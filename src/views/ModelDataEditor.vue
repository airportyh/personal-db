<template>
    <div v-if="schema && data">
        <h1>{{schema.name}} Data</h1>
        <ul>
            <li v-for="(object, id) in data"
                v-bind:key="id">
                <router-link :to="{
                    name: 'model-data-object-edit', 
                    params: { id, modelName: schema.name }
                }">
                    {{ object[schema.displayField] }}
                </router-link>
            </li>
        </ul>
        <button v-on:click="addObject">Add {{schema.name | capitalize}}</button>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import firebase from "firebase/app";
import { Model } from "../models/Metadata";
import { Dictionary } from "lodash";

@Component
export default class ModelDataEditor extends Vue {
    schema: Model | null = null;
    data: Dictionary<any> = {};
    dataOnValueCallback: any;
    schemaOnValueCallback: any;

    getId(): string {
        return this.$route.params.id;
    }

    getSchemaRef(): firebase.database.Reference {
        return firebase.database().ref(`models/${this.getId()}/schema`);
    }

    getDataRef(): firebase.database.Reference {
        return firebase.database().ref(`models/${this.getId()}/data`);
    }

    created(): void {
        this.dataOnValueCallback = this.getDataRef().on("value", (snapshot) => {
            this.data = snapshot && snapshot.val() || {};
        });
        this.schemaOnValueCallback = this.getSchemaRef().on("value", (snapshot) => {
            this.schema = snapshot && snapshot.val();
        });
    }

    addObject(): void {
        const newObjectRef = this.getDataRef().push();
        const id = newObjectRef.key;
        if (id) {
            this.$router.push({
                name: "model-data-object-edit",
                params: {
                    modelName: this.getId(),
                    id: id
                }
            });
        } else {
            throw new Error("Something wrong happened :(");
        }
    }
}
</script>