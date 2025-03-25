import {colorize} from 'json-colorizer'
import fs from 'fs'
import {readFile} from 'fs/promises'
import {Command, Flags} from '@oclif/core'

import {ArtifactsApi} from '@mitre/emass_client'
import {ArtifactsResponsePutPost} from '@mitre/emass_client/dist/api' // skipcq: JS-R1000
import {ArtifactsResponseGetDataInner as Artifacts} from '@mitre/emass_client/dist/api' // skipcq: JS-R1000

import {ApiConnection} from '../../../utils/emasser/apiConnection'
import {outputFormat} from '../../../utils/emasser/outputFormatter'
import {displayError, FlagOptions, getFlagsForEndpoint, getJsonExamples, printRedMsg} from '../../../utils/emasser/utilities'

function getAllJsonExamples(): Record<string, unknown> {
  return {
    ...getJsonExamples('artifacts-put-required'),
    ...getJsonExamples('artifacts-put-optional'),
  }
}

function assertParamExists(object: string, value: string | number | boolean | undefined | null): void {
  if (value === undefined) {
    printRedMsg(`Missing required parameter/field: ${object}`)
    throw new Error('Value not defined')
  }
}

function addRequiredFieldsToRequestBody(dataObj: Artifacts): Artifacts {
  const bodyObj: Artifacts = {}
  try {
    assertParamExists('filename', dataObj.filename)
    assertParamExists('isTemplate', dataObj.isTemplate)
    assertParamExists('type', dataObj.type)
    assertParamExists('category', dataObj.category)
  } catch (error) {
    console.log('Required JSON fields are:')
    console.log(colorize(JSON.stringify(getJsonExamples('artifacts-put-required'), null, 2)))
    throw error
  }

  bodyObj.filename = dataObj.filename
  bodyObj.isTemplate = dataObj.isTemplate
  bodyObj.type = dataObj.type
  bodyObj.category = dataObj.category

  return bodyObj
}

function addOptionalFields(bodyObject: Artifacts, dataObj: Artifacts): void {
  if (Object.prototype.hasOwnProperty.call(dataObj, 'name')) {
    bodyObject.name = dataObj.name
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'description')) {
    bodyObject.description = dataObj.description
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'referencePageNumber')) {
    bodyObject.referencePageNumber = dataObj.referencePageNumber
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'controls')) {
    bodyObject.controls = dataObj.controls
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'assessmentProcedures')) {
    bodyObject.assessmentProcedures = dataObj.assessmentProcedures
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'expirationDate')) {
    bodyObject.expirationDate = dataObj.expirationDate
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'lastReviewedDate')) {
    bodyObject.lastReviewedDate = dataObj.lastReviewedDate
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'signedDate')) {
    bodyObject.signedDate = dataObj.signedDate
  }
}

function generateBodyObj(dataObject: Artifacts): Artifacts {
  let bodyObj: Artifacts = {}
  try {
    bodyObj = addRequiredFieldsToRequestBody(dataObject)
    addOptionalFields(bodyObj, dataObject)
  } catch {
    process.exit(1)
  }

  return bodyObj
}

const CMD_HELP = 'saf emasser put artifacts -h or --help'
export default class EmasserPutArtifacts extends Command {
  static readonly usage = '<%= command.id %> [FLAGS]\n\x1B[93m NOTE: see EXAMPLES for command usages\x1B[0m'

  static readonly description = 'Updates artifacts for a system with provided entries'

  static readonly examples = [
    '<%= config.bin %> <%= command.id %> [-s,--systemId] [-f,--dataFile]',
    'The input file should be a well formed JSON containing the POA&M information based on defined business rules.',
    'Required JSON parameter/fields are: ',
    colorize(JSON.stringify(getJsonExamples('artifacts-put-required'), null, 2)),
    'Optional JSON parameters/fields are:',
    colorize(JSON.stringify(getJsonExamples('artifacts-put-optional'), null, 2)),
    '\x1B[1m\x1B[32mAll accepted parameters/fields are:\x1B[0m',
    colorize(getAllJsonExamples()),
  ]

  static readonly flags = {
    help: Flags.help({char: 'h', description: 'Show eMASSer CLI help for the PUT Artifacts command'}),
    ...getFlagsForEndpoint(process.argv) as FlagOptions, // skipcq: JS-0349
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(EmasserPutArtifacts)
    const apiCxn = new ApiConnection()
    const artifactApi = new ArtifactsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)

    const requestBodyArray: Artifacts[] = []

    // Check if a Artifacts json file was provided
    if (!fs.existsSync(flags.dataFile)) {
      console.error('\x1B[91m» Artifacts data file (.json) not found or invalid:', flags.dataFile, '\x1B[0m')
      process.exit(1)
    }

    try {
      // Read and parse the JSON file
      const fileContent = await readFile(flags.dataFile, 'utf8')
      const data: unknown = JSON.parse(fileContent)

      // Process the Artifacts data
      if (Array.isArray(data)) {
        data.forEach((dataObject: Artifacts) => {
          // Generate the PUT request object based on business logic
          requestBodyArray.push(generateBodyObj(dataObject))
        })
      } else if (typeof data === 'object' && data !== null) {
        const dataObject: Artifacts = data
        // Generate the PUT request object based on business logic
        requestBodyArray.push(generateBodyObj(dataObject))
      } else {
        console.error('\x1B[91m» Invalid data format in Artifacts file\x1B[0m')
        process.exit(1)
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('\x1B[91m» Error reading Artifacts data file, possible malformed JSON. Please use the -h flag for help.\x1B[0m')
        console.error('\x1B[93m→ Error message was:', error.message, '\x1B[0m')
      } else {
        console.error('\x1B[91m» Unknown error occurred while reading the file:', flags.dataFile, '\x1B[0m')
      }
      process.exit(1)
    }

    // Call API endpoint
    artifactApi.updateArtifactBySystemId(flags.systemId, requestBodyArray).then((response: ArtifactsResponsePutPost) => {
      console.log(colorize(outputFormat(response, false)))
    }).catch((error: unknown) => displayError(error, 'Artifacts'))
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
