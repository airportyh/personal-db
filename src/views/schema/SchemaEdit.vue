<template>
    <form v-on:submit.prevent="save" v-if="model">
        <h1>Model: {{model.name || '[Model Name]'}}</h1>
        <div>
            <div>
                <p>
                    <label>Model Name:</label><br>
                    <input type="text" v-model="model.name">
                </p>

                <p>
                    <label>Display Field:</label><br>
                    <input type="text" v-model="model.displayField">
                </p>
            </div>
        </div>

        <div>
            <h3>Fields</h3>
            <table class="fields-table" border="1">
                <thead>
                    <tr>
                        <th class="field-name-col">Field Name</th>
                        <th class="field-type-col">Field Type</th>
                        <th class="field-extra-col">Extra Settings</th>
                        <th class="move"></th>
                        <th class="move"></th>
                    </tr>
                </thead>

                <tbody>
                    <tr v-for="(field, index) in model.fields"
                        v-bind:key="index">
                        <td>
                            <input type="text" v-model="field.name">
                        </td>
                        <td>
                            <select v-model="field.type">
                                <option v-for="(type, idx) in fieldTypes"
                                        v-bind:key="idx"
                                        v-bind:value="type">
                                    {{type}}
                                </option>
                            </select>
                        </td>
                        <td>
                            <div  v-if="field.type==='relationship'">
                                <span>
                                    <label>Relationship Name:</label><br>
                                    <input type="text" v-model="field.relationshipName"><br>
                                </span>

                                <span>
                                    <label>Related Model:</label><br>
                                    <select v-model="field.relatedModelName">
                                        <option v-for="otherModel in otherModels"
                                                v-bind:key="otherModel.name"
                                                v-bind:value="otherModel.name">
                                            {{ otherModel.name }}
                                        </option>
                                    </select>
                                    <br>
                                </span>
                            </div>

                            <ChoiceEditor
                                v-if="field.type === 'choice'"
                                v-bind:field="field"
                                >
                            </ChoiceEditor>
                            
                        </td>
                        <td>
                            <div class="move-up fas fa-arrow-up" v-on:click="moveUp(index)"></div>
                            <div class="move-down fas fa-arrow-down" v-on:click="moveDown(index)"></div>
                        </td>
                        <td>
                            <div class="delete fas fa-trash-alt" v-on:click="deleteField(index)"></div>
                        </td>
                    </tr>
                </tbody>
            </table>
            <button v-on:click="addField">Add Field</button>
        </div>

        <p>
            <button type="submit">Save</button>
        </p>
    </form>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { API } from "../../services/API";
import { Model, FIELD_TYPES, RelationshipField, Field } from "../../models/Metadata";
import ChoiceEditor from "./ChoiceEditor.vue";
import * as _ from "lodash";

@Component({
    components: {
        ChoiceEditor
    }
})
export default class SchemaEdit extends Vue {
    model: Model | null = null;
    otherModels: _.Dictionary<Model> | null = null;
    fieldTypes = FIELD_TYPES;
    
    created(): void {
        API.getSchema(this.modelName)
            .then(schema => {
                this.model = schema;
                if (!this.model) {
                    this.model = {
                        name: this.modelName,
                        displayField: "",
                        fields: []
                    };
                }
            });
        API.getAllSchemas()
            .then(schemas => {
                this.otherModels = _.pickBy(schemas, schema => schema.name !== this.modelName) as any;
                console.log("other models", this.otherModels);
            });
    }

    get modelName(): string {
        return this.$route.params.modelName;
    }

    addField(): void {
        if (!this.model) return;
        this.model.fields.push({
            type: "text",
            name: ""
        });
    }

    doSave(model: Model, otherModels: _.Dictionary<Model>): Promise<any> {
        const schemasToUpdate = {} as _.Dictionary<Model>;
        _.forEach(otherModels, (otherModel) => {
            _.forEach(model.fields, (field) => {
                if (field.type === "relationship") {
                    const otherModel = otherModels[field.relatedModelName];
                    const existing = _.find(otherModel.fields, 
                        f => f.type === "relationship" && f.relationshipName === field.relationshipName);
                    if (!existing) {
                        const inverseRelationship: RelationshipField = {
                            name: this.modelName + "s",
                            type: "relationship",
                            relationshipName: field.relationshipName,
                            relatedModelName: this.modelName
                        }
                        otherModel.fields.push(inverseRelationship);
                        schemasToUpdate[otherModel.name] = otherModel;
                    }
                }
            });
        });

        console.log("schemas to update", schemasToUpdate);

        return API.saveSchema(model)
            .then(() => Promise.all(_.map(schemasToUpdate, (s) => API.saveSchema(s))));
    }

    moveUp(index: number): void {
        if (!this.model) {
            return;
        }
        const field = this.model.fields[index];
        this.model.fields.splice(index, 1);
        this.model.fields.splice(index - 1, 0, field);
    }

    moveDown(index: number): void {
        if (!this.model) {
            return;
        }
        const field = this.model.fields[index];
        
        if (index + 1 < this.model.fields.length) {
            this.model.fields.splice(index, 1);
            this.model.fields.splice(index + 1, 0, field);
        }
    }

    deleteField(index: number): void {
        if (!this.model) {
            return;
        }
        this.model.fields.splice(index, 1);
    }

    save(): void {
        if (!this.model || !this.otherModels) {
            return;
        }

        this.doSave(this.model, this.otherModels)
            .then(() => {
                console.log("Save successful.");
            });
    }
}
</script>

<style>
input[type=text], select {
    font-size: 100%;
}

button {
    font-size: 100%;
}

.fields-table {
    border-collapse: collapse;
    border: 1px solid #DFDFDF;
    margin-bottom: 10px;
}

.fields-table td {
    vertical-align: top;
    padding: 5px;
}

.field-name-col, .field-type-col {
    width: 25%;
}

.move-up, .move-down {
    cursor: pointer;
    display: block;
    color: #ccc;
}

.move-up:hover, .move-down:hover {
    color: black;
}
</style>