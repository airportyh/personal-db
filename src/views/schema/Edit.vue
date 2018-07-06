<template>
    <form v-on:submit.prevent="save" v-if="model">
        <h1>Model: {{model.name || '[Model Name]'}}</h1>
        <div class="panel">
            <h3>Model Info</h3>
            <div class="sub-panel">
                <p>
                    <label>Name:</label><br>
                    <input type="text" v-model="model.name">
                </p>

                <p>
                    <label>Display Field:</label><br>
                    <input type="text" v-model="model.displayField">
                </p>
            </div>
        </div>

        <div class="panel">
            <h3>Fields</h3>
            
            <div class="sub-panel" v-for="(field, index) in model.fields"
                v-bind:key="index">
                <p>
                    <label>Field Name:</label><br>
                    <input type="text" v-model="field.name">
                </p>

                <p>
                    <label>Field Type:</label><br>
                    <select v-model="field.type">
                        <option v-for="(type, idx) in fieldTypes"
                                v-bind:key="idx"
                                v-bind:value="type">
                            {{type}}
                        </option>
                    </select>
                </p>

                <p v-if="field.type==='relationship'">
                    <label>Relationship Name:</label><br>
                    <input type="text" v-model="field.relationshipName">
                </p>

                <p v-if="field.type==='relationship'">
                    <label>Related Model:</label><br>
                    <input type="text" v-model="field.relatedModelName">
                </p>
            </div>
            <button v-on:click="addField">Add Field</button>
        </div>

        <p>
            <button type="submit">Save</button>
        </p>
    </form>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import firebase from "firebase/app";
import { API } from "../../services/API";
import { Model, FIELD_TYPES } from "../../models/Metadata";

@Component
export default class SchemaEdit extends Vue {
    model: Model | null = null;
    fieldTypes = FIELD_TYPES;
    
    created(): void {
        API.getSchema(this.getModelName())
            .then(schema => {
                this.model = schema;
                if (!this.model) {
                    this.model = {
                        name: this.getModelName(),
                        displayField: "",
                        fields: []
                    };
                }
            });
    }

    getModelName(): string {
        return this.$route.params.modelName;
    }

    addField(): void {
        if (!this.model) return;
        this.model.fields.push({
            type: "text",
            name: ""
        });
    }

    save(): void {
        if (!this.model) {
            return;
        }
        API.setSchema(this.getModelName(), this.model)
            .then(() => {
                console.log("It worked");
            });
    }
}
</script>

<style>
.panel {
    margin-bottom: 1em;
    padding: 10px;
    background-color: #eee;
    border-radius: 5px;
}

.sub-panel h3 {
    padding: 0 10px;
    text-decoration: underline;
}

.sub-panel {
    background-color: #fff;
    border-radius: 5px;
    padding: 10px;
    margin-bottom: 10px;
}

input[type=text], select {
    font-size: 100%;
}

button {
    font-size: 100%;
}
</style>