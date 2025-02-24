/* eslint-disable valid-jsdoc */

import fs from 'fs'
import _ from 'lodash'
import {readFile} from 'fs/promises'
import {colorize} from 'json-colorizer'
import {Command, Flags} from '@oclif/core'

import {
  FlagOptions,
  getFlagsForEndpoint,
  getJsonExamples,
  printRedMsg,
} from '../../../utils/emasser/utilities'
import {ApiConnection} from '../../../utils/emasser/apiConnection'
import {outputFormat} from '../../../utils/emasser/outputFormatter'
import {outputError} from '../../../utils/emasser/outputError'

import {SoftwareBaselineApi} from '@mitre/emass_client'
import {SwBaselineResponsePostPut as SwBaselineResponse} from '@mitre/emass_client/dist/api'

/**
 * Represents a software entity with various attributes.
 *
 * @interface Software
 * Required properties
 * @property {string} [softwareId] - The unique identifier for the software.
 * @property {string} [softwareVendor] - The vendor of the software.
 * @property {string} [softwareName] - The name of the software.
 * @property {string} [version] - The version of the software.
 * Conditional property
 * @property {number} [approvalDate] - The date when the software was approved.
 * Optional properties
 * @property {string} [softwareType] - The type of the software.
 * @property {string} [parentSystem] - The parent system of the software.x
 * @property {string} [subsystem] - The subsystem of the software.x
 * @property {string} [network] - The network associated with the software.x
 * @property {string} [hostingEnvironment] - The hosting environment of the software.x
 * @property {string} [softwareDependencies] - The dependencies of the software.x
 * @property {string} [cryptographicHash] - The cryptographic hash of the software.x
 * @property {string} [inServiceData] - The in-service data of the software.x
 * @property {string} [itBudgetUii] - The IT budget UII of the software.x
 * @property {string} [fiscalYear] - The fiscal year associated with the software.x
 * @property {string} [popEndDate] - The end date of the period of performance.x
 * @property {string} [licenseOrContract] - The license or contract information of the software.x
 * @property {string} [licenseTerm] - The term of the license.x
 * @property {number} [costPerLicense] - The cost per license of the software.x
 * @property {number} [totalLicenses] - The total number of licenses.x
 * @property {number} [totalLicenseCost] - The total cost of all licenses.x
 * @property {number} [licensesUsed] - The number of licenses used.x
 * @property {string} [licensePoc] - The point of contact for the license.x
 * @property {number} [licenseRenewalDate] - The date when the license needs to be renewed.x
 * @property {number} [licenseExpirationDate] - The expiration date of the license.x
 * @property {string} [approvalStatus] - The approval status of the software.x
 * @property {number} [releaseDate] - The release date of the software.x
 * @property {number} [maintenanceDate] - The maintenance date of the software.x
 * @property {number} [retirementDate] - The retirement date of the software.x
 * @property {number} [endOfLifeSupportDate] - The end-of-life support date of the software.x
 * @property {number} [extendedEndOfLifeSupportDate] - The extended end-of-life support date of the software.x
 * @property {boolean} [criticalAsset] - Indicates if the software is a critical asset.x
 * @property {string} [location] - The location of the software.x
 * @property {string} [purpose] - The purpose of the software.x
 * Optional VA only properties
 * @property {boolean} [unsupportedOperatingSystem] - Indicates if the software runs on an unsupported operating system. (VA Only)
 * @property {boolean} [unapprovedSoftwareFromTrm] - Indicates if the software is unapproved from TRM. (VA Only)
 * @property {boolean} [approvedWaiver] - Indicates if there is an approved waiver for the software. (VA Only)
 */
