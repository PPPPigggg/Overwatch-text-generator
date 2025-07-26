import { createLoading } from "@/components/loading"
import type { Directive } from "vue"

export default {
  name: "loading",
  directive: {
    mounted(el, binding) {
      const text = el.getAttribute("loading-tip")
      const background = el.getAttribute("loading-background")
      const fullscreen = !!binding.modifiers.fullscreen
      const instance = createLoading(
        {
          text,
          background,
          loading: !!binding.value,
          absolute: !fullscreen,
        },
        fullscreen ? document.body : el,
      )
      el.style.position = "relative"
      el.instance = instance
    },
    updated(el, binding) {
      const instance = el.instance as FnReturnType<typeof createLoading>
      if (!instance) return
      instance.setText(el.getAttribute("loading-text"))
      if (binding.oldValue !== binding.value) {
        instance.setLoading?.(binding.value && !instance.loading)
      }
    },
    unmounted(el) {
      el?.instance?.close()
    },
  } as Directive,
}
