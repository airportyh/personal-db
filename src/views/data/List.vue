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
import { Model } from "../../models/Metadata";
import { Dictionary } from "lodash";
import { API, ModelAPI } from "../../services/API";

@Component
export default class DataList extends Vue {
    schema: Model | null = null;
    data: Dictionary<any> = {};

    get modelAPI(): ModelAPI {
        return API.model(this.modelName);
    }

    get modelName(): string {
        return this.$route.params.modelName;
    }

    created(): void {
        API.getSchema(this.modelName)
            .then(schema => {
                console.log("schema", schema);
                this.schema = schema;
            });
        this.modelAPI
            .getAll()
            .then(data => {
                console.log("data", data);
                this.data = data || {};
            });
    }

    addObject(): void {
        const id = this.modelAPI.push();
        if (id) {
            this.$router.push({
                name: "model-data-object-edit",
                params: {
                    modelName: this.modelName,
                    id: id
                }
            });
        } else {
            throw new Error("Something wrong happened :(");
        }
    }
}
</script>