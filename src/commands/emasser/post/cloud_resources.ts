import {colorize} from 'json-colorizer'
import {Command, Flags} from '@oclif/core'
import {CloudResourceResultsApi} from '@mitre/emass_client'
import {CloudResourcesResponsePost} from '@mitre/emass_client/dist/api'
import {ApiConnection} from '../../../utils/emasser/apiConnection'
import {outputFormat} from '../../../utils/emasser/outputFormatter'
import {FlagOptions, getFlagsForEndpoint, getJsonExamples, printRedMsg} from '../../../utils/emasser/utilities'
import {outputError} from '../../../utils/emasser/outputError'
import {readFile} from 'fs/promises'
import _ from 'lodash'
import fs from 'fs'

interface CloudResource {
  // Required
  provider: string,
  resourceId: string,
  resourceName: string,
  resourceType: string,
  complianceResults: ComplianceResults[]
  // Optional
  cspAccountId?: string,
  cspRegion?: string,
  initiatedBy?: string,
  isBaseline?: boolean,
  tags?: Tags|any,
}

interface Tags {
  [key: string]: string;
}

interface ComplianceResults {
  // Required
  cspPolicyDefinitionId: string,
  isCompliant: boolean,
  policyDefinitionTitle: string,
  // Optional
  assessmentProcedure?: string,
  complianceCheckTimestamp?: number,
  complianceReason?: string,
  control?: string,
  policyDeploymentName?: string,
  policyDeploymentVersion?: string,
  severity?: string
}

function getAllJsonExamples(): string {
  return JSON.stringify(
    _.merge({},
      getJsonExamples('cloud_resources-required'),
      getJsonExamples('cloud_resources-optional'),
    ),
  )
}

function assertParamExists(object: string, value: string|boolean|undefined|null): void {
  if (value === undefined) {
    printRedMsg(`Missing required parameter/field: ${object}`)
    throw new Error('Value not defined')
  }
}

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
  if (Object.prototype.hasOwnProperty.call(dataObj, 'tags')) {
    const tagsObj: Tags = {};
    (Object.keys(dataObj.tags) as (keyof typeof dataObj.tags)[]).forEach(key => {
      tagsObj[key.toString()] = dataObj.tags[key]
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

const CMD_HELP = 'saf emasser post cloud_resources -h or --help'
export default class EmasserPostCloudResources extends Command {
  static usage = '<%= command.id %> [options]'

  static description = 'Add a cloud resource and their scan results in the assets module for a system'

  static examples = [
    '<%= config.bin %> <%= command.id %> [-s,--systemId] [-f,--dataFile]',
    'The input file should be a well formed JSON containing the cloud resources and their scan results information.',
    'Required JSON parameter/fields are: ',
    colorize(JSON.stringify(getJsonExamples('cloud_resources-required'), null, 2)),
    'Optional JSON parameters/fields are:',
    colorize(JSON.stringify(getJsonExamples('cloud_resources-optional'), null, 2)),
    '\x1B[1m\x1B[32mAll accepted parameters/fields are:\x1B[0m',
    colorize(getAllJsonExamples()),
  ]

  static flags = {
    help: Flags.help({char: 'h', description: 'Post (add) cloud resources and their scan results in the assets module for a system'}),
    ...getFlagsForEndpoint(process.argv) as FlagOptions, // skipcq: JS-0349
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(EmasserPostCloudResources)
    const apiCxn = new ApiConnection()
    const addCloudResource = new CloudResourceResultsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)

    const requestBodyArray: CloudResource[] = []

    // Check if a Cloud Resource json file was provided
    if (fs.existsSync(flags.dataFile)) {
      let data: any
      try {
        data = JSON.parse(await readFile(flags.dataFile, 'utf8'))
      } catch (error: any) {
        console.error('\x1B[91m» Error reading Cloud Resource data file, possible malformed json. Please use the -h flag for help.\x1B[0m')
        console.error('\x1B[93m→ Error message was:', error.message, '\x1B[0m')
        process.exit(1)
      }

      // Create request body based on key/pair values provide in the input file
      if (Array.isArray(data)) {
        data.forEach((dataObject: CloudResource) => {
          let bodyObj: CloudResource = {
            provider: '',
            resourceId: '',
            resourceName: '',
            resourceType: '',
            complianceResults: [],
          }
          // Add required fields to request array object based on business logic
          try {
            bodyObj = addRequiredFieldsToRequestBody(dataObject)
            addOptionalFields(bodyObj, dataObject)
            requestBodyArray.push(bodyObj)
          } catch {
            process.exit(1)
          }
        })
      } else if (typeof data === 'object') {
        const dataObject: CloudResource = data
        let bodyObj: CloudResource = {
          provider: '',
          resourceId: '',
          resourceName: '',
          resourceType: '',
          complianceResults: [],
        }
        // Add required fields to request array object based on business logic
        try {
          bodyObj = addRequiredFieldsToRequestBody(dataObject)
          addOptionalFields(bodyObj, dataObject)
          requestBodyArray.push(bodyObj)
        } catch {
          process.exit(1)
        }
      }
    } else {
      console.error('\x1B[91m» Cloud Resource data file (.json) not found or invalid:', flags.dataFile, '\x1B[0m')
      process.exit(1)
    }

    // Call the endpoint
    addCloudResource.addCloudResourcesBySystemId(flags.systemId, requestBodyArray).then((response: CloudResourcesResponsePost) => {
      console.log(colorize(outputFormat(response, false)))
    }).catch((error:any) => console.error(colorize(outputError(error))))
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
