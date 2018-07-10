<template>
    <div>
        <h1>Welcome to MyDB</h1>
        <p v-if="user">
            Welcome back, {{user.displayName || user.email}}!<br>
            <router-link to="/models">Go to MyDB</router-link><br>
            <span class="link-like" v-on:click="logOut">Log out</span>
        </p>
        <p v-if="!user">
            You need to be logged in in order to access this database.
            <ul>
                <li><router-link :to="{ name: 'signin' }">Login</router-link></li>
                <li><router-link :to="{ name: 'signup' }">Sign Up</router-link></li>
            </ul>
        </p>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import firebase from "firebase/app";

@Component
export default class HomePage extends Vue {
    user: firebase.User | null = null;

    created(): void {
        firebase.auth().onAuthStateChanged(user => {
            this.user = user;
        });
    }

    logOut(): void {
        firebase.auth().signOut();
    }
}
</script>
