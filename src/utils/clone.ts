import { toRaw } from "vue"

function getType(value) {
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

function deepClone<T>(obj: T): T {
  const map = new Map()

  function clone(value) {
    if (map.has(value)) return map.get(value)

    function ArrayOrObject() {
      const result = new value.constructor()
      map.set(value, result)
      for (const [k, v] of Object.entries(value)) {
        result[k] = clone(v)
      }
      return result
    }

    const strategy = {
      Array: ArrayOrObject,
      Object: ArrayOrObject,
      Map() {
        const newMap = new Map()
        value.forEach((v, k) => {
          newMap.set(clone(k), clone(v))
        })

        return newMap
      },
      Set() {
        const newSet = new Set()
        value.forEach((item) => {
          newSet.add(clone(item))
        })
        return newSet
      },
      Date() {
        return new Date(value.valueOf())
      },
      Error() {
        return new Error(value.message)
      },
      RegExp() {
        const result = new RegExp(value.source, value.flags)
        result.lastIndex = value.lastIndex
        return result
      },
    }
    const fn = strategy[getType(value)]
    return fn ? fn() : value
  }
  return clone(toRaw(obj))
}

export { deepClone }
