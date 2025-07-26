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
      <template v-if="Component">
        <transition :name="transitionName" mode="out-in" appear>
          <keep-alive :include="keepAliveComponents">
            <component :is="Component" :key="route.fullPath" />
          </keep-alive>
        </transition>
      </template>
    </router-view>
  </Layout>
</template>

<style lang="scss" scoped></style>
