<template>
    <form v-on:submit.prevent="signIn">
        <h1>Sign In</h1>
        <label>Email:</label><br>
        <input type="text" v-model="email"><br>
        <label>Password:</label><br>
        <input type="password" v-model="password"><br>
        <button type="submit">Sign In</button>
    </form>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import firebase from "firebase/app";

@Component
export default class SignIn extends Vue {
    email: string = "";
    password: string = "";

    signIn(): void {
        firebase.auth().signInWithEmailAndPassword(this.email, this.password)
            .then(() => {
                console.log("login success!");
                this.$router.push("/models");
            })
            .catch(err => {
                alert("Login didn't work :( " + err.message);
            });
    }
}
</script>
