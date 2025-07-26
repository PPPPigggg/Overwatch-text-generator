import * as Validates from "./validate"
import { isEmpty, isBoolean } from "../is"

type ValidateKeys = keyof typeof Validates
/* 生成表格自定义校验函数 */
export const formValidate =
  (key: ValidateKeys, ...rest: any[]) =>
  (value: any, rule: any) => {
    const isRequired = isBoolean(rule.required) ? rule.required : true
    if (isRequired && isEmpty(value)) {
      return "此选项为必填项"
    }

    if (Validates[key](value, rest.slice(0, -1))) {
      // @ts-ignore
      return true
    } else {
      const errMsg = rest[rest.length - 1]
      return errMsg
    }
  }
