import firebase from "firebase/app";
import { Model, RelationshipField } from "@/models/Metadata";
import * as _ from "lodash";

export function ref(path: string): firebase.database.Reference {
    return firebase.database().ref(path);
}

export function fetch<T>(ref: firebase.database.Query): Promise<T> {
    return ref.once("value").then(s => s.val());
}

export function fetchRef<T>(path: string): Promise<T> {
    return fetch(ref(path));
}

export interface RelatedObject {
    linkId: string;
    link: _.Dictionary<string>;
    objectId: string;
    object: object;
}

export class ModelAPI {

    constructor(private modelName: string) {}

    getAll<T>(): Promise<_.Dictionary<T>> {
        return fetchRef(`data/models/${this.modelName}`);
    }

    get<T>(id: string): Promise<T> {
        return fetchRef(`data/models/${this.modelName}/${id}`);
    }

    getNewRef<T>(): firebase.database.Reference {
        return ref(`data/models/${this.modelName}`).push();
    }

    push<T>(object: T): Promise<string> {
        const newObjectRef = this.getNewRef();
        return newObjectRef.set(object)
            .then(() => {
                if (!newObjectRef.key) {
                    throw new Error("Could not get ref key");
                } else {
                    return newObjectRef.key
                }
            });
    }

    save<T>(id: string, object: T): Promise<void> {
        return ref(`data/models/${this.modelName}/${id}`).set(object);
    }
}

export class APIImplementation {

    getSchema(modelName: string): Promise<Model> {
        return fetchRef(`schemas/${modelName}`);
    }

    saveSchema(schema: Model): Promise<void> {
        return ref(`schemas/${schema.name}`).set(schema);
    }

    getAllSchemas(): Promise<_.Dictionary<Model>> {
        return fetchRef(`schemas`);
    }

    model(modelName: string): ModelAPI {
        return new ModelAPI(modelName);
    }

    pushRelationship<T>(
        sourceModel: Model, field: RelationshipField, 
        sourceId: string, destinationId: string): Promise<void> {
        const obj = {
            [sourceModel.name]: sourceId,
            [field.relatedModelName]: destinationId
        };
        return ref(`data/relationships/${field.relationshipName}`)
            .push()
            .set(obj);
    }

    fetchRelatedObjects(model: Model, field: RelationshipField, objectId: string): Promise<RelatedObject[]> {
        return ref(`data/relationships/${field.relationshipName}`)
            .orderByChild(model.name)
            .equalTo(objectId)
            .once("value")
            .then((snapshot) => {
                const rels = snapshot.val();
                return Promise.all(
                    _.map(rels, (rel: _.Dictionary<string>, linkId) => {
                        const id = rel[field.relatedModelName];
                        return ref(`data/models/${field.relatedModelName}/${id}`)
                            .once("value")
                            .then((snapshot) => {
                                const val = snapshot.val();
                                return {
                                    linkId: linkId,
                                    link: rel,
                                    objectId: id,
                                    object: val
                                } as RelatedObject;
                            });
                    })
                );
            });
    }

    searchRelatedObjects(relatedModel: Model, query: string): Promise<_.Dictionary<any>> {
        return fetch(ref(`data/models/${relatedModel.name}`)
            .orderByChild(relatedModel.displayField)
            .startAt(query)
            .endAt(query + "\uf8ff"));
    }

    unlinkRelationship(field: RelationshipField, id: string): Promise<void> {
        return ref(`data/relationships/${field.relationshipName}/${id}`).remove();
    }
}

export const API = new APIImplementation();