import type { UseFetchOptions } from "@vueuse/core"
import type { IApiOptions } from "@/utils/http/type"

import type {
  ComponentRenderProxy,
  VNode,
  VNodeChild,
  SetupContext,
  EmitsOptions,
} from "vue"

declare global {
  const require: (path: string) => any

  type IFetchOp = UseFetchOptions & { _options?: IApiOptions }

  // 用来表示id类型
  type ID = number | string

  const __APP_INFO__: {
    lastBuildTime: string
  }
  // declare interface Window {
  //   // Global vue app instance
  //   __APP__: App<Element>;
  // }

  declare type VueNode = VNodeChild | JSX.Element

  export type Writable<T> = {
    -readonly [P in keyof T]: T[P]
  }
  type RemoveIndex<T> = {
    [K in keyof T as string extends K
      ? never
      : number extends K
        ? never
        : K]: T[K]
  }
  declare type NullAndUnDef = undefined | null | void
  declare type Nullable<T> = T | null
  declare type NonNullable<T> = T extends null | undefined ? never : T
  declare type Recordable<T = any> = Record<string, T>
  declare type Key = string | number
  declare type ReadonlyRecordable<T = any> = {
    readonly [key: string]: T
  }
  declare type Indexable<T = any> = {
    [key: string]: T
  }
  declare type DeepPartial<T> = {
    [P in keyof T]?: DeepPartial<T[P]>
  }

  declare type TimeoutHandle = ReturnType<typeof setTimeout>
  declare type IntervalHandle = ReturnType<typeof setInterval>

  declare interface ChangeEvent extends Event {
    target: HTMLInputElement
  }

  declare interface WheelEvent {
    path?: EventTarget[]
  }
  declare function parseInt(s: string | number, radix?: number): number

  declare function parseFloat(string: string | number): number

  declare type EmitFn<E = EmitsOptions> = SetupContext<E>["emit"]

  namespace JSX {
    // tslint:disable no-empty-interface
    type Element = VNode
    // tslint:disable no-empty-interface
    type ElementClass = ComponentRenderProxy
    interface ElementAttributesProperty {
      $props: any
    }
    interface IntrinsicElements {
      [elem: string]: any
    }
    interface IntrinsicAttributes {
      [elem: string]: any
    }
  }
}

declare module "vue" {
  export type JSXComponent<Props = any> =
    | { new (): ComponentPublicInstance<Props> }
    | FunctionalComponent<Props>
}
