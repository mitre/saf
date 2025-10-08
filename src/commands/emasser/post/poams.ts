import fs from 'fs'
import _ from 'lodash'
import {readFile} from 'fs/promises'
import {colorize} from 'json-colorizer'
import {Command, Flags} from '@oclif/core'

import {ApiConnection} from '../../../utils/emasser/apiConnection'
import {outputFormat} from '../../../utils/emasser/outputFormatter'
import type {FlagOptions} from '../../../utils/emasser/utilities'
import {displayError, getFlagsForEndpoint, getJsonExamples, printHelpMsg, printRedMsg} from '../../../utils/emasser/utilities'

import {POAMApi} from '@mitre/emass_client'
import type {MilestonesGet, PoamResponsePostPutDelete} from '@mitre/emass_client/dist/api'
import {getErrorMessage} from '../../../utils/global'

/**
 * Interface representing a Plan of Action and Milestones (POAMs) object.
 *
 * @property {string} [status] - The current status of the POAM.
 * @property {string} [vulnerabilityDescription] - Description of the vulnerability.
 * @property {string} [sourceIdentifyingVulnerability] - Source identifying the vulnerability.
 * @property {string} [pocOrganization] - Point of contact organization.
 * @property {string} [resources] - Resources required for the POAM.
 * @property {Array<MilestonesGet>} [milestones] - List of milestones associated with the POAM.
 * @property {string} [pocFirstName] - Point of contact first name.
 * @property {string} [pocLastName] - Point of contact last name.
 * @property {string} [pocEmail] - Point of contact email address.
 * @property {string} [pocPhoneNumber] - Point of contact phone number.
 * @property {string} [severity] - Severity level of the vulnerability.
 * @property {string} [scheduledCompletionDate] - Scheduled completion date of the POAM.
 * @property {string} [completionDate] - Actual completion date of the POAM.
 * @property {string} [comments] - Additional comments regarding the POAM.
 * @property {string} [externalUid] - External unique identifier.
 * @property {string} [controlAcronym] - Control acronym associated with the POAM.
 * @property {string} [assessmentProcedure] - Assessment procedure for the POAM.
 * @property {string} [securityChecks] - Security checks associated with the POAM.
 * @property {string} [rawSeverity] - Raw severity level of the vulnerability.
 * @property {string} [relevanceOfThreat] - Relevance of the threat.
 * @property {string} [likelihood] - Likelihood of the threat occurring.
 * @property {string} [impact] - Impact level of the threat.
 * @property {string} [impactDescription] - Description of the impact.
 * @property {string} [residualRiskLevel] - Residual risk level after mitigation.
 * @property {string} [recommendations] - Recommendations for mitigating the threat.
 * @property {string} [mitigations] - Mitigations applied to reduce the threat.
 * @property {string} [resultingResidualRiskLevelAfterProposedMitigations] - Residual risk level after proposed mitigations.
 * @property {string} [predisposingConditions] - Predisposing conditions affecting the threat.
 * @property {string} [threatDescription] - Description of the threat.
 * @property {string} [devicesAffected] - Devices affected by the threat.
 * @property {boolean} [identifiedInCFOAuditOrOtherReview] - Indicates if identified in CFO audit or other review (optional for Army and USCG, required for VA).
 * @property {number} [personnelResourcesFundedBaseHours] - Funded base hours for personnel resources.
 * @property {string} [personnelResourcesCostCode] - Cost code for personnel resources.
 * @property {number} [personnelResourcesUnfundedBaseHours] - Unfunded base hours for personnel resources.
 * @property {string} [personnelResourcesNonfundingObstacle] - Non-funding obstacle for personnel resources.
 * @property {string} [personnelResourcesNonfundingObstacleOtherReason] - Other reason for non-funding obstacle for personnel resources.
 * @property {number} [nonPersonnelResourcesFundedAmount] - Funded amount for non-personnel resources.
 * @property {string} [nonPersonnelResourcesCostCode] - Cost code for non-personnel resources.
 * @property {number} [nonPersonnelResourcesUnfundedAmount] - Unfunded amount for non-personnel resources.
 * @property {string} [nonPersonnelResourcesNonfundingObstacle] - Non-funding obstacle for non-personnel resources.
 * @property {string} [nonPersonnelResourcesNonfundingObstacleOtherReason] - Other reason for non-funding obstacle for non-personnel resources.
 */
interface Poams {
  // Required Fields - Declared as undefined but validated later
  status?: string
  vulnerabilityDescription?: string
  sourceIdentifyingVulnerability?: string
  pocOrganization?: string
  resources?: string

