import type { RouteRecordRaw } from "vue-router"
import { PAGE_NOT_FOUND_NAME, HOME_NAME } from "@/router/constant"

export const errorRoute: RouteRecordRaw[] = [
  {
    path: "/error",
    name: PAGE_NOT_FOUND_NAME,
    meta: {
      title: "错误页",
    },
    component: () => import("@/views/error/state/index.vue"),
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    meta: {
      title: "NotFound",
    },
    redirect: {
      name: PAGE_NOT_FOUND_NAME,
    },
  },
]

export default errorRoute as RouteRecordRaw[]
