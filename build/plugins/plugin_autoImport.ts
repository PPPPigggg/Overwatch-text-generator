/**
 * @name AutoImportDeps
 * @description 按需加载，自动引入
 */

import AutoImport from "unplugin-auto-import/vite"
import { ArcoResolver } from "unplugin-vue-components/resolvers"

export default function () {
  return AutoImport({
    dts: "types/auto-imports.d.ts",
    dirs: ["src/hooks/*"],
    imports: ["vue", "vue-router"],
    vueTemplate: true,
    resolvers: [
      ArcoResolver(),
    ],
  })
}