interface Software {
  // Required field
  softwareId?: string,
  softwareVendor?: string,
  softwareName?: string,
  version?: string,
  // Conditional Fields
  approvalDate?: number,
  // Optional Fields
  softwareType?: string,
  parentSystem?: string,
  subsystem?: string,
  network?: string,
  hostingEnvironment?: string,
  softwareDependencies?: string,
  cryptographicHash?: string,
  inServiceData?: string,
  itBudgetUii?: string,
  fiscalYear?: string,
  popEndDate?:string,
  licenseOrContract?: string,
  licenseTerm?: string,
  costPerLicense?: number,
  totalLicenses?:number,
  totalLicenseCost?:number,
  licensesUsed?:number,
  licensePoc?:string,
  licenseRenewalDate?: number,
  licenseExpirationDate?: number,
  approvalStatus?: string,
  releaseDate?: number,
  maintenanceDate?: number,
  retirementDate?: number,
  endOfLifeSupportDate?: number,
  extendedEndOfLifeSupportDate?: number,
  criticalAsset?: boolean,
  location?:string,
  purpose?:string,
  // VA Only
  unsupportedOperatingSystem?: boolean,
  unapprovedSoftwareFromTrm?: boolean,
  approvedWaiver?: boolean,
}

/**
 * Combines JSON examples from multiple sources into a single object.
 *
 * This function aggregates JSON examples from three different sources:
 * 'software-put-required', 'software-post-put-conditional', and 'software-post-put-optional'.
 * It merges these examples into a single object and returns it as a string.
 *
 * @returns {string} A string representation of the combined JSON examples.
 */
function getAllJsonExamples(): string {
  let exampleBodyObj: any = {}

  exampleBodyObj = {
    ...getJsonExamples('software-put-required'),
    ...getJsonExamples('software-post-put-conditional'),
    ...getJsonExamples('software-post-put-optional'),
  }

  return exampleBodyObj
}

/**
 * Asserts that a required parameter exists and is not undefined.
 *
 * @param object - The name of the parameter or field being checked.
 * @param value - The value of the parameter or field to check.
 * @throws Will throw an error if the value is undefined.
 */
function assertParamExists(object: string, value: string|undefined|null): void {
  if (value === undefined) {
    printRedMsg(`Missing required parameter/field: ${object}`)
    throw new Error('Value not defined')
  }
}

/**
 * Adds required fields to the request body for a software object.
 *
 * This function ensures that the required fields `softwareId`, `softwareVendor`,
 * `softwareName`, and `version` are present in the input `dataObj`. If any of these
 * fields are missing, an error is thrown and an example JSON structure is logged.
 *
 * @param dataObj - The software object containing the data to be validated and added to the request body.
 * @returns A new software object containing only the required fields.
 * @throws Will throw an error if any of the required fields are missing in `dataObj`.
 */
function addRequiredFieldsToRequestBody(dataObj: Software): Software {
  const bodyObj: Software = {}

  try {
    assertParamExists('softwareId', dataObj.softwareId)
    assertParamExists('softwareVendor', dataObj.softwareVendor)
    assertParamExists('softwareName', dataObj.softwareName)
    assertParamExists('version', dataObj.version)
  } catch (error) {
    console.log('Required JSON fields are:')
    console.log(colorize(JSON.stringify(getJsonExamples('software-put-required'), null, 2)))
    throw error
  }

  // The required parameter "systemId" is validated by oclif
  bodyObj.softwareId = dataObj.softwareId
  bodyObj.softwareVendor = dataObj.softwareVendor
  bodyObj.softwareName = dataObj.softwareName
  bodyObj.version = dataObj.version

  return bodyObj
}

/**
 * Adds conditional fields from the data object to the body object.
 *
 * @param bodyObject - The target object to which fields may be added.
 * @param dataObj - The source object from which fields are conditionally copied.
 */
function addConditionalFields(bodyObject: Software, dataObj: Software): void {
  if (Object.prototype.hasOwnProperty.call(dataObj, 'publicFacingFqdn')) {
    bodyObject.approvalDate = dataObj.approvalDate
  }
}

