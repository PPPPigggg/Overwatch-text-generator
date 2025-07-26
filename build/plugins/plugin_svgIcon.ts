import { resolve } from "node:path"
import { createSvgIconsPlugin } from "vite-plugin-svg-icons"

export default function () {
  return createSvgIconsPlugin({
    iconDirs: [resolve(process.cwd(), "src/assets/svg")],
    symbolId: "svg-icon-[dir]-[name]",
  })
}
