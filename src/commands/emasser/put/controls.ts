import colorize from 'json-colorizer'
import {Command, Flags} from '@oclif/core'
import {ControlsApi} from '@mitre/emass_client'
import {ControlsResponsePut} from '@mitre/emass_client/dist/api'
import {ControlsGet as Controls} from '@mitre/emass_client/dist/api'
import {ApiConnection} from '../../../utils/emasser/apiConnection'
import {outputFormat} from '../../../utils/emasser/outputFormatter'
import {FlagOptions, getFlagsForEndpoint, getJsonExamples} from '../../../utils/emasser/utilities'
import {outputError} from '../../../utils/emasser/outputError'
import {readFile} from 'fs/promises'
import _ from 'lodash'
import fs from 'fs'

function printHelpMsg() {
  console.log('\x1B[93m', '\nInvoke saf emasser put controls [-h, --help] for additional help', '\x1B[0m')
}

function printRedMsg(msg: string) {
  console.log('\x1B[91m', msg, '\x1B[0m')
}

function assertParamExists(object: string, value: string|number|undefined|null): void {
  if (typeof value === 'undefined') {
    printRedMsg(`Missing required parameter/field: ${object}`)
    throw new Error('Value not defined')
  }
}

function addRequiredFieldsToRequestBody(dataObj: Controls): Controls {
  const bodyObj: Controls  = {}
  try {
    assertParamExists('acronym', dataObj.acronym)
    assertParamExists('responsibleEntities', dataObj.responsibleEntities)
    assertParamExists('controlDesignation', dataObj.controlDesignation)
    assertParamExists('estimatedCompletionDate', dataObj.estimatedCompletionDate)
    assertParamExists('implementationNarrative', dataObj.implementationNarrative)
  } catch (error) {
    console.log('Required JSON fields are:')
    console.log(colorize(JSON.stringify(getJsonExamples('controls-required'), null, 2)))
    throw error
  }

  bodyObj.acronym = dataObj.acronym
  bodyObj.responsibleEntities = dataObj.responsibleEntities
  bodyObj.controlDesignation = dataObj.controlDesignation
  bodyObj.estimatedCompletionDate = dataObj.estimatedCompletionDate
  bodyObj.implementationNarrative = dataObj.implementationNarrative

  return bodyObj
}

function addConditionalFields(bodyObject: Controls, dataObj: Controls): void {
  if (Object.prototype.hasOwnProperty.call(dataObj, 'commonControlProvider')) {
    bodyObject.commonControlProvider = dataObj.commonControlProvider
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'naJustification')) {
    bodyObject.naJustification = dataObj.naJustification
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'slcmCriticality')) {
    bodyObject.slcmCriticality = dataObj.slcmCriticality
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'slcmFrequency')) {
    bodyObject.slcmFrequency = dataObj.slcmFrequency
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'slcmMethod')) {
    bodyObject.slcmMethod = dataObj.slcmMethod
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'slcmReporting')) {
    bodyObject.slcmReporting = dataObj.slcmReporting
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'slcmTracking')) {
    bodyObject.slcmTracking = dataObj.slcmTracking
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'slcmComments')) {
    bodyObject.slcmComments = dataObj.slcmComments
  }
}

function addOptionalFields(bodyObject: Controls, dataObj: Controls): void {
  if (Object.prototype.hasOwnProperty.call(dataObj, 'implementationStatus')) {
    bodyObject.implementationStatus = dataObj.implementationStatus
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'severity')) {
    bodyObject.severity = dataObj.severity
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'vulnerabiltySummary')) {
    bodyObject.vulnerabiltySummary = dataObj.vulnerabiltySummary
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'recommendations')) {
    bodyObject.recommendations = dataObj.recommendations
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'relevanceOfThreat')) {
    bodyObject.relevanceOfThreat = dataObj.relevanceOfThreat
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'likelihood')) {
    bodyObject.likelihood = dataObj.likelihood
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'impact')) {
    bodyObject.impact = dataObj.impact
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'impactDescription')) {
    bodyObject.impactDescription = dataObj.impactDescription
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'residualRiskLevel')) {
    bodyObject.residualRiskLevel = dataObj.residualRiskLevel
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'testMethod')) {
    bodyObject.testMethod = dataObj.testMethod
  }
}

