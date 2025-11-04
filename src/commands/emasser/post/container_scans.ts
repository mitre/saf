import {colorize} from 'json-colorizer'
import {Command, Flags} from '@oclif/core'
import {ContainerScanResultsApi} from '@mitre/emass_client'
import {ContainersResponsePost} from '@mitre/emass_client/dist/api'
import {ApiConnection} from '../../../utils/emasser/apiConnection'
import {outputFormat} from '../../../utils/emasser/outputFormatter'
import {displayError, FlagOptions, getFlagsForEndpoint, getJsonExamples, printRedMsg} from '../../../utils/emasser/utilities'
import {readFile} from 'fs/promises'
import _ from 'lodash'
import fs from 'fs'

/**
 * Represents a container resource with associated metadata and benchmarks.
 *
 * @interface ContainerResource
 *
 * @property {string} containerId - The unique identifier of the container. (Required)
 * @property {string} containerName - The name of the container. (Required)
 * @property {number} time - The timestamp associated with the container resource. (Required)
 * @property {Benchmarks[]} benchmarks - An array of benchmark results for the container. (Required)
 * @property {string} [podName] - The name of the pod in which the container is running. (Optional)
 * @property {string} [podIp] - The IP address of the pod in which the container is running. (Optional)
 * @property {string} [namespace] - The namespace in which the container is running. (Optional)
 * @property {Tags|any} [tags] - Additional tags or metadata associated with the container. (Optional)
 */
interface ContainerResource {
  // Required
  containerId: string
  containerName: string
  time: number
  benchmarks: Benchmarks[]
  // Optional
  podName?: string
  podIp?: string
  namespace?: string
  tags?: Tags
}

/**
 * Represents a collection of tags where each tag is a key-value pair.
 * The key is a string representing the tag name, and the value is a string representing the tag value.
 */
interface Tags {
  [key: string]: string
}

/**
 * Represents the benchmarks for a container scan.
 */
interface Benchmarks {
  // Required
  benchmark: string
  results: Results[]
  // Optional
  isBaseline?: boolean
  version?: string
  release?: string
}

/**
 * Represents the results of a container scan.
 */
interface Results {
  // Required
  ruleId: string
  status: StatusEnum
  lastSeen: number
  // Optional
  message?: string
}

/**
 * Enum representing the status of a container scan.
 *
 * @readonly
 * @enum {string}
 * @property {string} Pass - The scan passed.
 * @property {string} Fail - The scan failed.
 * @property {string} Other - The scan has a status other than pass or fail.
 * @property {string} NotReviewed - The scan has not been reviewed.
 * @property {string} NotChecked - The scan has not been checked.
 * @property {string} NotApplicable - The scan is not applicable.
 */
export declare const StatusEnum: {
  readonly Pass: 'Pass'
  readonly Fail: 'Fail'
  readonly Other: 'Other'
  readonly NotReviewed: 'Not Reviewed'
  readonly NotChecked: 'Not Checked'
  readonly NotApplicable: 'Not Applicable'
}
/**
 * Represents the possible status values for the StatusEnum type.
 * This type is derived from the keys of the StatusEnum object.
 */
// eslint-disable-next-line no-redeclare
export declare type StatusEnum = typeof StatusEnum[keyof typeof StatusEnum]

/**
 * Combines JSON examples from 'container_scans-required' and
 * 'container_scans-optional' into a single JSON string.
 *
 * @returns {string} A JSON string that merges the required and
 *                   optional container scan examples.
 */
function getAllJsonExamples(): string {
  return JSON.stringify(
    _.merge({},
      getJsonExamples('container_scans-required'),
      getJsonExamples('container_scans-optional'),
    ),
  )
}

/**
 * Asserts that a parameter exists by checking if the value is not undefined.
 * If the value is undefined, it prints an error message and throws an error.
 *
 * @param object - The name of the parameter or field being checked.
 * @param value - The value of the parameter or field which can be of type string, boolean, number, undefined, or null.
 * @throws {Error} Throws an error if the value is undefined.
 */
function assertParamExists(object: string, value: string | boolean | number | undefined | null): void {
  if (value === undefined) {
    printRedMsg(`Missing required parameter/field: ${object}`)
    throw new Error('Value not defined')
  }
}

/**
 * Adds required fields to the request body for a container resource.
 *
 * This function ensures that the required fields are present in the input data object
 * and constructs a new container resource object with the required fields populated.
 * If any required field is missing, an error is thrown and the required fields are logged.
 *
 * @param {ContainerResource} dataObj - The input container resource object.
 * @returns {ContainerResource} - The new container resource object with required fields populated.
 * @throws Will throw an error if any required field is missing in the input data object.
 */
