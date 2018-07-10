import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import firebase from "firebase/app";
import "firebase/database";
import "firebase/auth";
import firebaseConfig from "./firebase-config";

Vue.config.productionTip = false;

firebase.initializeApp(firebaseConfig);

firebase.auth().onAuthStateChanged(user => {
  if (!user) {
    console.log("logged out");
  } else {
    console.log("logged in", user.email);
  }
})

Vue.filter("capitalize", (value: string) => {
  if (!value) {
    return "";
  }
  value = value.toString()
  return value.charAt(0).toUpperCase() + value.slice(1);
});

new Vue({
  router,
  render: (h) => h(App),
}).$mount("#app");



