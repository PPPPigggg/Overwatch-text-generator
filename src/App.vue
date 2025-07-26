<script lang="ts" setup>
import Layout from "@/layouts/index.vue"

import { computed } from "vue"
import { useKeepAliveStore } from "@/stores/modules/keepAlive"
import { isEmpty } from "./utils/is"
const route = useRoute()
// 缓存的路由组件列表
const keepAliveStore = useKeepAliveStore()

const transitionName = computed(() => {
  return !isEmpty(route.meta?.transitionName)
    ? route.meta?.transitionName
    : "fade-slide"
})

const keepAliveComponents = computed(() => keepAliveStore.list)
</script>

<template>
  <Layout>
    <router-view v-slot="{ Component }">
      <component :is="Component" :key="route.fullPath" />
    </router-view>
  </Layout>
</template>

<style lang="scss" scoped></style>
