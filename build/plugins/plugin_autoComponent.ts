/**
 * @name  AutoRegistryComponents
 * @description 按需加载，自动引入组件
 */
import Components from "unplugin-vue-components/vite"
import { ArcoResolver } from "unplugin-vue-components/resolvers"
import IconsResolver from "unplugin-icons/resolver"
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
      ArcoResolver({
        sideEffect: true,
      }),
      IconsResolver({ prefix: false, extension: "jsx" }),
    ],
    dirs: ["src/components/*"],
    extensions: ["vue", "tsx", "ts"],
    deep: false,
    directoryAsNamespace: false,
    globalNamespaces: [],
    directives: true,
    include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
    exclude: [/[\\/]node_modules[\\/]/, /[\\/]\.git[\\/]/, /[\\/]\.nuxt[\\/]/],
  })
}
