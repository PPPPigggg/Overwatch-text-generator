import { createApp } from "vue"
import App from "./App.vue"
import { setupRouter } from "./router"
import { setupStore } from "@/stores"
import { setupAssets, setupDirectives, setupGlobalMethods } from "@/setup"
import "@arco-design/web-vue/es/message/style/css.js"

const app = createApp(App)

function setupMount() {
  // 引入静态资源
  setupAssets()
  // 注册全局自定义指令
  setupDirectives(app)
  // 挂载全局方法
  setupGlobalMethods(app)
}

async function setupApp() {
  // 挂载状态管理
  setupStore(app)
  // 挂载路由
  await setupRouter(app)

  app.mount("#app")
}

setupMount()

setupApp()
