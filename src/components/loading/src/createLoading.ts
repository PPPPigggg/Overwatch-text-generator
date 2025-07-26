import { defineComponent, createVNode, render, reactive, h } from "vue"
import type { LoadingProps } from "./props"
import type { VNode } from "vue"

import Loading from "./index.vue"
console.log("Loading ==> ", Loading)

export function createLoading(
  props?: Partial<LoadingProps>,
  target?: HTMLElement,
  wait = false,
) {
  let vm: Nullable<VNode> = null
  const data = reactive({
    text: "加载中...",
    loading: true,
    ...props,
  }) as LoadingProps

  const LoadingWrap = defineComponent({
    render() {
      return h(Loading, { ...data })
    },
  })

  vm = createVNode(LoadingWrap)

  if (wait) {
    setTimeout(() => {
      render(vm, document.createElement("div"))
    }, 0)
  } else {
    render(vm, document.createElement("div"))
  }

  function close() {
    if (vm?.el && vm.el.parentNode) {
      vm.el.parentNode.removeChild(vm.el)
    }
  }

  function open(target: HTMLElement = document.body) {
    if (!vm || !vm.el) {
      return
    }
    target.appendChild(vm.el as HTMLElement)
  }

  if (target) {
    open(target)
  }
  return {
    vm,
    close,
    open,
    setText: (tip: string) => {
      data.text = tip
    },
    setLoading: (loading: boolean) => {
      data.loading = loading
    },
    get loading() {
      return data.loading
    },
    get $el() {
      return vm?.el as HTMLElement
    },
  }
}
