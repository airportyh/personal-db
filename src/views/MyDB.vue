<template>
    <div>
        <div id="nav" v-if="schemas">
            <router-link 
                v-for="(schema, idx) in schemas"
                v-bind:key="idx"
                class="nav-link"
                :to="{
                name: 'model-data-edit',
                params: { modelName: schema.name }
                }">{{ schema.name | capitalize }}s</router-link>
            <router-link to="/models" class="nav-link">Schemas</router-link>
            <span class="link-like" v-on:click="logout">Logout</span>
        </div>
        <router-view></router-view>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { Model } from "../models/Metadata";
import { API } from "../services/API";
import firebase from "firebase/app";

@Component
export default class MyDB extends Vue {
  schemas: _.Dictionary<Model> | null = null;
  onValue: any;

  created(): void {
    this.onValue = firebase.database().ref("schemas").on("value", (ss) => {
      this.schemas = ss && ss.val();
    });
  }

  destroyed(): void {
    if (this.onValue) {
      firebase.database().ref("schemas").off("value", this.onValue);
    }
  }

  logout(): void {
      firebase.auth().signOut()
        .then(() => {
            this.$router.push("/");
        });
  }
}
</script>