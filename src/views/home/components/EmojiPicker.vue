<template>
  <div class="emoji-picker">
    <!-- 搜索框 -->
    <div class="search-container">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="搜索表情..."
        class="search-input"
      />
    </div>

    <!-- 虚拟滚动容器 -->
    <div ref="containerRef" class="emoji-container" @scroll="handleScroll">
      <div class="emoji-list" :style="{ height: `${totalHeight}px` }">
        <div
          class="emoji-row"
          :style="{ transform: `translateY(${startOffset}px)` }"
        >
          <div
            v-for="(emoji, index) in visibleEmojis"
            :key="emoji.code"
            class="emoji-item"
            @click="$emit('select', emoji)"
          >
            <img
              :src="emoji.src"
              :alt="emoji.name || emoji.code"
              class="emoji-image"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue"

interface Emoji {
  code: string
  src: string
  name?: string
}

interface Props {
  emojis: Emoji[]
  itemHeight?: number
  itemsPerRow?: number
  containerHeight?: number
}

const props = withDefaults(defineProps<Props>(), {
  itemHeight: 40,
  itemsPerRow: 8,
  containerHeight: 200,
})

const emit = defineEmits<{
  select: [emoji: Emoji]
}>()

const searchQuery = ref("")
const containerRef = ref<HTMLElement>()
const scrollTop = ref(0)

// 过滤后的表情
const filteredEmojis = computed(() => {
  if (!searchQuery.value.trim()) {
    return props.emojis
  }

  const query = searchQuery.value.toLowerCase()
  return props.emojis.filter(
    (emoji) =>
      emoji.name?.toLowerCase().includes(query) ||
      emoji.code.toLowerCase().includes(query),
  )
})

// 计算行数
const totalRows = computed(() =>
  Math.ceil(filteredEmojis.value.length / props.itemsPerRow),
)

// 总高度
const totalHeight = computed(() => totalRows.value * props.itemHeight)

// 可见区域的行数
const visibleRowCount = computed(
  () => Math.ceil(props.containerHeight / props.itemHeight) + 2,
)

// 开始行索引
const startRowIndex = computed(() =>
  Math.max(0, Math.floor(scrollTop.value / props.itemHeight) - 1),
)

// 结束行索引
const endRowIndex = computed(() =>
  Math.min(totalRows.value - 1, startRowIndex.value + visibleRowCount.value),
)

// 可见的表情
const visibleEmojis = computed(() => {
  const start = startRowIndex.value * props.itemsPerRow
  const end = (endRowIndex.value + 1) * props.itemsPerRow
  return filteredEmojis.value.slice(start, end)
})

// 偏移量
const startOffset = computed(() => startRowIndex.value * props.itemHeight)

// 处理滚动
const handleScroll = (event: Event) => {
  const target = event.target as HTMLElement
  scrollTop.value = target.scrollTop
}

onMounted(() => {
  // 重置滚动位置
  if (containerRef.value) {
    containerRef.value.scrollTop = 0
  }
})
</script>

<style scoped>
.emoji-picker {
  overflow: hidden;
  border-radius: 8px;
  background: white;
  box-shadow: 0 4px 12px rgb(0 0 0 / 10%);
}

.search-container {
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.search-input {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  width: 100%;
  outline: none;
  font-size: 14px;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: #3b82f6;
}

.emoji-container {
  overflow-y: auto;
  position: relative;
  height: 200px;
}

.emoji-list {
  position: relative;
  width: 100%;
}

.emoji-row {
  display: grid;
  position: absolute;
  top: 0;
  padding: 4px 8px;
  width: 100%;
  grid-template-columns: repeat(8, 1fr);
  gap: 4px;
}

.emoji-item {
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 4px;
  height: 32px;
  cursor: pointer;
  transition:
    background-color 0.2s,
    transform 0.1s;
}

.emoji-item:hover {
  background-color: #f3f4f6;
  transform: scale(1.1);
}

.emoji-image {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

/* 滚动条样式 */
.emoji-container::-webkit-scrollbar {
  width: 6px;
}

.emoji-container::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.emoji-container::-webkit-scrollbar-thumb {
  border-radius: 3px;
  background: #c1c1c1;
}

.emoji-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
