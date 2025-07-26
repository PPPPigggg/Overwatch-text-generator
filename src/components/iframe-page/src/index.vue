<template>
  <div class="iframe-box h-full w-full">
    <iframe
      ref="iframeRef"
      class="h-full w-full border-none outline-none"
      :src="src"
      v-bind="$attrs"
      @load="onFrameLoad"
    ></iframe>
  </div>
</template>
<script lang="ts" setup>
import { showLoadingToast } from "vant"
import { ref } from "vue"

const iframeRef = ref<HTMLIFrameElement | null>(null)

defineOptions({
  name: "IFramePage",
})

defineProps({
  src: {
    type: String,
    required: true,
  },
})

const emits = defineEmits<{
  (e: "load"): void
}>()

const loading = showLoadingToast({
  message: "",
  forbidClick: true,
})

const onFrameLoad = () => {
  emits("load")
  loading.close()
}

defineExpose({
  instance: () => iframeRef.value,
})
</script>
<style lang="scss" scoped>
.iframe-box {
  transform: translate(0);

  :deep(div[class^="ant-spin"]) {
    width: 100%;
    height: 100%;
  }
}
</style>
