import fs from 'fs'
import _ from 'lodash'
import {readFile} from 'fs/promises'
import colorize from 'json-colorizer'
import {Command, Flags} from '@oclif/core'

import {outputError} from '../../../utils/emasser/outputError'
import {ApiConnection} from '../../../utils/emasser/apiConnection'
import {outputFormat} from '../../../utils/emasser/outputFormatter'
import {FlagOptions, getFlagsForEndpoint, getJsonExamples} from '../../../utils/emasser/utilities'

import {POAMApi} from '@mitre/emass_client'
import {MilestonesGet, PoamResponsePut,
  PoamGet as Poams} from '@mitre/emass_client/dist/api'

function printRedMsg(msg: string) {
  console.log('\x1B[91m', msg, '\x1B[0m')
}

function printHelpMsg(msg: string) {
  console.log('\x1B[93m', msg, '\x1B[0m')
}

function assertParamExists(object: string, value: string|number|undefined|null): void {
  if (value === undefined) {
    printRedMsg(`Missing required parameter/field: ${object}`)
    throw new Error('Value not defined')
  }
}

function addRequiredFieldsToRequestBody(dataObj: Poams): Poams {
  const bodyObj: Poams  = {}
  try {
    assertParamExists('poamId', dataObj.poamId)
    assertParamExists('displayPoamId', dataObj.displayPoamId)
    assertParamExists('status', dataObj.status)
    assertParamExists('vulnerabilityDescription', dataObj.vulnerabilityDescription)
    assertParamExists('sourceIdentVuln', dataObj.sourceIdentVuln)
    assertParamExists('pocOrganization', dataObj.pocOrganization)
    assertParamExists('resources', dataObj.resources)
    assertParamExists('mitigation', dataObj.mitigation)
  } catch (error) {
    console.log('Required JSON fields are:')
    console.log(colorize(JSON.stringify(getJsonExamples('poams-put-required'), null, 2)))
    throw error
  }

  bodyObj.poamId = dataObj.poamId
  bodyObj.displayPoamId = dataObj.displayPoamId
  bodyObj.status = dataObj.status
  bodyObj.vulnerabilityDescription = dataObj.vulnerabilityDescription
  bodyObj.sourceIdentVuln = dataObj.sourceIdentVuln
  bodyObj.pocOrganization = dataObj.pocOrganization
  bodyObj.resources = dataObj.resources
  bodyObj.mitigation = dataObj.mitigation

  return bodyObj
}

function addConditionalFields(bodyObject: Poams, dataObj: Poams): void {
  if (Object.prototype.hasOwnProperty.call(dataObj, 'pocFirstName')) {
    bodyObject.pocFirstName = dataObj.pocFirstName
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'pocLastName')) {
    bodyObject.pocLastName = dataObj.pocLastName
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'pocEmail')) {
    bodyObject.pocEmail = dataObj.pocEmail
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'pocPhoneNumber')) {
    bodyObject.pocPhoneNumber = dataObj.pocPhoneNumber
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'severity')) {
    bodyObject.severity = dataObj.severity
  }
}

function addOptionalFields(bodyObject: Poams, dataObj: Poams): void {
  if (Object.prototype.hasOwnProperty.call(dataObj, 'externalUid')) {
    bodyObject.externalUid = dataObj.externalUid
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'controlAcronym')) {
    bodyObject.controlAcronym = dataObj.controlAcronym
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'cci')) {
    bodyObject.cci = dataObj.cci
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'securityChecks')) {
    bodyObject.securityChecks = dataObj.securityChecks
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'rawSeverity')) {
    bodyObject.rawSeverity = dataObj.rawSeverity
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

  if (Object.prototype.hasOwnProperty.call(dataObj, 'recommendations')) {
    bodyObject.recommendations = dataObj.recommendations
  }
  // if (Object.prototype.hasOwnProperty.call(dataObj,'mitigation')) {bodyObject.mitigation = dataObj.mitigation; }
}

