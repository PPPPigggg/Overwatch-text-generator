<script lang="ts" setup>
import CircularText from "./components/CircularText.vue"
import EmojiPicker from "./components/EmojiPicker.vue"
import FadeContent from "./components/FadeContent.vue"

import { useUserStore } from "@/stores/modules/state"
import { copyText } from "@/utils/copy"
import { useFetch } from "@vueuse/core"
import { storeToRefs } from "pinia"
import { ref } from "vue"
import type { IEmojiItem } from "./type"
import { Modal } from "@arco-design/web-vue"

const userStateStore = useUserStore()

const { addEmoji, removeEmoji, iKnowTip, addTemplateText, removeTemplateText } =
  userStateStore
const { topEmojis, knowTip, templateTextList } = storeToRefs(userStateStore)

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
  if (!color) return text
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

/* 获取当前选取的内容 */
function getSelectContent() {
  const selection = window.getSelection() as Selection

  if (!selection || selection.rangeCount <= 0)
    return {
      contents: null,
      selection: null,
      range: null,
    }
  const range = selection.getRangeAt(0)
  const commonContainer = range.commonAncestorContainer

  const startNode = range.startContainer
  const endNode = range.endContainer
  let parentNode = commonContainer.parentNode as HTMLElement | null

  // 确保 parentNode 不是编辑器容器
  if (
    !(
      parentNode &&
      parentNode.nodeType === Node.ELEMENT_NODE &&
      parentNode !== editorRef.value &&
      editorRef.value?.contains(parentNode) &&
      startNode === endNode
    )
  ) {
    parentNode = null
  }

  const contents = range.cloneContents()

  return {
    parentNode, // 父节点，如果有父节点说明当前选取是在元素内部选中的
    contents,
    selection,
    range,
  }
}

// 插入图标
function insertEmoji(emoji: IEmojiItem) {
  editorRef.value?.focus()

  const renderEl = document.createDocumentFragment()

  const img = document.createElement("img")
  img.src = emoji.url
  img.dataset.emojiCode = emoji.id

  // 使用零宽空格，避免图片被选中时出现offset和文本不一致的问题
  const space = document.createTextNode("\u200B")
  img.appendChild(space)

  renderEl.appendChild(img)
  insertNodeAtCursor(renderEl)
}

function applyColor(color?: string) {
  const selection = window.getSelection()
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0)
    if (!range.collapsed) {
      const contents = range.cloneContents()

      const renderEl = document.createDocumentFragment()

      Array.from(contents.childNodes || []).forEach((childEl) => {
        const el = childEl as HTMLElement

        if (el.nodeType === Node.ELEMENT_NODE && el.tagName === "IMG") {
          // 如果是图片，直接添加
          renderEl.appendChild(el)
          return
        }

        if (el.textContent)
          renderEl.appendChild(wrapSpan(el.textContent, color))
      })
      insertNodeAtCursor(renderEl)
    }
  }
}

// 编辑框输入事件
const handleInput = (e: InputEvent) => {
  // 清除 font 标签
  clearFont(e)
}

