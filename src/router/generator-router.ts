import type { RouteRecordRaw } from "vue-router"
import { uniqueSlash } from "@/utils/url"
import { isEmpty } from "@/utils/is"

/**
 * 拍平路由结构并拼接上对应的path
 * @returns {Promise<Router>}
 */
export const flatRouter = (
  routers: RouteRecordRaw[],
  flatArr: RouteRecordRaw[] = [],
  parentPath = "/",
) => {
  routers.forEach((item) => {
    if (item.path) {
      item.path = uniqueSlash(`/${parentPath}/${item.path}`)
    }
    if (item.children && item.children.length) {
      if (isEmpty(item.redirect)) {
        item.redirect = { name: item.children[0]?.name || "" }
      }
      flatRouter(item.children, flatArr, item.path)
    }

    flatArr.push(item)
  })

  return flatArr
}