function processBusinessLogic(bodyObject: Poams, dataObj: Poams): void { // skipcq: JS-0044
  //-----------------------------------------------------------------------------
  // Conditional fields that are required based on the "status" field value
  // "Risk Accepted"   comments, resources
  // "Ongoing"         scheduledCompletionDate, resources, milestones (at least 1)
  // "Completed"       scheduledCompletionDate, comments, resources,
  //                   completionDate, milestones (at least 1)
  // "Not Applicable"  POAM can not be created
  //-----------------------------------------------------------------------------
  const HELP_MSG = '\nInvoke saf emasser post poams [-h, --help] for additional help'
  switch (dataObj.status) {
    case 'Risk Accepted': {
      if (dataObj.comments === undefined) {
        printRedMsg('When status is "Risk Accepted" the following parameters/fields are required:')
        printRedMsg('    comments')
        printHelpMsg(HELP_MSG)
        process.exit(1)
      } else if (Object.prototype.hasOwnProperty.call(dataObj, 'scheduledCompletionDate') || Object.prototype.hasOwnProperty.call(dataObj, 'milestones')) {
        printRedMsg('When status is "Risk Accepted" POA&Ms CAN NOT be saved with the following parameters/field:')
        printRedMsg('    scheduledCompletionDate, or milestone')
        printHelpMsg(HELP_MSG)
        process.exit(1)
      } else {
        bodyObject.comments = dataObj.comments
      }

      break
    }

    case 'Ongoing': {
      if (!(Object.prototype.hasOwnProperty.call(dataObj, 'scheduledCompletionDate') && Object.prototype.hasOwnProperty.call(dataObj, 'milestones'))) {
        printRedMsg('When status is "Ongoing" the following parameters/fields are required:')
        printRedMsg('    scheduledCompletionDate, milestones')
        printHelpMsg(HELP_MSG)
        process.exit(1)
      } else if (((_.some(dataObj.milestones, function (milestone) { // skipcq: JS-0241
        return milestone.description
      }))) ||
                  ((_.some(dataObj.milestones, function (milestone) { // skipcq: JS-0241
                    return milestone.scheduledCompletionDate
                  })))) {
        printRedMsg('When milestones are define the parameters "description" and "scheduledCompletionDate" are required.')
        printRedMsg('Missing one of the required milestones parameters:')
        printRedMsg('    description, scheduledCompletionDate')
        process.exit(1)
      } else {
        // Add the POA&M completion date
        bodyObject.scheduledCompletionDate = dataObj.scheduledCompletionDate

        // Add the milestone object
        const milestoneArray: Array<MilestonesGet> = []
        dataObj.milestones?.forEach((milestone: MilestonesGet) => {
          const milestoneObj: MilestonesGet = {}
          milestoneObj.milestoneId = milestone.milestoneId
          milestoneObj.description = milestone.description
          milestoneObj.scheduledCompletionDate = milestone.scheduledCompletionDate
          milestoneArray.push(milestoneObj)
        })
        bodyObject.milestones = [...milestoneArray]
      }

      break
    }

    case 'Completed': {
      if (!(Object.prototype.hasOwnProperty.call(dataObj, 'scheduledCompletionDate')) || !(Object.prototype.hasOwnProperty.call(dataObj, 'comments')) ||
           !(Object.prototype.hasOwnProperty.call(dataObj, 'completionDate')) || !(Object.prototype.hasOwnProperty.call(dataObj, 'milestones'))) {
        printRedMsg('When status is "Completed" the following parameters/fields are required:')
        printRedMsg('    scheduledCompletionDate, comments, completionDate, or milestone')
        printHelpMsg(HELP_MSG)
        process.exit(1)
      } else {
        // Add the POA&M schedule and completion date, comments
        bodyObject.comments = dataObj.comments
        bodyObject.completionDate = dataObj.completionDate
        bodyObject.scheduledCompletionDate = dataObj.scheduledCompletionDate

        // Add the milestone object
        const milestoneArray: Array<MilestonesGet> = []
        dataObj.milestones?.forEach((milestone: MilestonesGet) => {
          const milestoneObj: MilestonesGet = {}
          milestoneObj.milestoneId = milestone.milestoneId
          milestoneObj.description = milestone.description
          milestoneObj.scheduledCompletionDate = milestone.scheduledCompletionDate
          milestoneArray.push(milestoneObj)
        })
        bodyObject.milestones = [...milestoneArray]
      }

      break
    }

    case 'Archived': {
      printHelpMsg('Archived POA&M Items cannot be updated')
      process.exit(0)
      break
    }

    default: {
      printRedMsg('The "status" field must one of the following:')
      printRedMsg('    Risk Accepted, Ongoing, or Completed')
      printRedMsg(`Status provided was: ${dataObj.status}`)
      process.exit(1)
      break
    }
  }

  // POC checks: If any poc information is provided all POC fields are required
  if ((Object.prototype.hasOwnProperty.call(dataObj, 'pocFirstName') || Object.prototype.hasOwnProperty.call(dataObj, 'pocLastName') ||
      Object.prototype.hasOwnProperty.call(dataObj, 'pocEmail') || Object.prototype.hasOwnProperty.call(dataObj, 'pocPhoneNumber')) && (!(Object.prototype.hasOwnProperty.call(dataObj, 'pocFirstName')) || !(Object.prototype.hasOwnProperty.call(dataObj, 'pocLastName')) ||
        !(Object.prototype.hasOwnProperty.call(dataObj, 'pocEmail')) || !(Object.prototype.hasOwnProperty.call(dataObj, 'pocPhoneNumber')))) {
    printRedMsg('If any POC content is provided (pocFirstName, pocLastName, pocEmail, pocPhoneNumber) than all POC parameters are required:')
    printRedMsg('    pocFirstName, pocLastName, pocEmail, pocPhoneNumber')
    printHelpMsg(HELP_MSG)
    process.exit(1)
  }
}

