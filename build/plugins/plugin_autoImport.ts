/**
 * @name AutoImportDeps
 * @description 按需加载，自动引入
 */

import AutoImport from "unplugin-auto-import/vite"
import { VantResolver } from "@vant/auto-import-resolver"

export default function () {
  return AutoImport({
    dts: "types/auto-imports.d.ts",
    dirs: ["src/hooks/*"],
    imports: ["vue", "vue-router"],
    vueTemplate: true,
    resolvers: [
      VantResolver({
        importStyle: false, // 为了避免出现某些样式没有正确的打包，这里设置为全量引入
      }),
    ],
  })
}
