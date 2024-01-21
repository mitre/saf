import {fingerprint} from '@mitre/hdf-converters'
import Profile from '@mitre/inspec-objects/lib/objects/profile'
import appRootPath from 'app-root-path'
import {getInstalledPathSync} from 'get-installed-path'
import {AnyProfile, ContextualizedEvaluation, ExecJSON} from 'inspecjs'
import _ from 'lodash'
import path from 'path'
/**
 * `SpreadsheetTypes` is a type alias for the possible types of spreadsheets.
 * It is used to specify the type of spreadsheet when calling functions that require this information.
 * Currently, the possible types are 'cis', 'disa', and 'general'.
 */
export type SpreadsheetTypes = 'cis' | 'disa' | 'general'

// Migrate this to an 'enum' type given it is a Set
// export enum SpreadsheetTypes {
//   CIS = 'cis',
//   DISA = 'disa',
//   GENERAL = 'general'
// }

/**
 * `knownInspecMetadataKeys` is an array of keys that are known to be used in InSpec metadata.
 * It is used in functions that need to process or manipulate InSpec metadata.
 * The current keys are 'control', 'title', 'desc', 'description', 'rationale', 'impact', 'references', and 'tag'.
 */
export const knownInspecMetadataKeys = ['control', 'title', 'desc', 'description', 'rationale', 'impact', 'references', 'tag']

/**
 * `arrayedPaths` is an array of paths that need to be arrayed.
 * It is used in the `arrayNeededPaths` function to determine if a path needs to be arrayed.
 * The current paths are 'tags.cci' and 'tags.nist'.
 */
export const arrayedPaths = ['tags.cci', 'tags.nist']

/**
 * The `checkSuffix` function.
 *
 * This function ensures that a given string ends with '.json'.
 * If the input string does not end with '.json', it appends '.json' to the string.
 *
 * @param input - The input string to check. This should be a string that is expected to represent a JSON file name or path.
 *
 * @returns {string} - The input string with '.json' appended if it was not already present. If '.json' was already present, the input string is returned unchanged.
 */
export function checkSuffix(input: string): string {
  if (input.endsWith('.json')) {
    return input
  }

  return `${input}.json`
}

/**
 * The `convertFullPathToFilename` function.
 *
 * This function converts a full file path into a filename.
 * It does this by extracting the last part of the path, which is the filename.
 *
 * @param inputPath - The full path to convert. This should be a string representing a valid file path.
 *
 * @returns {string} - The filename extracted from the full path. If the path does not contain a filename, an empty string is returned.
 */
export function convertFullPathToFilename(inputPath: string): string {
  return path.basename(inputPath)
}

/**
 * The `dataURLtoU8Array` function.
 *
 * This function converts a data URL into a Uint8Array.
 *
 * - First, it splits the data URL into an array using a comma as the separator.
 * - Then, it decodes the second part of the array (the base64 string) into a binary string.
 * - It creates a new Uint8Array with the same length as the binary string.
 * - Finally, it fills the Uint8Array with the char codes from the binary string.
 *
 * @param dataURL - The data URL to convert. This should be a base64-encoded data URL.
 *
 * @returns {Uint8Array} - The Uint8Array representation of the data URL.
 */
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

/**
 * The `getInstalledPath` function.
 *
 * This function retrieves the installed path of a specified package.
 * If the package is not installed, it returns the application root path.
 *
 * - First, it attempts to get the installed path of the specified package using `getInstalledPathSync`.
 * - If this fails (throws an error), it defaults to the application root path.
 *
 * @param {string} moduleName - The name of the module to get the installed path for.
 * @returns {string} - The installed path of the specified package, or the application root path if the package is not installed.
 */
export function getInstalledPath(moduleName: string): string {
  let installedPath
  try {
    installedPath = getInstalledPathSync(moduleName)
  } catch {
    installedPath = appRootPath.path
  }

  return installedPath
}

/**
 * The `arrayNeededPaths` function.
 *
 * This function checks if a path needs to be arrayed based on its type.
 * It uses the 'arrayedPaths' array for this check.
 *
 * @param typeOfPath - The type of path to check.
 *                     This is converted to lowercase and checked against the 'arrayedPaths' array.
 * @param values - The values to possibly wrap in an array.
 *
 * @returns {any | any[]} - If `typeOfPath` is in 'arrayedPaths', `values` is returned as an array.
 *                          Otherwise, `values` is returned as is.
 */
export function arrayNeededPaths(typeOfPath: string, values: any): any | any[] {
  return arrayedPaths.includes(typeOfPath.toLowerCase()) ? (Array.isArray(values) ? values : [values]) : values
}

