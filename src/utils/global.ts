import {getInstalledPathSync} from 'get-installed-path'
import _ from 'lodash'
import path from 'path'

export type SpreadsheetTypes = 'cis' | 'disa' |'general'

export function checkSuffix(input: string) {
  if (input.endsWith('.json')) {
    return input
  }
  return `${input}.json`
}

export function sliceIntoChunks(
  arr: any[],
  chunkSize: number
): any[][] {
  const res = []
  for (let i = 0; i < arr.length; i += chunkSize) {
    res.push(arr.slice(i, i + chunkSize))
  }
  return res
}

export function getInstalledPath(): string {
  let installedPath = ''

  try {
    installedPath = getInstalledPathSync('@mitre/saf')
  } catch {
    // eslint-disable-next-line unicorn/prefer-module
    installedPath = path.join(require.main?.path.replace('/bin', '').replace('\\bin', '') || '.')
  }
  return installedPath
}

export const arrayedPaths = ['tags.cci', 'tags.nist']

export function findFieldIndex(field: string | string [], fields: (string | number)[], defaultIndex: number) {
  if (Array.isArray(field)) {
    return fields.indexOf(
      fields.find(fieldsItem => fields.includes(fieldsItem)) || 'Field Not Defined'
    )
  }
  return fields.includes(field) ? defaultIndex : fields.indexOf(field)
}

export function arrayNeededPaths(typeOfPath: string, values: any) {
  if (arrayedPaths.includes(typeOfPath.toLowerCase())) {
    return [values]
  }
  return values
}

export function extractValueViaPathOrNumber(typeOfPathOrNumber: string, pathOrNumber: string | string[] | number, data: Record<string, any>, format?: SpreadsheetTypes): any {
  if (typeof pathOrNumber === 'string') {
    return arrayNeededPaths(typeOfPathOrNumber, _.get(data, pathOrNumber))
  }
  if (Array.isArray(pathOrNumber)) {
    const foundPath = pathOrNumber.find(item => _.get(data, item)) || 'Field Not Defined'
    return arrayNeededPaths(typeOfPathOrNumber, _.get(data, foundPath))
  }
  if (typeof pathOrNumber === 'number') {
    return pathOrNumber
  }
}
