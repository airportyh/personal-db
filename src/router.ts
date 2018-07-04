import Vue from "vue";
import Router from "vue-router";
import ModelList from "./views/ModelList.vue";
import ModelSchemaEditor from "./views/ModelSchemaEditor.vue";
import ModelDataEditor from "./views/ModelDataEditor.vue";
import ModelDataObjectEditor from "./views/ModelDataObjectEditor.vue";

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: "/",
      name: "model-list",
      component: ModelList
    },
    {
      path: "/models/:id/schema",
      name: "model-schema-edit",
      component: ModelSchemaEditor
    },
    {
      path: "/models/:id/data",
      name: "model-data-edit",
      component: ModelDataEditor
    },
    {
      path: "/models/:modelName/data/:id",
      name: "model-data-object-edit",
      component: ModelDataObjectEditor
    }
  ],
});