function processBusinessLogic(bodyObject: Controls, dataObj: Controls): void { // skipcq: JS-0044
  //----------------------------------------------------------------------------------------
  // Conditional fields that are required based on the "implementationStatus" value
  // "Planned" or       estimatedCompletionDate, responsibleEntities, slcmCriticality,
  // "Implemented"      slcmFrequency, slcmMethod, slcmReporting, slcmTracking, slcmComments
  //
  // "Not Applicable"     naJustification, responsibleEntities
  //
  // "Manually Inherited" commonControlProvider, estimatedCompletionDate,
  //                      responsibleEntities, slcmCriticality, slcmFrequency, slcmMethod,
  //                      slcmReporting, slcmTracking, slcmComments
  //
  // "Inherited"          Only the following fields can be updated:
  //                      controlDesignation, commonnControlProvider
  //----------------------------------------------------------------------------------------

  // Only process if we have an Implementation Status
  if (Object.prototype.hasOwnProperty.call(dataObj, 'implementationStatus')) {
    // The implementation Status is always required in any of these cases
    bodyObject.implementationStatus = dataObj.implementationStatus

    switch (dataObj.implementationStatus) {
      case 'Planned':
      case 'Implemented': {
        // No need to check for controlDesignation and estimatedCompletionDate, they are required fields
        if (!(Object.prototype.hasOwnProperty.call(dataObj, 'responsibleEntities')) || !(Object.prototype.hasOwnProperty.call(dataObj, 'slcmCriticality')) ||
            !(Object.prototype.hasOwnProperty.call(dataObj, 'slcmFrequency')) || !(Object.prototype.hasOwnProperty.call(dataObj, 'slcmMethod')) ||
            !(Object.prototype.hasOwnProperty.call(dataObj, 'slcmReporting')) || !(Object.prototype.hasOwnProperty.call(dataObj, 'slcmTracking')) ||
            !(Object.prototype.hasOwnProperty.call(dataObj, 'slcmComments'))) {
          printRedMsg('Missing one of these parameters/fields:')
          printRedMsg('    responsibleEntities, slcmCriticality, slcmFrequency,')
          printRedMsg('    slcmMethod,slcmReporting, slcmTracking, slcmComments')
          printHelpMsg()
          process.exit(1)
        } else {
          bodyObject.responsibleEntities = dataObj.responsibleEntities
          bodyObject.slcmCriticality = dataObj.slcmCriticality
          bodyObject.slcmFrequency = dataObj.slcmFrequency
          bodyObject.slcmMethod = dataObj.slcmMethod
          bodyObject.slcmReporting = dataObj.slcmReporting
          bodyObject.slcmTracking = dataObj.slcmTracking
          bodyObject.slcmComments = dataObj.slcmComments
        }

        break
      }

      case 'Not Applicable': {
        // No need to check for controlDesignation, it is a required field
        if ((Object.prototype.hasOwnProperty.call(dataObj, 'naJustification') && Object.prototype.hasOwnProperty.call(dataObj, 'responsibleEntities'))) {
          bodyObject.naJustification = dataObj.naJustification
          bodyObject.responsibleEntities = dataObj.responsibleEntities
        } else {
          printRedMsg('Missing one of these parameters/fields:')
          printRedMsg('    naJustification, responsibleEntities')
          printHelpMsg()
          process.exit(1)
        }

        break
      }

      case 'Manually Inherited': {
        // No need to check for controlDesignation and estimatedCompletionDate, they are required fields
        if (!(Object.prototype.hasOwnProperty.call(dataObj, 'commonControlProvider')) || !(Object.prototype.hasOwnProperty.call(dataObj, 'responsibleEntities')) ||
            !(Object.prototype.hasOwnProperty.call(dataObj, 'slcmCriticality')) || !(Object.prototype.hasOwnProperty.call(dataObj, 'slcmFrequency')) ||
            !(Object.prototype.hasOwnProperty.call(dataObj, 'slcmMethod')) || !(Object.prototype.hasOwnProperty.call(dataObj, 'slcmReporting')) ||
            !(Object.prototype.hasOwnProperty.call(dataObj, 'slcmTracking')) || !(Object.prototype.hasOwnProperty.call(dataObj, 'slcmComments'))) {
          printRedMsg('Missing one of these parameters/fields:')
          printRedMsg('    commonControlProvider, responsibleEntities, slcmCriticality,')
          printRedMsg('    slcmFrequency, slcmMethod, slcmReporting, slcmTracking, slcmComments')
          printHelpMsg()
          process.exit(1)
        } else {
          bodyObject.commonControlProvider = dataObj.commonControlProvider
          bodyObject.responsibleEntities = dataObj.responsibleEntities
          bodyObject.slcmCriticality = dataObj.slcmCriticality
          bodyObject.slcmFrequency = dataObj.slcmFrequency
          bodyObject.slcmMethod = dataObj.slcmMethod
          bodyObject.slcmReporting = dataObj.slcmReporting
          bodyObject.slcmTracking = dataObj.slcmTracking
          bodyObject.slcmComments = dataObj.slcmComments
        }

        break
      }

      case 'Inherited': {
        // No need to check for controlDesignation, it is a required field
        if ((Object.prototype.hasOwnProperty.call(dataObj, 'commonControlProvider'))) {
          bodyObject.commonControlProvider = dataObj.commonControlProvider
        } else {
          printRedMsg('When implementationStatus value is "Inherited" the following field is required: commonControlProvider')
          printHelpMsg()
          process.exit(1)
        }

        break
      }

      default: {
        printRedMsg('The "implementationStatus" field must one of the following:')
        printRedMsg('    Planned, Implemented, Not Applicable, Inherited, or Manually Inherited')
        printRedMsg(`Status provided was: ${dataObj.implementationStatus}`)
        process.exit(1)
      }
    }
  }
}

