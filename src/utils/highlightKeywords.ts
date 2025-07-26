import { isString, isNumber, isEmpty, isArray } from "./is"
import type { CSSProperties } from "vue"

/**
 * 高亮关键词
 * @param content 被高亮的字符串
 * @param keywords 关键词集合
 * @param style 自定义高亮样式，可以为字符串或者对象，如果是以"."开头的字符串，则会被当做类名处理，否则会被当做样式处理
 * @returns string
 * @example content = 'abc', keywords = [a]
 * return  '<span style="color: red;">a</span>bc'
 */
export const highlightKeywords = (
  content: string,
  keywords: Array<string> | string,
  style: string | CSSProperties = ".red",
) => {
  let res = ""

  if (isEmpty(keywords) || (isArray(content) && content.every(isEmpty))) {
    return content
  }

  if (isString(style)) {
    style = style.startsWith(".")
      ? `class="${style.slice(1)}"`
      : `style="${style}"`
  } else {
    style = `style="${stringifyStyle(style)}"`
  }

  if (isString(keywords)) {
    keywords = [keywords]
  }

  const newKeywords = keywords.map((item) => {
    return item?.toLocaleLowerCase() || ""
  })

  const newContent = content.toLocaleLowerCase()

  let highlightIntervals: Array<Array<number>> = []

  newKeywords.forEach((keyword) => {
    let index = 0

    /**
     * 获取每个关键词在字符串中对应的所有位置
     * 不用正则的原因：正则表达式在处理特殊字符串如“c++”等会报错
     */
    while (newContent.indexOf(keyword, index) !== -1) {
      const startPosition = newContent.indexOf(keyword, index)
      const endPosition = startPosition + keyword.length
      highlightIntervals.push([startPosition, endPosition])

      // index += startPosition + 1;
      index = endPosition // 已更正此行
    }
  })

  /**
   * 所获取的区间必须经过合并，不然会出现被替换的文本重复的情况
   * 如 content = "abcde" keywords=['ab', 'bc']
   * 为合并区间为[[0,1], [1,3]]
   * 结果会为'<span style="color: red;">ab</span><span style="color: red;">bc</span>de'
   */
  highlightIntervals = mergeInterval(highlightIntervals)

  let index = 0

  highlightIntervals.forEach((interval) => {
    const intervalStart = interval[0]
    const intervalEnd = interval[1]

    res += content.substring(index, intervalStart)
    res += `<span ${style}">${content.substring(intervalStart, intervalEnd)}</span>`

    index = intervalEnd
  })

  if (index < content.length) {
    res += content.substring(index)
  }

  return res
}

/**
 * 合并数组区间
 * @param intervals
 * @returns number[][]
 * @example
 * intervals = [[1,4],[4,5]]; res = [[1,5]]
 * intervals = [[1,3],[2,6],[8,10],[15,18]]; res = [[1,6],[8,10],[15,18]]
 * intervals = [[0,2],[3,6]] res = [[0,2],[3,6]]
 */
function mergeInterval(intervals: Array<Array<number>>) {
  if (intervals?.length <= 0) return intervals

  intervals.sort((a, b) => a[0] - b[0])
  let prev = intervals[0]
  const result = [] as Array<Array<number>>
  for (let i = 0; i < intervals.length; i++) {
    const cur = intervals[i]
    if (cur[0] > prev[1]) {
      result.push(prev)
      prev = cur
    } else {
      prev[1] = Math.max(cur[1], prev[1])
    }
  }
  result.push(prev)
  return result
}

/**
 * 对象转换为style字符串
 * @param styles
 * @returns string
 */
function stringifyStyle(styles: CSSProperties | string | undefined): string {
  let ret = ""
  if (!styles || isString(styles)) {
    return ret
  }
  for (const key in styles) {
    const value = styles[key]
    if (isString(value) || isNumber(value)) {
      const styleKey = key.startsWith(`--`)
        ? key
        : key.replace(/\B([A-Z])/g, "-$1").toLowerCase() // 转换为 kebab-case格式
      ret += `${styleKey}:${value};`
    }
  }
  return ret
}
