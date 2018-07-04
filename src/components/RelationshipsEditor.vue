<template>
    <div v-if="relatedModel">
        <label>{{ field.name | capitalize }}:</label><br>
        <div>
            <ul v-if="relatedObjects">
                <li v-for="relatedObject in relatedObjects"
                    v-bind:key="relatedObject.linkId">
                    {{ relatedObject.object[relatedModel.displayField] }}
                    <i class="delete fas fa-trash-alt"
                        v-on:click="removeRelationship(relatedObject)"></i>
                </li>
            </ul>
            <p v-if="Object.keys(relatedObjects).length === 0">
                No {{ relatedModel.name }}s are currently linked to this {{ parentModel.name }}.
            </p>
            <button type="button" v-on:click="toAddMode" v-if="!addMode">
                Add {{ relatedModel.name | capitalize }}
            </button>
            <div v-show="addMode">
                <input ref="textInput" type="text" v-model="query"
                    v-on:keyup="onKeyUp($event)"
                    v-on:keydown="onKeyDown($event)"
                    
                    >
                <div class="dropdown" v-if="this.query.length > 0">
                    <ul>
                        <li v-for="(option, idx) in dropDownOptions"
                            v-bind:key="option.value"
                            v-on:click="selectOption(option)"
                            v-bind:class="{
                                selected: idx === dropDownSelectionIndex,
                                'create-new-li': option.isCreateNew
                            }"
                            v-on:mouseenter="setDropDownSelectionIndex(idx)"
                            >
                            {{ option.label }}
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import firebase from "firebase/app";
import { Model, Field, RelationshipField } from "../models/Metadata";
import * as _ from "lodash";

interface DropDownOption {
    value: string;
    label: string;
    isCreateNew: boolean;
}

interface RelatedObject {
    linkId: string;
    link: _.Dictionary<string>;
    objectId: string;
    object: object;
}

@Component
export default class RelationshipsEditor extends Vue {
    @Prop() parentId: string;
    @Prop() parentModel: Model;
    @Prop() field: RelationshipField;
    addMode: boolean = false;
    relatedModel: Model | null = null;
    relatedObjects: RelatedObject[] | null = null;
    query: string = "";
    dropDownOptions: DropDownOption[] = [];
    dropDownSelectionIndex: number = 0;

    created(): void {
        this.fetchRelationship(this.field);
    }

    onKeyDown(event: KeyboardEvent): void {
        if (event.keyCode === 13) {
            event.preventDefault();
            const option = this.dropDownOptions[this.dropDownSelectionIndex];
            this.selectOption(option);
        }
    }

    onKeyUp(event: KeyboardEvent): void {
        if (!this.relatedModel) {
            return;
        }
        if (event.keyCode === 38) { // up arrow
            this.dropDownSelectionIndex--;
            if (this.dropDownSelectionIndex < 0) {
                this.dropDownSelectionIndex = this.dropDownOptions.length - 1;
            }
            return;
        } else if (event.keyCode === 40) { // down arrow
            this.dropDownSelectionIndex++;
            if (this.dropDownSelectionIndex >= this.dropDownOptions.length) {
                this.dropDownSelectionIndex = 0;
            }
            return;
        }
        const query = this.query;
        if (query.length < 1) {
            this.setDropDownOptions([]);
            return;
        }
        const ref = firebase.database().ref(`models/${this.relatedModel.name}/data`)
            .orderByChild(this.relatedModel.displayField)
            .startAt(query)
            .endAt(query + "\uf8ff")
            .once("value", (snapshot) => {
                const options = _(snapshot.val() || {}).chain()
                    .entries()
                    .map(([key, obj]) => {
                        if (!this.relatedModel) {
                            throw new Error("relatedModel should have been initialized.");
                        }
                        return {
                            value: key,
                            label: String(obj[this.relatedModel.displayField]),
                            isCreateNew: false
                        }
                    }).value();
                this.setDropDownOptions(options);
            });
    }

    setDropDownSelectionIndex(idx: number): void {
        this.dropDownSelectionIndex = idx;
    }

    removeRelationship(relatedObject: RelatedObject): void {
        console.log("removing relationship", relatedObject);
        firebase.database().ref(`relationships/${this.field.relationshipName}/${relatedObject.linkId}`)
            .remove()
            .then(() => {
                return this.fetchRelatedObjects(this.field);
            })
            .then((relatedObjects) => {
                this.relatedObjects = relatedObjects;
            });
    }

