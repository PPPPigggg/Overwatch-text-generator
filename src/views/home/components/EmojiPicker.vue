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
        allow-clear
      />
      <div class="font-size-12px text-gray py-2">键入 @ 符号可按分类搜索</div>
    </div>

    <a-list
      class="emoji-container"
      :virtualListProps="{
        height: defaultContainerHeight,
        fixedSize: true,
      }"
      size="small"
      :bordered="false"
      :split="false"
      :data="emojiList"
      @contextmenu.prevent
      scrollbar
    >
      <template #item="{ item, index }">
        <a-list-item :key="index" class="emoji-list-item">
          <div class="emoji-row">
            <template v-for="emojiItem in item" :key="emojiItem.id">
              <a-popconfirm
                content="是否移除收藏？"
                :disabled="!userStateStore.topEmojis.includes(emojiItem.id)"
                trigger="contextMenu"
                @ok="removeEmoji(emojiItem.id)"
                @contextmenu.prevent="
                  userStateStore.topEmojis.includes(emojiItem.id)
                    ? void 0
                    : addEmoji(emojiItem.id)
                "
              >
                <div class="emoji-item" @click="$emit('select', emojiItem)">
                  <a-image
                    :src="emojiItem.url"
                    show-loader
                    :preview="false"
                    :alt="emojiItem.name || emojiItem.id"
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
              </a-popconfirm>
            </template>
          </div>
        </a-list-item>
      </template>
    </a-list>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import type { IEmojiItem } from "../type"
import { useUserStore } from "@/stores/modules/state"

const userStateStore = useUserStore()
const { addEmoji, removeEmoji } = userStateStore

function changeEmojis(emojiItem: IEmojiItem) {
  // if (userStateStore.topEmojis.includes(emojiItem.id)) {
  //   removeEmoji(emojiItem.id)
  // } else {
  //   addEmoji(emojiItem.id)
  // }
}

interface Props {
  emojis: IEmojiItem[]
}

const defaultItemsPerRow = 7 // 每行显示的表情数量
const defaultContainerHeight = 400

function listToRows(list: IEmojiItem[]) {
  const rows = Math.ceil(list.length / defaultItemsPerRow)
  return Array.from({ length: rows }, (_, rowIndex) =>
    list.slice(
      rowIndex * defaultItemsPerRow,
      (rowIndex + 1) * defaultItemsPerRow,
    ),
  )
}

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

const emojiList = computed(() => {
  const emojis = filteredEmojis.value
  return listToRows(emojis)
})
</script>

<style lang="scss" scoped>
.emoji-picker {
  border: 1px solid var(--border-color-3);
  border-radius: 8px;
  background: var(--bg-color-2);
  box-shadow: var(--shadow-color-2);
}

.search-container {
  padding: 12px;
  padding-bottom: 0;
  border-bottom: 1px solid var(--border-color-3);
}

.search-input {
  padding: 8px 12px;
  border-radius: 6px;
  width: 100%;
  outline: none;
  font-size: 14px;
  transition: border-color 0.2s;
}

.emoji-container {
  position: relative;
  min-width: 200px;
}

.emoji-list {
  position: relative;
  width: 100%;
}

.emoji-list-item {
  $gap: 8px;

  padding: $gap $gap 0 !important;

  &:first-child {
    padding-top: $gap !important;
  }

  .emoji-row {
    display: flex;
    width: auto;
    /* stylelint-disable */
    grid-template-columns: repeat(v-bind(defaultItemsPerRow), 1fr);
    gap: $gap;
  }

  .emoji-item {
    display: flex;
    overflow: hidden;
    justify-content: center;
    box-sizing: border-box;
    align-items: center;
    padding: 2px;
    border-radius: 6px;
    width: 35px;
    height: 35px;
    background-color: var(--fill-color-3);
    cursor: pointer;
    transition: background-color 0.25s;

    &:hover {
      background-color: #f06414;
    }

    .emoji-image {
      width: 100%;
      height: 100%;
      transition: all 0.3s;

      &:hover {
        transform: scale(1.2);
      }

      &:active {
        transform: scale(0.98);
        transition: all 0.25s;
      }
    }
  }
}

body[arco-theme="dark"] .emoji-item {
  background: var(--bg-color-5);
}
</style>
