import type { RouteRecordRaw } from "vue-router"
import { HOME_NAME } from "@/router/constant"
// import errRoutes from "./error"

/**
 * 不需要登陆权限的路由
 */
export default [
  {
    name: HOME_NAME,
    path: "/",
    meta: {
      icon: "home",
      title: import.meta.env.VITE_APP_TITLE,
    },
    component: () => import("@/views/home/index.vue"),
  },
] as RouteRecordRaw[]
