<script lang="ts" setup>
import CircularText from "./components/CircularText.vue"
import FadeContent from "./components/FadeContent.vue"
import SvgIcon from "@/components/svg-icon"
import { ref } from "vue"
import { showNotify } from "vant"
import { copyText } from "@/utils/copy"

// 编辑器 DOM 引用
const editorRef = ref<HTMLDivElement | null>(null)

const genEmojisCode = (code: string) => `<TXC00${code}>`
// 自定义表情列表
const emojis = [
  {
    code: "000000038490",
    src: require("@/assets/images/heros/000000038490.png"),
  },
  {
    code: "000000038491",
    src: require("@/assets/images/heros/000000038491.png"),
  },
  {
    code: "000000038492",
    src: require("@/assets/images/heros/000000038492.png"),
  },
  {
    code: "000000038493",
    src: require("@/assets/images/heros/000000038493.png"),
  },
  {
    code: "000000038494",
    src: require("@/assets/images/heros/000000038494.png"),
  },
  {
    code: "000000038495",
    src: require("@/assets/images/heros/000000038495.png"),
  },
  {
    code: "000000038497",
    src: require("@/assets/images/heros/000000038497.png"),
  },
  {
    code: "000000038498",
    src: require("@/assets/images/heros/000000038498.png"),
  },
  {
    code: "000000038499",
    src: require("@/assets/images/heros/000000038499.png"),
  },
  {
    code: "00000003849A",
    src: require("@/assets/images/heros/00000003849A.png"),
  },
  {
    code: "00000003849B",
    src: require("@/assets/images/heros/00000003849B.png"),
  },
  {
    code: "00000003849C",
    src: require("@/assets/images/heros/00000003849C.png"),
  },
  {
    code: "00000003849D",
    src: require("@/assets/images/heros/00000003849D.png"),
  },
  {
    code: "00000003849E",
    src: require("@/assets/images/heros/00000003849E.png"),
  },
  {
    code: "00000003849F",
    src: require("@/assets/images/heros/00000003849F.png"),
  },
  {
    code: "0000000384A0",
    src: require("@/assets/images/heros/0000000384A0.png"),
  },
  {
    code: "0000000384A1",
    src: require("@/assets/images/heros/0000000384A1.png"),
  },
  {
    code: "0000000384A2",
    src: require("@/assets/images/heros/0000000384A2.png"),
  },
  {
    code: "0000000384C2",
    src: require("@/assets/images/heros/0000000384C2.png"),
  },
]

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

// 记录光标位置
let lastSelection: Selection | null = null
const saveSelection = () => {
  const selection = window.getSelection()
  if (selection && selection.rangeCount > 0) {
    lastSelection = selection
  }
}

// 插入表情
const insertEmoji = (emoji: { code: string; src: string }) => {
  editorRef.value?.focus()

  const renderEl = document.createDocumentFragment()

  const img = document.createElement("img")
  img.src = emoji.src
  img.dataset.emojiCode = emoji.code // 使用 data-* 属性存储代码
  img.style.width = "20px"
  img.style.height = "20px"
  img.style.verticalAlign = "middle"

  renderEl.appendChild(img)
  insertNodeAtCursor(renderEl)
  saveSelection()
}

const applyColor = (color: string) => {
  editorRef.value?.focus()
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
            const span = document.createElement("span")
            span.style.color = color
            span.textContent = char

            span.dataset.colorCode = color // 添加scaqewd自定义属性以便后续处理
            spans.appendChild(span)
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

      range.collapse(false)
      selection.removeAllRanges()
      selection.addRange(range)
    }
  }
}

// 编辑框输入事件
const handleInput = (e: InputEvent) => {
  const target = e.target as HTMLElement
  // 清除 font 标签
  clearFont(e)

  // 获取所有 span 标签
  const spans = target.querySelectorAll("span[data-color-code]")
  if (spans.length > 0) {
    spans.forEach((span) => {
      const colorCode = (span as HTMLElement).dataset.colorCode || ""
      if (colorCode) {
        span.innerHTML = wrapSpan(span.textContent || "", colorCode)
      }
    })
  }
}

// 包装span标签
const wrapSpan = (text: string, color: string): string => {
  if (!color) return text
  return `<span style="color:${color}" data-color-code="${color}">${text}</span>`
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
    copyText(resultText, resultText)

    showNotify({
      type: "success",
      message: "内容已复制到剪贴板",
    })
  } catch (err) {
    showNotify({
      type: "danger",
      message: "复制失败，未知原因",
    })
  }
}

function nodeToContent(node: DocumentFragment): string {
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
      const emoji = emojis.find((e) => genEmojisCode(e.code) === fullMatch)
      if (emoji) {
        const img = document.createElement("img")
        img.src = emoji.src
        img.dataset.emojiCode = emoji.code
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

  copyText(resultText, null)
  showNotify({
    type: "success",
    message: "内容已复制到剪贴板",
  })
}

// 处理剪切事件
const handleCut = (e: ClipboardEvent) => {
  // 先复制内容
  handleCopy(e)

  // 然后删除选中的内容
  const selection = window.getSelection()
  if (selection && selection.rangeCount > 0) {
    selection.deleteFromDocument()
    saveSelection()
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

    // 将光标移动到插入内容的末尾
    if (fragment.lastChild) {
      range.setStartAfter(fragment.lastChild as Node)
    }

    range.collapse(true)

    selection.removeAllRanges()
    selection.addRange(range)

    saveSelection()
  }
}

// 在光标位置插入节点
const insertNodeAtCursor = (node: DocumentFragment) => {
  const selection = window.getSelection()
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0)
    range.deleteContents()
    range.insertNode(node)

    // 将光标移动到插入内容的末尾
    range.setStartAfter(node)
    range.collapse(true)
    selection.removeAllRanges()
    selection.addRange(range)
  } else if (editorRef.value) {
    // 如果没有选区，插入到编辑器末尾
    editorRef.value.appendChild(node)
  }

  saveSelection()
}

// 清空内容
const clearContent = () => {
  if (editorRef.value) {
    editorRef.value.innerHTML = ""
    saveSelection()
  }
}
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
            v-for="emoji in emojis"
            :key="emoji.code"
            :src="emoji.src"
            @click="insertEmoji(emoji)"
            class="emoji"
          />
        </div>
        <div class="rich-input-container">
          <div class="rich-input-container-inner">
            <!-- 输入框 -->
            <div
              ref="editorRef"
              contenteditable="plaintext-only"
              class="editor"
              @blur="saveSelection"
              @mouseup="saveSelection"
              @keyup="saveSelection"
              @input="clearFont"
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
        text="by * 一坨猪 * overwatch * "
        :spin-duration="20"
        on-hover="speedUp"
        @click="copyText('一坨猪#5358', '一坨猪#5358')"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.rich-input-container {
  margin: auto;
  padding: 0.375rem;
  border: 1px solid #ccc;
  border-radius: 28px;
  width: 50vw;
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
  margin-bottom: 10px;
  padding: 8px;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;

  .emoji {
    margin-right: 5px;
    border-radius: 999px;
    width: 30px;
    height: 30px;
    cursor: pointer;
    transition: transform 0.2s;

    &:hover {
      transform: scale(1.2);
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

  &:empty::before {
    cursor: text;
    color: #746d68;
    content: "请输入内容...";
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