    selectOption(option: DropDownOption): void {
        if (!this.relatedModel) {
            return;
        }
        console.log("selecting option", option.value);
        if (option.isCreateNew) {
            this.addRelatedObject();
        } else {
            const relatedObject = {
                [this.relatedModel.displayField]: this.query
            };
            this.addRelatedObject2(option.value);
        }
    }

    setDropDownOptions(options: DropDownOption[]): void {
        if (!this.relatedModel) {
            return;
        }
        const createNew = {
            value: "create-new",
            label: `Create "${this.query}"`,
            isCreateNew: true
        };
        const filteredOptions = options
            .filter(option => {
                return !(option.value in (this.relatedObjects || {}));
            });
        this.dropDownOptions = [...filteredOptions, createNew];
        this.dropDownSelectionIndex = 0;
    }

    onBlur(): void {
        setTimeout(() => {
            console.log("On blur");
            this.setDropDownOptions([]);
        }, 100);
    }

    toAddMode(): void {
        this.addMode = true;
        this.$nextTick(() => {
            const elm: HTMLInputElement = this.$refs.textInput as HTMLInputElement;
            elm.focus();
        });
    }

    fetchRelatedObjects(field: RelationshipField): Promise<RelatedObject[]> {
        return firebase.database().ref(`relationships/${field.relationshipName}`)
            .orderByChild(this.parentModel.name)
            .equalTo(this.parentId)
            .once("value")
            .then((snapshot) => {
                const links = snapshot.val();
                console.log("links", links);
                return Promise.all(
                    _.map(links, (link: _.Dictionary<string>, linkId) => {
                        const id = link[field.relatedModelName];
                        return firebase.database().ref(`models/${field.relatedModelName}/data/${id}`)
                            .once("value")
                            .then((snapshot) => {
                                const val = snapshot.val();
                                return {
                                    linkId: linkId,
                                    link: link,
                                    objectId: id,
                                    object: val
                                } as RelatedObject;
                            });
                    })
                );
            });
    }

    fetchRelationship(field: RelationshipField): Promise<void> {
        return Promise.all([
            firebase.database().ref(`models/${field.relatedModelName}/schema`).once("value"),
            this.fetchRelatedObjects(field)
        ]).then(([relatedModelSnapshot, relatedObjects]) => {
            this.relatedModel = relatedModelSnapshot.val();
            console.log("related objects", relatedObjects);
            this.relatedObjects = relatedObjects;
            console.log("related objects", this.relatedObjects);
        });
    }

    addRelatedObject2(id: string): void {
        if (!this.relatedModel) {
            return;
        }
        const newRelationshipRef = firebase.database().ref(`relationships/${this.field.relationshipName}`).push()
        newRelationshipRef.set({
            [this.parentModel.name]: this.parentId,
            [this.relatedModel.name]: id
        }).then(() => {
            this.fetchRelatedObjects(this.field)
                .then((relatedObjects) => {
                    this.relatedObjects = relatedObjects;
                    this.query = "";
                });
        });
    }

    addRelatedObject(): void {
        const value = this.query;
        //console.log(`Adding ${field.name} ${value}.`);
        const relatedModel = this.relatedModel;
        if (!relatedModel) {
            return;
        }
        const newObjectRef = firebase.database().ref(`models/${relatedModel.name}/data`).push();
        const newObject = {
            [relatedModel.displayField]: value
        };
        
        const newRelationshipRef = firebase.database().ref(`relationships/${this.field.relationshipName}`).push()
        Promise.all([
            newObjectRef.set(newObject),
            newRelationshipRef.set({
                [this.parentModel.name]: this.parentId,
                [relatedModel.name]: newObjectRef.key
            })
        ]).then(() => {
            this.fetchRelatedObjects(this.field)
                .then((relatedObjects) => {
                    this.relatedObjects = relatedObjects;
                    this.query = "";
                });
        });
    }
}
</script>

<style>
* {
    box-sizing: border-box;
}

.dropdown {
    display: block;
    position: absolute;
    pointer-events: none;
}

input[type=text], .dropdown ul {
    width: 300px;
}

.dropdown ul {
    padding: 0;
    margin: 0;
    background-color: white;
    border: 1px solid black;
    pointer-events: auto;
}

.dropdown li {
    list-style: none;
    padding: 0.2em 0.5em;
    margin: 0;
}

.dropdown li:nth-child(2n) {
    background-color: #f0f0f0;
}

.dropdown li.create-new-li {
    text-decoration: underline;
    font-weight: bold;
}

.dropdown li button {
    text-align: left;
    width: 100%;
}

.dropdown li.selected {
    background-color: darkblue;
    color: white;
}

.delete {
    margin-left: 10px;
    color: #ccc;
    cursor: pointer;
}

.delete:hover {
    color: black;
}
</style>