/**
 * Adds optional fields from the `dataObj` to the `bodyObject` if they exist.
 *
 * @param bodyObject - The target object to which optional fields will be added.
 * @param dataObj - The source object containing optional fields.
 */
// skipcq: JS-R1005 - Ignore Function cyclomatic complexity high threshold
function addOptionalFields(bodyObject: Software, dataObj: Software): void {
  if (Object.prototype.hasOwnProperty.call(dataObj, 'softwareType')) {
    bodyObject.softwareType = dataObj.softwareType
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'parentSystem')) {
    bodyObject.parentSystem = dataObj.parentSystem
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'subsystem')) {
    bodyObject.subsystem = dataObj.subsystem
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'network')) {
    bodyObject.network = dataObj.network
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'hostingEnvironment')) {
    bodyObject.hostingEnvironment = dataObj.hostingEnvironment
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'softwareDependencies')) {
    bodyObject.softwareDependencies = dataObj.softwareDependencies
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'cryptographicHash')) {
    bodyObject.cryptographicHash = dataObj.cryptographicHash
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'inServiceData')) {
    bodyObject.inServiceData = dataObj.inServiceData
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'itBudgetUii')) {
    bodyObject.itBudgetUii = dataObj.itBudgetUii
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'fiscalYear')) {
    bodyObject.fiscalYear = dataObj.fiscalYear
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'popEndDate')) {
    bodyObject.popEndDate = dataObj.popEndDate
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'licenseOrContract')) {
    bodyObject.licenseOrContract = dataObj.licenseOrContract
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'licenseTerm')) {
    bodyObject.licenseTerm = dataObj.licenseTerm
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'costPerLicense')) {
    bodyObject.costPerLicense = dataObj.costPerLicense
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'totalLicenses')) {
    bodyObject.totalLicenses = dataObj.totalLicenses
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'totalLicenseCost')) {
    bodyObject.totalLicenseCost = dataObj.totalLicenseCost
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'licensesUsed')) {
    bodyObject.licensesUsed = dataObj.licensesUsed
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'licensePoc')) {
    bodyObject.licensePoc = dataObj.licensePoc
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'licenseRenewalDate')) {
    bodyObject.licenseRenewalDate = dataObj.licenseRenewalDate
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'licenseExpirationDate ')) {
    bodyObject.licenseExpirationDate  = dataObj.licenseExpirationDate
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'approvalStatus')) {
    bodyObject.approvalStatus = dataObj.approvalStatus
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'releaseDate')) {
    bodyObject.releaseDate = dataObj.releaseDate
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'maintenanceDate')) {
    bodyObject.maintenanceDate = dataObj.maintenanceDate
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'retirementDate')) {
    bodyObject.retirementDate = dataObj.retirementDate
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'endOfLifeSupportDate')) {
    bodyObject.endOfLifeSupportDate = dataObj.endOfLifeSupportDate
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'extendedEndOfLifeSupportDate')) {
    bodyObject.extendedEndOfLifeSupportDate = dataObj.extendedEndOfLifeSupportDate
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'criticalAsset')) {
    bodyObject.criticalAsset = dataObj.criticalAsset
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'location')) {
    bodyObject.location = dataObj.location
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'purpose')) {
    bodyObject.purpose = dataObj.purpose
  }

  // VA Only
  if (Object.prototype.hasOwnProperty.call(dataObj, 'unsupportedOperatingSystem')) {
    bodyObject.unsupportedOperatingSystem = dataObj.unsupportedOperatingSystem
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'unapprovedSoftwareFromTrm')) {
    bodyObject.unapprovedSoftwareFromTrm = dataObj.unapprovedSoftwareFromTrm
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'approvedWaiver')) {
    bodyObject.approvedWaiver = dataObj.approvedWaiver
  }
}

/**
 * Generates a body object for a software baseline request.
 *
 * This function takes a `Software` object as input and constructs a new `Software`
 * object by adding required, conditional, and optional fields to it. If an error
 * occurs during this process, the function will terminate the process with an exit code of 1.
 *
 * @param dataObject - The input `Software` object containing the initial data.
 * @returns The constructed `Software` object with the necessary fields added.
 */
