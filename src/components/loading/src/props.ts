import type { ExtractPropTypes, PropType } from "vue"

export const loadingProps = {
  text: {
    type: String as PropType<string>,
    default: () => "加载中...",
  },
  absolute: {
    type: Boolean as PropType<boolean>,
    default: false,
  },
  loading: {
    type: Boolean as PropType<boolean>,
    default: false,
  },
  background: {
    type: String as PropType<string>,
  },
  theme: {
    type: String as PropType<"dark" | "light">,
  },
}

export type LoadingProps = ExtractPropTypes<typeof loadingProps>
