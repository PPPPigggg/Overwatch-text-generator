<script lang="ts" setup>
import CircularText from "./components/CircularText.vue"
import FadeContent from "./components/FadeContent.vue"
import EmojiPicker from "./components/EmojiPicker.vue"

import SvgIcon from "@/components/svg-icon"
import { ref } from "vue"
import { copyText } from "@/utils/copy"
import { useFetch } from "@vueuse/core"
import { Message } from "@arco-design/web-vue"
import type { IEmojiItem } from "./type"

const { data: emojis } = useFetch("./textures.json").json<IEmojiItem[]>()

// 编辑器 DOM 引用
const editorRef = ref<HTMLDivElement | null>(null)

const genEmojisCode = (code: string) => `<TXC00${code}>`

const genColorCode = (color: string) => `<FG${color.replace("#", "")}FF>`
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

// 插入表情
const insertEmoji = (emoji: IEmojiItem) => {
  editorRef.value?.focus()

  const renderEl = document.createDocumentFragment()

  const img = document.createElement("img")
  img.src = emoji.url
  img.dataset.emojiCode = emoji.id // 使用 data-* 属性存储代码

  renderEl.appendChild(img)
  insertNodeAtCursor(renderEl)
}

const applyColor = (color: string) => {
  const selection = window.getSelection()
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0)
    if (!range.collapsed) {
      const contents = range.extractContents()

      const renderEl = document.createDocumentFragment()

      Array.from(contents.childNodes || []).forEach((childEl) => {
        if (childEl.nodeType !== 1) {
          const spans = document.createDocumentFragment()
          Array.from((childEl as Text).textContent || "").forEach((char) => {
            spans.appendChild(wrapSpan(char, color))
          })
          renderEl.appendChild(spans)
        } else if (childEl.nodeName === "SPAN") {
          const span = childEl as HTMLSpanElement
          span.dataset.colorCode = color // 添加自定义属性以便后续处理
          span.style.color = color
          renderEl.appendChild(span)
        } else {
          renderEl.appendChild(childEl)
        }
      })

      range.insertNode(renderEl)

      range.collapse()
      selection.removeAllRanges()
      selection.addRange(range)
    }
  }
}

// 编辑框输入事件
const handleInput = (e: InputEvent) => {
  // 清除 font 标签
  clearFont(e)
}

// 包装span标签
const wrapSpan = (text: string, color: string = "#000000") => {
  const span = document.createElement("span")
  span.style.color = color
  span.textContent = text

  span.dataset.colorCode = color
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

  try {
    copyText(resultText)
  } catch (err) {
    Message.warning("复制失败，未知原因")
  }
}

function nodeToContent(node: DocumentFragment): string {
  const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, {
    acceptNode: function (textNode) {
      const parent = textNode.parentNode as HTMLElement

      if (!parent || parent.tagName !== "SPAN") {
        if (textNode.textContent?.trim()) {
          return NodeFilter.FILTER_ACCEPT
        }
      }
      return NodeFilter.FILTER_REJECT
    },
  })
  const textNodesToWrap: Node[] = []
  let textNode: Node | null
  while ((textNode = walker.nextNode())) {
    textNodesToWrap.push(textNode)
  }

  // 包裹每个文本节点
  textNodesToWrap.forEach((textNode) => {
    textNode.parentNode?.replaceChild(
      wrapSpan(textNode.textContent || ""),
      textNode,
    )
  })

  // 将表情图片替换为代码
  node.querySelectorAll("img[data-emoji-code]").forEach((img) => {
    const code = (img as HTMLElement).dataset.emojiCode
    if (code) {
      img.replaceWith(document.createTextNode(genEmojisCode(code)))
    }
  })

  const colorSpans = node.querySelectorAll("span[data-color-code]")

  colorSpans.forEach((span, index) => {
    const prevColorCode =
      (colorSpans[index - 1] as HTMLElement)?.dataset.colorCode || ""

    const colorCode = (span as HTMLElement).dataset.colorCode

    const isSome = prevColorCode && prevColorCode === colorCode

    const textContent = span.textContent || ""

    if (textContent.trim() === "") return

    if (isSome) {
      span.replaceWith(document.createTextNode(textContent))
      return
    }

    if (colorCode) {
      span.replaceWith(
        document.createTextNode(`${genColorCode(colorCode)}${textContent}`),
      )
    }
  })

  return node.textContent || ""
}

function appendTextWithColor(
  fragment: DocumentFragment,
  text: string,
  color: string,
) {
  if (color) {
    // 为每个字符创建带颜色的span
    Array.from(text).forEach((char) => {
      const span = document.createElement("span")
      span.style.color = color
      span.dataset.colorCode = color
      span.textContent = char
      fragment.appendChild(span)
    })
  } else {
    fragment.appendChild(document.createTextNode(text))
  }
}