/**
 * The `extractValueViaPathOrNumber` function extracts a value from a data object.
 * It uses a path or number (`pathOrNumber`) to perform the extraction.
 *
 * - If `pathOrNumber` is a string, it's treated as a path. The function uses it to extract a value from `data`.
 *   The extracted value is then processed by `arrayNeededPaths`.
 *
 * - If `pathOrNumber` is an array, the function finds the first item that corresponds to a property in `data`.
 *   If no such item is found, it defaults to 'Field Not Defined'. The value of the found or default property is then processed by `arrayNeededPaths`.
 *
 * - If `pathOrNumber` is a number, the function simply returns it.
 *
 * @param typeOfPathOrNumber - The type of `pathOrNumber`. Passed to `arrayNeededPaths`.
 * @param pathOrNumber - The path or number to extract the value. Treated differently based on its type:
 *                       string (path), array (list of potential paths), or number (returned as is).
 * @param data - The data object to extract the value from.
 *
 * @returns {any} The extracted value. If `pathOrNumber` is a string or array, it's processed by `arrayNeededPaths`.
 *                If `pathOrNumber` is a number, it's returned as is.
 */
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

interface ExtendedContextualizedEvaluation extends ContextualizedEvaluation {
  profiles?: AnyProfile[]; // change this line
}

/**
 * The `getProfileInfo` function retrieves and formats profile information from a given evaluation.
 *
 * - First, it checks if the evaluation data and profile data are available. If not, it returns an empty string.
 * - Then, it extracts the first profile from the evaluation data.
 * - It creates a string containing the file name and various profile information:
 *   version, SHA256 hash, maintainer, copyright, copyright email, and control count.
 * - If a piece of information is not available (i.e., the property value is falsy), it is not included in the string.
 * - The string is then returned, with each piece of information on a new line.
 *
 * @param evaluation - The evaluation to extract profile information from.
 *                     This should be a `ContextualizedEvaluation` object.
 *                     If this is `null` or `undefined`, the function returns an empty string.
 * @param fileName - The name of the file the evaluation is from.
 *                   This is included in the returned string.
 *
 * @returns {string} A string containing the profile information.
 *                   Each piece of information is on a new line.
 *                   If a piece of information is not available, it is not included in the string.
 *                   If the evaluation data or profile data is not available, it returns an empty string.
 */
export function getProfileInfo(evaluation: ExtendedContextualizedEvaluation, fileName: string): string {

  let result = ''

  const profile: AnyProfile | undefined = evaluation?.profiles ? evaluation.profiles[0] : undefined;

  if (!evaluation || !profile) {
    return result
  }

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

  if ('controls' in profile && profile.controls.length) {
    result += `Control Count: ${profile.controls.length}\n`
  }

  return result.trim()
}

/**
 * The `getDescription` function retrieves a specific description from either an array of descriptions or a key/string pair.
 *
 * - If `descriptions` is an array, it searches for a description object where the `label` property matches the provided `key` (case-insensitive).
 *   If a match is found, it returns the `data` property of the description object.
 *   If no match is found, it returns 'description not found'.
 *
 * - If `descriptions` is a key/string pair, it returns the value associated with the provided `key`.
 *   If the `key` does not exist in the `descriptions`, it returns 'unknown key'.
 *
 * @param descriptions - Either an array of description objects or a key/string pair.
 *                       If it's an array, each object should have a `label` (string) and a `data` (string).
 *                       If it's a key/string pair, it's an object where the keys are strings and the values are also strings.
 * @param key - The key to retrieve the description.
 *              If `descriptions` is an array, it should match the `label` of one of the objects.
 *              If `descriptions` is a key/string pair, it should be one of the keys.
 *
 * @returns {string} The description associated with the provided `key`,
 *                   'description not found' if no matching description was found in the array,
 *                   or 'unknown key' if the `key` does not exist in the `descriptions` object.
 */
export function getDescription(
  descriptions: { [key: string]: string } | ExecJSON.ControlDescription[],
  key: string,
): string {
  if (Array.isArray(descriptions)) {
    const description = descriptions.find((description: ExecJSON.ControlDescription) => description.label.toLowerCase() === key)
    return description ? description.data : `description for ${key} not found`
  }

  return descriptions[key] || `no description was labeled with: ${key}`
}

/**
 * The `checkInput` function validates the type of an input file.
 *
 * - It uses the `fingerprint` function to detect the file type.
 * - If the detected type doesn't match the desired type, it throws an error.
 *
 * @param guessOptions - An object with the file data and filename.
 *                       The `data` property is the file content as a string.
 *                       The `filename` property is the file name.
 * @param desiredType - A string for the desired file type.
 *                      This is compared with the detected file type.
 * @param desiredFormat - A string for the desired file format.
 *                        This is included in the error message if the detected type doesn't match the desired type.
 *
 * @throws {Error} If the detected file type doesn't match the desired type,
 *                 an error is thrown. The error message includes the detected type,
 *                 the desired format, and a prompt for the user to ensure the input
 *                 is a valid file of the desired format.
 *
 * @returns {void} This function doesn't return a value. Its purpose is to validate
 *                 the file type and throw an error if the validation fails.
 */
export function checkInput(guessOptions: { data: string, filename: string }, desiredType: string, desiredFormat: string): void {
  const detectedType = fingerprint({data: guessOptions.data, filename: convertFullPathToFilename(guessOptions.filename)})
  if (detectedType !== desiredType) {
    throw new Error(`Unable to process input file\nDetected input type: ${detectedType || 'unknown or none'}\nPlease ensure the input is a valid ${desiredFormat}`)
  }
}
