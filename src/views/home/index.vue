<script lang="ts" setup>
import CircularText from "./components/CircularText.vue"
import FadeContent from "./components/FadeContent.vue"
import SvgIcon from "@/components/svg-icon"
import { ref } from "vue"
import { showNotify } from "vant"
import { copyText } from "@/utils/copy"

// 编辑器 DOM 引用
const editorRef = ref<HTMLDivElement | null>(null)

// 自定义表情列表
const emojis = [
  {
    code: "<TXC00000000038490>",
    src: require("@/assets/images/heros/000000038490.png"),
  },
  {
    code: "<TXC00000000038491>",
    src: require("@/assets/images/heros/000000038491.png"),
  },
  {
    code: "<TXC00000000038492>",
    src: require("@/assets/images/heros/000000038492.png"),
  },
  {
    code: "<TXC00000000038493>",
    src: require("@/assets/images/heros/000000038493.png"),
  },
  {
    code: "<TXC00000000038494>",
    src: require("@/assets/images/heros/000000038494.png"),
  },
  {
    code: "<TXC00000000038495>",
    src: require("@/assets/images/heros/000000038495.png"),
  },
  {
    code: "<TXC00000000038497>",
    src: require("@/assets/images/heros/000000038497.png"),
  },
  {
    code: "<TXC00000000038498>",
    src: require("@/assets/images/heros/000000038498.png"),
  },
  {
    code: "<TXC00000000038499>",
    src: require("@/assets/images/heros/000000038499.png"),
  },
  {
    code: "<TXC0000000003849A>",
    src: require("@/assets/images/heros/00000003849A.png"),
  },
  {
    code: "<TXC0000000003849B>",
    src: require("@/assets/images/heros/00000003849B.png"),
  },
  {
    code: "<TXC0000000003849C>",
    src: require("@/assets/images/heros/00000003849C.png"),
  },
  {
    code: "<TXC0000000003849D>",
    src: require("@/assets/images/heros/00000003849D.png"),
  },
  {
    code: "<TXC0000000003849E>",
    src: require("@/assets/images/heros/00000003849E.png"),
  },
  {
    code: "<TXC0000000003849F>",
    src: require("@/assets/images/heros/00000003849F.png"),
  },
  {
    code: "<TXC000000000384A0>",
    src: require("@/assets/images/heros/0000000384A0.png"),
  },
  {
    code: "<TXC000000000384A1>",
    src: require("@/assets/images/heros/0000000384A1.png"),
  },
  {
    code: "<TXC000000000384A2>",
    src: require("@/assets/images/heros/0000000384A2.png"),
  },
  {
    code: "<TXC000000000384C2>",
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
      span.replaceWith(
        document.createTextNode(`${genColorCode(colorCode)}${textContent}`),
      )
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
            <SvgIcon name="copy" @click="copyContent" class="copy-btn"
              >复制</SvgIcon
            >
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

.copy-btn {
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

    .copy-btn {
      margin-top: 20px;
      border-radius: 4px;
      width: 34px;
      height: 34px;
      cursor: pointer;
    }
  }
}
</style>
