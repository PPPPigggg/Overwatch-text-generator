import { ref, type Ref, type UnwrapRef } from "vue"

export interface Actions {
  setLeft: () => void
  setRight: () => void
  toggle: () => void
}

/**
 * 用于在两个状态值间切换的 Hook。
 *
 * @param {any} left - 左侧状态(不传默认为左侧 false)
 * @param {any} right - 右侧状态(默认值为true)
 * @returns {[state, { toggle, setLeft,setRight,}]}
 *
 * @example
 * const [state, {toggle}] = useToggle();
 *
 * @example
 * const [state, {toggle}] = useToggle('left', 'right');
 */
export const useToggle = <L = true, R = false>(
  left = false as L,
  right = true as R,
): [Ref<L | R>, Actions] => {
  const state = ref(left) as Ref<L | R>

  const toggle = () => {
    state.value = state.value === left ? right : left
  }

  const setLeft = () => {
    state.value = left
  }
  const setRight = () => {
    state.value = right
  }

  return [
    state,
    {
      toggle,
      setLeft,
      setRight,
    },
  ]
}