  // Conditional Fields
  milestones?: Array<MilestonesGet>
  pocFirstName?: string
  pocLastName?: string
  pocEmail?: string
  pocPhoneNumber?: string
  scheduledCompletionDate?: string
  completionDate?: string
  comments?: string
  // Conditional but certain eMASS instances may
  // require the severity Risk Analysis field
  severity?: string

  // Optional
  externalUid?: string
  controlAcronym?: string
  assessmentProcedure?: string
  securityChecks?: string
  rawSeverity?: string
  impactDescription?: string
  recommendations?: string
  resultingResidualRiskLevelAfterProposedMitigations?: string
  predisposingConditions?: string
  threatDescription?: string
  devicesAffected?: string
  // Optional but certain eMASS instances
  // may require these Risk Analysis fields
  mitigations?: string
  relevanceOfThreat?: string
  likelihood?: string
  impact?: string
  residualRiskLevel?: string
  // Optional for Army and USCG - Required (Conditional) for VA
  identifiedInCFOAuditOrOtherReview?: boolean
  personnelResourcesFundedBaseHours?: number
  personnelResourcesCostCode?: string
  personnelResourcesUnfundedBaseHours?: number
  personnelResourcesNonfundingObstacle?: string
  personnelResourcesNonfundingObstacleOtherReason?: string
  nonPersonnelResourcesFundedAmount?: number
  nonPersonnelResourcesCostCode?: string
  nonPersonnelResourcesUnfundedAmount?: number
  nonPersonnelResourcesNonfundingObstacle?: string
  nonPersonnelResourcesNonfundingObstacleOtherReason?: string
}

/**
 * Retrieves and combines JSON examples from various sources.
 *
 * This function aggregates JSON examples by merging the results of
 * multiple calls to `getJsonExamples` with different parameters.
 * The resulting object includes required, conditional, and optional
 * examples for POAMs (Plan of Action and Milestones).
 *
 * @returns {string} A string representation of the combined JSON examples.
 */
function getAllJsonExamples(): string {
  const exampleBodyObj: Record<string, unknown> = {
    ...getJsonExamples('poams-post-required'),
    ...getJsonExamples('poams-post-put-required-va'),
    ...getJsonExamples('poams-post-conditional'),
    ...getJsonExamples('poams-post-put-optional'),
  }

  return JSON.stringify(exampleBodyObj)
}

/**
 * Asserts that a required parameter exists and is not undefined.
 *
 * @param object - The name of the parameter or field being checked.
 * @param value - The value of the parameter or field to check.
 * @throws Will throw an error if the value is undefined.
 */
function assertParamExists(object: string, value: string | undefined | null): void {
  if (value === undefined) {
    printRedMsg(`Missing required parameter/field: ${object}`)
    throw new Error('Value not defined')
  }
}

/**
 * Adds required fields to the request body for a POAM (Plan of Action and Milestones) object.
 *
 * This function ensures that the required fields are present in the input `dataObj` and then
 * constructs a new `Poams` object with these fields. If any required field is missingFields, an error
 * is thrown, and a sample JSON structure of the required fields is logged.
 *
 * @param {Poams} dataObj - The input POAM object containing the data to be validated and added to the request body.
 * @returns {Poams} - A new POAM object containing the required fields.
 * @throws Will throw an error if any of the required fields are missingFields in the input `dataObj`.
 */
function addRequiredFieldsToRequestBody(dataObj: Poams): Poams {
  const bodyObj: Poams = {}
  try {
    assertParamExists('status', dataObj.status)
    assertParamExists('vulnerabilityDescription', dataObj.vulnerabilityDescription)
    assertParamExists('sourceIdentifyingVulnerability', dataObj.sourceIdentifyingVulnerability)
    assertParamExists('pocOrganization', dataObj.pocOrganization)
    assertParamExists('resources', dataObj.resources)
  } catch (error) {
    console.log('Required JSON fields are:')
    console.log(colorize(JSON.stringify(getJsonExamples('poams-post-required'), null, 2)))
    throw error
  }

  // The required parameter "systemId" is validated by oclif
  bodyObj.status = dataObj.status
  bodyObj.vulnerabilityDescription = dataObj.vulnerabilityDescription
  bodyObj.sourceIdentifyingVulnerability = dataObj.sourceIdentifyingVulnerability
  bodyObj.pocOrganization = dataObj.pocOrganization
  bodyObj.resources = dataObj.resources

  return bodyObj
}

