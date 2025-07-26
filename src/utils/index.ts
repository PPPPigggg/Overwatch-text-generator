import { isNumber, isString } from "./is"

/* 深度查找 */

export function deepSearch<T extends Record<string, any>>(
  list: T[],
  key: keyof T,
  cb: (item: T) => boolean,
): T[]
export function deepSearch<T extends Record<string, any>>(
  list: T[],
  key: (item: T) => boolean,
): T[]
export function deepSearch<T extends Record<string, any>>(
  list: T[],
  key: keyof T | ((item: T) => boolean) = "children",
  cb: (item: T) => boolean = () => true,
): T[] {
  if (typeof key === "function") {
    cb = key
    key = "children"
  }
  function searchPath(currentList: T[], currentPath: T[] = []): T[] {
    let left = 0
    let right = currentList.length - 1

    while (left <= right) {
      const leftNode = currentList[left]
      const rightNode = currentList[right]

      const newLeftPath = [...currentPath, leftNode]
      const newRightPath = [...currentPath, rightNode]

      if (cb(leftNode)) {
        return newLeftPath
      }

      if (cb(rightNode)) {
        return newRightPath
      }

      if (leftNode && typeof key === "string" && leftNode[key]) {
        const result = searchPath(leftNode[key] as T[], newLeftPath)
        if (result.length) {
          return result
        }
      }

      if (rightNode && typeof key === "string" && rightNode[key]) {
        const result = searchPath(rightNode[key] as T[], newRightPath)
        if (result.length) {
          return result
        }
      }

      left++
      right--
    }
    return []
  }
  return searchPath(list)
}

/* 获取文件后缀名 */
export function getFileExtension(filename: string) {
  return /[.]/.exec(filename) ? /[^.]+$/.exec(filename)?.[0] : undefined
}

/**
 * 将枚举转为options
 * @param {any} enumObj
 * @returns {Array}
 */
export const enumToOptions = (enumObj: Record<string, any>) => {
  return Object.keys(enumObj)
    .filter((key) => !isNumber(key))
    .map((key) => {
      return {
        label: key,
        value: enumObj[key],
      }
    })
}

/**
 * 判断是否为外部链接
 * @param {string} path
 * @returns {Boolean}
 */
export function isExternal(path: string): boolean {
  return /^(https?:|mailto:|tel:)/.test(path)
}

/* 日期格式化 */
export function dateFormat(dateInput: Date | string, format: string) {
  if (!dateInput) return ""

  if (isString(dateInput)) {
    dateInput = new Date(dateInput)
  }

  const components: Record<string, any> = {
    yyyy: dateInput.getFullYear(),
    MM: dateInput.getMonth() + 1,
    dd: dateInput.getDate(),
    HH: dateInput.getHours(),
    mm: dateInput.getMinutes(),
    ss: dateInput.getSeconds(),
  }

  format = format.replace(/(yyyy|MM|dd|HH|mm|ss)/g, (match, p1) => {
    return components[p1].toString().padStart(2, "0")
  })

  return format
}

/* 秒转换为时分秒 */
export function secondsToHms(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60

  let timeString = ""

  if (h > 0) {
    timeString += `${h}:`
  }

  const mDisplay = h > 0 ? m.toString().padStart(2, "0") : m.toString()
  timeString += `${mDisplay}:`

  // 秒数需要确保有两位数
  const sDisplay = s.toString().padStart(2, "0")
  timeString += sDisplay

  return timeString
}

/* 节流 */
type FnType = (...args: any) => any
export function throttle(fn: FnType, wait: number = 300) {
  let timer: FnReturnType<typeof setTimeout> | null = null
  return function (this: any, ...args: any) {
    if (timer === null) {
      fn.apply(this, args)
      timer = setTimeout(() => {
        timer = null
      }, wait)
    }
  }
}

/* 防抖 */
export function debounce(fn: FnType, wait: number = 300) {
  let timer: FnReturnType<typeof setTimeout> | null = null
  return function (this: any, ...args: any) {
    if (timer) clearTimeout(timer)
    if (timer === null) {
      fn.apply(this, args)
    }
    timer = setTimeout(() => {
      timer = null
    }, wait)
  }
}

