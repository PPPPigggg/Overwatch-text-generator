<script lang="ts" setup>
import { ref } from "vue"
import { showNotify } from "vant"

// 编辑器 DOM 引用
const editorRef = ref<HTMLDivElement | null>(null)

// 自定义表情列表
// 注意: 实际项目中请将表情图片放在 public 目录下或由 vite 处理
const emojis = [
  {
    name: "smile",
    code: "<01>",
    src: require("@/assets/images/heros/000000038490.png"),
  }, // 示例表情
  {
    name: "sad",
    code: "<02>",
    src: require("@/assets/images/heros/000000038491.png"),
  }, // 示例表情
]

// 预设颜色
const colors = ["#ff0000", "#00ff00", "#0000ff", "#000000"]

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

  const selection = window.getSelection()

  const img = document.createElement("img")
  img.src = emoji.src
  img.dataset.emojiCode = emoji.code // 使用 data-* 属性存储代码
  img.style.width = "20px"
  img.style.height = "20px"
  img.style.verticalAlign = "middle"

  if (lastSelection && lastSelection.rangeCount > 0) {
    // selection?.removeAllRanges()
    const lastRange = lastSelection.getRangeAt(0)
    lastRange.insertNode(img)
    // 重新设置光标位置
    lastRange.setStartAfter(img)
    lastRange.collapse(true)
    selection?.removeAllRanges()
    selection?.addRange(lastRange)
  }

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

            span.dataset.colorCode = color // 添加自定义属性以便后续处理
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

const clearFont = (e: InputEvent) => {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return
  const range = selection.getRangeAt(0)
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

  range.collapse(false)
  selection.removeAllRanges()
  selection.addRange(range)
}

// 复制内容
const copyContent = async () => {
  if (!editorRef.value) return

  const contentClone = editorRef.value.cloneNode(true) as HTMLElement

  // 将表情图片替换为代码
  contentClone.querySelectorAll("img[data-emoji-code]").forEach((img) => {
    const code = (img as HTMLElement).dataset.emojiCode
    if (code) {
      img.replaceWith(document.createTextNode(code))
    }
  })

  // 将颜色标签 <font color="..."> 替换为自定义格式 <ff0000>...

  const colorSpans = contentClone.querySelectorAll("span[data-color-code]")

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
      span.replaceWith(document.createTextNode(`<${colorCode}>${textContent}`))
    }
  })

  const resultText = contentClone.textContent || ""

  try {
    await navigator.clipboard.writeText(resultText)

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
</script>

<template>
  <div class="rich-input-container">
    <!-- 表情选择栏 -->
    <div class="emoji-bar">
      <img
        v-for="emoji in emojis"
        :key="emoji.code"
        :src="emoji.src"
        :alt="emoji.name"
        @click="insertEmoji(emoji)"
        class="emoji"
      />
    </div>

    <!-- 输入框 -->
    <div
      ref="editorRef"
      contenteditable="plaintext-only"
      class="editor"
      @blur="saveSelection"
      @mouseup="saveSelection"
      @keyup="saveSelection"
      @input="clearFont"
    ></div>

    <!-- 功能栏 -->
    <div class="toolbar">
      <div class="color-picker">
        <button
          v-for="color in colors"
          :key="color"
          :style="{ backgroundColor: color }"
          class="color-swatch"
          @click="applyColor(color)"
        ></button>
      </div>
      <button @click="copyContent" class="copy-btn">复制</button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.rich-input-container {
  margin: auto;
  border: 1px solid #ccc;
  border-radius: 8px;
  width: 50vw;
  font-family: sans-serif;
}

.emoji-bar {
  padding: 8px;
  border-bottom: 1px solid #eee;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  background-color: #f8f8f8;
}

.emoji {
  margin-right: 5px;
  width: 24px;
  height: 24px;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.2);
  }
}

.editor {
  padding: 10px;
  min-height: 120px;
  outline: none;
  line-height: 1.6;
  font-size: 16px;

  &:empty::before {
    cursor: text;
    color: #aaa;
    content: "请输入内容...";
  }
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  border-top: 1px solid #eee;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  background-color: #f8f8f8;
}

.color-picker {
  display: flex;
  gap: 5px;
}

.color-swatch {
  padding: 0;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 24px;
  height: 24px;
  cursor: pointer;

  &:hover {
    border-color: #333;
  }
}

.copy-btn {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #fff;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background-color: #f0f0f0;
  }
}

/* 媒体查询如果是移动设备 */
@media (width <= 700px) {
  .rich-input-container {
    width: 90vw;
  }
}
</style>
