<script lang="ts" setup>
import routerTabbar from "@/router/modules/auth-modules/tabbar"

const route = useRoute()

const showTbbar = computed(
  () =>
    routerTabbar.find((item) => item.name === route.name) ||
    route.meta?.showTabbar === true,
)
</script>

<template>
  <van-tabbar v-if="showTbbar" route safe-area-inset-bottom placeholder fixed>
    <van-tabbar-item
      v-for="(item, index) in routerTabbar"
      :key="index"
      :to="item.path"
    >
      <span>{{ item.meta?.title }}</span>
      <template #icon="props">
        <SvgIcon
          class="size-22px"
          :name="
            props.active ? item?.meta?.icon + '-o' : (item?.meta?.icon as any)
          "
        />
      </template>
    </van-tabbar-item>
  </van-tabbar>
</template>

<style lang="scss" scoped></style>
