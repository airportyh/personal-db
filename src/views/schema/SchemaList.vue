<template>
    <div>
        <h1>Model List</h1>
        <ul>
            <li v-for="(schema, modelName) in schemas"
                v-bind:key="modelName">
                {{schema.name}}
                (<router-link :to="{ name: 'model-schema-edit', params: { modelName } }">schema</router-link>)
                (<router-link :to="{ name: 'model-data-edit', params: { modelName } }">data</router-link>)
            </li>
        </ul>
        <button v-on:click="addModel">Add New Model</button>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import firebase from "firebase/app";
import { Model } from "../../models/Metadata";
import { API } from "../../services/API";

@Component
export default class SchemaList extends Vue {
    schemas: _.Dictionary<Model> | null = null;

    created(): void {
        API.getAllSchemas()
            .then((schemas) => {
                this.schemas = schemas;
            });
    }

    addModel(): void {
        const key = prompt("What is the name of the model?") || "<unnamed>";
        this.$router.push({
            name: "model-schema-edit",
            params: {
                modelName: key
            }
        });
    }
}
</script>