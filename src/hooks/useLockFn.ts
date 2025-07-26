import { ref } from "vue"

/**
 * 异步锁，上一次没有执行完，下一次无法执行
 * @param fn
 * @returns {function(...[*]=): Promise<*>}
 *
 * @example
 * const [submit, loading] = useLockFn(async () => await requist());
 * submit() // 第一次请求
 * submit() // 第一次没有结束，第二次无法请求
 */
export const useLockFn = (fn: (...args: any[]) => Promise<any> | any) => {
  const loading = ref(false)

  const submit = async (...args: any[]) => {
    if (loading.value) return
    loading.value = true
    try {
      return await fn(...args)
    } finally {
      loading.value = false
    }
  }
  return [submit, loading]
}
