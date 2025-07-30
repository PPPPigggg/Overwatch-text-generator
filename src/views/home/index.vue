<script lang="ts" setup>
import CircularText from "./components/CircularText.vue"
import FadeContent from "./components/FadeContent.vue"
import EmojiPicker from "./components/EmojiPicker.vue"

import SvgIcon from "@/components/svg-icon"
import { ref } from "vue"
import { copyText } from "@/utils/copy"
import { useFetch } from "@vueuse/core"
import { useUserStore } from "@/stores/modules/state"
import type { IEmojiItem } from "./type"
import { storeToRefs } from "pinia"

const userStateStore = useUserStore()

const { addEmoji, removeEmoji, iKnowTip } = userStateStore
const { topEmojis, knowTip } = storeToRefs(userStateStore)

function removeConfirm(id: string) {
  removeEmoji(id)
  setTimeout(() => {
    iKnowTip()
  }, 1000)
}

const { data: emojis, isFetching: emojisLoading } =
  useFetch("./textures.json").json<IEmojiItem[]>()

const topEmojiList = computed(() => {
  if (!emojis.value) return []
  // return emojis.value.filter((emoji) => topEmojis.value.includes(emoji.id))
  return topEmojis.value
    .map((id) => {
      const emoji = emojis.value?.find((e) => e.id === id)
      return emoji
    })
    .filter(Boolean) as IEmojiItem[]
})

// 编辑器 DOM 引用
const editorRef = ref<HTMLDivElement | null>(null)

const genEmojisCode = (code: string) => `<TXC00${code}>`

const genColorCode = (color: string, text: string) => {
  if (!color) return ""
  return `<FG${color.replace("#", "")}FF>${text}</FG${color.replace("#", "")}FF>`
}
// 预设颜色
const colors = [
  "#e11d48",
  "#f472b6",
  "#fb923c",
  "#facc15",
  "#84cc16",
  "#10b981",
  "#0ea5e9",
  "#3b82f6",
  "#8b5cf6",
  "#a78bfa",
  "#000000",
]

// 插入图标
const insertEmoji = (emoji: IEmojiItem) => {
  editorRef.value?.focus()

  const renderEl = document.createDocumentFragment()

  const img = document.createElement("img")
  img.src = emoji.url
  img.dataset.emojiCode = emoji.id // 使用 data-* 属性存储代码

  renderEl.appendChild(img)
  insertNodeAtCursor(renderEl)
}

const applyColor = (color?: string) => {
  const selection = window.getSelection()
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0)
    if (!range.collapsed) {
      const contents = range.extractContents()

      const renderEl = document.createDocumentFragment()

      Array.from(contents.childNodes || []).forEach((childEl) => {
        const el = childEl as HTMLElement

        if (el.nodeType === Node.ELEMENT_NODE && el.tagName === "IMG") {
          // 如果是图片，直接添加
          renderEl.appendChild(el)
          return
        }

        // 如果是文本节点，直接包裹span
        const spans = document.createDocumentFragment()

        Array.from(el.textContent || "").forEach((char) => {
          const span = wrapSpan(char, color)
          spans.appendChild(span)
        })

        renderEl.appendChild(spans)
      })

      const commonContainer = range.commonAncestorContainer

      const parentNode = commonContainer.parentNode as HTMLElement | null
      if (
        commonContainer.nodeType === Node.TEXT_NODE &&
        parentNode &&
        parentNode.nodeName === "SPAN"
      ) {
        parentNode.parentNode?.insertBefore(renderEl, parentNode.nextSibling)
      } else {
        range.insertNode(renderEl)
        // Select the newly inserted content
      }
    }
  }
}

// 编辑框输入事件
const handleInput = (e: InputEvent) => {
  // 清除 font 标签
  clearFont(e)
}

// 包装span标签
const wrapSpan = (text: string, color?: string) => {
  const span = document.createElement("span")
  if (color) {
    span.style.color = color
    span.dataset.colorCode = color
  }
  span.textContent = text
  return span
}
// 清除 font 标签
const clearFont = (e: InputEvent) => {
  const target = e.target as HTMLElement
  Array.from(target.querySelectorAll("font")).forEach((font) => {
    // 存放所有子节点
    const fragment = document.createDocumentFragment()
    while (font.firstChild) {
      fragment.appendChild(font.firstChild)
    }
    // 用content替换font自己，效果就是把内容提上来
    font.parentNode?.replaceChild(fragment, font)
  })
}

