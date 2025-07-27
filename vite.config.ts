import { resolve } from "node:path"
import { loadEnv } from "vite"
// import proxy from "./build/proxy"
import { createVitePlugins } from "./build/plugins"
import postcssPxToViewport from "postcss-px-to-viewport-8-plugin"
import postcssPresetEnv from "postcss-preset-env"

import type { UserConfig, ConfigEnv } from "vite"

const __APP_INFO__ = {
  lastBuildTime: new Date().toLocaleDateString(),
}

export default ({ command, mode }: ConfigEnv): UserConfig => {
  const isBuild = command === "build"
  // 环境变量
  const env = loadEnv(mode, process.cwd())
  const { VITE_DROP_CONSOLE } = env

  return {
    base: "/",
    define: {
      "process.env": {},
      __APP_INFO__: JSON.stringify(__APP_INFO__),
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: "true",
    },
    css: {
      postcss: {
        plugins: [
          postcssPresetEnv({
            autoprefixer: {
              grid: true,
            },
          }),
          // postcssPxToViewport({
          //   // options
          //   unitToConvert: "px", // 需要转换的单位，默认为"px"
          //   viewportWidth: 375, // 设计稿的视窗宽度
          //   unitPrecision: 5, // 单位转换后保留的精度
          //   viewportUnit: "vw", // 希望使用的视窗单位
          //   fontViewportUnit: "vw", // 字体使用的视窗单位
          //   selectorBlackList: [], // 需要忽略的 CSS 选择器，不会转为视窗单位，使用原有的 px 等单位
          //   minPixelValue: 1, // 设置最小的转换数值，如果为 1 的话，只有大于 1 的值会被转换
          //   mediaQuery: false, // 媒体查询里的单位是否需要转换单位
          // }),
        ],
      },
    },
    resolve: {
      alias: [
        {
          find: "@",
          replacement: resolve(__dirname, "./src"),
        },
      ],
    },
    plugins: [...createVitePlugins(isBuild)],
    server: {
      host: "0.0.0.0",
      port: 8080,
      // proxy: proxy(env),
    },
    optimizeDeps: {
      include: ["vue", "vue-router", "@vueuse/core"],
    },
    esbuild: {
      pure: VITE_DROP_CONSOLE ? ["console.log", "debugger"] : [],
      supported: {
        // https://github.com/vitejs/vite/pull/8665
        "top-level-await": true,
      },
    },
    build: {
      minify: "esbuild",
      cssTarget: "chrome79",
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        // 静态资源分类打包
        output: {
          chunkFileNames: "static/js/[name]-[hash].js",
          entryFileNames: "static/js/[name]-[hash].js",
          assetFileNames: "static/[ext]/[name]-[hash].[ext]",
        },
      },
    },
  }
}
