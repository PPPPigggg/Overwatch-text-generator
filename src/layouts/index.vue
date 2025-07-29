<script lang="ts" setup>
import LightOrDark from "./components/lightOrDark/index.vue"
</script>

<template>
  <div class="content">
    <div class="setting-header">
      <LightOrDark />
    </div>
    <slot></slot>
  </div>
</template>

<style lang="scss" scoped>
.content {
  display: flex;
  overflow-y: auto;
  flex-direction: column;
  height: 100%;

  .setting-header {
    display: flex;
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    z-index: 1000;
    justify-content: flex-end;
    align-items: center;
    padding: 0 16px;
    height: 60px;
  }
}
</style>
