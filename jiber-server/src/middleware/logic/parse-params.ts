import { parseParamsStr } from './parse-params-str'

const strRegex = new RegExp(`(^".*"$|^'.*'$)`)

export const parseParams = (state: any, param: string | number | boolean | undefined | any[]) => {
  if (typeof param === 'number') {
    return param
  }
  if (typeof param === 'boolean') {
    return param
  }
  if (Array.isArray(param)) {
    return param
  }
  if (param === undefined) {
    return param
  }
  if (strRegex.test(param)) {
    return param.substring(1, param.length - 1)
  }

  const path: string = parseParamsStr(state, param)
  return path
}