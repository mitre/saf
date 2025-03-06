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

import {HardwareBaselineApi} from '@mitre/emass_client'
import {HwBaselineResponsePostPut as HwBaselineResponse} from '@mitre/emass_client/dist/api'

/**
 * Represents a hardware asset with various attributes.
 *
 * @interface Hardware
 *
 * @property {string} [assetName] - The name of the asset. This is a required field.
 *
 * @property {string} [publicFacingFqdn] - The fully qualified domain name if the asset is public-facing.
 * @property {string} [publicFacingIpAddress] - The IP address if the asset is public-facing.
 * @property {string} [publicFacingUrls] - The URLs if the asset is public-facing.
 *
 * @property {string} [componentType] - The type of component.
 * @property {string} [nickname] - A nickname for the asset.
 * @property {string} [assetIpAddress] - The IP address of the asset.
 * @property {boolean} [publicFacing] - Indicates if the asset is public-facing.
 * @property {boolean} [virtualAsset] - Indicates if the asset is virtual.
 * @property {string} [manufacturer] - The manufacturer of the asset.
 * @property {string} [modelNumber] - The model number of the asset.
 * @property {string} [serialNumber] - The serial number of the asset.
 * @property {string} [OsIosFwVersion] - The OS/IOS/Firmware version of the asset.
 * @property {string} [memorySizeType] - The memory size and type of the asset.
 * @property {string} [location] - The location of the asset.
 * @property {string} [approvalStatus] - The approval status of the asset.
 * @property {boolean} [criticalAsset] - Indicates if the asset is critical.
 */
interface Hardware {
  // Required field
  assetName?: string,
  // Conditional Fields
  publicFacingFqdn?: string,
  publicFacingIpAddress?: string,
  publicFacingUrls?: string,
  // Optional Fields
  componentType?: string,
  nickname?: string,
  assetIpAddress?: string,
  publicFacing?: boolean,
  virtualAsset?: boolean,
  manufacturer?: string,
  modelNumber?: string,
  serialNumber?: string,
  OsIosFwVersion?: string,
  memorySizeType?: string,
  location?: string,
  approvalStatus?: string,
  criticalAsset?: boolean
}

/**
 * Combines JSON examples from multiple sources into a single object.
 *
 * This function aggregates JSON examples by merging the results of
 * `getJsonExamples` for 'hardware-post-required', 'hardware-post-put-conditional',
 * and 'hardware-post-put-optional' into one object.
 *
 * @returns {string} A string representation of the combined JSON examples.
 */
function getAllJsonExamples(): string {
  let exampleBodyObj: any = {}

  exampleBodyObj = {
    ...getJsonExamples('hardware-post-required'),
    ...getJsonExamples('hardware-post-put-conditional'),
    ...getJsonExamples('hardware-post-put-optional'),
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
 * Adds required fields to the request body for a hardware object.
 *
 * This function ensures that the required fields are present in the request body.
 * If the required field `assetName` is missing, an error is thrown and an example
 * JSON structure is logged to the console.
 *
 * @param dataObj - The hardware object containing the data to be validated and added to the request body.
 * @returns The hardware object with the required fields added.
 * @throws Will throw an error if the required field `assetName` is missing.
 */
function addRequiredFieldsToRequestBody(dataObj: Hardware): Hardware {
  const bodyObj: Hardware = {}

  try {
    assertParamExists('assetName', dataObj.assetName)
  } catch (error) {
    console.log('Required JSON field is:')
    console.log(colorize(JSON.stringify(getJsonExamples('hardware-post-required'), null, 2)))
    throw error
  }

  // The required parameter "systemId" is validated by oclif
  bodyObj.assetName = dataObj.assetName

  return bodyObj
}

/**
 * Adds conditional fields from the `dataObj` to the `bodyObject` if they exist.
 *
 * @param bodyObject - The target object to which fields will be added.
 * @param dataObj - The source object from which fields will be copied if they exist.
 */
function addConditionalFields(bodyObject: Hardware, dataObj: Hardware): void {
  if (Object.prototype.hasOwnProperty.call(dataObj, 'publicFacingFqdn')) {
    bodyObject.publicFacingFqdn = dataObj.publicFacingFqdn
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'publicFacingIpAddress')) {
    bodyObject.publicFacingIpAddress = dataObj.publicFacingIpAddress
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'publicFacingUrls')) {
    bodyObject.publicFacingUrls = dataObj.publicFacingUrls
  }
}

/**
 * Adds optional fields from the `dataObj` to the `bodyObject` if they exist.
 *
 * @param bodyObject - The target object to which optional fields will be added.
 * @param dataObj - The source object from which optional fields will be copied.
 */
