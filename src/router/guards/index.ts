import { isNavigationFailure } from "vue-router"
import NProgress from "nprogress" // progress bar
import { HOME_NAME, LOGIN_NAME, REDIRECT_NAME } from "../constant"
import type { Router, RouteLocationNormalized } from "vue-router"
import { useKeepAliveStore } from "@/stores/modules/keepAlive"
import { isEmpty } from "@/utils/is"
import { getUrlQuery } from "@/utils/url"

NProgress.configure({ showSpinner: false }) // NProgress Configuration
/**
 * 创建路由守卫
 * @param router 路由实例
 * @param whiteNameList 白名单路由
 */

// 判断路由是前进还是后退
let position = 0
let isBack = false
export function createRouterGuards(router: Router, whiteNameList: string[]) {
  router.beforeEach(async (to, _, next) => {
    isBack = position > window.history.state?.position
    // 检查当前路由是否为登录页
    // if (to.name !== LOGIN_NAME) {
    //   NProgress.start() // start progress bar
    // }
    if (![LOGIN_NAME, HOME_NAME].includes(to.name as string)) {
      NProgress.start() // start progress bar
    }

    const keepAliveStore = useKeepAliveStore()

    // 在这里设置需要缓存的组件名称
    const toCompName = getComponentName(to)
    // 如果设置了keepAlive，只有回退的情况才会缓存这个页面，前进则刷新
    if (!isBack && toCompName) {
      keepAliveStore.remove(toCompName)
    }

    next()
  })

  /** 获取路由对应的组件名称 */
  const getComponentName = (route: RouteLocationNormalized) => {
    const comp = route.matched[route.matched.length - 1]?.components?.default
    return comp?.name ?? (comp as any)?.type?.name
  }

  router.afterEach((to, from, failure) => {
    position = isNaN(window.history.state?.position)
      ? (window.history.state["position"] = 0)
      : window.history.state?.position

    const keepAliveStore = useKeepAliveStore()

    if (isNavigationFailure(failure)) {
      console.error("failed navigation", failure)
    }
    // 在这里设置需要缓存的组件名称
    const toCompName = getComponentName(to)
    // 判断当前页面是否开启缓存，如果开启，则将当前页面的 componentName 信息存入 keep-alive 全局状态
    if (to.meta?.keepAlive) {
      // 需要缓存的组件
      if (toCompName) {
        keepAliveStore.add(toCompName)
      } else {
        console.warn(
          `${to.fullPath}页面组件的keepAlive为true但未设置组件名，会导致缓存失效，请检查`,
        )
      }
    } else {
      // 不需要缓存的组件
      if (toCompName) {
        keepAliveStore.remove(toCompName)
      }
    }
    // 如果进入的是 Redirect 页面，则也将离开页面的缓存清空(Redirect页面是用来刷新当前页面的)
    if (to.name === REDIRECT_NAME) {
      const fromCompName = getComponentName(from)
      fromCompName && keepAliveStore.remove(fromCompName)
    }

    NProgress.done()

    // 设置页面标题
    if (to.meta.title) {
      document.title = to.meta.title
    }
  })

  router.onError((error) => {
    console.log(error, "路由错误")
  })
}
