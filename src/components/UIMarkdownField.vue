<template>
    <div>
        <label>{{ field.name | capitalize }}:</label>
        &nbsp;
        <span class="link-like"
            v-on:click="editMode = true"
            v-if="!editMode">Edit</span>
        <br>
        <div v-html="html" v-if="!editMode"></div>
        
        <MarkdownEditor
            v-model="markdown"
            v-if="editMode">
        </MarkdownEditor>
        <button
            v-if="editMode"
            type="button" 
            v-on:click="save">
            Save
        </button>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { TextField } from "@/models/Metadata";
import * as marked from "marked";
import MarkdownEditor from "./MarkdownEditor.vue";

@Component({
    components: {
        MarkdownEditor
    }
})
export default class UIMarkdownField extends Vue {
    @Prop() field: TextField;
    @Prop() data: any;
    editMode: boolean = false;

    get markdown(): string {
        return this.data[this.field.name];
    }

    set markdown(markdown) {
        this.data[this.field.name] = markdown;
    }

    get html(): string {
        return marked(this.markdown);
    }

    save(): void {
        this.editMode = false;
        this.$emit("change");
    }

}
</script>