function generateBodyObj(dataObject: Controls): Controls {
  let bodyObj: Controls = {}
  try {
    bodyObj = addRequiredFieldsToRequestBody(dataObject)
    processBusinessLogic(bodyObj, dataObject)
    addConditionalFields(bodyObj, dataObject)
    addOptionalFields(bodyObj, dataObject)
  } catch {
    process.exit(1)
  }

  return bodyObj
}

export default class EmasserPutControls extends Command {
  static usage = '<%= command.id %> [ARGUMENTS]'

  static description = 'Update Security Control information of a system for both the Implementation Plan and Risk Assessment.'

  static examples = ['<%= config.bin %> <%= command.id %> [-s,--systemId] [-f,--controlsFile]',
    'The input file should be a well formed JSON containing the Security Control information based on defined business rules.',
    'Required JSON parameter/fields are: ',
    colorize(JSON.stringify(getJsonExamples('controls-required'), null, 2)),
    'Conditional JSON parameters/fields are: ',
    colorize(JSON.stringify(getJsonExamples('controls-conditional'), null, 2)),
    'Optional JSON parameters/fields are:',
    colorize(JSON.stringify(getJsonExamples('controls-optional'), null, 2))]

  static flags = {
    help: Flags.help({char: 'h', description: 'Put (update) control information in a system for one or many controls. See emasser Features (emasserFeatures.md) for additional information.'}),
    ...getFlagsForEndpoint(process.argv) as FlagOptions, // skipcq: JS-0349
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(EmasserPutControls)
    const apiCxn = new ApiConnection()
    const updateControl = new ControlsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)

    const requestBodyArray: Controls[] = []

    // Check if a Security Control information json file was provided
    if (fs.existsSync(flags.controlFile)) {
      let data: any
      try {
        data = JSON.parse(await readFile(flags.controlFile, 'utf8'))
      } catch (error: any) {
        if (error.code === 'ENOENT') {
          console.log('Security Control information JSON file not found!')
          process.exit(1)
        } else {
          console.log('Error reading Security Control information file, possible malformed json. Please use the -h flag for help.')
          console.log('Error message was:', error.message)
          process.exit(1)
        }
      }

      // Security Control information json file provided, check if we have multiple content to process
      if (Array.isArray(data)) {
        data.forEach((dataObject: Controls) => {
          // Generate the put request object based on business logic
          requestBodyArray.push(generateBodyObj(dataObject))
        })
      } else if (typeof data === 'object') {
        const dataObject: Controls = data
        // Generate the put request object based on business logic
        requestBodyArray.push(generateBodyObj(dataObject))
      }
    } else {
      console.error('Invalid or Security Control information JSON file not found on the provided directory:', flags.controlFile)
      process.exit(1)
    }

    updateControl.updateControlBySystemId(flags.systemId, requestBodyArray).then((response: ControlsResponsePut) => {
      console.log(colorize(outputFormat(response)))
    }).catch((error:any) => console.error(colorize(outputError(error))))
  }
}
