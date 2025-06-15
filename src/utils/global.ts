import appRootPath from 'app-root-path'
import {Assettype, fingerprint, Role, Techarea} from '@mitre/hdf-converters'
import {getInstalledPathSync} from 'get-installed-path'
import {AnyProfile, ContextualizedEvaluation, ExecJSON} from 'inspecjs'
import _ from 'lodash'
import fs from 'fs'
import axios from 'axios'
import AdmZip from 'adm-zip'

export type SpreadsheetTypes = 'cis' | 'disa' | 'general'

export const knownInspecMetadataKeys = ['control', 'title', 'desc', 'description', 'rationale', 'impact', 'references', 'tag']

export function checkSuffix(input: string, suffix = '.json') {
  if (input.endsWith(suffix)) {
    return input
  }

  return `${input}${suffix}`
}

/**
 * The `basename` function.
 *
 * This function returns the basename, i.e. the last value for a given path
 * which is usually the filename and extension.
 *
 * Not using path.basename as it doesn't "just work" as one would expect handling
 * paths from other filesystem types: see https://nodejs.org/api/path.html#windows-vs-posix
 *
 * @param inputPath - The full path to convert. This should be a string representing a valid file path.
 *
 * @returns {string} - The filename extracted from the full path. If the path does not contain a filename, an empty string is returned.
 */
export function basename(inputPath: string): string {
  // trim trailing whitespace and path separators
  // ('/'=linux or '\'=windows (note that this could be double backslash on occasion)) from the end of the string
  const trimmedPath = inputPath.trimEnd().replace(/[\\/]+$/, '')

  // grab everything after the last separator or the entire string if no separator found
  const lastSeparatorIndex = Math.max(
    trimmedPath.lastIndexOf('/'),
    trimmedPath.lastIndexOf('\\'),
  )

  // return the substring after the index of the separator - if no separator was found then the index was -1 to which adding 1 makes 0, i.e. the beginning of the string
  return trimmedPath.slice(lastSeparatorIndex + 1)
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

export const arrayedPaths = ['tags.cci', 'tags.nist']

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
export function arrayNeededPaths(typeOfPath: string, values: string | string[]): string | string[] {
  const isArray = Array.isArray(values)
  let result
  if (arrayedPaths.includes(typeOfPath.toLowerCase())) {
    result = isArray ? values : [values]
  } else {
    result = values
  }

  return result
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extractValueViaPathOrNumber(typeOfPathOrNumber: string, pathOrNumber: string | string[] | number, data: Record<string, any>): any {
  // Maps paths from mapping file to target value
  if (typeof pathOrNumber === 'string') {
    return arrayNeededPaths(typeOfPathOrNumber, _.get(data, pathOrNumber))
  }

  if (Array.isArray(pathOrNumber)) {
    // const foundPath = pathOrNumber.find(item => _.get(data, item)) || 'Field Not Defined'
    const foundPath = pathOrNumber.find(item => _.get(data, item)) ?? 'Field Not Defined'
    return arrayNeededPaths(typeOfPathOrNumber, _.get(data, foundPath))
  }

  if (typeof pathOrNumber === 'number') {
    return pathOrNumber
  }
}

interface ExtendedContextualizedEvaluation extends ContextualizedEvaluation {
  profiles?: AnyProfile[] // change this line
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
// export function getProfileInfo(evaluation: ContextualizedEvaluation, fileName: string): string {
export function getProfileInfo(evaluation: ExtendedContextualizedEvaluation, fileName: string): string {
  let result = ''
  // const profile: ExecJSONProfile = _.get(evaluation, 'data.profiles[0]')
  const profile: AnyProfile | undefined = evaluation?.profiles ? evaluation.profiles[0] : undefined

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

  if (profile.controls.length) {
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
  descriptions:
    | {
      [key: string]: string
    }
    | ExecJSON.ControlDescription[],
  key: string,
): string | undefined {
  return Array.isArray(descriptions) ? descriptions.find(
    (description: ExecJSON.ControlDescription) =>
      description.label.toLowerCase() === key,
  )?.data : _.get(descriptions, key)
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
export function checkInput(guessOptions: {data: string, filename: string}, desiredType: string, desiredFormat: string): void {
  const detectedType = fingerprint({data: guessOptions.data, filename: basename(guessOptions.filename)})
  if (!(detectedType === desiredType))
    throw new Error(`Unable to process input file\
      \nDetected input type: ${detectedType === '' ? 'unknown or none' : `${detectedType} - did you mean to run the ${detectedType} to HDF converter instead?`}\
      \nPlease ensure the input is a valid ${desiredFormat}`)
}

/**
 * Retrieves the error message from an unknown error object.
 *
 * @param error - The error object to extract the message from (any type).
 * @returns The error message as a string. If the error is an instance of
 *          `Error`, it returns the error's message. If the error is not an
 *          instance of `Error`, it attempts to stringify the error object.
 *          If stringification fails (e.g., due to circular references), it
 *          falls back to converting the error to a string.
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  try {
    return JSON.stringify(error)
  } catch {
    return String(error) // Fallback for circular references
  }
}

/**
 * Downloads a file from the specified URL and saves it to the given output path.
 *
 * @param url - The URL of the file to download. If undefined, an error is thrown.
 * @param outputPath - The path where the downloaded file will be saved.
 * @returns A promise that resolves when the file has been successfully downloaded and saved.
 * @throws Will throw an error if the URL is undefined or if there is an error during the download or file writing process.
 */
export async function downloadFile(url: string | undefined, outputPath: string): Promise<void> {
  if (url === undefined) {
    throw new Error('XCCDF URL not defined')
  }

  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream',
    })

    const writer = fs.createWriteStream(outputPath)

    response.data.pipe(writer)

    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        resolve()
      })

      writer.on('error', (err) => {
        console.error('Error writing file:', err)
        reject(err)
      })
    })
  } catch (error) {
    throw new Error(`Error downloading file: ${getErrorMessage(error)}`)
  }
}

