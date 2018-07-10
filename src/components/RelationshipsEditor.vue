<template>
    <div v-if="relatedModel">
        <label>{{ field.name | capitalize }}:</label><br>
        <div>
            <ul v-if="relatedObjects">
                <li v-for="relatedObject in relatedObjects"
                    v-bind:key="relatedObject.linkId">
                    {{ relatedObject.object[relatedModel.displayField] }}
                    <router-link
                        :to="{
                            name: 'model-data-object-edit',
                            params: {
                                id: relatedObject.objectId,
                                modelName: relatedModel.name
                            }
                        }">
                        <i class="fas fa-link"></i>
                    </router-link>
                    <i class="delete fas fa-trash-alt"
                        v-on:click="removeRelationship(relatedObject)"></i>
                </li>
            </ul>
            <p v-if="Object.keys(relatedObjects).length === 0">
                No {{ relatedModel.name }}s are currently linked to this {{ parentModel.name }}.
            </p>
            <span class="link-like" v-if="!addMode" type="button" v-on:click="toAddMode">
                <i class="fas fa-plus"></i>{{ relatedModel.name | capitalize }}
            </span>
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
import { Model, Field, RelationshipField } from "../models/Metadata";
import * as _ from "lodash";
import { API, RelatedObject } from "../services/API";

interface DropDownOption {
    value: string;
    label: string;
    isCreateNew: boolean;
}

@Component
export default class RelationshipsEditor extends Vue {
    @Prop() parentId: string;
    @Prop() parentModel: Model;
    @Prop() field: RelationshipField;
    @Prop() editMode: boolean;
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
        API.searchRelatedObjects(this.relatedModel, query)
            .then(relatedObjects => {
                const options = _(relatedObjects).chain()
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
        API.unlinkRelationship(this.field, relatedObject.linkId)
            .then(() => this.updateRelatedObjects());
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

    toAddMode(): void {
        this.addMode = true;
        this.$nextTick(() => {
            const elm: HTMLInputElement = this.$refs.textInput as HTMLInputElement;
            elm.focus();
        });
    }

    fetchRelatedObjects(): Promise<RelatedObject[]> {
        return API.fetchRelatedObjects(this.parentModel, this.field, this.parentId);
    }

    fetchRelationship(field: RelationshipField): Promise<void> {
        return Promise.all([
            API.getSchema(field.relatedModelName),
            this.fetchRelatedObjects()
        ]).then(([relatedModel, relatedObjects]) => {
            this.relatedModel = relatedModel;
            this.relatedObjects = relatedObjects;
        });
    }

    addRelatedObject2(id: string): void {
        if (!this.relatedModel) {
            return;
        }
        API.pushRelationship(this.parentModel, this.field, this.parentId, id)
            .then(() => this.updateRelatedObjects());
    }

    addRelatedObject(): void {
        if (!this.relatedModel) {
            return;
        }
        const newObject = {
            [this.relatedModel.displayField]: this.query
        };

        API.model(this.relatedModel.name).push(newObject)
            .then((newId) => API.pushRelationship(this.parentModel, this.field, this.parentId, newId))
            .then(() => this.updateRelatedObjects());
    }

    updateRelatedObjects(): void {
        this.fetchRelatedObjects()
            .then((relatedObjects) => {
                this.relatedObjects = relatedObjects;
                this.query = "";
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
    cursor: pointer;
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