// 复制内容
const copyContent = async () => {
  if (!editorRef.value) return

  const contentClone = document.createDocumentFragment()
  contentClone.appendChild(editorRef.value.cloneNode(true))
  const resultText = nodeToContent(contentClone)

  copyText(resultText)
}
function nodeToContent(node: DocumentFragment): string {
  // 将图标图片替换为代码
  node.querySelectorAll("img[data-emoji-code]").forEach((img) => {
    const code = (img as HTMLElement).dataset.emojiCode
    if (code) {
      img.replaceWith(document.createTextNode(genEmojisCode(code)))
    }
  })

  // 将带颜色的span转换为颜色代码

  const spans = Array.from(
    node.querySelectorAll("span[data-color-code]"),
  ).filter(
    (span) => span.textContent && span.textContent.trim() !== "",
  ) as HTMLElement[]

  if (spans.length !== 0) {
    const groups: HTMLElement[][] = []
    let groupSpan = [spans[0] as HTMLElement]
    for (let i = 1; i < spans.length; i++) {
      const currentSpan = spans[i] as HTMLElement
      const previousSpan = spans[i - 1] as HTMLElement

      if (currentSpan.dataset.colorCode === previousSpan?.dataset.colorCode) {
        groupSpan.push(currentSpan)
      } else {
        groups.push(groupSpan)
        groupSpan = [currentSpan]
      }
    }

    // 添加最后一个分组
    if (groupSpan.length > 0) {
      groups.push(groupSpan)
    }

    groups.forEach((group) => {
      const [firstSpan, ...restSpans] = group
      const colorCode = firstSpan.dataset.colorCode || ""
      const combinedText = group.map((span) => span.textContent || "").join("")

      const textNode = document.createTextNode(
        genColorCode(colorCode, combinedText),
      )
      firstSpan.replaceWith(textNode)

      // 移除其余的span元素
      restSpans.forEach((span) => span.remove())
    })
  }

  return node.textContent || ""
}

function contentToNode(textContent: string): DocumentFragment {
  const fragment = document.createDocumentFragment()
  let currentIndex = 0

  // 匹配图标和颜色代码（包括结束标签）
  const formatPattern =
    /(<TXC[0-9A-Fa-f]+>)|(<FG([0-9A-Fa-f]{6})FF>(.*?)<\/FG[0-9A-Fa-f]{6}FF>)/g

  const matches = Array.from(textContent.matchAll(formatPattern))

  for (const match of matches) {
    // 添加匹配前的普通文本
    if (match.index! > currentIndex) {
      const plainText = textContent.slice(currentIndex, match.index)
      if (plainText) {
        fragment.appendChild(document.createTextNode(plainText))
      }
    }

    if (match[1]) {
      // 处理图标
      const emoji = emojis.value?.find((e) => genEmojisCode(e.id) === match[1])
      if (emoji) {
        const img = document.createElement("img")
        img.src = emoji.url
        img.dataset.emojiCode = emoji.id
        img.style.width = "20px"
        img.style.height = "20px"
        img.style.verticalAlign = "middle"
        fragment.appendChild(img)
      }
    } else if (match[2]) {
      // 处理颜色文字
      const color = match[3]
      const text = match[4]
      if (color && text) {
        const span = document.createElement("span")
        span.style.color = `#${color}`
        span.dataset.colorCode = `#${color}`
        const innerFragment = contentToNode(text)
        span.appendChild(innerFragment)
        fragment.appendChild(span)
      }
    }

    currentIndex = match.index! + match[0].length
  }

  // 添加剩余的普通文本
  if (currentIndex < textContent.length) {
    const remainingText = textContent.slice(currentIndex)
    if (remainingText) {
      fragment.appendChild(document.createTextNode(remainingText))
    }
  }

  return fragment
}

// 处理复制事件
const handleCopy = (e: ClipboardEvent) => {
  e.preventDefault()
  const selection = window.getSelection()

  if (!(selection && selection.rangeCount > 0)) return

  const range = selection.getRangeAt(0)
  if (range.collapsed) return

  const contents = range.cloneContents()

  const resultText = nodeToContent(contents)

  copyText(resultText)
}

// 处理剪切事件
const handleCut = (e: ClipboardEvent) => {
  // 删除选中的内容
  const selection = window.getSelection()
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0)

    handleCopy(e)

    if (!range.collapsed) {
      range.deleteContents() // 删除选中的内容
      selection.removeAllRanges()
      selection.addRange(range) // 更新选区
    }
  }
}

// 处理粘贴事件
const handlePaste = (e: ClipboardEvent) => {
  e.preventDefault()

  const selection = window.getSelection()

  if (!(selection && selection.rangeCount > 0)) return

  const range = selection.getRangeAt(0)

  const clipboardData = e.clipboardData
  if (!clipboardData) return

  // 获取纯文本内容
  const textData = clipboardData.getData("text/plain")

  const fragment = contentToNode(textData)
  if (fragment.childNodes.length > 0) {
    range.deleteContents() // 删除选中的内容
    range.insertNode(fragment) // 插入新的内容

    range.collapse()

    selection.removeAllRanges()
    selection.addRange(range)
  }
}

