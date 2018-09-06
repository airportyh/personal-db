<template>
    <div>
        <label>{{ field.name | capitalize }}:</label>
        &nbsp;
        <span class="link-like" v-on:click="toEditMode">Edit</span>
        <br>
        <div v-if="!editMode">
            <a  v-if="field.type === 'url'"
                v-bind:href="data[field.name]"
                target="_blank">
                {{ data[field.name] }}
            </a>
            <span v-if="field.type === 'text'">{{ data[field.name] || '(N/A)' }}</span>
        </div>
        <form v-if="editMode" v-on:submit.prevent="change">
            <input ref="textInput" type="text" v-model="data[field.name]">
            <button type="submit">Save</button>
        </form>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { TextField } from "../models/Metadata";

@Component
export default class UITextField extends Vue {
    @Prop() field: TextField;
    @Prop() data: any;
    editMode: boolean = false;

    toEditMode(): void {
        this.editMode = true;
        this.$nextTick(() => {
            const elm: HTMLInputElement = this.$refs.textInput as HTMLInputElement;
            elm.select();
        });
    }

    change(): void {
        this.editMode = false;
        this.$emit("change");
    }
}
</script>