import type { RouteRecordRaw } from "vue-router"
import { HOME_NAME } from "./../../constant"

// 默认tabbar都是需要权限校验的路由
// 可以通过meta中的auth来手动设置是否需要权限校验
export default [
  {
    name: HOME_NAME,
    path: "/",
    meta: {
      // icon: "home",
      title: import.meta.env.VITE_APP_TITLE,
    },
    component: () => import("@/views/home/index.vue"),
  },
] as RouteRecordRaw[]