// 包装span标签
function wrapSpan(text: string, color?: string) {
  const span = document.createElement("span")
  if (color) {
    span.style.color = color
    span.dataset.colorCode = color
  }
  span.textContent = text
  return span
}
// 清除 font 标签
function clearFont(e: InputEvent) {
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

/* 节点转换为对应代码 */
function toContent(node: DocumentFragment): string {
  const elList = Array.from(node.childNodes) as HTMLElement[]

  const groups = elList.reduce(
    (acc: HTMLElement[][], currentEl: HTMLElement) => {
      if (!currentEl || !currentEl.textContent) return acc

      const lastGroup = acc[acc.length - 1]
      const lastEl = lastGroup?.[lastGroup.length - 1]

      if (
        lastEl &&
        lastEl.nodeName === "SPAN" &&
        currentEl.nodeName === "SPAN" &&
        currentEl.dataset.colorCode === lastEl.dataset.colorCode
      ) {
        lastGroup.push(currentEl)
      } else {
        acc.push([currentEl])
      }

      return acc
    },
    [],
  )

  let content = ""

  groups.forEach((group) => {
    // 将图标图片替换为代码
    const [firstEl] = group

    if (firstEl.nodeType !== Node.ELEMENT_NODE) {
      // 如果不是元素节点，直接添加
      content += firstEl.textContent || ""
      return
    }

    if (firstEl.nodeName === "IMG") {
      content += genEmojisCode(firstEl.dataset.emojiCode || "")
      return
    }

    if (firstEl.nodeName === "SPAN") {
      const colorCode = firstEl.dataset.colorCode || ""
      const combinedText = group.map((span) => span.textContent || "").join("")

      content += genColorCode(colorCode, combinedText)
    }
  })

  return content
}

/* 代码反转回原来的节点 */
function toNode(textContent: string): DocumentFragment {
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
        const innerFragment = toNode(text)
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

// 清空内容
// function clearContent() {
//   if (editorRef.value) {
//     editorRef.value.innerHTML = ""
//   }
// }

// 保存模板文本
function saveTemplateText() {
  if (!editorRef.value) return

  const contentClone = document.createDocumentFragment()
  Array.from(editorRef.value.cloneNode(true).childNodes).forEach((node) => {
    contentClone.appendChild(node)
  })
  const resultText = toContent(contentClone)

  addTemplateText(resultText)
}
// 移除模板文本
function delTemplateText(text: string) {
  Modal.open({
    title: "提示",
    content: "确认移除模板吗？",
    cancelText: "取消",
    closable: true,
    width: 300,
    onOk: () => {
      removeTemplateText(text)
    },
  })
}

// 全部复制
function copyContent() {
  if (!editorRef.value) return

  const contentClone = document.createDocumentFragment()
  Array.from(editorRef.value.cloneNode(true).childNodes).forEach((node) => {
    contentClone.appendChild(node)
  })
  const resultText = toContent(contentClone)

  copyText(resultText)
}

// 处理复制事件
function handleCopy(e: ClipboardEvent) {
  e.preventDefault()
  const { contents, parentNode } = getSelectContent()
  const fragment = document.createDocumentFragment()

  // 如果有父节点，说明是选中元素内部的内容
  if (parentNode) {
    const parent = parentNode.cloneNode()
    parent.appendChild(contents)
    fragment.appendChild(parent)
  } else if (contents) {
    fragment.appendChild(contents)
  }

  const resultText = toContent(fragment)
  copyText(resultText)
}

// 处理剪切事件
function handleCut(e: ClipboardEvent) {
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
function handlePaste(e: ClipboardEvent) {
  e.preventDefault()

  const clipboardData = e.clipboardData
  if (!clipboardData) return

  // 获取纯文本内容
  const textData = clipboardData.getData("text/plain")

  const fragment = toNode(textData)
  if (fragment.childNodes.length > 0) {
    insertNodeAtCursor(fragment)
  }
}

// 在光标位置插入节点
function insertNodeAtCursor(node: DocumentFragment) {
  const { range, parentNode, selection } = getSelectContent()

  if (!range || !selection) return

  // TODO: 判断元素是否相同，相同则合并
  range?.deleteContents()
  // 确保 parentNode 不是编辑器容器
  if (parentNode) {
    const renderEl = document.createDocumentFragment()

    // 计算选区在文本节点中的起始和结束位置
    const startOffset = range.startOffset
    const endOffset = range.endOffset

    // 创建三个 el 元素：前、中、后
    const beforeEl = parentNode.cloneNode()
    beforeEl.textContent = parentNode.textContent?.slice(0, startOffset) || ""

    const middleEl = node

    const afterEl = parentNode.cloneNode()
    afterEl.textContent = parentNode.textContent?.slice(endOffset) || ""

    // 将新的 span 元素添加到 renderEl 中
    if (beforeEl.textContent) renderEl.appendChild(beforeEl)
    if (middleEl.childNodes) renderEl.appendChild(middleEl)
    if (afterEl.textContent) renderEl.appendChild(afterEl)

    const lastNodeInsert = renderEl.lastChild
    // 替换原始 span 元素
    parentNode.replaceWith(renderEl)
    // 将光标移动到插入的内容后面
    if (lastNodeInsert) {
      range.setStartBefore(lastNodeInsert)
      range.collapse(true)
    }
  } else {
    range.insertNode(node)
    range.collapse(false)
  }

  // 重置选区
  selection.removeAllRanges()
  selection.addRange(range)
}

const popAnimation = ref("zoom-in-left")
const popEmojiOffset = ref(20)
// 当前宽度小于700px时，使用zoom -in -right动画

const handleResize = () => {
  if (window.innerWidth < 780) {
    popAnimation.value = "zoom-in"
    popEmojiOffset.value = 0
  } else {
    popAnimation.value = "zoom-in-left"
    popEmojiOffset.value = 20
  }
}

onMounted(() => {
  handleResize()
})
</script>

<template>
  <div class="w-100vw h-100vh overflow-y-auto flex-center select-none">
    <FadeContent>
      <div class="content-box">
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
              <div
                v-for="topEmojiItem in topEmojiList"
                :key="topEmojiItem.id"
                class="flex-center"
              >
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
            :popup-offset="popEmojiOffset"
            position="right"
            :animation-name="popAnimation"
          >
            <div class="more-btn emoji" key="more">
              <ion:more style="color: white"></ion:more>
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
              id="editor"
              ref="editorRef"
              contenteditable="true"
              class="editor"
              @input="handleInput"
              @paste="handlePaste"
              @copy="handleCopy"
              @cut="handleCut"
              @drogstart.prevent
            ></div>
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
              <div class="flex-center action-buttons">
                <div
                  @click="saveTemplateText"
                  class="text-28px cursor-pointer mr-3"
                >
                  <ion:add style="color: var(--color-text-1)" />
                </div>
                <div @click="copyContent" class="text-24px cursor-pointer">
                  <ion:copy-outline style="color: var(--color-text-1)" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="template-bar">
          <div class="template-text">
            <TransitionGroup name="template-list">
              <div
                v-for="text in templateTextList"
                :key="text"
                class="template-text-item"
                @click="copyText(text)"
              >
                <span>{{ text }}</span>
                <ion:close-circle
                  @click.stop="delTemplateText(text)"
                  class="template-remove-icon"
                ></ion:close-circle>
              </div>
            </TransitionGroup>
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
<style lang="scss">
.modal-body {
  text-align: center;
}
</style>

<style lang="scss" scoped>
.template-list-move, /* 对移动中的元素应用的过渡 */
.template-list-enter-active,
.template-list-leave-active {
  transition: all 0.5s ease;
}

.template-list-enter-from,
.template-list-leave-to {
  opacity: 0;
  transform: scale(0);
}

/* 确保将离开的元素从布局流中删除
  以便能够正确地计算移动的动画。 */
.template-list-leave-active {
  position: absolute;
}

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

.content-box {
  position: relative;
  margin-top: -30px;
  width: min(calc(100vw - 1.5rem), 46.5rem);
}

.rich-input-container,
.emoji-bar {
  margin: auto;
  padding: 0.375rem;
  border: 2px solid var(--border-color-1);
  border-radius: 28px;
  box-shadow: var(--shadow-color-3);
  font-family:
    Ginto, ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji",
    "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  transform: none;
  transform-origin: 50% 50% 0;

  .rich-input-container-inner {
    overflow: hidden;
    border-radius: 24px;
    background-image: linear-gradient(
      to bottom,
      rgb(255 255 255 / 90%),
      rgb(255 255 255 / 0%)
    );
    background-repeat: no-repeat;
  }
}

body[arco-theme="dark"] .rich-input-container-inner {
  background-image: linear-gradient(
    to bottom,
    var(--bg-color-2),
    var(--bg-color-1)
  );
}

.tip-text {
  position: absolute;
  top: -40px;
  font-size: 14px;
  color: var(--text-color-3);
}

.emoji-bar {
  $emoji-size: 35px;

  display: grid;
  position: relative;
  margin-bottom: 15px;
  padding: 15px;
  gap: 5px;
  grid-template-columns: repeat(auto-fill, minmax($emoji-size, 1fr));

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
    width: $emoji-size;
    height: $emoji-size;
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

.editor {
  overflow: auto;
  padding: 0.6875rem 1rem;
  min-height: 100px;
  max-height: 50vh;
  outline: none;
  line-height: 1.6;
  font-size: 17px;

  :deep(img) {
    margin: 0 2px;
    padding: 2px;
    width: 22px;
    height: 22px;
    background: var(--fill-color-3);

    /* 禁止图片可以被拖动 */
    -webkit-user-drag: none;
    vertical-align: top;
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

.template-bar {
  display: flex;
  position: absolute;
  left: 0;
  right: 0;
  flex-direction: column;
  margin: auto;
  margin-top: 12px;
  padding-bottom: 100px;
  width: 100%;

  .template-text {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    flex: 1;
    gap: 12px;
  }

  .template-text-item {
    position: relative;
    box-sizing: border-box;
    padding: 8px 6px;
    border-radius: 10px;
    background-color: white;
    box-shadow:
      0 0 #0000,
      0 0 #0000,
      0 0 #0000,
      0 0 #0000,
      0 1px 3px 0 rgb(0 0 0 / 20%),
      0 0.5px 0.5px 0.5px #fff inset;
    cursor: pointer;
    -webkit-user-drag: none;
    transition: all 0.3s;

    .template-remove-icon {
      position: absolute;
      right: -8px;
      top: -10px;
      width: 23px;
      height: 23px;
      opacity: 0;
      cursor: pointer;
      color: var(--base-primary);
      transform: scale(0);
      transition: all 0.2s;

      &:hover {
        transform: scale(1.3);
      }
    }

    &:hover {
      z-index: 100;
      box-shadow: var(--shadow-color-3);
      transform: scale(1.05);

      .template-remove-icon {
        visibility: visible;
        opacity: 1;
        transform: scale(1);
      }
    }
  }
}

/* 媒体查询如果是移动设备 */
@media (width <= 700px) {
  .toolbar {
    display: block;
    text-align: center;

    .action-buttons {
      margin-top: 20px;
    }
  }
}
</style>
