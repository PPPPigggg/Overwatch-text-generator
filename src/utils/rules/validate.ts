import { unref } from "vue"

/* 姓名校验 由2-10位汉字组成 */
export function validateUsername(str) {
  console.log("str: ", str)
  const reg = /^([\u4e00-\u9fa5·]{2,16})$/

  return reg.test(str)
}

/* 银行卡校验 */
export function validateBankCode(str) {
  const reg = /^[1-9]\d{9,29}$/
  return reg.test(str)
}

/* 手机号校验 由以1开头的11位数字组成  */
export function validateMobile(str) {
  const reg = /^1\d{10}$/
  return reg.test(str)
}

/* 验证码校验 只能为6位数字验证码 */
export function validateCode(str) {
  const reg = /^\d{6}$/
  return reg.test(str)
}

/* 邮箱校验 */
export function validateEmail(str) {
  const reg =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return reg.test(str)
}

/* 身份证校验 */
export function validateIdCard(str) {
  const reg =
    /^[1-9]\d{5}(?:18|19|20)\d{2}(?:0[1-9]|10|11|12)(?:0[1-9]|[1-2]\d|30|31)\d{3}[\dXx]$/
  return reg.test(str)
}

/* 身份证年龄校验 默认 18 - 65 */
export function validateIdCardAge(
  idCard: string,
  interval: Array<Array<number>>,
): boolean {
  const ageInterval = interval[0]

  if (!validateIdCard(idCard)) {
    throw new Error("Invalid ID card format")
  }

  const myYear = Number(idCard.substring(6, 10))
  const myMonth = Number(idCard.substring(10, 12))
  const myDay = Number(idCard.substring(12, 14))

  const now = new Date()
  const nowYear = now.getFullYear()
  const nowMonth = now.getMonth() + 1
  const nowDay = now.getDate()

  let age = nowYear - myYear - 1

  if (myMonth < nowMonth || (myMonth === nowMonth && myDay <= nowDay)) {
    age++
  }

  return age >= ageInterval[0] && age <= ageInterval[1]
}

/* 密码校验 */
export function validatePass(str) {
  // const reg =
  //   /(?=.*([a-zA-Z].*))(?=.*[0-9].*)[a-zA-Z0-9*-/+.~!@#$%^&*()]{6,16}$/
  // return reg.test(str)
  return str.length >= 6 && str.length <= 16
}

/* 值相等校验 */
export function validateEqual(str1, str2: any[]) {
  return str2.every((item) => {
    return str1 === unref(item)
  })
}

/* 图片校验 */
export function validateImage(file) {
  return file?.length > 0
}

/* 校验图片是否已经上传完成 */
export function validateImageUploaded(files) {
  return files?.every((file) => {
    return file.status !== "uploading"
  })
}

/* 校验是否支持输入小数 */
export function validateDecimal(str) {
  const reg = /\d+\.\d+/
  return !reg.test(str)
}

/* 校验小数位数 */
export function validateDecimalLength(str, len) {
  const reg = new RegExp(`^\\d+(\\.\\d{0,${len}})?$`)
  return reg.test(str)
}

/* 校验正确的数值不能为负数不能以0开头不能以"-"符号开头 */
export function validateNumber(str) {
  const reg = /^(?!0\d)(?!-\d)\d+(\.\d+)?$/
  return reg.test(str)
}
