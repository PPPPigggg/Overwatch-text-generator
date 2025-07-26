// import type { ProxyOptions } from "vite"

// type ProxyTargetList = Record<string, ProxyOptions>

// const proxy = (env: Record<string, any>): ProxyTargetList => {
//   const { VITE_BASE_API } = env
//   return {
//     "/dev-api": {
//       target: VITE_BASE_API,
//       changeOrigin: true,
//       rewrite: (path) => {
//         return path && path.replace(/^\/dev-api/, "")
//       },
//     },
//   }
// }

// export default proxy
