<script lang="ts" setup>
// import Tabbar from "./components/Tabbar.vue"
</script>

<template>
  <div class="content">
    <slot></slot>
  </div>
</template>

<style lang="scss" scoped>
.content {
  display: flex;
  overflow-y: auto;
  flex-direction: column;
  height: 100%;

  background-color: rgb(248 244 241 /1) /* #f8f4f1 */;
}
</style>
