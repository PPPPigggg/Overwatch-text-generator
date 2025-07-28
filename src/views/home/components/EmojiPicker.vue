<template>
  <div class="emoji-picker">
    <!-- 搜索框 -->
    <div class="search-container">
      <a-mention
        v-model="searchQuery"
        placeholder="搜索表情，仅支持搜索部分图标..."
        type="text"
        class="search-input"
        :data="classification"
      />
      <div class="font-size-12px text-gray">键入 @ 符号可按分类搜索</div>
    </div>

    <!-- 虚拟滚动容器 -->
    <div ref="containerRef" class="emoji-container" @scroll="handleScroll">
      <div class="emoji-list" :style="{ height: `${totalHeight}px` }">
        <div
          class="emoji-row"
          :style="{ transform: `translateY(${startOffset}px)` }"
        >
          <div
            v-for="emoji in visibleEmojis"
            :key="emoji.id"
            class="emoji-item"
            @click="$emit('select', emoji)"
          >
            <a-image
              :src="emoji.url"
              show-loader
              :preview="false"
              :alt="emoji.name || emoji.id"
              class="emoji-image"
              loading="lazy"
            >
              <template #loader>
                <div class="size-100%">
                  <a-spin>
                    <template #icon>
                      <div class="size-100% m-auto text-center">
                        <img
                          class="size-70% m-auto"
                          src="@/assets/images/朱诺loading.gif"
                        />
                      </div>
                    </template>
                  </a-spin>
                </div>
              </template>
            </a-image>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue"
import type { IEmojiItem } from "../type"

interface Props {
  emojis: IEmojiItem[]
}

const defaultItemSize = 30
const defaultItemsPerRow = 8
const defaultContainerHeight = 400

const addPx = (value: number) => `${value}px`

const props = withDefaults(defineProps<Props>(), {})

defineEmits<{
  select: [emoji: IEmojiItem]
}>()

const classification = computed(() =>
  props.emojis
    .filter((emoji) => emoji.classify)
    .map((emoji) => emoji.classify)
    .filter((value, index, self) => self.indexOf(value) === index),
)

const searchQuery = ref("")
const containerRef = ref<HTMLElement>()
const scrollTop = ref(0)

// 过滤后的表情
const filteredEmojis = computed(() => {
  const list = props?.emojis || []

  if (!searchQuery.value.trim()) {
    return list
  }

  const query = searchQuery.value.trim()

  // 处理 @ 符号分类搜索
  if (query.includes("@")) {
    const parts = query.split("@").filter((part) => part.trim())
    if (parts.length === 0) return list

    return list.filter((emoji) => {
      return parts.some((part) => {
        const searchTerm = part.toLowerCase()
        return (
          emoji.classify?.toLowerCase().includes(searchTerm) ||
          emoji.name?.toLowerCase().includes(searchTerm) ||
          emoji.id.toLowerCase().includes(searchTerm)
        )
      })
    })
  }

  // 普通搜索（支持空格分隔的多关键词）
  const keywords = query
    .toLowerCase()
    .split(/\s+/)
    .filter((keyword) => keyword)
  if (keywords.length === 0) return list

  return list.filter((emoji) => {
    const name = emoji.name?.toLowerCase() || ""
    const id = emoji.id.toLowerCase()
    const classify = emoji.classify?.toLowerCase() || ""

    // 所有关键词都必须匹配（AND 逻辑）
    return keywords.every(
      (keyword) =>
        name.includes(keyword) ||
        id.includes(keyword) ||
        classify.includes(keyword),
    )
  })
})

// 计算行数
const totalRows = computed(() =>
  Math.ceil(filteredEmojis.value.length / defaultItemsPerRow),
)

// 总高度
const totalHeight = computed(() => totalRows.value * defaultItemSize)

// 可见区域的行数
const visibleRowCount = computed(
  () => Math.ceil(defaultContainerHeight / defaultItemSize) + 2,
)

// 开始行索引
const startRowIndex = computed(() =>
  Math.max(0, Math.floor(scrollTop.value / defaultItemSize) - 1),
)

// 结束行索引
const endRowIndex = computed(() =>
  Math.min(totalRows.value - 1, startRowIndex.value + visibleRowCount.value),
)

// 可见的表情
const visibleEmojis = computed(() => {
  const start = startRowIndex.value * defaultItemsPerRow
  const end = (endRowIndex.value + 1) * defaultItemsPerRow
  return filteredEmojis.value.slice(start, end)
})

// 偏移量
const startOffset = computed(() => startRowIndex.value * defaultItemSize)

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

<style lang="scss" scoped>
.emoji-picker {
  overflow: hidden;
  border-radius: 8px;
  background: white;
  box-shadow: 0 4px 12px rgb(0 0 0 / 10%);
}

.search-container {
  padding: 12px;
  padding-bottom: 0;
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

  &:focus {
    border-color: #3b82f6;
  }
}

.emoji-container {
  min-width: 200px;
  overflow-y: auto;
  position: relative;
  height: v-bind(addPx(defaultContainerHeight));
}

.emoji-list {
  position: relative;
  width: 100%;
}

.emoji-row {
  display: grid;
  padding: 4px 8px;
  width: auto;
  grid-template-columns: repeat(v-bind(defaultItemsPerRow), 1fr);
  gap: 4px;
}

.emoji-item {
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 6px;
  width: v-bind(addPx(defaultItemSize));
  height: v-bind(addPx(defaultItemSize));
  cursor: pointer;
  transition: transform 0.5s;
  overflow: hidden;
  box-sizing: border-box;
  background-color: #cccccc;
  box-sizing: border-box;
  transition: all 0.3s;
  padding: 2px;

  &:hover {
    background-color: #ec6516;
    box-shadow: 0 0 20px #ec651650;
    transform: scale(1.1);
  }

  &:active {
    background-color: #ec6516;
    box-shadow: none;
    transform: scale(0.98);
    transition: all 0.25s;
  }

  .emoji-image {
    width: 100%;
    height: 100%;
  }
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