/**
 * Adds conditional fields from the `dataObj` to the `bodyObject` if they exist.
 *
 * @remarks
 * This function checks if the properties `pocFirstName`, `pocLastName`, `pocEmail`,
 * `pocPhoneNumber`, `severity`
 * exist in the `dataObj`. If they do, it assigns their values to the corresponding properties
 * in the `bodyObject`.
 *
 * The properties `scheduledCompletionDate`, `completionDate`, and `comments` are checked
 * in the business logic function.
 */
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

/**
 * Adds optional fields from the data object to the body object if they exist.
 *
 * @param bodyObject - The target object to which optional fields will be added.
 * @param dataObj - The source object containing optional fields.
 */
// skipcq: JS-R1005 - Ignore Function cyclomatic complexity high threshold
function addOptionalFields(bodyObject: Poams, dataObj: Poams): void {
  if (Object.prototype.hasOwnProperty.call(dataObj, 'externalUid')) {
    bodyObject.externalUid = dataObj.externalUid
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'controlAcronym')) {
    bodyObject.controlAcronym = dataObj.controlAcronym
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'assessmentProcedure')) {
    bodyObject.assessmentProcedure = dataObj.assessmentProcedure
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

  if (Object.prototype.hasOwnProperty.call(dataObj, 'mitigations')) {
    bodyObject.mitigations = dataObj.mitigations
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'resultingResidualRiskLevelAfterProposedMitigations')) {
    bodyObject.resultingResidualRiskLevelAfterProposedMitigations = dataObj.resultingResidualRiskLevelAfterProposedMitigations
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'predisposingConditions')) {
    bodyObject.predisposingConditions = dataObj.predisposingConditions
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'threatDescription')) {
    bodyObject.threatDescription = dataObj.threatDescription
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'devicesAffected')) {
    bodyObject.devicesAffected = dataObj.devicesAffected
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'identifiedInCFOAuditOrOtherReview')) {
    bodyObject.identifiedInCFOAuditOrOtherReview = dataObj.identifiedInCFOAuditOrOtherReview
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'personnelResourcesFundedBaseHours')) {
    bodyObject.personnelResourcesFundedBaseHours = dataObj.personnelResourcesFundedBaseHours
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'personnelResourcesCostCode')) {
    bodyObject.personnelResourcesCostCode = dataObj.personnelResourcesCostCode
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'personnelResourcesUnfundedBaseHours')) {
    bodyObject.personnelResourcesUnfundedBaseHours = dataObj.personnelResourcesUnfundedBaseHours
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'personnelResourcesNonfundingObstacle')) {
    bodyObject.personnelResourcesNonfundingObstacle = dataObj.personnelResourcesNonfundingObstacle
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'personnelResourcesNonfundingObstacleOtherReason')) {
    bodyObject.personnelResourcesNonfundingObstacleOtherReason = dataObj.personnelResourcesNonfundingObstacleOtherReason
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'nonPersonnelResourcesFundedAmount')) {
    bodyObject.nonPersonnelResourcesFundedAmount = dataObj.nonPersonnelResourcesFundedAmount
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'nonPersonnelResourcesCostCode')) {
    bodyObject.nonPersonnelResourcesCostCode = dataObj.nonPersonnelResourcesCostCode
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'nonPersonnelResourcesUnfundedAmount')) {
    bodyObject.nonPersonnelResourcesUnfundedAmount = dataObj.nonPersonnelResourcesUnfundedAmount
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'nonPersonnelResourcesNonfundingObstacle')) {
    bodyObject.nonPersonnelResourcesNonfundingObstacle = dataObj.nonPersonnelResourcesNonfundingObstacle
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'nonPersonnelResourcesNonfundingObstacleOtherReason')) {
    bodyObject.nonPersonnelResourcesNonfundingObstacleOtherReason = dataObj.nonPersonnelResourcesNonfundingObstacleOtherReason
  }
}

