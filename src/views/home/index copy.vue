<script lang="ts" setup>
import { ref, nextTick } from 'vue'

// 自定义表情数据
const emojis = [
  { display: '😀', code: '<01>' },
  { display: '😂', code: '<02>' },
  { display: '😍', code: '<03>' },
  { display: '😭', code: '<04>' },
  { display: '😡', code: '<05>' },
  { display: '😴', code: '<06>' },
  { display: '🤔', code: '<07>' },
  { display: '👍', code: '<08>' },
]

// 预设颜色数据
const colors = [
  { name: '红色', value: '#ff0000' },
  { name: '蓝色', value: '#0000ff' },
  { name: '绿色', value: '#00ff00' },
  { name: '橙色', value: '#ff8800' },
  { name: '紫色', value: '#8800ff' },
  { name: '粉色', value: '#ff00ff' },
  { name: '青色', value: '#00ffff' },
  { name: '黄色', value: '#ffff00' },
]

const inputText = ref('')
const textareaRef = ref<HTMLTextAreaElement>()

// 插入表情到输入框
const insertEmoji = (emoji: { display: string; code: string }) => {
  const textarea = textareaRef.value
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const before = inputText.value.substring(0, start)
  const after = inputText.value.substring(end)

  inputText.value = before + emoji.display + after

  nextTick(() => {
    const newPosition = start + emoji.display.length
    textarea.setSelectionRange(newPosition, newPosition)
    textarea.focus()
  })
}

// 应用颜色到选中文字
const applyColor = (color: { name: string; value: string }) => {
  const textarea = textareaRef.value
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd

  if (start === end) {
    alert('请先选中要改变颜色的文字')
    return
  }

  const selectedText = inputText.value.substring(start, end)
  const before = inputText.value.substring(0, start)
  const after = inputText.value.substring(end)

  // 创建带颜色标签的文字
  const coloredText = `<color=${color.value}>${selectedText}</color>`
  inputText.value = before + coloredText + after

  nextTick(() => {
    const newEnd = start + coloredText.length
    textarea.setSelectionRange(newEnd, newEnd)
    textarea.focus()
  })
}

// 复制功能 - 将表情和颜色转换为代码
const copyText = async () => {
  let textToCopy = inputText.value

  // 将表情替换为对应的代码
  emojis.forEach(emoji => {
    const regex = new RegExp(emoji.display, 'g')
    textToCopy = textToCopy.replace(regex, emoji.code)
  })

  // 将颜色标签转换为目标格式
  textToCopy = textToCopy.replace(/<color=(#[0-9a-fA-F]{6})>(.*?)<\/color>/g, '<$1>$2')

  try {
    await navigator.clipboard.writeText(textToCopy)
    alert('复制成功！')
  } catch (err) {
    console.error('复制失败:', err)
    alert('复制失败，请手动复制')
  }
}
</script>

<template>
  <div class="w-100% h-100% flex-center">
    <div class="input-container">
      <!-- 表情选择栏 -->
      <div class="emoji-selector">
        <div class="emoji-title">选择表情：</div>
        <div class="emoji-list">
          <button
            v-for="emoji in emojis"
            :key="emoji.code"
            class="emoji-btn"
            @click="insertEmoji(emoji)"
          >
            {{ emoji.display }}
          </button>
        </div>
      </div>

      <!-- 颜色选择栏 -->
      <div class="color-selector">
        <div class="color-title">选择颜色（先选中文字再点击颜色）：</div>
        <div class="color-list">
          <button
            v-for="color in colors"
            :key="color.value"
            class="color-btn"
            :style="{ backgroundColor: color.value }"
            :title="color.name"
            @click="applyColor(color)"
          />
        </div>
      </div>

      <!-- 输入框 -->
      <div class="input-wrapper">
        <textarea
          ref="textareaRef"
          v-model="inputText"
          class="text-input"
          placeholder="在此输入文字，点击上方表情可插入，选中文字后点击颜色可改变字体颜色..."
          rows="4"
        />
      </div>

      <!-- 复制按钮 -->
      <div class="button-wrapper">
        <button class="copy-btn" @click="copyText">
          复制文本
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.input-container {
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  width: 500px;
  max-width: 90vw;
  background: #fff;
  box-shadow: var(--shadow-color-1);
}

.emoji-selector {
  margin-bottom: 15px;

  .emoji-title {
    margin-bottom: 8px;
    font-size: 14px;
    color: #666;
  }

  .emoji-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .emoji-btn {
    border: 1px solid #ddd;
    border-radius: 6px;
    width: 40px;
    height: 40px;
    background: #f9f9f9;
    cursor: pointer;
    font-size: 18px;
    transition: all 0.2s;

    &:hover {
      border-color: #bbb;
      background: #e9e9e9;
    }

    &:active {
      transform: scale(0.95);
    }
  }
}

.color-selector {
  margin-bottom: 15px;

  .color-title {
    margin-bottom: 8px;
    font-size: 14px;
    color: #666;
  }

  .color-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .color-btn {
    border: 2px solid #ddd;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      border-color: #333;
      transform: scale(1.1);
    }

    &:active {
      transform: scale(0.95);
    }
  }
}

.input-wrapper {
  margin-bottom: 15px;

  .text-input {
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    width: 100%;
    min-height: 80px;
    resize: vertical;
    line-height: 1.5;
    font-size: 14px;

    &:focus {
      border-color: #007bff;
      outline: none;
      box-shadow: 0 0 0 2px rgb(0 123 255 / 25%);
    }

    &::placeholder {
      color: #999;
    }
  }
}

.button-wrapper {
  text-align: center;

  .copy-btn {
    padding: 10px 24px;
    border: none;
    border-radius: 6px;
    background: #007bff;
    cursor: pointer;
    font-size: 14px;
    color: white;
    transition: background 0.2s;

    &:hover {
      background: #0056b3;
    }

    &:active {
      transform: translateY(1px);
    }
  }
}
</style>
