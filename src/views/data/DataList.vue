<template>
    <div v-if="schema && data">
        <h1>{{schema.name | capitalize}}s</h1>
        <ul>
            <li v-for="(object) in data"
                v-bind:key="object.id">
                <span v-if="displayField.type == 'markdown'" v-html="marked(object[displayField.name])">
                </span>
                <router-link
                    v-if="displayField.type == 'markdown'"
                    :to="{
                        name: 'model-data-object-edit', 
                        params: { id: object.id, modelName: schema.name }
                    }"
                >
                    (edit)
                </router-link>
                <router-link
                    v-if="displayField.type != 'markdown'"
                    :to="{
                        name: 'model-data-object-edit', 
                        params: { id: object.id, modelName: schema.name }
                    }"
                >
                    {{ object[displayField.name] }}
                </router-link>
            </li>
        </ul>
        <button v-on:click="addObject">Add {{schema.name | capitalize}}</button>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import firebase from "firebase/app";
import { Model, Field } from "../../models/Metadata";
import { Dictionary } from "lodash";
import { API, ModelAPI } from "../../services/API";
import * as marked from "marked";

@Component
export default class DataList extends Vue {
    schema: Model | null = null;
    diplayField: Field | null = null;
    data: Dictionary<any> = {};

    get modelAPI(): ModelAPI {
        return API.model(this.modelName);
    }

    get modelName(): string {
        return this.$route.params.modelName;
    }
    
    marked(md): string {
        return marked(md);
    }

    async load(): void {
        const schema = await API.getSchema(this.modelName)
        this.displayField = schema.fields.find(field => field.name === schema.displayField);
        this.schema = schema;
        const data = await this.modelAPI.getAll(schema.sortField);
        this.data = data || {};
        if (this.schema.sortDirection === "DESC") {
            this.data = this.data.reverse();
        }
    }

    created(): void {
        this.load();
    }

    addObject(): void {
        const ref = this.modelAPI.getNewRef();
        if (ref.key) {
            this.$router.push({
                name: "model-data-object-edit",
                params: {
                    modelName: this.modelName,
                    id: ref.key
                }
            });
        } else {
            throw new Error("Something wrong happened :(");
        }
    }

    @Watch("$route")
    onRouteChange(): void {
        this.load();
    }
}
</script>