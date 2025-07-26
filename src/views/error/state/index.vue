<template>
  <div class="page-container">
    <div>
      <div class="text-center font-size-70px font-bold font-italic text-color1">
        {{ state }}
      </div>
      <div class="mb-20px text-center font-size-16px text-color3">
        {{ message }}
      </div>
      <van-button
        round
        type="primary"
        class="w-200px"
        @click="
          router.replace({
            path: '/',
          })
        "
      >
        回到首页
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const state = route.params?.state || "404"
const message = computed(() => "错误")
</script>

<style lang="scss" scoped>
.page-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: white;
}
</style>
