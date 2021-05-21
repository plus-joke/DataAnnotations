/*
 * @Author: your name
 * @Date: 2021-04-28 12:42:02
 * @LastEditTime: 2021-05-08 09:15:34
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \DataAnnotationsDome\src\router\index.js
 */
import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Fabric",
    component: () => import("../views/Fabric.vue"),
  },
  {
    path: "/AILabel",
    name: "AILabel",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/AILabel.vue"),
  },
  {
    path: "/Fabric",
    name: "Fabric",
    component: () => import("../views/Fabric.vue"),
  },
  {
    path: "/Konva",
    name: "Konva",
    component: () => import("../views/Konva.vue"),
  },
  {
    path: "/ZRender",
    name: "ZRender",
    component: () => import("../views/ZRender.vue"),
  },
];

const router = new VueRouter({
  routes,
});

export default router;
