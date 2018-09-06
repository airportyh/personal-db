<template>
    <div>
        <label>{{ field.name | capitalize }}:</label><br>
        <div v-if="!editMode">
            <span >{{ data[field.name] || `(no ${field.name} set)`}}</span>
            &nbsp;
            <span class="link-like" v-on:click="editMode = true">Edit</span>
        </div>
        <select v-if="editMode" v-model="data[field.name]" v-on:change="change">
            <option value="undefined">(no {{ field.name }} set)</option>
            <option
                v-for="(option, idx) in field.choices"
                v-bind:value="option"
                v-bind:key="idx">
                {{option}}
            </option>
        </select>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { ChoiceField } from "../models/Metadata";

@Component
export default class UIChoiceField extends Vue {
    @Prop() field: ChoiceField;
    @Prop() data: any;
    editMode: boolean = false;

    change(): void {
        this.$emit("change");
        this.editMode = false;
    }
}
</script>