/**
 * Extracts a specific file from a ZIP archive.
 *
 * @param zipPath - The path to the ZIP archive.
 * @param fileName - The name of the file to extract from the ZIP archive.
 * @returns The content of the extracted file as a Buffer, or null if the file is not found or an error occurs.
 */
export function extractFileFromZip(zipPath: string, fileName: string): [Buffer | null, string] {
  try {
    const zip = new AdmZip(zipPath)
    const zipEntries = zip.getEntries()

    // Look for the file (it will cycle trough all files to include sub-folders)
    for (const entry of zipEntries) {
      if (entry.entryName.endsWith(fileName)) {
        // Returns file content as a Buffer and file name
        return [entry.getData(), entry.entryName]
      }
    }
    throw new Error(`File not found in the ZIP archived: ${fileName}`)
  } catch (error) {
    throw new Error(`Error extracting file -> ${getErrorMessage(error)}`)
  }
}

/**
 * Retrieves example JSON metadata based on the specified endpoint.
 *
 * @param endpoint - The endpoint identifier to determine the type of metadata to return.
 *                   Supported values:
 *                   - `'ckl-one-metadata'`: Returns metadata with a single profile.
 *                   - `'ckl-multiple-metadata'`: Returns metadata with multiple profiles.
 *                   If no endpoint is provided or the endpoint is not recognized, an empty array is returned.
 *
 * @returns An array of strings representing the JSON metadata examples for the specified endpoint.
 *          If the endpoint is `'ckl-one-metadata'`, a single profile metadata is returned.
 *          If the endpoint is `'ckl-multiple-metadata'`, multiple profiles metadata is returned.
 *          Returns an empty array if the endpoint is not recognized.
 *
 * @throws {SyntaxError} If the constructed JSON data is malformed and cannot be parsed.
 */
export function getJsonMetaDataExamples(endpoint?: string): string[] {
  const profile = '{ '
    + '"name:": "The benchmark name (must match with profile name listed in HDF)",'
    + '"title:": "The benchmark title",'
    + '"version": "The benchmark version number (integer)",'
    + '"releasenumber": "The benchmark Release number (integer or double)",'
    + '"releasedate": "The benchmark release date (dd LLL yyyy)",'
    + '"showCalendar": true}'

  const assets = '"marking": "[Unclass, CUI, etc]",'
    + '"hostname": "The asset hostname",'
    + '"hostip": "The asset IP address",'
    + '"hostmac": "The asset MAC address",'
    + '"targetcomment": "The target comments",'
    + `"role": "The computing role, one of: [${Object.values(Role)}]",`
    + `"assettype": "The asset type, one of: [${Object.values(Assettype)}]",`
    + `"techarea": "The tech area, one of: [${Object.values(Techarea).filter(item => item !== '')}]",`
    + '"stigguid": "The STIG ID",'
    + '"targetkey": "The target key",'
    + '"webordatabase": "Is the target a web or database? [Y/n]",'
    + '"webdbsite": "The Web or DB site",'
    + '"webdbinstance": "The Web or DB instance",'
    + '"vulidmapping": "Use gid or id for Vul ID number [gid/id]"'

  if (endpoint === 'ckl-one-metadata') {
    const data = '{ '
      + '"profiles": ['
      + profile
      + '],'
      + assets
      + '}'

    return JSON.parse(data)
  }

  if (endpoint === 'ckl-multiple-metadata') {
    const data = '{ '
      + '"profiles": ['
      + profile + ',' + profile + ',' + profile
      + '],'
      + assets
      + '}'

    return JSON.parse(data)
  }

  return []
}
