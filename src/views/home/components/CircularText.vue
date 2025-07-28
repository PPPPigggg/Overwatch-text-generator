<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from "vue"
import { animate as anime, JSAnimation } from "animejs"

interface CircularTextProps {
  text: string
  spinDuration?: number
  onHover?: "slowDown" | "speedUp" | "pause" | "goBonkers"
  className?: string
}

const props = withDefaults(defineProps<CircularTextProps>(), {
  text: "",
  spinDuration: 20,
  onHover: "speedUp",
  className: "",
})

const letters = computed(() => Array.from(props.text))
const isHovered = ref(false)
const containerRef = ref<HTMLElement | null>(null)
let animationInstance: JSAnimation | null = null

const runAnimation = () => {
  if (animationInstance) {
    animationInstance.pause()
  }

  if (isHovered.value && props.onHover === "pause") {
    return // 暂停动画
  }

  const baseDuration = props.spinDuration * 1000
  let duration = baseDuration
  let scale = 1

  if (isHovered.value) {
    switch (props.onHover) {
      case "slowDown":
        duration = baseDuration * 2
        break
      case "speedUp":
        duration = baseDuration / 4
        break
      case "goBonkers":
        duration = baseDuration / 20
        scale = 0.8
        break
    }
  }

  if (containerRef.value) {
    animationInstance = anime(containerRef.value, {
      rotate: "+=360",
      scale,
      loop: true,
      duration,
      easing: "linear",
    })
  }
}

onMounted(() => {
  if (containerRef.value) {
    runAnimation()
  }
})

watch(isHovered, () => {
  runAnimation()
})

onUnmounted(() => {
  if (animationInstance) {
    animationInstance.pause()
    animationInstance = null
  }
})

const handleHoverStart = () => {
  isHovered.value = true
}

const handleHoverEnd = () => {
  isHovered.value = false
}

const getLetterTransform = (index: number) => {
  const rotationDeg = (360 / letters.value.length) * index
  const factor = Math.PI / letters.value.length
  const x = factor * index
  const y = factor * index
  return `rotateZ(${rotationDeg}deg) translate3d(${x}px, ${y}px, 0)`
}
</script>

<template>
  <div
    ref="containerRef"
    :class="`m-0 mx-auto rounded-full w-[100px] h-[100px] relative font-black text-black text-center cursor-pointer origin-center ${props.className}`"
    @mouseenter="handleHoverStart"
    @mouseleave="handleHoverEnd"
  >
    <span
      v-for="(letter, i) in letters"
      :key="i"
      class="absolute inline-block inset-0 text-12px transition-all duration-500 ease-[cubic-bezier(0,0,0,1)]"
      :style="{
        transform: getLetterTransform(i),
        WebkitTransform: getLetterTransform(i),
      }"
    >
      {{ letter }}
    </span>
  </div>
</template>
