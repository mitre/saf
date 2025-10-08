import {colorize} from 'json-colorizer'
import {Command, Flags} from '@oclif/core'
import {CloudResourceResultsApi} from '@mitre/emass_client'
import type {CloudResourcesResponsePost} from '@mitre/emass_client/dist/api'
import {ApiConnection} from '../../../utils/emasser/apiConnection'
import {outputFormat} from '../../../utils/emasser/outputFormatter'
import type {FlagOptions} from '../../../utils/emasser/utilities'
import {displayError, getFlagsForEndpoint, getJsonExamples, printRedMsg} from '../../../utils/emasser/utilities'
import {readFile} from 'fs/promises'
import _ from 'lodash'
import fs from 'fs'

/**
 * Represents a cloud resource with compliance results.
 *
 * @interface CloudResource
 *
 * @property {string} provider - The cloud service provider (e.g., AWS, Azure, GCP).
 * @property {string} resourceId - The unique identifier of the resource.
 * @property {string} resourceName - The name of the resource.
 * @property {string} resourceType - The type of the resource (e.g., VM, Storage, Database).
 * @property {ComplianceResults[]} complianceResults - An array of compliance results associated with the resource.
 *
 * @property {string} [cspAccountId] - (Optional) The cloud service provider account ID.
 * @property {string} [cspRegion] - (Optional) The region where the resource is located.
 * @property {string} [initiatedBy] - (Optional) The entity or user who initiated the resource.
 * @property {boolean} [isBaseline] - (Optional) Indicates if the resource is a baseline.
 * @property {Tags|any} [tags] - (Optional) Tags associated with the resource.
 */
interface CloudResource {
  // Required
  provider: string
  resourceId: string
  resourceName: string
  resourceType: string
  complianceResults: ComplianceResults[]
  // Optional
  cspAccountId?: string
  cspRegion?: string
  initiatedBy?: string
  isBaseline?: boolean
  tags?: Tags
}

/**
 * Represents a collection of tags where each tag is a key-value pair.
 *
 * @interface Tags
 * @property {string} [key] - The key of the tag.
 * @property {string} value - The value associated with the tag key.
 */
interface Tags {
  [key: string]: string
}

interface ComplianceResults {
  // Required
  cspPolicyDefinitionId: string
  isCompliant: boolean
  policyDefinitionTitle: string
  // Optional
  assessmentProcedure?: string
  complianceCheckTimestamp?: number
  complianceReason?: string
  control?: string
  policyDeploymentName?: string
  policyDeploymentVersion?: string
  severity?: string
}

/**
 * Combines JSON examples for 'cloud_resources-required' and 'cloud_resources-optional'
 * into a single JSON string.
 *
 * @returns {string} A JSON string that merges the required and optional cloud resources examples.
 */
function getAllJsonExamples(): string {
  return JSON.stringify(
    _.merge({},
      getJsonExamples('cloud_resources-required'),
      getJsonExamples('cloud_resources-optional'),
    ),
  )
}

/**
 * Asserts that a required parameter exists and is not undefined.
 *
 * @param object - The name of the parameter or field being checked.
 * @param value - The value of the parameter or field to check. Can be a string, boolean, undefined, or null.
 * @throws {Error} Throws an error if the value is undefined.
 */
function assertParamExists(object: string, value: string | boolean | undefined | null): void {
  if (value === undefined) {
    printRedMsg(`Missing required parameter/field: ${object}`)
    throw new Error('Value not defined')
  }
}

/**
 * Adds required fields to the request body for a CloudResource object.
 *
 * This function ensures that all required fields are present in the provided
 * CloudResource object. If any required field is missing, an error is thrown.
 *
 * @param dataObj - The CloudResource object containing the data to be validated and added to the request body.
 * @returns A new CloudResource object with all required fields populated.
 * @throws Will throw an error if any required field is missing in the provided dataObj.
 */
