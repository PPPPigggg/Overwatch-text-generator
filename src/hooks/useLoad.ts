/**
 * @description 下拉加载更多封装
 * @param { Function } api 获取 api 方法 (必传) api要传入useFetch
 * @param { Boolean } immediate 是否立即执行onload (默认 false)
 * @param { Boolean } showLoading 是否显示全屏loading (默认 false)
 * @param { Number } page 当前页数 (默认 1)
 * @param { Number } pageSize 每页几条 (默认 15)
 * */
import { showLoadingToast, type ToastWrapperInstance } from "vant"
import { deepClone } from "@/utils/clone"
import { isArray, isBoolean } from "@/utils/is"
import { ref, type Ref } from "vue"
import { http } from "@/utils/http/request"
import type { FetchReturn, RefsToVal } from "@/utils/http/type"

export interface ListType<T = Record<string, any>[]> {
  records: T
  total: number
  size: number
  current: number
  orders: Record<string, any>[]
  optimizeCountSql: boolean
  searchCount: boolean
  maxLimit?: any
  countId?: any
  pages: number
}

const defaultConfig = () => ({
  pageNum: 1,
  pageSize: 15,
  immediate: false,
  showLoading: false,
})

interface IOptions {
  pageNum?: number
  pageSize?: number
  immediate?: boolean
  showLoading?: boolean
}

type LoadReturn<T> = RefsToVal<FetchReturn<T>>

type PageListType<T> = T extends ListType<any> ? Array<T["records"]> : T[]

export const useLoad = <T = any>(
  cb: (p: any) => FetchReturn<T> | PromiseLike<RefsToVal<FetchReturn<T>>>,
  options: IOptions = {},
) => {
  const { immediate, pageNum, pageSize, showLoading } = Object.assign(
    defaultConfig(),
    options,
  )

  const loading = ref(false)
  const page_num = ref(pageNum)
  const page_size = ref(pageSize)
  const page_list = ref([]) as unknown as Ref<PageListType<T>>
  const finished = ref(false)
  const error = ref<any>(undefined)
  const refreshing = ref(false)

  // 覆盖数据还是清空数据后再覆盖
  let isClearCover = true

  const goTop = () => {
    // 初始化时回到顶部，避免切换tab时页面停留在底部然后多次触发onload
    const vantList = document.querySelectorAll(
      ".van-list",
    ) as unknown as HTMLElement[]
    if (vantList?.length > 0) {
      vantList.forEach((vanItem) => {
        vanItem.style.position = "absolute"

        setTimeout(() => {
          vanItem.style.position = ""
        }, 0)
      })
    }
  }

  let loadingToast: ToastWrapperInstance | undefined

  const onLoad = async (
    init: boolean = false,
    params: Record<string, any> = {},
  ) => {
    loading.value = true

    if (init) {
      page_num.value = 1
      if (refreshing.value) {
        loading.value = false
        finished.value = true // 防止刷新时下滑会触发加载的问题
      } else {
        finished.value = false
        goTop()
        if (isClearCover) page_list.value = [] as any // 当刷新并且不是通过下拉刷新时清空数据
        isClearCover = true
      }
    }

    const { data: resData, error: resError } = (await cb({
      pageNum: page_num.value,
      pageSize: page_size.value,
      ...params,
    })) as unknown as LoadReturn<ListType<T>>

    if (refreshing.value) {
      refreshing.value = false
    }

    error.value = resError
    loadingToast?.close()

    if (resError) {
      page_num.value = 1
      finished.value = true
      loading.value = false
      return
    }

    let resDataValue: typeof resData | {}

    // 兼容返回数据为数组的情况
    if (isArray(resData)) {
      resDataValue = {
        records: resData || [],
        pages: 1,
        current: 1,
        optimizeCountSql: false,
        searchCount: false,
        size: resData?.length || 0,
        total: resData?.length || 0,
        orders: [],
      }
    } else {
      resDataValue = resData || {
        records: [],
        pages: 1,
        current: 1,
        optimizeCountSql: false,
        searchCount: false,
        size: 0,
        total: 0,
        orders: [],
      }
    }

    const {
      records: pageList = [],
      pages: pageTotal,
      current: pageCur,
    } = resDataValue as ListType<T>

    if (isArray(pageList)) {
      if (!init && page_num.value !== 1) {
        page_list.value.push(...pageList)
      } else {
        // 深拷贝避免缓存时被引用数据篡改
        page_list.value = (deepClone(pageList) || []) as any
      }
    }

    if (pageTotal <= pageCur) {
      finished.value = true
    } else {
      page_num.value++
      finished.value = false
    }

    loading.value = false
  }

  const onRefresh = (
    params: Recordable | boolean = {},
    clear: boolean = true,
  ) => {
    if (isBoolean(params)) {
      clear = params
      params = {}
    }

    isClearCover = clear
    return onLoad(true, params)
  }

  if (showLoading) {
    loadingToast = showLoadingToast({ forbidClick: true })
  }

  if (immediate) {
    onLoad().finally(() => {
      loadingToast?.close()
    })
  }

  return {
    pageNum: page_num,
    pageSize: page_size,
    pageList: page_list,
    finished,
    loading,
    error,
    refreshing,
    onLoad,
    onRefresh,
  }
}
