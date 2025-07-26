import { throttle } from "@/utils"
import { isFunction } from "@/utils/is"
import {
  onActivated,
  onBeforeMount,
  onDeactivated,
  onMounted,
  onUnmounted,
  ref,
  type Ref,
} from "vue"

type FnType = (width: number) => void

/**
 * 用于监听元素或窗口大小变化的钩子函数
 *
 * @param {HTMLElement | null | Function} [dom] - 要监听的DOM元素或回调函数
 * @param {Function} [onResize] - 大小变化时的回调函数
 * @returns {{width: import('vue').Ref<number>}} 返回一个包含宽度ref的对象
 *
 * @example
 * // 监听窗口大小变化
 * const { width } = useResize();
 *
 * @example
 * // 监听特定元素大小变化
 * const el = ref(null);
 * const { width } = useResize(el);
 *
 * @example
 * // 使用回调函数
 * const { width } = useResize((newWidth) => {
 *   console.log('New width:', newWidth);
 * });
 */

export function useResize(dom?: FnType): {
  width: Ref<number>
}
export function useResize(
  dom: HTMLElement | null | FnType,
  onResize?: FnType,
): { width: Ref<number> }
export function useResize(
  dom?: HTMLElement | null | FnType,
  onResize?: FnType,
): { width: Ref<number> } {
  // 重载参数
  if (dom && isFunction(dom)) {
    onResize = dom
    dom = null
  }
  const isObserverDom = dom && dom instanceof HTMLElement

  // 监听屏幕变化
  const width = ref(0)
  let observer

  if (isObserverDom) {
    const resize = (
      entries: ResizeObserverEntry[],
      observer: ResizeObserver,
    ) => {
      width.value = entries[0].contentRect.width
    }

    observer = new ResizeObserver(resize)
    observer.observe(dom as HTMLElement)

    if (onResize && isFunction(onResize)) {
      // @ts-ignore
      watch(width, () => onResize(toValue(width)))
    }

    onBeforeMount(() => {
      observer && observer.disconnect()
    })
  } else {
    const resize = throttle((e: UIEvent) => {
      width.value = (e.target as Window).innerWidth
    }, 500)

    onMounted(() => {
      resize({
        target: { innerWidth: window.innerWidth },
      } as unknown as UIEvent)
      window.addEventListener("resize", resize)
    })
    onActivated(() => {
      resize({
        target: { innerWidth: window.innerWidth },
      } as unknown as UIEvent)
      window.addEventListener("resize", resize)
    })
    onUnmounted(() => {
      window.removeEventListener("resize", resize)
    })
    onDeactivated(() => {
      window.removeEventListener("resize", resize)
    })
    if (onResize && isFunction(onResize)) {
      // @ts-ignore
      watch(width, () => onResize(toValue(breakPoint), toValue(width)))
    }
  }

  return {
    width,
  }
}