// 安全转换避免异常
export function jsonParse(str: string) {
  try {
    return JSON.parse(str)
  } catch (e) {
    return str || ""
  }
}
// 安全转换避免异常
export function jsonStringify(obj: any) {
  try {
    return JSON.stringify(obj)
  } catch (e) {
    return obj || ""
  }
}

/**
 * 字节单位转换
 * @param {number} bytes 字节数
 * @param {"bytes"|"KB"|"MB"|"GB"|"TB"|"PB"|"EB"|"ZB"|"YB"="MB"} unit 传入的默认字节单位为MB
 * @param {number|"top"|"floor"=0} fixed 保留小数位数, 'top'表示向上取整, 'floor'表示向下取整
 * @param {Array} range 转换范围 默认最小单位为MB 最大单位为GB
 * @returns {String}
 */

type UnitsType = "bytes" | "KB" | "MB" | "GB" | "TB" | "PB" | "EB" | "ZB" | "YB"
export function bytesTrs(
  bytes: number,
  unit: UnitsType = "MB",
  range: [UnitsType, UnitsType] = ["MB", "GB"],
  fixed: number | "top" | "floor" = 0,
) {
  const units = ["bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]

  let l = units.indexOf(unit)
  let n = Number(bytes) || 0
  while (
    n >= 1024 &&
    l >= units.indexOf(range[0]) &&
    l < units.indexOf(range[1]) &&
    l < units.length - 1
  ) {
    n = n / 1024
    l++
  }

  if (fixed === "top") {
    n = Math.ceil(n)
  } else if (fixed === "floor") {
    n = Math.floor(n)
  } else {
    n = Number(truncate(n, fixed))
  }

  return n + "" + units[l]
}

/**
 * 人民币单位转换
 */
const unitMap = {
  分: 0.01,
  角: 0.1,
  元: 1,
  十: 10,
  百: 100,
  千: 1000,
  万: 10000,
  十万: 100000,
  百万: 1000000,
  千万: 10000000,
  亿: 100000000,
}
export function moneyTrs(
  amount: number,
  unit: keyof typeof unitMap = "分",
  range: Array<keyof typeof unitMap> = ["元", "万"],
  fixed: number | "top" | "floor" = 2,
) {
  if (!amount) return "0"
  // 将输入金额转换为“元”为单位的金额
  const amountInYuan = amount * unitMap[unit]

  const toFixed = (num: number) => {
    switch (fixed) {
      case "top":
        return Math.ceil(num)
      case "floor":
        return Math.floor(num)
      default:
        return truncate(num, fixed)
    }
  }

  // 遍历转换范围，找到合适的单位
  for (let i = 0; i < range.length; i++) {
    const unitName = range[i]
    const unitValue = unitMap[unitName]

    // 计算在当前单位下的金额
    const convertedAmount = amountInYuan / unitValue

    // 判断如果下一个单位的值大于当前转换值则输出当前单位
    if (i + 1 >= range.length || amountInYuan < unitMap[range[i + 1]]) {
      return `${toFixed(convertedAmount)}${unitName}`
    }
  }

  // 默认返回最大单位
  const lastUnit = range[range.length - 1]
  const lastAmount = amountInYuan / unitMap[lastUnit]
  return `${toFixed(lastAmount)}${lastUnit}`
}

/* 截取小数位数不四舍五入 */
export function truncate(num: number, decimalPlaces: number) {
  const factor = Math.pow(10, decimalPlaces)
  return (Math.floor(num * factor) / factor).toFixed(decimalPlaces)
}

/**
 * 截取部分字符串转为*字符
 * @param str
 * @param start 开始位置
 * @param end=0 结束位置
 * @example hideMiddleNum("15608798003", 3, 4) => "156****8003"
 */
export function hideMiddleNum(str: string, start: number, end = 0) {
  if (!str) return ""
  str = str + ""
  if (start < 0 || end > str.length) {
    return ""
  }

  const before = str.slice(0, start)
  const after = str.slice(str.length - end)

  const maskedPart = "*".repeat(str.length - (end + start))

  // 组合起来并返回结果
  return before + maskedPart + after
}
