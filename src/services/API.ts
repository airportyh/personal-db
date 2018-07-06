import firebase from "firebase/app";
import { Model } from "@/models/Metadata";
import * as _ from "lodash";

export function ref(path: string): firebase.database.Reference {
    return firebase.database().ref(path);
}

export function fetch<T>(ref: firebase.database.Reference): Promise<T> {
    return ref.once("value").then(s => s.val());
}

export function fetchRef<T>(path: string): Promise<T> {
    return fetch(ref(path));
}

export class ModelAPI {

    constructor(private modelName: string) {}

    getAll<T>(): Promise<_.Dictionary<T>> {
        return fetchRef(`data/models/${this.modelName}`);
    }

    get<T>(id: string): Promise<T> {
        return fetchRef(`data/models/${this.modelName}/${id}`);
    }

    push<T>(): string | null {
        const newObjectRef = ref(`data/models/${this.modelName}`).push();
        return newObjectRef.key;
    }

    save<T>(id: string, object: T): Promise<void> {
        return ref(`data/models/${this.modelName}/${id}`).set(object);
    }
}

export class APIImplementation {

    getSchema(modelName: string): Promise<Model> {
        return fetchRef(`schemas/${modelName}`);
    }

    setSchema(modelName: string, schema: Model): Promise<void> {
        return ref(`schemas/${modelName}`).set(schema);
    }

    getAllSchemas(): Promise<_.Dictionary<Model>> {
        return fetchRef(`schemas`);
    }

    model(modelName: string): ModelAPI {
        return new ModelAPI(modelName);
    }
}

export const API = new APIImplementation();