import {getInstalledPathSync} from 'get-installed-path'
import {ExecJSONProfile} from 'inspecjs/lib/generated_parsers/v_1_0/exec-json'
import _ from 'lodash'
import path from 'path'
import {ExtendedEvaluationFile} from '../types/checklist'

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

export function convertFullPathToFilename(inputPath: string): string {
  let filePath = inputPath.split('/')
  const relativeFileName = filePath[filePath.length - 1]
  filePath = relativeFileName.split('\\')
  return filePath[filePath.length - 1]
}

export function dataURLtoU8Array(dataURL: string): Uint8Array {
  const arr = dataURL.split(',')
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }

  return u8arr
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

export function arrayNeededPaths(typeOfPath: string, values: any) {
  // Converts CCI and NIST values to Arrays
  if (arrayedPaths.includes(typeOfPath.toLowerCase())) {
    return [values]
  }
  return values
}

export function extractValueViaPathOrNumber(typeOfPathOrNumber: string, pathOrNumber: string | string[] | number, data: Record<string, any>): any {
  // Maps paths from mapping file to target value
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

export function getProfileInfo(file: ExtendedEvaluationFile): string {
  let result = ''
  const profile: ExecJSONProfile = _.get(file, 'evaluation.data.profiles[0]')
  if (file.fileName) {
    result += `File Name: ${file.fileName}\n`
  }
  if (profile.version) {
    result += `Version: ${profile.version}\n`
  }
  if (profile.sha256) {
    result += `SHA256 Hash: ${profile.sha256}\n`
  }
  if (profile.maintainer) {
    result += `Maintainer: ${profile.maintainer}\n`
  }
  if (profile.copyright) {
    result += `Copyright: ${profile.copyright}\n`
  }
  if (profile.copyright_email) {
    result += `Copyright Email: ${profile.copyright_email}\n`
  }
  if (profile.controls.length) {
    result += `Control Count: ${profile.controls.length}\n`
  }
  return result.trim()
}
