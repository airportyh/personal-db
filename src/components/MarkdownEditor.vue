<template>
    <div>
        <textarea></textarea>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import * as SimpleMDE from "simplemde";
import "simplemde/dist/simplemde.min.css";

@Component
export default class MarkdownEditor extends Vue {
    @Prop() value: string;
    editor: SimpleMDE;
    changeHandler: Function;

    mounted(): void {
        const textarea = this.$el.querySelector("textarea");
        if (!textarea) {
            throw new Error("no textarea found.");
        }
        this.editor = new SimpleMDE({
            element: textarea,
            initialValue: this.value || "",
            toolbar: false,
            autofocus: true
        });
        this.changeHandler = () => {
            const value = this.editor.value();
            this.$emit("input", value);
        };
        this.editor.codemirror.on("change", this.changeHandler);
    }

    beforeDestroy(): void {
        this.editor.codemirror.off("change", this.changeHandler);
        this.editor.toTextArea();
    }
}
</script>

<style>
.editor-statusbar {
    display: none;
}
</style>