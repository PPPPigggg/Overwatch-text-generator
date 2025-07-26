import type { RouteMeta as VRouteMeta } from "vue-router"

declare module "vue-router" {
  interface RouteMeta extends VRouteMeta {
    /** 标题 */
    title: string
    /** 是否需要缓存 */
    keepAlive?: boolean
    /** 当前页面切换动画 */
    transitionName?: string | false
    /** 是否需要权限校验 */
    auth?: boolean
    /** icon当前路由对应的icon图标 */
    icon?: string
    /** 是否显示tabbar，默认只有tabbar路由才显示 */
    showTabbar?: boolean
  }
}
