<template>
    <form v-on:submit.prevent="signUp">
        <h1>Sign Up</h1>
        <label>Email:</label><br>
        <input type="text" v-model="email"><br>
        <label>Password:</label><br>
        <input type="password" v-model="password"><br>
        <label>Confirm Password:</label><br>
        <input type="password" v-model="passwordAgain"><br>
        <button type="submit">Sign Up</button>
    </form>
</template>

<script lang="ts">
import { Component, Vue, Prop }  from "vue-property-decorator";
import firebase from "firebase/app";

@Component
export default class SignUp extends Vue {
    email: string = "";
    password: string = "";
    passwordAgain: string = "";

    signUp(): void {
        if (this.password !== this.passwordAgain) {
            alert("The passwords don't match!");
            return;
        }
        console.log("firebase.auth", firebase.auth);
        firebase.auth().createUserWithEmailAndPassword(this.email, this.password)
            .then(() => {
                this.$router.push("/models");
            })
            .catch(err => {
                alert("Couldn't sign up because " + err.message);
            });
        }
}
</script>