function addOptionalFields(bodyObject: Hardware, dataObj: Hardware): void {
  if (Object.prototype.hasOwnProperty.call(dataObj, 'componentType')) {
    bodyObject.componentType = dataObj.componentType
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'nickname')) {
    bodyObject.nickname = dataObj.nickname
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'assetIpAddress')) {
    bodyObject.assetIpAddress = dataObj.assetIpAddress
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'publicFacing')) {
    bodyObject.publicFacing = dataObj.publicFacing
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'virtualAsset')) {
    bodyObject.virtualAsset = dataObj.virtualAsset
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'manufacturer')) {
    bodyObject.manufacturer = dataObj.manufacturer
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'modelNumber')) {
    bodyObject.modelNumber = dataObj.modelNumber
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'serialNumber')) {
    bodyObject.serialNumber = dataObj.serialNumber
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'OsIosFwVersion')) {
    bodyObject.OsIosFwVersion = dataObj.OsIosFwVersion
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'memorySizeType')) {
    bodyObject.memorySizeType = dataObj.memorySizeType
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'location')) {
    bodyObject.location = dataObj.location
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'approvalStatus')) {
    bodyObject.approvalStatus = dataObj.approvalStatus
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'criticalAsset')) {
    bodyObject.criticalAsset = dataObj.criticalAsset
  }
}

/**
 * Generates a body object for a hardware baseline.
 *
 * This function takes a `Hardware` object as input and creates a new `Hardware` object
 * with required, conditional, and optional fields populated based on the input object.
 * If any error occurs during the process, the function will terminate the process with an exit code of 1.
 *
 * @param dataObject - The input `Hardware` object containing the data to populate the body object.
 * @returns The generated `Hardware` body object.
 */
function generateBodyObj(dataObject: Hardware): Hardware {
  let bodyObj: Hardware = {}

  try {
    bodyObj = addRequiredFieldsToRequestBody(dataObject)
    addConditionalFields(bodyObj, dataObject)
    addOptionalFields(bodyObj, dataObject)
  } catch {
    process.exit(1)
  }

  return bodyObj
}

const CMD_HELP = 'saf emasser post hardware_baseline -h or --help'
export default class EmasserHardwareBaseline extends Command {
  static readonly usage = '<%= command.id %> [FLAGS]\n\x1B[93m NOTE: see EXAMPLES for command usages\x1B[0m'

  static readonly description = 'Add one or many hardware assets to a system.\n' +
    'The CLI expects an input JSON file containing the required, conditional\n' +
    'and optional fields for the hardware asset(s) being added to the system.'

  static readonly examples = [
    '<%= config.bin %> <%= command.id %> [-s,--systemId] [-f,--dataFile]',
    'The input file should be a well formed JSON containing Hardware Assets.',
    '\x1B[1mRequired JSON parameter/field is:\x1B[0m',
    colorize(JSON.stringify(getJsonExamples('hardware-post-required'), null, 2)),
    '\x1B[1mConditional JSON parameters/fields are:\x1B[0m',
    colorize(JSON.stringify(getJsonExamples('hardware-post-put-conditional'), null, 2)),
    '\x1B[1mOptional JSON parameters/fields are:\x1B[0m',
    colorize(JSON.stringify(getJsonExamples('hardware-post-put-optional'), null, 2)),
    '\x1B[1m\x1B[32mAll accepted parameters/fields are:\x1B[0m',
    colorize(getAllJsonExamples()),
  ]

  static readonly flags = {
    help: Flags.help({char: 'h', description: 'Show eMASSer CLI help for the POST Hardware Baseline command'}),
    ...getFlagsForEndpoint(process.argv) as FlagOptions, // skipcq: JS-0349
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(EmasserHardwareBaseline)
    const apiCxn = new ApiConnection()
    const hwBaseline = new HardwareBaselineApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)

    const requestBodyArray: Hardware[] = []

    // Check if a Hardware json file was provided
    if (fs.existsSync(flags.dataFile)) {
      let data: any
      try {
        data = JSON.parse(await readFile(flags.dataFile, 'utf8'))
      } catch (error: any) {
        console.error('\x1B[91m» Error reading Hardware data file, possible malformed json. Please use the -h flag for help.\x1B[0m')
        console.error('\x1B[93m→ Error message was:', error.message, '\x1B[0m')
        process.exit(1)
      }

      // Process the Hardware data file
      if (Array.isArray(data)) {
        data.forEach((dataObject: Hardware) => {
          // Generate the post request object based on business logic
          requestBodyArray.push(generateBodyObj(dataObject))
        })
      } else if (typeof data === 'object') {
        const dataObject: Hardware = data
        // Generate the post request object based on business logic
        requestBodyArray.push(generateBodyObj(dataObject))
      }
    } else {
      console.error('\x1B[91m» Hardware data file (.json) not found or invalid:', flags.dataFile, '\x1B[0m')
      process.exit(1)
    }

    // Call the endpoint
    hwBaseline.addHwBaselineAssets(flags.systemId, requestBodyArray).then((response: HwBaselineResponse) => {
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
