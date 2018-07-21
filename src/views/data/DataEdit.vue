<template>
    <div v-if="data && schema">
        <h1>{{ schema.name | capitalize }}: {{ data[schema.displayField] }}</h1>
        <div
            v-for="(field, index) in schema.fields"
            v-bind:key="index"
            class="field"
            >

            <UITextField
                v-if="field.type === 'text' || field.type === 'url'"
                v-bind:field="field"
                v-bind:data="data"
                v-on:change="save">
            </UITextField>

            <UIMarkdownField
                v-if="field.type === 'markdown'"
                v-bind:field="field"
                v-bind:data="data"
                v-on:change="save">
            </UIMarkdownField>

            <UIChoiceField
                v-if="field.type === 'choice'"
                v-bind:field="field"
                v-bind:data="data"
                v-on:change="save"
                >
            </UIChoiceField>

            <RelationshipsEditor
                v-if="field.type === 'relationship'"
                v-bind:parentId="id"
                v-bind:parentModel="schema"
                v-bind:field="field"
            />

        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import { Model, Field, RelationshipField } from "../../models/Metadata";
import * as _ from "lodash";
import RelationshipsEditor from "../../components/RelationshipsEditor.vue";
import UITextField from "../../components/UITextField.vue";
import UIChoiceField from "../../components/UIChoiceField.vue";
import UIMarkdownField from "../../components/UIMarkdownField.vue";
import { API, ModelAPI } from "../../services/API";

interface Relationship {
    field: RelationshipField,
    schema: Model,
    relatedObjects: _.Dictionary<object>
}

@Component({
    components: {
        RelationshipsEditor,
        UITextField,
        UIChoiceField,
        UIMarkdownField
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

    load(): void {
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

    created(): void {
        this.load();
    }

    save(): void {
        this.modelAPI.save(this.id, this.data)
            .then(() => {
                console.log("It worked!");
            });
    }

    @Watch("$route")
    onRouteChanged(val: string, oldVal: string): void {
        this.load();
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

button {
    font-size: 100%;
}
</style>