function addRequiredFieldsToRequestBody(dataObj: ContainerResource): ContainerResource {
  const bodyObj: ContainerResource = {
    containerId: '',
    containerName: '',
    time: 0,
    benchmarks: [],
  }
  const benchmarksArray: Benchmarks[] = []
  const resultsArray: Results[] = []
  try {
    assertParamExists('containerId', dataObj.containerId)
    assertParamExists('containerName', dataObj.containerName)
    assertParamExists('time', dataObj.time)

    let i = 0
    let j = 0
    dataObj.benchmarks.forEach((entryObject: Benchmarks) => {
      assertParamExists(`benchmarks[${i}].benchmark`, entryObject.benchmark)

      entryObject.results.forEach((resultObj: Results) => {
        assertParamExists(`benchmarks.results[${j}].ruleId`, resultObj.ruleId)
        assertParamExists(`benchmarks.results[${j}].lastSeen`, resultObj.lastSeen)
        assertParamExists(`benchmarks.results[${j}].status`, resultObj.status)
        j++

        const resultsObj: Results = {ruleId: '', status: 'Pass', lastSeen: 0, ruleId: resultObj.ruleId, lastSeen: resultObj.lastSeen, status: resultObj.status}
        resultsArray.push(resultsObj)
      })

      i++
      const benchMarksObj: Benchmarks = {
        benchmark: '',
        results: [],
        benchmark: entryObject.benchmark, results: resultsArray}
      benchmarksArray.push(benchMarksObj)
    })
  } catch (error) {
    console.log('Required JSON fields are:')
    console.log(colorize(JSON.stringify(getJsonExamples('container_scans-required'), null, 2)))
    throw error
  }

  bodyObj.containerId = dataObj.containerId
  bodyObj.containerName = dataObj.containerName
  bodyObj.time = dataObj.time
  bodyObj.benchmarks = benchmarksArray

  return bodyObj
}

/**
 * Adds optional fields from the `dataObj` to the `bodyObject`.
 *
 * @param bodyObject - The target object to which optional fields will be added.
 * @param dataObj - The source object containing optional fields.
 *
 * The function performs the following operations:
 * - Adds `namespace`, `podIp`, and `podName` fields if they exist in `dataObj`.
 * - Adds `tags` object if it exists in `dataObj`.
 * - Adds `benchmarks` array if it exists in `dataObj`, including optional fields within each benchmark and its results.
 *
 * The `benchmarks` array in `dataObj` is expected to contain objects with the following structure:
 * - `benchmark` (required)
 * - `isBaseline` (optional)
 * - `version` (optional)
 * - `release` (optional)
 * - `results` (required array) containing objects with the following structure:
 *   - `ruleId` (required)
 *   - `status` (required)
 *   - `lastSeen` (required)
 *   - `message` (optional)
 */
function addOptionalFields(bodyObject: ContainerResource, dataObj: ContainerResource): void {
  // Add object optional entries
  if (Object.prototype.hasOwnProperty.call(dataObj, 'namespace')) {
    bodyObject.namespace = dataObj.namespace
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'podIp')) {
    bodyObject.podIp = dataObj.podIp
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'podName')) {
    bodyObject.podName = dataObj.podName
  }

  // Add optional tags objects if available
  if (dataObj.tags && typeof dataObj.tags === 'object') {
    const tagsObj: Tags = {}
    Object.keys(dataObj.tags).forEach((key) => {
      tagsObj[key] = dataObj.tags?.[key] as string // Ensure type safety
    })
    bodyObject.tags = tagsObj
  }

  const benchmarksArray: Benchmarks[] = []
  const resultsArray: Results[] = []
  // Add the optional benchmark entries
  dataObj.benchmarks.forEach((entryObject: Benchmarks) => {
    const benchmarksObj: Benchmarks = {benchmark: '', results: [], benchmark: entryObject.benchmark}
    // These are required
    // Check for the optional entry (isBaseline, version, and release)
    if (Object.prototype.hasOwnProperty.call(entryObject, 'isBaseline')) {
      benchmarksObj.isBaseline = entryObject.isBaseline
    }

    if (Object.prototype.hasOwnProperty.call(entryObject, 'version')) {
      benchmarksObj.version = entryObject.version
    }

    if (Object.prototype.hasOwnProperty.call(entryObject, 'release')) {
      benchmarksObj.release = entryObject.release
    }

    // Add the optional Results entries
    entryObject.results.forEach((resultObj: Results) => {
      const resultsObj: Results = {ruleId: '', status: 'Pass', lastSeen: 0, ruleId: resultObj.ruleId, status: resultObj.status, lastSeen: resultObj.lastSeen}
      // These are required
      // Check for the optional entry
      if (Object.prototype.hasOwnProperty.call(resultObj, 'message')) {
        resultsObj.message = resultObj.message
      }

      resultsArray.push(resultsObj)
    })
    benchmarksObj.results = resultsArray
    benchmarksArray.push(benchmarksObj)
  })

  bodyObject.benchmarks = benchmarksArray
}

