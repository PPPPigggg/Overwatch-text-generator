import vue from "@vitejs/plugin-vue"
import vueJsx from "@vitejs/plugin-vue-jsx"
import Unocss from "unocss/vite"
import autoComponent from "./plugin_autoComponent"
import { compression } from "vite-plugin-compression2"
import { chunkSplitPlugin } from "vite-plugin-chunk-split"
import autoImport from "./plugin_autoImport"
import envType from "./plugin_envType"
import svgIcon from "./plugin_svgIcon"
import vitePluginRequire from "vite-plugin-require"
import legacy from "@vitejs/plugin-legacy"
import { vitePluginForArco } from "@arco-plugins/vite-vue"

// @ts-ignore
import type { PluginOption } from "vite"
export function createVitePlugins(isBuild: boolean): PluginOption[] {
  const vitePlugins: PluginOption[] = [
    vue(),

    vueJsx(),
    vitePluginForArco({
      style: "css",
    }),
    Unocss(),
    // 按需加载组件，自动引入组件
    autoComponent(),
    // 按需加载，自动引入api
    autoImport(),
    // 分包
    chunkSplitPlugin({
      strategy: "default",
    }),
    // 自动生成环境变量类型
    envType({ dts: "types/env.d.ts" }),
    // 自动导入svg图标
    svgIcon(),
    // 使vite支持require导入
    (vitePluginRequire as any).default(),
    legacy({
      modernPolyfills: true,
      renderLegacyChunks: false,
    }),
  ]

  // gzip压缩
  if (isBuild) vitePlugins.push(compression())

  return vitePlugins
}