function contentToNode(textContent: string): DocumentFragment {
  const fragment = document.createDocumentFragment()
  let currentIndex = 0
  let currentColor = ""

  // 匹配表情和颜色代码
  const formatPattern = /(<TXC[0-9A-Fa-f]+>|<FG([0-9A-Fa-f]{6})FF>)/g
  let match

  while ((match = formatPattern.exec(textContent)) !== null) {
    // 添加匹配前的文本
    const beforeText = textContent.substring(currentIndex, match.index)
    if (beforeText) {
      appendTextWithColor(fragment, beforeText, currentColor)
    }

    const fullMatch = match[1]
    if (fullMatch.startsWith("<TXC")) {
      // 处理表情
      const emoji = emojis.value?.find((e) => genEmojisCode(e.id) === fullMatch)
      if (emoji) {
        const img = document.createElement("img")
        img.src = emoji.url
        img.dataset.emojiCode = emoji.id
        img.style.width = "20px"
        img.style.height = "20px"
        img.style.verticalAlign = "middle"
        fragment.appendChild(img)
      }
    } else if (fullMatch.startsWith("<FG")) {
      // 处理颜色代码
      const colorHex = match[2]
      currentColor = `#${colorHex}`
    }

    currentIndex = formatPattern.lastIndex
  }

  // 添加剩余的文本
  const remainingText = textContent.substring(currentIndex)
  if (remainingText) {
    appendTextWithColor(fragment, remainingText, currentColor)
  }
  return fragment
}

// 处理复制事件
const handleCopy = (e: ClipboardEvent) => {
  e.stopPropagation()
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
  handleCopy(e)

  const selection = window.getSelection()
  if (selection && selection.rangeCount > 0) {
    selection.deleteFromDocument()
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
  <div class="w-100vw h-100vh overflow-y-auto flex-center bg-#f8f4f1">
    <FadeContent
      :blur="true"
      :duration="400"
      :delay="200"
      :threshold="0.1"
      :initial-opacity="0"
      easing="ease-out"
    >
      <div>
        <!-- 表情选择栏 -->
        <div class="emoji-bar">
          <img
            v-for="emoji in emojis?.filter((e) => e.isTop) || []"
            :key="emoji.id"
            :src="emoji.url"
            :alt="emoji.name"
            @click="insertEmoji(emoji)"
            class="emoji"
          />
          <a-trigger
            trigger="click"
            :unmount-on-close="false"
            update-at-scroll
            :popup-offset="20"
            position="right"
            :animation-name="popAnimation"
          >
            <div class="more-btn emoji">
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
              <!-- 自定义颜色 -->
              <input
                type="color"
                @change="
                  applyColor(($event.target as HTMLInputElement).value || '')
                "
                class="color-swatch-input"
              />
            </div>
            <div>
              <SvgIcon
                name="clear"
                @click="clearContent"
                class="clear-btn mr-3"
              ></SvgIcon>
              <SvgIcon name="copy" @click="copyContent" class="copy-btn" />
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
.rich-input-container,
.emoji-bar {
  margin: auto;
  padding: 0.375rem;
  border: 1px solid #ccc;
  border-radius: 28px;
  width: 40vw;
  box-shadow: rgb(0 0 0 / 6%) 0 42px 30px 0;
  box-shadow: rgb(255 255 255) 0 0 0 1px inset;
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

.emoji-bar {
  display: grid;
  position: relative;
  margin-bottom: 15px;
  padding: 10px;
  gap: 5px;
  grid-template-columns: repeat(auto-fill, minmax(30px, 1fr));

  .more-btn {
    display: flex;
    position: absolute;
    right: 10px;
    bottom: 10px;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    background-color: #ec6516 !important;
    cursor: pointer;
    color: white;
  }

  .emoji {
    box-sizing: border-box;
    padding: 2px;
    border-radius: 999px;
    width: 30px;
    height: 30px;
    background: #cccccc;
    cursor: pointer;

    /* 禁止图片可以被拖动 */
    user-select: none;
    -webkit-user-drag: none;
    vertical-align: middle;
    transition: all 0.5s;

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
  }
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
    background: #cccccc;

    /* 禁止图片可以被拖动 */
    user-select: none;
    -webkit-user-drag: none;
    vertical-align: middle;
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
  padding: 0;
  border-style: none;
  border-radius: 4px;
  width: 24px;
  height: 24px;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.2);
  }

  &:active {
    border: 2px solid #ccc;
  }
}

.color-swatch-input {
  overflow: hidden;
  margin-left: 20px;
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

.copy-btn,
.clear-btn {
  border-radius: 4px;
  width: 24px;
  height: 24px;
  cursor: pointer;
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
