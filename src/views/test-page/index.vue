<script lang="ts" setup>
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

const applyColor = (color?: string) => {
  const selection = window.getSelection()
  if (selection && selection.rangeCount > 0) {
    let range = selection.getRangeAt(0)
    if (!range.collapsed) {
      const contents = range.extractContents()

      const renderEl = document.createDocumentFragment()

      Array.from(contents.childNodes || []).forEach((childEl) => {
        const el = childEl as HTMLElement

        // 如果是文本节点，直接包裹span
        const spans = document.createDocumentFragment()

        Array.from(el.textContent || "").forEach((char) => {
          const span = wrapSpan(char, color)
          spans.appendChild(span)
        })

        renderEl.appendChild(spans)
      })

      const commonContainer = range.commonAncestorContainer

      const parentNode = commonContainer.parentNode as HTMLElement
      if (
        commonContainer.nodeType === Node.TEXT_NODE &&
        parentNode?.nodeName === "SPAN"
      ) {
        // 在当前节点的同级节点之后插入新节点
        parentNode.parentNode?.insertBefore(renderEl, parentNode.nextSibling)
      } else {
        range.insertNode(renderEl)
      }
    }
  }
}
</script>

<template>
  <div
    class="position-fixed top-10vh m-auto right-0 left-0 m-auto text-center text-20px"
  >
    <div contenteditable="true" class="mb-10">
      123
      <span>ppp</span>
      <span style="color: blue">456</span>
    </div>
    <button @click="applyColor('red')">Apply Red</button>
  </div>
</template>

<style lang="scss" scoped></style>
