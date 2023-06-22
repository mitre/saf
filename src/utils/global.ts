import {fingerprint} from '@mitre/hdf-converters'
import {getInstalledPathSync} from 'get-installed-path'
import {ContextualizedEvaluation, ExecJSON} from 'inspecjs'
import {ExecJSONProfile} from 'inspecjs/lib/generated_parsers/v_1_0/exec-json'
import _ from 'lodash'
import path from 'path'

export type SpreadsheetTypes = 'cis' | 'disa' | 'general'

export const knownInspecMetadataKeys = ['control', 'title', 'desc', 'description', 'rationale', 'impact', 'references', 'tag']

export function checkSuffix(input: string) {
  if (input.endsWith('.json')) {
    return input
  }

  return `${input}.json`
}

// replacement for path.basename since it doesn't "just work" as one would expect with handling paths from other filesystem types
export function convertFullPathToFilename(inputPath: string): string {
  let filePath = inputPath.split('/')
  let basename = filePath.at(-1)
  if (!basename) {
    throw new Error('Could not derive basename from file path')
  }

  filePath = basename.split('\\')
  basename = filePath.at(-1)
  if (!basename) {
    throw new Error('Could not derive basename from file path')
  }

  return basename
}

export function dataURLtoU8Array(dataURL: string): Uint8Array {
  const arr = dataURL.split(',')
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)

  while (n--) {
    // eslint-disable-next-line unicorn/prefer-code-point
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

export function getProfileInfo(evaluation: ContextualizedEvaluation, fileName: string): string {
  let result = ''
  const profile: ExecJSONProfile = _.get(evaluation, 'data.profiles[0]')
  result += `File Name: ${fileName}\n`
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

// Get description from Array of descriptions or Key/String pair
export function getDescription(
  descriptions:
    | {
      [key: string]: string;
    }
    | ExecJSON.ControlDescription[],
  key: string,
): string | undefined {
  return Array.isArray(descriptions) ? descriptions.find(
    (description: ExecJSON.ControlDescription) =>
      description.label.toLowerCase() === key,
  )?.data : _.get(descriptions, key)
}

// Check if file input is of given type - throw error if not
export function checkInput(guessOptions: { data: string, filename: string }, desiredType: string, desiredFormat: string): void {
  const detectedType = fingerprint({data: guessOptions.data, filename: convertFullPathToFilename(guessOptions.filename)})
  if (!(detectedType === desiredType))
    throw new Error(`Unable to process input file\
      \nDetected input type: ${detectedType === '' ? 'unknown or none' : `${detectedType} - did you mean to run the ${detectedType} to HDF converter instead?`}\
      \nPlease ensure the input is a valid ${desiredFormat}`)
}
