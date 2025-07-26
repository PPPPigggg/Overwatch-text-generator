import { isNumber, isObject } from "@/utils/is"
import { ref, onUnmounted } from "vue"
import type { Ref } from "vue"

interface ICountDownReturn {
  count: Ref<number>
  isDone: Ref<boolean>
  start: (second?: number) => void
  stop: () => void
}

interface ICountDownEvents {
  onChange?: (count: number) => void
  onFinish?: () => void
}

/**
 * 倒计时
 */
export function useCountDown(
  num: number,
  events?: ICountDownEvents,
): ICountDownReturn
export function useCountDown(
  num: ICountDownEvents,
  events?: undefined,
): ICountDownReturn
export function useCountDown(
  num: ICountDownEvents | number = 0,
  events?: ICountDownEvents,
): ICountDownReturn {
  if (!isNumber(num) && isObject(num)) {
    events = num as ICountDownEvents
    num = 0
  }

  const count = ref(num)
  const isDone = ref(true)
  let timer: FnReturnType<typeof setInterval>

  const start = (second: number = 0) => {
    if (!isNumber(second)) {
      second = 0
    }

    if (second) {
      count.value = second || num
    }
    isDone.value = false
    timer = setInterval(() => {
      count.value--
      events?.onChange && events.onChange(count.value)

      if (count.value === 0) {
        count.value = second || num
        events?.onFinish && events.onFinish()
        isDone.value = true
        stop()
      }
    }, 1000)
  }

  const stop = () => {
    clearInterval(timer)
  }

  onUnmounted(() => {
    clearInterval(timer)
  })

  return { count, isDone, start, stop }
}
