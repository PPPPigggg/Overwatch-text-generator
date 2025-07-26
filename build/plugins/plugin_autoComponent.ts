/**
 * @name  AutoRegistryComponents
 * @description 按需加载，自动引入组件
 */
import Components from "unplugin-vue-components/vite"
import { VantResolver } from "@vant/auto-import-resolver"

export default function () {
  return Components({
    dts: "types/components.d.ts",
    types: [
      {
        from: "vue-router",
        names: ["RouterLink", "RouterView"],
      },
    ],
    resolvers: [
      VantResolver({
        importStyle: false, // 为了避免出现某些样式没有正确的打包，这里设置为全量引入
      }),
    ],
    dirs: ["src/components/*"],
    extensions: ["vue", "tsx", 'ts'],
    deep: false,
    directoryAsNamespace: false,
    globalNamespaces: [],
    directives: true,
    include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
    exclude: [/[\\/]node_modules[\\/]/, /[\\/]\.git[\\/]/, /[\\/]\.nuxt[\\/]/],
  })
}
