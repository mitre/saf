import {getInstalledPathSync} from 'get-installed-path'
import path from 'path'

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