function addRequiredFieldsToRequestBody(dataObj: CloudResource): CloudResource {
  const bodyObj: CloudResource = {
    provider: '',
    resourceId: '',
    resourceName: '',
    resourceType: '',
    complianceResults: [],
  }

  const complianceResultsArray: ComplianceResults[] = []

  try {
    assertParamExists('provider', dataObj.provider)
    assertParamExists('resourceId', dataObj.resourceId)
    assertParamExists('resourceName', dataObj.resourceName)
    assertParamExists('resourceType', dataObj.resourceType)

    let i = 0
    dataObj.complianceResults.forEach((entryObject: ComplianceResults) => {
      assertParamExists(`dataObj.complianceResults[${i}].cspPolicyDefinitionId`, entryObject.cspPolicyDefinitionId)
      assertParamExists(`dataObj.complianceResults[${i}].isCompliant`, entryObject.isCompliant)
      assertParamExists(`dataObj.complianceResults[${i}].policyDefinitionTitle`, entryObject.policyDefinitionTitle)
      i++

      const complianceResultsObj: ComplianceResults = {
        cspPolicyDefinitionId: '',
        isCompliant: false,
        policyDefinitionTitle: '',
      }
      complianceResultsObj.cspPolicyDefinitionId = entryObject.cspPolicyDefinitionId
      complianceResultsObj.isCompliant = entryObject.isCompliant
      complianceResultsObj.policyDefinitionTitle = entryObject.policyDefinitionTitle
      complianceResultsArray.push(complianceResultsObj)
    })
  } catch (error) {
    console.log('Required JSON fields are:')
    console.log(colorize(JSON.stringify(getJsonExamples('cloud_resources-required'), null, 2)))
    throw error
  }

  bodyObj.provider = dataObj.provider
  bodyObj.resourceId = dataObj.resourceId
  bodyObj.resourceName = dataObj.resourceName
  bodyObj.resourceType = dataObj.resourceType
  bodyObj.complianceResults = complianceResultsArray
  return bodyObj
}

/**
 * Adds optional fields from the `dataObj` to the `bodyObject` if they exist.
 *
 * @param bodyObject - The target object to which optional fields will be added.
 * @param dataObj - The source object containing optional fields.
 *
 * @remarks
 * This function checks for the presence of optional fields in the `dataObj` and
 * adds them to the `bodyObject` if they exist.
 * It handles the following optional fields:
 * - `cspAccountId`
 * - `cspRegion`
 * - `initiatedBy`
 * - `isBaseline`
 * - `tags`
 * - `complianceResults`
 *
 * For the `tags` field, it creates a new `Tags` object and copies the key-value
 * pairs from `dataObj.tags`.
 *
 * For the `complianceResults` field, it creates a new array of `ComplianceResults`
 * objects and copies the properties from `dataObj.complianceResults`.
 */
function addOptionalFields(bodyObject: CloudResource, dataObj: CloudResource): void {
  // Add object optional entries
  if (Object.prototype.hasOwnProperty.call(dataObj, 'cspAccountId')) {
    bodyObject.cspAccountId = dataObj.cspAccountId
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'cspRegion')) {
    bodyObject.cspRegion = dataObj.cspRegion
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'initiatedBy')) {
    bodyObject.initiatedBy = dataObj.initiatedBy
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'isBaseline')) {
    bodyObject.isBaseline = dataObj.isBaseline
  }

  // Add optional tags objects if available
  if (dataObj.tags && typeof dataObj.tags === 'object') {
    const tagsObj: Tags = {}
    Object.keys(dataObj.tags).forEach((key) => {
      tagsObj[key] = dataObj.tags?.[key] as string // Ensure type safety
    })
    bodyObject.tags = tagsObj
  }

  // Add optional compliance results fields
  const complianceResultsArray: ComplianceResults[] = []
  dataObj.complianceResults.forEach((entryObject: ComplianceResults) => {
    const complianceResultsObj: ComplianceResults = {
      cspPolicyDefinitionId: '',
      isCompliant: false,
      policyDefinitionTitle: '',
    }
    complianceResultsObj.cspPolicyDefinitionId = entryObject.cspPolicyDefinitionId
    complianceResultsObj.isCompliant = entryObject.isCompliant
    complianceResultsObj.policyDefinitionTitle = entryObject.policyDefinitionTitle
    if (Object.prototype.hasOwnProperty.call(entryObject, 'assessmentProcedure')) {
      complianceResultsObj.assessmentProcedure = entryObject.assessmentProcedure
    }

    if (Object.prototype.hasOwnProperty.call(entryObject, 'complianceCheckTimestamp')) {
      complianceResultsObj.complianceCheckTimestamp = entryObject.complianceCheckTimestamp
    }

    if (Object.prototype.hasOwnProperty.call(entryObject, 'complianceReason')) {
      complianceResultsObj.complianceReason = entryObject.complianceReason
    }

    if (Object.prototype.hasOwnProperty.call(entryObject, 'control')) {
      complianceResultsObj.control = entryObject.control
    }

    if (Object.prototype.hasOwnProperty.call(entryObject, 'policyDeploymentName')) {
      complianceResultsObj.policyDeploymentName = entryObject.policyDeploymentName
    }

    if (Object.prototype.hasOwnProperty.call(entryObject, 'policyDeploymentVersion')) {
      complianceResultsObj.policyDeploymentVersion = entryObject.policyDeploymentVersion
    }

    if (Object.prototype.hasOwnProperty.call(entryObject, 'severity')) {
      complianceResultsObj.severity = entryObject.severity
    }

    complianceResultsArray.push(complianceResultsObj)
  })

  bodyObject.complianceResults = complianceResultsArray
}

