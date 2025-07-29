<script lang="ts" setup>
import { useSettingStore } from "@/stores/modules/layoutSetting"
import { storeToRefs } from "pinia"

const layoutSettingStore = useSettingStore()
const { themeMode } = storeToRefs(layoutSettingStore)
const {  setTheme } = layoutSettingStore

const toggle = (event: MouseEvent) => {
  const navTheme = themeMode.value

  const x = event.clientX
  const y = event.clientY
  const endRadius = Math.hypot(
    Math.max(x, innerWidth - x),
    Math.max(y, innerHeight - y),
  )
  const themeChange = () => {
    if (navTheme === "dark") {
      setTheme("light")
    } else {
      setTheme("dark")
    }
  }

  let isDark = navTheme === "dark"

  // @ts-ignore

  if (document?.startViewTransition) {
    // @ts-ignore
    const transition = document?.startViewTransition(themeChange)

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ]
      document.documentElement.animate(
        {
          clipPath: isDark ? [...clipPath].reverse() : clipPath,
        },
        {
          duration: 500,
          easing: "ease-in",
          pseudoElement: isDark
            ? "::view-transition-old(root)"
            : "::view-transition-new(root)",
        },
      )
    })
  } else {
    themeChange()
  }
}

onMounted(() => {
  const navTheme = themeMode.value
  setTheme(navTheme)
})
</script>

<template>
  <div @click="toggle" class="cursor-pointer text-24px">
    <icon-sun-fill v-if="themeMode === 'light'" />
    <icon-moon-fill v-else />
  </div>
</template>

<style lang="scss">
::view-transition-old(root),
::view-transition-new(root) {
  mix-blend-mode: normal;
  animation: none;
}

/* 进入dark模式和退出dark模式时，两个图像的位置顺序正好相反 */
.dark::view-transition-old(root) {
  z-index: 1;
}

.dark::view-transition-new(root) {
  z-index: 999;
}

::view-transition-old(root) {
  z-index: 999;
}

::view-transition-new(root) {
  z-index: 1;
}
</style>
