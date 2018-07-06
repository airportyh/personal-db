<template>
    <form v-if="data && schema" v-on:submit.prevent="save">
        <h1>{{ schema.name | capitalize }} object editor</h1>
        <div
            v-for="(field, index) in schema.fields"
            v-bind:key="index"
            class="field"
            >
            <div v-if="field.type === 'text'">
                <label>{{ field.name | capitalize }}:</label><br>
                <input type="text" v-model="data[field.name]">
            </div>

            <RelationshipsEditor
                v-if="field.type === 'relationship'"
                v-bind:parentId="getId()"
                v-bind:parentModel="schema"
                v-bind:field="field"
            />
        </div>
        <button type="submit">Save</button>
    </form>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import firebase from "firebase/app";
import { Model, Field, RelationshipField } from "../../models/Metadata";
import * as _ from "lodash";
import RelationshipsEditor from "../../components/RelationshipsEditor.vue";
import { API, ModelAPI } from "../../services/API";

interface Relationship {
    field: RelationshipField,
    schema: Model,
    relatedObjects: _.Dictionary<object>
}

@Component({
    components: {
        RelationshipsEditor
    }
})
export default class ModelDataObjectEditor extends Vue {
    schema: Model | null = null;
    data: any = null;

    get id(): string {
        return this.$route.params.id;
    }

    get modelName(): string {
        return this.$route.params.modelName;
    }

    get modelAPI(): ModelAPI {
        return API.model(this.modelName);
    }

    created(): void {
        API.getSchema(this.modelName)
            .then(schema => {
                this.schema = schema;
            });
        this.modelAPI
            .get(this.id)
            .then(data => {
                this.data = data || {};
            });
    }

    save(): void {
        this.modelAPI.save(this.id, this.data)
            .then(() => {
                console.log("It worked!");
            });
    }
}
</script>

<style>
.field {
    padding: 10px 0;
}

.field label {
    font-weight: bold;
}

input[type=text], select {
    font-size: 100%;
}

button {
    font-size: 100%;
}
</style>