function generateBodyObj(dataObject: Poams): Poams {
  let bodyObj: Poams = {}
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

export default class EmasserPutPoams extends Command {
  static usage = '<%= command.id %> [options]'

  static description = 'Update a Plan of Action and Milestones (POA&M) into a systems.'

  static examples = ['<%= config.bin %> <%= command.id %> [-s,--systemId] [-f,--poamFile]',
    'The input file should be a well formed JSON containing the POA&M information based on defined business rules.',
    'Required JSON parameter/fields are: ',
    colorize(JSON.stringify(getJsonExamples('poams-put-required'), null, 2)),
    'Conditional JSON parameters/fields are: ',
    colorize(JSON.stringify(getJsonExamples('poams-put-conditional'), null, 2)),
    'Optional JSON parameters/fields are:',
    colorize(JSON.stringify(getJsonExamples('poams-post-put-optional'), null, 2))]

  static flags = {
    help: Flags.help({char: 'h', description: 'Put (update) a Plan of Action and Milestones (POA&M) item(s) in a system. See emasser Features (emasserFeatures.md) for additional information.'}),
    ...getFlagsForEndpoint(process.argv) as FlagOptions, // skipcq: JS-0349
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(EmasserPutPoams)
    const apiCxn = new ApiConnection()
    const updatePoam = new POAMApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)

    const requestBodyArray: Poams[] = []

    // Check if a POA&Ms json file was provided
    if (fs.existsSync(flags.poamFile)) {
      let data: any
      try {
        data = JSON.parse(await readFile(flags.poamFile, 'utf8'))
      } catch (error: any) {
        if (error.code === 'ENOENT') {
          console.log('POA&Ms JSON file not found!')
          process.exit(1)
        } else {
          console.log('Error reading POA&Ms file, possible malformed json. Please use the -h flag for help.')
          console.log('Error message was:', error.message)
          process.exit(1)
        }
      }

      // POA&Ms json file provided, check if we have multiple POA&Ms to process
      if (Array.isArray(data)) {
        data.forEach((dataObject: Poams) => {
          // Generate the put request object based on business logic
          requestBodyArray.push(generateBodyObj(dataObject))
        })
      } else if (typeof data === 'object') {
        const dataObject: Poams = data
        // Generate the put request object based on business logic
        requestBodyArray.push(generateBodyObj(dataObject))
      }
    } else {
      console.error('Invalid or POA&M JSON file not found on the provided directory:', flags.poamFile)
      process.exit(1)
    }

    updatePoam.updatePoamBySystemId(flags.systemId, requestBodyArray).then((response: PoamResponsePut) => {
      console.log(colorize(outputFormat(response)))
    }).catch((error:any) => console.error(colorize(outputError(error))))
  }
}