/**
 * Processes the business logic for POA&M (Plan of Action and Milestones) based on the status field value.
 *
 * @param bodyObject - The object that will be populated with the required fields based on the status.
 * @param dataObj - The input object containing the status and other fields to be validated and processed.
 *
 * The function performs the following checks and operations based on the status:
 *
 * - "Risk Accepted":
 *   - Requires `comments` field.
 *   - Ensures `scheduledCompletionDate` and `milestones` fields are not present.
 *
 * - "Ongoing":
 *   - Requires `scheduledCompletionDate` and `milestones` fields.
 *   - Ensures at least one milestone object has `description` and `scheduledCompletionDate`.
 *
 * - "Completed":
 *   - Requires `scheduledCompletionDate`, `comments`, `completionDate`, and `milestones` fields.
 *
 * - "Not Applicable":
 *   - POAMs cannot be created with this status.
 *
 *
 * If any required fields are missingFields or invalid, the function prints an error message and exits the process.
 *
 * Additionally, if any POC (Point of Contact) information is provided, all POC fields (`pocFirstName`, `pocLastName`, `pocEmail`, `pocPhoneNumber`) are required.
 *
 * @remarks
 * The function uses `printRedMsg` to display error messages and `printHelpMsg` to display help messages.
 * It exits the process with a status code of 1 if any validation fails.
 */
