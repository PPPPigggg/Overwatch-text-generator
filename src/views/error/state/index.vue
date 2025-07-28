<template>
  <div class="error-container">
    <canvas ref="canvasRef"></canvas>
    <div class="content">
      <router-link to="/" class="error-link font-bold">404</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue"

// --- 可配置常量 ---

// 鼠标指针的图片 (SVG data URI)
const CURSOR_IMAGE_SRC = require("@/assets/images/法鸡.png")
const CURSOR_IMAGE_WIDTH = 100 // 鼠标图片宽度
const CURSOR_IMAGE_HEIGHT = 100 // 鼠标图片高度
const CURSOR_ROPE_OFFSET_X = 0 // 绳子在鼠标图片上的X轴偏移量
const CURSOR_ROPE_OFFSET_Y = 0 // 绳子在鼠标图片上的Y轴偏移量

// 左下角锚点的图片 (SVG data URI)
const ANCHOR_IMAGE_SRC = require("@/assets/images/天使.png")
const ANCHOR_IMAGE_WIDTH = 100 // 锚点图片宽度
const ANCHOR_IMAGE_HEIGHT = 100 // 锚点图片高度
const ANCHOR_ROPE_OFFSET_X = 37 // 绳子在锚点图片上的X轴偏移量
const ANCHOR_ROPE_OFFSET_Y = 2 // 绳子在锚点图片上的Y轴偏移量

// 物理效果
const GRAVITY = 0.9 // 应用于绳子的重力
const BOUNCE = 0.9 // 绳子节段的反弹系数
const CONNECTION_DAMPING = 0.2 // 绳子末端连接到锚点时的阻尼效果

// 绳子属性
const ROPE_LENGTH = 35 // 绳子的节段数量
const ROPE_SEGMENT_LENGTH = 10 // 每个绳子节段的长度

// 样式属性
const ROPE_WIDTH = 10 // 光束的宽度
const ROPE_COLOR = "rgba(255, 255, 255, 0.8)" // 光束核心的颜色
const GLOW_COLOR = "rgba(255, 215, 0, 0.7)" // 光束的光晕颜色
const GLOW_BLUR = 20 // 光晕的模糊半径

