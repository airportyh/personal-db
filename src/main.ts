import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import firebase from "firebase/app";
import "firebase/database";

Vue.config.productionTip = false;

const firebaseConfig = {
  databaseURL: "https://personal-db-ef6ad.firebaseio.com/",
  projectId: "personal-db-ef6ad"
};

firebase.initializeApp(firebaseConfig);

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
