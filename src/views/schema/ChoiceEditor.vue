<template>
<div>
    <label>Choices:</label>
    <div v-if="!choices.length">Add some choices!!!</div>
    <ul v-if="choices.length">
        <li v-for="(choice, idx) in choices"
            v-bind:key="idx">
            {{ choice }}
            <div class="delete fas fa-trash-alt" v-on:click="deleteChoice(idx)"></div>
        </li>
    </ul>
    <input type="text" v-model="newChoice">
    <button type="button" v-on:click="addChoice">Add</button>
</div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { ChoiceField } from "@/models/Metadata";

@Component
export default class ChoiceEditor extends Vue {
    @Prop() field: ChoiceField;
    newChoice: string = "";

    get choices(): string[] {
        if (!this.field.choices) {
            this.field.choices = [];
        }
        return this.field.choices;
    }

    addChoice(): void {
        this.choices.push(this.newChoice);
        this.newChoice = "";
    }

    deleteChoice(idx: number): void {
        this.choices.splice(idx, 1);
    }
}
</script>