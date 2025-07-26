import type { RouteRecordRaw } from "vue-router"
import { PAGE_NOT_FOUND_NAME, HOME_NAME } from "@/router/constant"

const moduleName = "error"

export const errorRoute: RouteRecordRaw[] = [
  {
    path: "/error",
    name: moduleName,
    redirect: "/error/404",
    meta: {
      title: "错误页",
    },
    children: [
      {
        path: ":state(\\d+)",
        name: PAGE_NOT_FOUND_NAME,
        meta: {
          title: "error",
        },
        component: () => import("@/views/error/state/index.vue"),
      },
      {
        path: "wx-error",
        name: "WxError",
        meta: {
          title: "错误",
        },
        component: () => import("@/views/error/wx-error/index.vue"),
      },
    ],
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    meta: {
      title: "NotFound",
    },
    redirect: {
      name: HOME_NAME,
    },
  },
]

export default errorRoute as RouteRecordRaw[]
