import type { StorageLike } from "pinia-plugin-persistedstate"
import SecureLS from "secure-ls"

// localStorage加密存储
const ls = new SecureLS({
  isCompression: false, //不压缩
  //自定义秘钥
  encryptionSecret: import.meta.env.VITE_STORAGE_ENCRYPT_KEY,
})
export const SelfStorage: StorageLike = {
  setItem(key: string, value: string) {
    ls.set(key, value)
  },
  getItem(key: string): string | null {
    return ls.get(key)
  },
}
