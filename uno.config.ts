import { defineConfig, Postprocessor, presetMini } from "unocss"
import { presetGrid } from "unocss-preset-grid"

export default defineConfig({
  presets: [
    presetMini(),
    // @ts-ignore
    presetGrid(),
  ],
  rules: [
    // .text-color1
    [
      /^text-color([1-4])$/,
      (match) => ({ color: `var(--text-color-${match[1]})` }),
    ],
    // .border-1
    [/^border-(\d+)$/, (match) => ({ border: `${match[1]}px solid` })],
    // .border-color1
    [
      /^border-color([1-4])$/,
      (match) => ({ "border-color": `var(--border-color-${match[1]})` }),
    ],
    // .bg-color1
    [
      /^bg-color([1-4])$/,
      (match) => ({ "background-color": `var(--fill-color-${match[1]})` }),
    ],
    // .shadow1
    [
      /^shadow([1-4])$/,
      (match) => ({ "box-shadow": `var(--shadow-color-${match[1]})` }),
    ],
    // .line-1
    [
      /^line-(\d+)$/,
      (match) => {
        return {
          "white-space": Number(match[1]) === 1 ? "nowrap" : undefined,
          display: Number(match[1]) > 1 ? "-webkit-box" : undefined,
          "-webkit-line-clamp": match[1],
          "-webkit-box-orient": "vertical",
          overflow: "hidden",
          "text-overflow": "ellipsis",
        }
      },
    ],
  ],
  shortcuts: {
    "flex-center": "flex items-center justify-center",
    "flex-between": "flex items-center justify-between",
    "flex-around": "flex items-center justify-around",
    "flex-evenly": "flex items-center justify-evenly",
    "flex-column": "flex flex-col",
    "flex-column-center": "flex flex-col items-center justify-center",
    "flex-column-between": "flex flex-col items-center justify-between",
    border: "border-1 border-color2",
    "border-t": "border-x-0 border-b-0 border-t-1 border-solid border-color2",
    "border-b": "border-x-0 border-b-1 border-t-0 border-solid border-color2",
    "border-l": "border-y-0 border-r-0 border-l-1 border-solid border-color2",
    "border-r": "border-y-0 border-r-1 border-l-0 border-solid border-color2",
    "border-x": "border-x-1 border-solid border-color2",
    "border-y": "border-y-1 border-solid border-color2",
  },
  theme: {
    colors: {
      primary: "var(--base-primary)",
      success: "var(--base-success)",
      warning: "var(--base-warning)",
      danger: "var(--base-danger)",
    },
  },
})