const canvasRef = ref<HTMLCanvasElement | null>(null)
let animationFrameId: number

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext("2d")!
  let width = (canvas.width = window.innerWidth)
  let height = (canvas.height = window.innerHeight)

  // 自定义鼠标和锚点图片
  const cursorImage = new Image()
  cursorImage.src = CURSOR_IMAGE_SRC

  const anchorImage = new Image()
  anchorImage.src = ANCHOR_IMAGE_SRC

  const mouse = { x: width / 2, y: height / 2 }
  const ballRadius = 15 // 用于定位锚点
  const gravity = GRAVITY
  const bounce = BOUNCE
  const ropeLength = ROPE_LENGTH
  const segments = Array.from({ length: ropeLength }, (_, i) => ({
    x: width / 2,
    y: i * 20,
    oldX: width / 2,
    oldY: i * 20,
    pinned: i === 0,
  }))

  const anchor = { x: ballRadius + 20, y: height - ballRadius - 20 }

  function updateRope() {
    for (let i = 1; i < segments.length; i++) {
      const p = segments[i]
      const vx = (p.x - p.oldX) * bounce
      const vy = (p.y - p.oldY) * bounce

      p.oldX = p.x
      p.oldY = p.y
      p.x += vx
      p.y += vy
      p.y += gravity
    }

    for (let i = 0; i < 5; i++) {
      for (let j = 1; j < segments.length; j++) {
        const p1 = segments[j - 1]
        const p2 = segments[j]
        const dx = p2.x - p1.x
        const dy = p2.y - p1.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        const diff = (ROPE_SEGMENT_LENGTH - dist) / dist

        p2.x += dx * diff * 0.5
        p2.y += dy * diff * 0.5
        p1.x -= dx * diff * 0.5
        p1.y -= dy * diff * 0.5
      }
    }

    segments[0].x = mouse.x + CURSOR_ROPE_OFFSET_X
    segments[0].y = mouse.y + CURSOR_ROPE_OFFSET_Y
  }

  function drawRope() {
    ctx.save()

    // 绘制光束
    ctx.shadowColor = GLOW_COLOR // 金色光晕
    ctx.shadowBlur = GLOW_BLUR

    ctx.beginPath()
    ctx.moveTo(segments[segments.length - 1].x, segments[segments.length - 1].y)
    for (let i = segments.length - 2; i >= 0; i--) {
      ctx.lineTo(segments[i].x, segments[i].y)
    }
    ctx.lineWidth = ROPE_WIDTH
    ctx.strokeStyle = ROPE_COLOR // 光束核心为亮白色
    ctx.stroke()

    ctx.restore()
  }

  function drawImages() {
    // 绘制锚点图片
    if (anchorImage.complete) {
      ctx.drawImage(
        anchorImage,
        anchor.x - ANCHOR_IMAGE_WIDTH / 2,
        anchor.y - ANCHOR_IMAGE_HEIGHT / 2,
        ANCHOR_IMAGE_WIDTH,
        ANCHOR_IMAGE_HEIGHT,
      )
    }
    // 绘制鼠标图片
    if (cursorImage.complete) {
      ctx.drawImage(
        cursorImage,
        mouse.x - CURSOR_IMAGE_WIDTH / 2,
        mouse.y - CURSOR_IMAGE_HEIGHT / 2,
        CURSOR_IMAGE_WIDTH,
        CURSOR_IMAGE_HEIGHT,
      )
    }
  }

  function connectRope() {
    const lastSegment = segments[segments.length - 1]
    const targetX = anchor.x + ANCHOR_ROPE_OFFSET_X
    const targetY = anchor.y + ANCHOR_ROPE_OFFSET_Y
    const dx = lastSegment.x - targetX
    const dy = lastSegment.y - targetY
    // 增加阻尼效果，让连接更自然
    lastSegment.x = targetX + dx * CONNECTION_DAMPING
    lastSegment.y = targetY + dy * CONNECTION_DAMPING
  }

  function animate() {
    ctx.clearRect(0, 0, width, height)
    updateRope()
    connectRope()
    drawRope()
    drawImages()
    animationFrameId = requestAnimationFrame(animate)
  }

  const handleMouseMove = (e: MouseEvent) => {
    mouse.x = e.clientX
    mouse.y = e.clientY
  }

  const handleResize = () => {
    width = canvas.width = window.innerWidth
    height = canvas.height = window.innerHeight
    anchor.y = height - ballRadius - 20
  }

  window.addEventListener("mousemove", handleMouseMove)
  window.addEventListener("resize", handleResize)

  animate()

  onUnmounted(() => {
    cancelAnimationFrame(animationFrameId)
    window.removeEventListener("mousemove", handleMouseMove)
    window.removeEventListener("resize", handleResize)
  })
})
</script>

<style scoped lang="scss">
.error-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  cursor: none; /* 隐藏默认鼠标 */
}

canvas {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 0;
}

.content {
  position: relative;
  z-index: 1;
  text-align: center;
}

.error-link {
  appearance: button;
  background-color: #1899d6;
  border: solid transparent;
  border-radius: 16px;
  border-width: 0 0 4px;
  box-sizing: border-box;
  color: #ffffff;
  cursor: pointer;
  display: inline-block;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0.8px;
  line-height: 20px;
  margin: 0;
  outline: none;
  overflow: visible;
  padding: 13px 19px;
  text-align: center;
  text-transform: uppercase;
  touch-action: manipulation;
  transform: translateZ(0);
  transition: filter 0.2s;
  user-select: none;
  -webkit-user-select: none;
  vertical-align: middle;
  white-space: nowrap;

  &:after {
    background-clip: padding-box;
    background-color: #1cb0f6;
    border: solid transparent;
    border-radius: 16px;
    border-width: 0 0 4px;
    bottom: -4px;
    content: "";
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
    z-index: -1;
  }

  &:main,
  &:focus {
    user-select: auto;
  }

  &:hover:not(:disabled) {
    filter: brightness(1.1);
  }

  &:disabled {
    cursor: auto;
  }

  &:active:after {
    border-width: 0 0 0px;
  }

  &:active {
    padding-bottom: 10px;
  }
}
</style>