function generateBodyObj(dataObject: Software): Software {
  let bodyObj: Software = {}

  try {
    bodyObj = addRequiredFieldsToRequestBody(dataObject)
    addConditionalFields(bodyObj, dataObject)
    addOptionalFields(bodyObj, dataObject)
  } catch {
    process.exit(1)
  }

  return bodyObj
}

const CMD_HELP = 'saf emasser put software_baseline -h or --help'
export default class EmasserSoftwareBaseline extends Command {
  static readonly usage = '<%= command.id %> [FLAGS]\n\x1B[93m NOTE: see EXAMPLES for command usages\x1B[0m'

  static readonly description = 'Update one or many software assets to a system.\n' +
    'The CLI expects an input JSON file containing the required, conditional\n' +
    'and optional fields for the software asset(s) being added to the system.'

  static readonly examples = [
    '<%= config.bin %> <%= command.id %> [-s,--systemId] [-f,--dataFile]',
    'The input file should be a well formed JSON containing Software Assets.',
    '\x1B[1mRequired JSON parameter/field is:\x1B[0m',
    colorize(JSON.stringify(getJsonExamples('software-put-required'), null, 2)),
    '\x1B[1mConditional JSON parameters/fields are:\x1B[0m',
    colorize(JSON.stringify(getJsonExamples('software-post-put-conditional'), null, 2)),
    '\x1B[1mOptional JSON parameters/fields are:\x1B[0m',
    colorize(JSON.stringify(getJsonExamples('software-post-put-optional'), null, 2)),
    '\x1B[1m\x1B[32mAll accepted parameters/fields are:\x1B[0m',
    colorize(getAllJsonExamples()),
  ]

  static readonly flags = {
    help: Flags.help({char: 'h', description: 'Show eMASSer CLI help for the PUT Software Baseline command'}),
    ...getFlagsForEndpoint(process.argv) as FlagOptions, // skipcq: JS-0349
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(EmasserSoftwareBaseline)
    const apiCxn = new ApiConnection()
    const swBaseline = new SoftwareBaselineApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)

    const requestBodyArray: Software[] = []

    // Check if a Software json file was provided
    if (fs.existsSync(flags.dataFile)) {
      let data: any
      try {
        data = JSON.parse(await readFile(flags.dataFile, 'utf8'))
      } catch (error: any) {
        console.error('\x1B[91m» Error reading Software data file, possible malformed json. Please use the -h flag for help.\x1B[0m')
        console.error('\x1B[93m→ Error message was:', error.message, '\x1B[0m')
        process.exit(1)
      }

      // Process the Software data file
      if (Array.isArray(data)) {
        data.forEach((dataObject: Software) => {
          // Generate the put request object
          requestBodyArray.push(generateBodyObj(dataObject))
        })
      } else if (typeof data === 'object') {
        const dataObject: Software = data
        // Generate the put request object
        requestBodyArray.push(generateBodyObj(dataObject))
      }
    } else {
      console.error('\x1B[91m» Software data file (.json) not found or invalid:', flags.dataFile, '\x1B[0m')
      process.exit(1)
    }

    // Call the endpoint
    swBaseline.updateSwBaselineAssets(flags.systemId, requestBodyArray).then((response: SwBaselineResponse) => {
      console.log(colorize(outputFormat(response, false)))
    }).catch((error: any) => console.error(colorize(outputError(error))))
  }

  protected async catch(err: Error & {exitCode?: number}): Promise<any> { // skipcq: JS-0116
    // If error message is for missing flags, display
    // what fields are required, otherwise show the error
    if (err.message.includes('See more help with --help')) {
      this.warn(err.message.replace('with --help', `with: \x1B[93m${CMD_HELP}\x1B[0m`))
    } else {
      this.warn(err)
    }
  }
}
