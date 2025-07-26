<template>
  <Transition>
    <section
      v-show="loading"
      class="full-loading"
      :class="{ absolute, [`${theme}`]: !!theme }"
      :style="[background ? `background-color: ${background}` : '']"
    >
      <Loading vertical v-bind="$attrs" color="var(--base-primary)">
        {{ text }}
      </Loading>
    </section>
  </Transition>
</template>
<script lang="ts" setup>
import { Loading } from "vant"
import { loadingProps } from "./props"

defineOptions({ name: "Loading" })

defineProps(loadingProps)
</script>
<style lang="scss" scoped>
.full-loading {
  display: flex;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 200;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: rgb(255 255 255 / 90%);

  &.absolute {
    position: absolute;
    left: 0;
    top: 0;
    z-index: 300;
  }
}

.full-loading.dark {
  background-color: rgb(122 122 122 / 80%);
}

html[data-theme="dark"] {
  .full-loading:not(.light) {
    background-color: var(--m-ant-color-bg-mask);
  }
}

.v-enter-active,
.v-leave-active {
  transition: opacity 0.2s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