// skipcq: JS-R1005 - Ignore Function cyclomatic complexity high threshold
function processBusinessLogic(bodyObject: Poams, dataObj: Poams): void { // skipcq: JS-0044
  const HELP_MSG = 'Invoke saf emasser post poams [-h, --help] for additional help'
  switch (dataObj.status) {
    case 'Risk Accepted': {
      // Risk Accepted POA&M Item require a comments field
      if (dataObj.comments === undefined) {
        printRedMsg('When status is "Risk Accepted" the following parameter/field is required:')
        printRedMsg('    comments')
        printHelpMsg(HELP_MSG)
        process.exit(1)
      // Risk Accepted POA&M Item cannot be saved with a Scheduled Completion Date or Milestones.
      } else if (Object.prototype.hasOwnProperty.call(dataObj, 'scheduledCompletionDate') || Object.prototype.hasOwnProperty.call(dataObj, 'milestones')) {
        printRedMsg('When status is "Risk Accepted" POA&Ms CAN NOT be saved with the following parameters/fields:')
        printRedMsg('    scheduledCompletionDate, or milestones')
        printHelpMsg(HELP_MSG)
        process.exit(1)
      } else {
        bodyObject.comments = dataObj.comments
      }

      break
    }

    case 'Ongoing': {
      // POA&M Items that have a status of “Ongoing” cannot be saved without Milestones or Scheduled Completion.
      if (!(Object.prototype.hasOwnProperty.call(dataObj, 'scheduledCompletionDate') && Object.prototype.hasOwnProperty.call(dataObj, 'milestones'))) {
        printRedMsg('When status is "Ongoing" the following parameters/fields are required:')
        printRedMsg('    scheduledCompletionDate, milestones')
        printHelpMsg(HELP_MSG)
        process.exit(1)
      // If we have a milestone, ensure the required fields are provided.
      } else if (!(_.some(dataObj.milestones, 'description')) || !(_.some(dataObj.milestones, 'scheduledCompletionDate'))) {
        printRedMsg('Milestone object requires the following fields:')
        printRedMsg('    "milestones": [{"description": "The milestone description", "scheduledCompletionDate": Unix date format }], ')
        process.exit(1)
      } else {
        // Add the POA&M completion date
        bodyObject.scheduledCompletionDate = dataObj.scheduledCompletionDate

        // Add the milestone object
        const milestoneArray: Array<MilestonesGet> = []
        dataObj.milestones?.forEach((milestone: MilestonesGet) => {
          const milestoneObj: MilestonesGet = {}
          milestoneObj.description = milestone.description
          milestoneObj.scheduledCompletionDate = milestone.scheduledCompletionDate
          milestoneArray.push(milestoneObj)
        })
        bodyObject.milestones = [...milestoneArray]
      }

      break
    }

    case 'Completed': {
      // Completed POA&M Item require the completionDate, comments, and Milestones.
      // Given that this is a POST and the POA&M is completed, the scheduledCompletionDate is acceptable
      if (!(Object.prototype.hasOwnProperty.call(dataObj, 'scheduledCompletionDate')) || !(Object.prototype.hasOwnProperty.call(dataObj, 'comments'))
        || !(Object.prototype.hasOwnProperty.call(dataObj, 'completionDate')) || !(Object.prototype.hasOwnProperty.call(dataObj, 'milestones'))) {
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
          milestoneObj.description = milestone.description
          milestoneObj.scheduledCompletionDate = milestone.scheduledCompletionDate
          milestoneArray.push(milestoneObj)
        })
        bodyObject.milestones = [...milestoneArray]
      }

      break
    }

    case 'Not Applicable': {
      printRedMsg('POA&M Item cannot be created manually if a security Control or Assessment Procedure is "Not Applicable".')
      process.exit(1)

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
  let missingFields = ''
  if ((_.get(dataObj, 'pocFirstName') === undefined)) missingFields = 'pocFirstName'
  if ((_.get(dataObj, 'pocLastName') === undefined)) missingFields += (missingFields === '') ? 'pocLastName' : ', pocLastName'
  if ((_.get(dataObj, 'pocEmail') === undefined)) missingFields += (missingFields === '') ? 'pocEmail' : ', pocEmail'
  if ((_.get(dataObj, 'pocPhoneNumber') === undefined)) missingFields += (missingFields === '') ? 'pocPhoneNumber' : ', pocPhoneNumber'
  const totalPocMissingFields = missingFields.split(',').length
  if ((totalPocMissingFields >= 1 && totalPocMissingFields < 4) && missingFields !== '') {
    printRedMsg('If any POC fields are provided (pocFirstName, pocLastName, pocEmail, pocPhoneNumber) than all POC fields are required:')
    printRedMsg(`    Missing field(s): ${missingFields}`)
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

const CMD_HELP = 'saf emasser post poams -h or --help'
export default class EmasserPostPoams extends Command {
  static readonly usage = '<%= command.id %> [FLAGS]\n\x1B[93m NOTE: see EXAMPLES for command usages\x1B[0m'

  static readonly description = 'Add a Plan of Action and Milestones (POA&M) into a systems.\n'
    + 'This CLI expects an input file containing the necessary fields to add a POA&M. The content\n'
    + 'of the file must be in compliance with the eMASS API defined business rules for adding POA&Ms.'

  static readonly examples = [
    '<%= config.bin %> <%= command.id %> [-s,--systemId] [-f,--dataFile]',
    'The input file should be a well formed JSON containing the POA&M information based on defined business rules.',
    '\x1B[1mRequired JSON parameter/fields are:\x1B[0m',
    colorize(JSON.stringify(getJsonExamples('poams-post-required'), null, 2)),
    '\x1B[1mRequired for VA but Conditional for Army and USCG JSON parameters/fields are:\x1B[0m',
    colorize(JSON.stringify(getJsonExamples('poams-post-put-required-va'), null, 2)),
    '\x1B[1mConditional JSON parameters/fields are:\x1B[0m',
    colorize(JSON.stringify(getJsonExamples('poams-post-conditional'), null, 2)),
    '\x1B[1mOptional JSON parameters/fields are:\x1B[0m',
    colorize(JSON.stringify(getJsonExamples('poams-post-put-optional'), null, 2)),
    '\x1B[1m\x1B[32mAll accepted parameters/fields are:\x1B[0m',
    colorize(getAllJsonExamples()),
  ]

  static readonly flags = {
    help: Flags.help({char: 'h', description: 'Show eMASSer CLI help for the POST POA&Ms command'}),
    ...getFlagsForEndpoint(process.argv) as FlagOptions, // skipcq: JS-0349
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(EmasserPostPoams)
    const apiCxn = new ApiConnection()
    const addPoam = new POAMApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)

    const requestBodyArray: Poams[] = []

    // Check if a POA&Ms json file was provided
    if (fs.existsSync(flags.dataFile)) {
      let data
      try {
        data = JSON.parse(await readFile(flags.dataFile, 'utf8'))
      } catch (error: unknown) {
        console.error('\x1B[91m» Error reading POA&Ms data file, possible malformed json. Please use the -h flag for help.\x1B[0m')
        console.error('\x1B[93m→ Error message was:', getErrorMessage(error), '\x1B[0m')
        process.exit(1)
      }

      // POA&Ms json file provided, check if we have multiple POA&Ms to process
      if (Array.isArray(data)) {
        data.forEach((dataObject: Poams) => {
          // Generate the post request object based on business logic
          requestBodyArray.push(generateBodyObj(dataObject))
        })
      } else if (typeof data === 'object') {
        const dataObject: Poams = data
        // Generate the post request object based on business logic
        requestBodyArray.push(generateBodyObj(dataObject))
      }
    } else {
      console.error('\x1B[91m» POA&M(s) data file (.json) not found or invalid:', flags.dataFile, '\x1B[0m')
      process.exit(1)
    }

    // Call the endpoint
    addPoam.addPoamBySystemId(flags.systemId, requestBodyArray).then((response: PoamResponsePostPutDelete) => {
      console.log(colorize(outputFormat(response, false)))
    }).catch((error: unknown) => displayError(error, 'POA&Ms'))
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
