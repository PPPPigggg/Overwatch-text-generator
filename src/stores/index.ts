import { createPinia } from "pinia"
import { createPersistedState } from "pinia-plugin-persistedstate"
import { parse, stringify } from "zipson"
import { SelfStorage } from "./encrypt"

import type { App } from "vue"
// 存储持久化配置

const pinia = createPinia()

export function setupStore(app: App<Element>) {
  pinia.use(
    createPersistedState({
      key: (id) => `store_${id}`,
      // 采用zipson压缩localStorage存储的内容
      serializer: {
        deserialize: parse,
        serialize: stringify,
      },
      storage: SelfStorage,
    }),
  )
  app.use(pinia)
}

export { pinia as store }
