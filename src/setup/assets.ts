import "virtual:svg-icons-register"
import "uno.css"
import "@/styles/index.scss"
import vConsole from "vconsole"
import type { App } from "vue"

// 引入静态资源
export const setupAssets = (app?: App) => {}

if (import.meta.env.DEV) {
  new vConsole()
}