/**
 * Checks if the given object is a valid ContainerResource.
 *
 * A valid ContainerResource is an object that:
 * - Is of type 'object' and not null.
 * - Contains the properties 'containerId', 'containerName', 'time', and 'benchmarks'.
 * - The 'containerId' property is a string.
 * - The 'containerName' property is a string.
 * - The 'time' property is a number.
 * - The 'benchmarks' property is an array.
 *
 * @param obj - The object to check.
 * @returns True if the object is a valid ContainerResource, false otherwise.
 */
function isValidContainerResource(obj: unknown): obj is ContainerResource {
  return typeof obj === 'object'
    && obj !== null
    && 'containerId' in obj
    && 'containerName' in obj
    && 'time' in obj
    && 'benchmarks' in obj
    && typeof (obj as ContainerResource).containerId === 'string'
    && typeof (obj as ContainerResource).containerName === 'string'
    && typeof (obj as ContainerResource).time === 'number'
    && Array.isArray((obj as ContainerResource).benchmarks)
}

const CMD_HELP = 'saf emasser post container_scans -h or --help'
export default class EmasserContainerScans extends Command {
  static readonly usage = '<%= command.id %> [FLAGS]\n\x1B[93m NOTE: see EXAMPLES for command usages\x1B[0m'

  static readonly description = 'Upload containers and their scan results in the assets module for a system'

  static readonly examples = [
    '<%= config.bin %> <%= command.id %> [-s,--systemId] [-f,--dataFile]',
    'The input file should be a well formed JSON containing the container scan results information.',
    'Required JSON parameter/fields are: ',
    colorize(JSON.stringify(getJsonExamples('container_scans-required'), null, 2)),
    'Optional JSON parameters/fields are:',
    colorize(JSON.stringify(getJsonExamples('container_scans-optional'), null, 2)),
    '\x1B[1m\x1B[32mAll accepted parameters/fields are:\x1B[0m',
    colorize(getAllJsonExamples()),
  ]

  static readonly flags = {
    help: Flags.help({char: 'h', description: 'Show eMASSer CLI help for the POST Container Scan Results command'}),
    ...getFlagsForEndpoint(process.argv) as FlagOptions, // skipcq: JS-0349
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(EmasserContainerScans)
    const apiCxn = new ApiConnection()
    const addContainer = new ContainerScanResultsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)

    const requestBodyArray: ContainerResource[] = []

    // Check if a Container Scans json file was provided
    if (!fs.existsSync(flags.dataFile)) {
      console.error(`\x1B[91m» Container Scan Results data file (.json) not found or invalid: ${flags.dataFile}\x1B[0m`)
      process.exit(1)
    }

    try {
      const fileContent = await readFile(flags.dataFile, 'utf8')
      const data: unknown = JSON.parse(fileContent)

      if (Array.isArray(data)) {
        data.forEach((item) => {
          if (isValidContainerResource(item)) {
            processContainerResource(item)
          } else {
            console.error('\x1B[91m» Invalid container resource format detected.\x1B[0m')
            process.exit(1)
          }
        })
      } else if (typeof data === 'object' && data !== null && isValidContainerResource(data)) {
        processContainerResource(data)
      } else {
        console.error('\x1B[91m» Invalid data format in Container Scan Results JSON file.\x1B[0m')
        process.exit(1)
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('\x1B[91m» Error reading Container Scan Results data file, possible malformed JSON. Please use the -h flag for help.\x1B[0m')
        console.error('\x1B[93m→ Error message was:', error.message, '\x1B[0m')
      } else {
        console.error('\x1B[91m» Unknown error occurred while reading the file.\x1B[0m')
      }
      process.exit(1)
    }

    /**
    * Processes a single container resource object and adds it to the request body array.
    */
    function processContainerResource(dataObject: ContainerResource): void {
      try {
        const bodyObj: ContainerResource = addRequiredFieldsToRequestBody(dataObject)
        addOptionalFields(bodyObj, dataObject)
        requestBodyArray.push(bodyObj)
      } catch {
        console.error('\x1B[91m» Error processing container resource.\x1B[0m')
        process.exit(1)
      }
    }

    // Call the API endpoint
    addContainer.addContainerSansBySystemId(flags.systemId, requestBodyArray).then((response: ContainersResponsePost) => {
      console.log(colorize(outputFormat(response, false)))
    }).catch((error: unknown) => displayError(error, 'Container Scans'))
  }

  // skipcq: JS-0116 - Base class (CommandError) expects expected catch to return a Promise
  protected async catch(err: Error & {exitCode?: number}): Promise<void> {
    // If error message is for missing flags, display
    // what fields are required, otherwise show the error
    if (err.message.includes('See more help with --help')) {
      this.warn(err.message.replace('with --help', `with: \x1B[93m${CMD_HELP}\x1B[0m`))
    } else {
      this.warn(err)
    }
  }
}
