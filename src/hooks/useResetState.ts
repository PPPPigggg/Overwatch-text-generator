type ResetState<S> = () => S
import { deepClone } from "@/utils/clone"
import { reactive, toValue } from "vue"
import type { MaybeRefOrGetter, Reactive } from "vue"

/**
 * @description 重置对象hooks
 * @param initialState 对象
 * @returns {[state, resetState]}
 */
export const useResetState = <S extends Recordable>(
  initialState: MaybeRefOrGetter<S>,
): [Reactive<S>, ResetState<S>] => {
  const initStateRef = toValue(initialState)
  const initialStateMemo = deepClone(initStateRef)

  const state = reactive(initStateRef)

  const resetState = () => {
    Object.assign(state, initialStateMemo)
    return initialStateMemo
  }

  return [state, resetState]
}