// 在光标位置插入节点
const insertNodeAtCursor = (node: DocumentFragment) => {
  const selection = window.getSelection()
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0)
    range.deleteContents()
    range.insertNode(node)

    range.collapse()
    selection.removeAllRanges()
    selection.addRange(range)
  } else if (editorRef.value) {
    // 如果没有选区，插入到编辑器末尾
    editorRef.value.appendChild(node)
  }
}

// 清空内容
const clearContent = () => {
  if (editorRef.value) {
    editorRef.value.innerHTML = ""
  }
}

const popAnimation = ref("zoom-in-right")
// 当前宽度小于700px时，使用zoom -in -right动画

const handleResize = () => {
  if (window.innerWidth < 780) {
    popAnimation.value = "zoom-in"
  } else {
    popAnimation.value = "zoom-in-left"
  }
}

onMounted(() => {
  handleResize()
})
</script>

<template>
  <div class="w-100vw h-100vh overflow-y-auto flex-center select-none">
    <FadeContent>
      <div class="relative">
        <!-- 图标选择栏 -->
        <div class="emoji-bar" @contextmenu.prevent>
          <Transition name="fade">
            <p class="tip-text flex-center" v-if="!knowTip">
              <icon-info-circle class="mr-1" />
              <span>右键点击图标可【收藏】/【取消收藏】图标</span>
            </p>
          </Transition>
          <a-spin class="emoji-bar-empty" v-if="emojisLoading">
            <template #icon>
              <div class="size-100px m-auto text-center">
                <img
                  class="w-100% m-auto"
                  src="@/assets/images/哈蒙德loading.gif"
                />
              </div>
            </template>
          </a-spin>
          <template v-else-if="topEmojiList.length > 0">
            <TransitionGroup name="emoji-list">
              <div v-for="topEmojiItem in topEmojiList" :key="topEmojiItem.id">
                <a-popconfirm
                  content="是否移除收藏？"
                  :disabled="!topEmojis.includes(topEmojiItem.id)"
                  trigger="contextMenu"
                  @ok="removeConfirm(topEmojiItem.id)"
                  @contextmenu.prevent="
                    topEmojis.includes(topEmojiItem.id)
                      ? void 0
                      : addEmoji(topEmojiItem.id)
                  "
                >
                  <img
                    :src="topEmojiItem.url"
                    :alt="topEmojiItem.name"
                    @click="insertEmoji(topEmojiItem)"
                    class="emoji"
                  />
                </a-popconfirm>
              </div>
            </TransitionGroup>
          </template>
          <a-empty
            v-else
            class="emoji-bar-empty"
            description="右键点击图标可【收藏】/【取消收藏】图标"
          />
          <!-- 占位 -->
          <div class="emoji" style="visibility: hidden"></div>

          <a-trigger
            trigger="click"
            :unmount-on-close="false"
            update-at-scroll
            :popup-offset="20"
            position="right"
            :animation-name="popAnimation"
          >
            <div class="more-btn emoji" key="more">
              <SvgIcon name="more" color="#fff"></SvgIcon>
              <div class="demo-basic"></div>
            </div>
            <template #content>
              <EmojiPicker
                :emojis="emojis || []"
                @select="(emoji) => insertEmoji(emoji)"
              >
              </EmojiPicker>
            </template>
          </a-trigger>
        </div>

        <div class="rich-input-container">
          <div class="rich-input-container-inner">
            <!-- 输入框 -->
            <div
              ref="editorRef"
              contenteditable="true"
              class="editor"
              @input="handleInput"
              @paste="handlePaste"
              @copy="handleCopy"
              @cut="handleCut"
              @drogstart.prevent
            ></div>
          </div>
          <!-- 功能栏 -->
          <div class="toolbar">
            <div class="color-picker">
              <!-- 预设颜色 -->
              <button
                v-for="color in colors"
                :key="color"
                :style="{ backgroundColor: color }"
                class="color-swatch"
                @click="applyColor(color)"
              ></button>
              <button
                class="color-swatch"
                style="border: 2px dotted red"
                @click="applyColor()"
              ></button>
              <input
                type="color"
                @change="
                  applyColor(($event.target as HTMLInputElement).value || '')
                "
                class="color-swatch-input ml-20px"
              />
            </div>
            <div class="flex-center">
              <IconDelete
                @click="clearContent"
                class="text-24px cursor-pointer mr-3"
              />
              <IconCopy @click="copyContent" class="text-24px cursor-pointer" />
            </div>
          </div>
        </div>
      </div>
    </FadeContent>

    <div class="bottom-0 right-0 position-fixed">
      <CircularText
        text="by * 一坨猪 * overwatch * input * "
        :spin-duration="20"
        on-hover="speedUp"
        @click="copyText('一坨猪#5358', '一坨猪#5358')"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* .height-fade- */

