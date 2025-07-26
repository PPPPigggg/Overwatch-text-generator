import { copyText } from "@/utils/copy"
import CopySvg from "@/assets/svg/copy.svg?raw"

export default {
  name: "copy",
  directive: {
    mounted(el: any, { value }) {
      el.style = "cursor: pointer; display: inline-flex; align-items: center;"
      // 添加复制图标
      const span = document.createElement("span")

      span.style.display = "inline-flex"
      span.style.alignItems = "center"
      span.style.justifyContent = "center"
      span.style.width = "1em"
      span.style.height = "1em"
      span.style.marginLeft = "4px"
      span.style.marginRight = "4px"
      span.style.verticalAlign = "middle"

      span.className = "copy-icon"
      span.innerHTML = CopySvg
      el.appendChild(span)

      const copyValue = value || el.innerText

      el.$value = copyValue

      el.handler = (event: any) => {
        event.stopPropagation()
        copyText(el.$value)
      }
      el.addEventListener("click", el.handler)
    },
    updated(el, { value }) {
      const copyValue = value || el.innerText
      el.$value = copyValue
    },
    unmounted(el) {
      el.removeEventListener("click", el.handler)
    },
  },
}
