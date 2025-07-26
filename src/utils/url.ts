/* 获取url上的query参数以对象的方式返回 */
function getUrlQuery(url?: string): Recordable {
  const urlSearch = (url || window.location.href).replace(/^[^?=]*\?/g, "")
  const obj = {}
  const searchURL = new URLSearchParams(urlSearch)
  searchURL.forEach((value, key) => {
    obj[key] = value
  })
  return obj
}

/* 设置url的query参数 */
function setUrlQuery(url: string, obj: Recordable) {
  const searchURL = new URLSearchParams(url.split("?")[1] || "")

  for (const key in obj) {
    searchURL.delete(key)
    searchURL.append(key, obj[key])
  }
  return url.split("?")[0] + "?" + searchURL.toString()
}

/* 移除url指定参数 */
function removeUrlQuery(url: string, key: string) {
  const searchURL = new URLSearchParams(url)
  searchURL.delete(key)
  const search = searchURL.toString()
  return search ? url + "?" + search : url
}

/* 移除路径上多余的斜杆 ///aaa//bbb///ccc => /aaa/bbb/ccc */
const uniqueSlash = (path: string) => path.replace(/(https?:\/)|(\/)+/g, "$1$2")

export { getUrlQuery, setUrlQuery, removeUrlQuery, uniqueSlash }