.emoji-list-move, /* 对移动中的元素应用的过渡 */
.emoji-list-enter-active,
.emoji-list-leave-active {
  transition: all 0.5s ease;
}

.emoji-list-enter-from,
.emoji-list-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}

/* 确保将离开的元素从布局流中删除
  以便能够正确地计算移动的动画。 */
.emoji-list-leave-active {
  position: absolute;
}

.rich-input-container,
.emoji-bar {
  margin: auto;
  padding: 0.375rem;
  border: 1px solid var(--border-color-4);
  border-radius: 28px;
  width: 40vw;
  box-shadow: var(--shadow-color-3);
  font-family:
    Ginto, ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji",
    "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  transform: none;
  transform-origin: 50% 50% 0;

  .rich-input-container-inner {
    overflow: hidden;
    border-radius: 28px;
  }
}

.tip-text {
  position: absolute;
  top: -40px;
  font-size: 14px;
  color: var(--text-color-3);
}

.emoji-bar {
  display: grid;
  position: relative;
  margin-bottom: 15px;
  padding: 15px;
  gap: 5px;
  grid-template-columns: repeat(auto-fill, minmax(30px, 1fr));

  .emoji-bar-empty {
    /* 在grid中占满 */
    grid-column: 1 / -1;
  }

  .more-btn {
    display: flex;
    position: absolute;
    right: 15px;
    bottom: 15px;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    background-color: #f06414 !important;
    cursor: pointer;
    color: white;
  }

  .emoji {
    box-sizing: border-box;
    padding: 2px;
    border-radius: 999px;
    width: 30px;
    height: 30px;
    background: var(--fill-color-3);
    cursor: pointer;

    /* 禁止图片可以被拖动 */
    -webkit-user-drag: none;
    vertical-align: middle;
    transition: all 0.3s;

    &:hover {
      background-color: #f06414;
      box-shadow: 0 0 20px #f0641450;
      transform: scale(1.1);
    }

    &:active {
      background-color: #f06414;
      box-shadow: none;
      transform: scale(0.98);
      transition: all 0.25s;
    }
  }
}

body[arco-theme="dark"] .emoji {
  background: var(--bg-color-5);
}

body[arco-theme="dark"] .editor {
  background-image: linear-gradient(
    to bottom,
    var(--bg-color-2),
    var(--bg-color-1)
  );
}

.editor {
  overflow: auto;
  padding: 0.6875rem 1rem;
  min-height: 120px;
  max-height: 50vh;
  outline: none;
  background-image: linear-gradient(
    to bottom,
    rgb(255 255 255 / 90%),
    rgb(255 255 255 / 0%)
  );
  line-height: 1.6;
  font-size: 16px;

  :deep(img) {
    margin: 0 2px;
    padding: 2px;
    width: 20px;
    height: 20px;
    background: var(--fill-color-3);

    /* 禁止图片可以被拖动 */
    -webkit-user-drag: none;
  }

  &:empty::before {
    cursor: text;
    color: #746d68;
    content: "请输入内容，注意：部分图标无法在游戏内正常显示，需自行测试...";
  }
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
}

.color-picker {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

.color-swatch {
  box-sizing: border-box;
  padding: 0;
  border-style: none;
  border-radius: 4px;
  width: 24px;
  height: 24px;
  background: var(--bg-color-1);
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.2);
  }

  &:active {
    border: 2px solid var(--border-color-4);
  }
}

.color-swatch-input {
  overflow: hidden;
  padding: 0;
  border: none;
  border-radius: 4px;
  width: 24px;
  height: 24px;
  appearance: none;
  background: none;
  cursor: pointer;

  &::-webkit-color-swatch-wrapper {
    padding: 0;
    border-radius: 4px;
  }

  &::-webkit-color-swatch {
    border: none;
    border-radius: 4px;
  }

  &::-moz-color-swatch {
    border: none;
    border-radius: 4px;
  }
}

/* 媒体查询如果是移动设备 */
@media (width <= 700px) {
  .rich-input-container,
  .emoji-bar {
    width: 90vw;
  }

  .toolbar {
    display: block;
    text-align: center;

    .copy-btn,
    .clear-btn {
      margin-left: 10px;
      margin-right: 10px;
      margin-top: 20px;
      border-radius: 4px;
      width: 34px;
      height: 34px;
      cursor: pointer;
    }
  }
}
</style>
