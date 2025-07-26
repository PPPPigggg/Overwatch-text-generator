import { showToast } from "vant"

export function copyText(
  text: string | undefined | null,
  prompt: string | null = "已复制到剪切板!",
) {
  if (!text) return

  if (navigator.clipboard) {
    return navigator.clipboard
      .writeText(text)
      .then(() => {
        prompt && showToast(prompt)
      })
      .catch((error) => {
        console.error("复制失败!", error)
        return error
      })
  }
  if (Reflect.has(document, "execCommand")) {
    try {
      const textArea = document.createElement("textarea")
      textArea.value = text
      // 在手机 Safari 浏览器中，点击复制按钮，整个页面会跳动一下
      textArea.style.width = "0"
      textArea.style.position = "fixed"
      textArea.style.left = "-999px"
      textArea.style.top = "10px"
      textArea.setAttribute("readonly", "readonly")
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)

      prompt && showToast(prompt)
    } catch (error: any) {
      console.error("复制失败!", error)
    }
  }
  console.log(
    '"navigator.clipboard" 或 "document.execCommand" 中存在API错误, 拷贝失败!"',
  )
}
