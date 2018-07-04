<template>
    <div>
        <h1>Model List</h1>
        <ul>
            <li v-for="(model, id) in models"
                v-bind:key="id">
                {{model.schema.name}}
                (<router-link :to="{ name: 'model-schema-edit', params: { id } }">schema</router-link>)
                (<router-link :to="{ name: 'model-data-edit', params: { id } }">data</router-link>)
            </li>
        </ul>
        <button v-on:click="addModel">Add New Model</button>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import firebase from "firebase/app";
import { Model } from "../models/Metadata";

@Component
export default class ModelList extends Vue {
    models: Model[] | null = null;
    onValueCallback: any;

    getRef(): firebase.database.Reference {
        return firebase.database().ref("models");
    }

    created(): void {
        this.onValueCallback = this.getRef().on("value", (snapshot) => {
            this.models = snapshot && snapshot.val();
        });
    }

    destroyed(): void {
        if (this.onValueCallback) {
            this.getRef().off("value", this.onValueCallback);
        }
    }

    addModel(): void {
        const key = prompt("What is the name of the model?") || "<unnamed>";
        this.$router.push({
            name: "model-schema-edit",
            params: {
                id: key
            }
        });
    }
}
</script>