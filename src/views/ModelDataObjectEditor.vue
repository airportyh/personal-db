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
import { Model, Field, RelationshipField } from "../models/Metadata";
import * as _ from "lodash";
import RelationshipsEditor from "../components/RelationshipsEditor.vue";

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

    getId(): string {
        return this.$route.params.id;
    }

    getModelName(): string {
        return this.$route.params.modelName;
    }

    getSchemaRef(): firebase.database.Reference {
        return firebase.database().ref(`models/${this.getModelName()}/schema`);
    }

    getDataRef(): firebase.database.Reference {
        return firebase.database().ref(`models/${this.getModelName()}/data/${this.getId()}`);
    }

    created(): void {
        this.getSchemaRef().once("value", (snapshot) => {
            this.schema = snapshot.val();
        });
        this.getDataRef().once("value", (snapshot) => {
            this.data = snapshot.val() || {};
        });
    }

    save(): void {
        this.getDataRef().set(this.data).then(() => {
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

input[type=text] {
    font-size: 100%;
}

button {
    font-size: 100%;
}
</style>
