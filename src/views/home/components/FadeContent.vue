<template>
  <div ref="elementRef" :style="{ opacity: props.initialOpacity }">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue"
import { animate as anime, type AnimationParams } from "animejs"

const props = {
  blur: true,
  duration: 400,
  easing: "ease-out",
  delay: 200,
  threshold: 0.1,
  initialOpacity: 0,
  className: "",
}

const elementRef = ref<HTMLDivElement | null>(null)

onMounted(() => {
  const element = elementRef.value
  if (!element) return

  const animeProps: AnimationParams = {
    opacity: [props.initialOpacity, 1],
    duration: props.duration,
    easing: props.easing,
    delay: props.delay,
  }

  if (props.blur) {
    animeProps.filter = ["blur(10px)", "blur(0px)"]
  }

  anime(element, animeProps)
})
</script>
