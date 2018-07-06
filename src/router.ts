import Vue from "vue";
import Router from "vue-router";
import SchemaList from "./views/schema/SchemaList.vue";
import SchemaEdit from "./views/schema/SchemaEdit.vue";
import DataList from "./views/data/DataList.vue";
import DataEdit from "./views/data/DataEdit.vue";

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: "/",
      name: "model-list",
      component: SchemaList
    },
    {
      path: "/models/:modelName/schema",
      name: "model-schema-edit",
      component: SchemaEdit
    },
    {
      path: "/models/:modelName/data",
      name: "model-data-edit",
      component: DataList
    },
    {
      path: "/models/:modelName/data/:id",
      name: "model-data-object-edit",
      component: DataEdit
    }
  ],
});
