import { isVNode, toValue } from "vue"

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor

/* 获取数据类型 */
function getType(value: any) {
  let type: any = typeof value
  if (value === null) {
    type = null + ""
  } else if (typeof value === "object") {
    const objType = Object.prototype.toString
      .call(value)
      .replace(/\[object (\w+)\]/, "$1")
    type = objType
  }
  return type.replace(/^\w/, type.charAt(0).toUpperCase())
}

function isDef<T = unknown>(val?: T): val is T {
  return typeof val !== "undefined"
}

function isUnDef<T = unknown>(val?: T): val is T {
  return !isDef(val)
}

function isNull(val: unknown): val is null {
  return val === null
}

function isNullAndUnDef(val: unknown): val is null | undefined {
  return isUnDef(val) && isNull(val)
}

function isNullOrUnDef(val: unknown): val is null | undefined {
  return isUnDef(val) || isNull(val)
}

function isAsyncFunction(val: unknown): val is Function {
  return val instanceof AsyncFunction
}

function isBoolean(val: unknown): val is boolean {
  return getType(val) === "Boolean"
}

function isRegExp(val: unknown): val is RegExp {
  return getType(val) === "RegExp"
}

function isWindow(val: any): val is Window {
  return typeof window !== "undefined" && getType(val) === "Window"
}

function isElement(val: unknown): val is Element {
  return isObjectType(val) && !!val.tagName
}

const isServer = typeof window === "undefined"

const isClient = !isServer

const isUrl = (val: string): boolean => {
  const reg = /^(http|https):\/\/([\w.]+\/?)\S*/
  return reg.test(val)
}

const isArray = Array.isArray

const isNumber = (value: any): value is number => {
  return !isNaN(parseFloat(value)) && isFinite(value)
}

const isNumberStrict = (value: any): value is number => {
  return isNumber(value) && typeof value === "number"
}

const isMap = (val: unknown): val is Map<any, any> => getType(val) === "Map"
const isSet = (val: unknown): val is Set<any> => getType(val) === "Set"
const isDate = (val: unknown): val is Date => getType(val) === "Date"
const isFunction = (val: unknown): val is Function => typeof val === "function"
const isString = (val: unknown): val is string => typeof val === "string"
const isSymbol = (val: unknown): val is symbol => typeof val === "symbol"
/**
 * 是否为对象类型, array，obj，fn等会返回true
 */
const isObjectType = (val: unknown): val is Record<any, any> =>
  val !== null && typeof val === "object"

const isPromise = <T = any>(val: unknown): val is Promise<T> =>
  isObjectType(val) && isFunction(val.then) && isFunction(val.catch)

const isObject = (val: unknown): val is Recordable => getType(val) === "Object"

const isIntegerKey = (key: unknown) =>
  isString(key) &&
  key !== "NaN" &&
  key[0] !== "-" &&
  `${parseInt(key, 10)}` === key

const isEmpty = (value: any): value is NonNullable<any> => {
  value = toValue(value)
  return (
    value === null ||
    value === undefined ||
    value === "" ||
    (Array.isArray(value) && value.length === 0) ||
    (isObjectType(value) && Object.keys(value).length === 0)
  )
}

const isBlob = (value: any) => {
  return getType(value) === "Blob"
}

const inBrowser = typeof window !== "undefined"
const UA = inBrowser && window?.navigator.userAgent.toLowerCase()
const isIE = UA && /msie|trident/.test(UA)
const isIE9 = UA && UA.indexOf("msie 9.0") > 0
const isEdge = UA && UA.indexOf("edge/") > 0
const isAndroid = UA && UA.indexOf("android") > 0
const isIOS = UA && /iphone|ipad|ipod|ios/.test(UA)
// chrome
const isChrome = UA && /chrome\/\d+/.test(UA) && !isEdge
const isPhantomJS = UA && /phantomjs/.test(UA)
// 火狐浏览器
const isFF = UA && UA.match(/firefox\/(\d+)/)
// webview
const isWebView = UA && /(iphone|ipad|ipod|ios).*applewebkit/i.test(UA)
// 是否是微信浏览器
const isWeChat = UA && UA.includes("micromessenger")
// 是否是手机
const isMobile = UA && /(iphone|ipad|ipod|ios|android)/i.test(UA)
// 是否是pc端
const isPC = !isMobile

export {
  getType,
  isArray,
  isNumber,
  isNumberStrict,
  isMap,
  isSet,
  isDate,
  isFunction,
  isString,
  isSymbol,
  isObjectType,
  isPromise,
  isObject,
  isIntegerKey,
  isUrl,
  isEmpty,
  isBlob,
  isElement,
  isWindow,
  isRegExp,
  isBoolean,
  isAsyncFunction,
  isNullOrUnDef,
  isNullAndUnDef,
  isNull,
  isUnDef,
  isDef,
  isVNode,
  isClient,
  inBrowser,
  isIE,
  isIE9,
  isEdge,
  isAndroid,
  isIOS,
  isChrome,
  isPhantomJS,
  isFF,
  isWebView,
  isWeChat,
  isMobile,
  isPC,
}