/**
 * Checks if the given object is a valid CloudResource.
 *
 * @param obj - The object to check.
 * @returns True if the object is a CloudResource, false otherwise.
 */
function isValidCloudResource(obj: unknown): obj is CloudResource {
  if (typeof obj !== 'object' || obj === null) return false
  const requiredFields = ['provider', 'resourceId', 'resourceName', 'resourceType', 'complianceResults']
  return requiredFields.every(field => field in obj)
}

const CMD_HELP = 'saf emasser post cloud_resources -h or --help'
export default class EmasserPostCloudResources extends Command {
  static readonly usage = '<%= command.id %> [FLAGS]\n\x1B[93m NOTE: see EXAMPLES for command usages\x1B[0m'

  static readonly description = 'Add a cloud resource and their scan results in the assets module for a system'

  static readonly examples = [
    '<%= config.bin %> <%= command.id %> [-s,--systemId] [-f,--dataFile]',
    'The input file should be a well formed JSON containing the cloud resources and their scan results information.',
    'Required JSON parameter/fields are: ',
    colorize(JSON.stringify(getJsonExamples('cloud_resources-required'), null, 2)),
    'Optional JSON parameters/fields are:',
    colorize(JSON.stringify(getJsonExamples('cloud_resources-optional'), null, 2)),
    '\x1B[1m\x1B[32mAll accepted parameters/fields are:\x1B[0m',
    colorize(getAllJsonExamples()),
  ]

  static readonly flags = {
    help: Flags.help({char: 'h', description: 'Show eMASSer CLI help for the POST Cloud Resource Results command'}),
    ...getFlagsForEndpoint(process.argv) as FlagOptions, // skipcq: JS-0349
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(EmasserPostCloudResources)
    const apiCxn = new ApiConnection()
    const addCloudResource = new CloudResourceResultsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)

    const requestBodyArray: CloudResource[] = []

    // Check if a Cloud Resource json file was provided
    if (!fs.existsSync(flags.dataFile)) {
      console.error('\x1B[91m» Cloud Resource data file (.json) not found or invalid:', flags.dataFile, '\x1B[0m')
      process.exit(1)
    }

    try {
      const fileContent = await readFile(flags.dataFile, 'utf8')
      const data: unknown = JSON.parse(fileContent)

      // Create request body based on key/pair values provide in the input file
      if (Array.isArray(data)) {
        data.forEach((item) => {
          if (!isValidCloudResource(item)) {
            console.error('\x1B[91m» Invalid Cloud Resource entry in array.\x1B[0m')
            process.exit(1)
          }

          try {
            const bodyObj: CloudResource = addRequiredFieldsToRequestBody(item)
            addOptionalFields(bodyObj, item)
            requestBodyArray.push(bodyObj)
          } catch {
            process.exit(1)
          }
        })
      } else if (isValidCloudResource(data)) {
        try {
          const bodyObj: CloudResource = addRequiredFieldsToRequestBody(data)
          addOptionalFields(bodyObj, data)
          requestBodyArray.push(bodyObj)
        } catch {
          process.exit(1)
        }
      } else {
        console.error('\x1B[91m» Invalid Cloud Resource data format.\x1B[0m')
        process.exit(1)
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('\x1B[91m» Error reading Cloud Resource data file, possible malformed JSON. Please use the -h flag for help.\x1B[0m')
        console.error('\x1B[93m→ Error message was:', error.message, '\x1B[0m')
      } else {
        console.error('\x1B[91m» Unknown error occurred while reading the file:', flags.dataFile, '\x1B[0m')
      }
      process.exit(1)
    }

    // Call the endpoint
    addCloudResource.addCloudResourcesBySystemId(flags.systemId, requestBodyArray).then((response: CloudResourcesResponsePost) => {
      console.log(colorize(outputFormat(response, false)))
    }).catch((error: unknown) => displayError(error, 'Cloud Resources'))
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
