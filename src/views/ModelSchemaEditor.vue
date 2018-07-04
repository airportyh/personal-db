<template>
    <form v-on:submit.prevent="save" v-if="model">
        <h1>Model Schema Editor</h1>
        <p>
            <label>Name</label><br>
            <input type="text" v-model="model.name">
        </p>

        <p>
            <label>Display Field</label><br>
            <input type="text" v-model="model.displayField">
        </p>

        <h3>Fields</h3>
        <ul>
            <li v-for="(field, index) in model.fields"
                v-bind:key="index">
                <select v-model="field.type">
                    <option v-for="(type, idx) in fieldTypes"
                            v-bind:key="idx"
                            v-bind:value="type">
                        {{type}}
                    </option>
                </select>
                <input type="text" v-model="field.name">
                <span v-if="field.type==='relationship'">
                    <input type="text" v-model="field.relationshipName">
                    <input type="text" v-model="field.relatedModelName">
                </span>
            </li>
        </ul>
        <button v-on:click="addField">Add Field</button>

        <p>
            <button type="submit">Save</button>
        </p>
    </form>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import firebase from "firebase/app";
import { Model, FIELD_TYPES } from "../models/Metadata";

@Component
export default class ModelSchemaEditor extends Vue {
    model: Model | null = null;
    fieldTypes = FIELD_TYPES;
    onValueCallback: any;

    created(): void {
        this.onValueCallback = this.getRef().on("value", (snapshot) => {
            this.model = snapshot && snapshot.val();
            if (!this.model) {
                this.model = {
                    name: this.getId(),
                    displayField: "",
                    fields: []
                };
            }
        });
    }

    destroyed(): void {
        if (this.onValueCallback) {
            this.getRef().off("value", this.onValueCallback);
        }
    }

    getId(): string {
        return this.$route.params.id;
    }

    getRef(): firebase.database.Reference {
        return firebase.database().ref(`models/${this.getId()}/schema`);
    }

    addField(): void {
        if (!this.model) return;
        this.model.fields.push({
            type: "text",
            name: ""
        });
    }

    save(): void {
        this.getRef().set(this.model).then(() => {
            console.log("It worked");
        });
    }
}
</script>