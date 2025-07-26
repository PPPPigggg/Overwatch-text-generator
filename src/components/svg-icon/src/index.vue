<template>
  <span
    :style="{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: props.color,
    }"
    class="svg-icon size-16px"
  >
    <svg aria-hidden="true" :class="'size-100%'">
      <use :xlink:href="symbolId" />
    </svg>
  </span>
</template>

<script lang="ts" setup>
import { computed, type CSSProperties } from "vue"
defineOptions({
  name: "SvgIcon",
})

const props = defineProps({
  prefix: {
    type: String,
    default: "svg-icon",
  },
  name: {
    type: String,
    required: true,
  },
  size: {
    type: [Number, String],
    default: 16,
  },
  color: {
    type: String,
    default: "var(--text-color-2)",
  },
})
const symbolId = computed(() => `#${props.prefix}-${props.name}`)
</script>

<style scoped lang="scss">
.svg-icon {
  & > svg {
    overflow: hidden;
    fill: currentcolor;
  }
}
</style>
