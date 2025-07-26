import "nprogress/nprogress.css" // 进度条样式
import { createRouter, createWebHashHistory } from "vue-router"

import { createRouterGuards } from "./guards/index"
import notAuthRoutes from "./modules/not-auth-modules/index"
// import authRoutes from "./modules/auth-modules/index"
import { flatRouter } from "./generator-router"

import type { App } from "vue"
import type { RouteRecordRaw } from "vue-router"
import { deepClone } from "@/utils/clone"

export const routes: Array<RouteRecordRaw> = flatRouter([
  // ...authRoutes,
  ...notAuthRoutes,
])

const whiteNameList = flatRouter(deepClone(notAuthRoutes)).map(
  (item) => item.name as string,
)

export const router = createRouter({
  // process.env.BASE_URL
  history: createWebHashHistory(),
  routes,
})

export async function setupRouter(app: App) {
  // 创建路由守卫
  createRouterGuards(router, whiteNameList)

  app.use(router)

  // 路由准备就绪后挂载APP实例
  await router.isReady()
}
export default router
