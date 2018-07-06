import Vue from "vue";
import Router from "vue-router";
import SchemaList from "./views/schema/List.vue";
import SchemaEdit from "./views/schema/Edit.vue";
import DataList from "./views/data/List.vue";
import DataEdit from "./views/data/Edit.vue";

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
