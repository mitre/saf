import colorize from 'json-colorizer'
import {Command, Flags} from '@oclif/core'
import {CloudResourceResultsApi} from '@mitre/emass_client'
import {CloudResourcesResponsePost} from '@mitre/emass_client/dist/api'
import {ApiConnection} from '../../../utils/emasser/apiConnection'
import {outputFormat} from '../../../utils/emasser/outputFormatter'
import {FlagOptions, getFlagsForEndpoint, getJsonExamples} from '../../../utils/emasser/utilities'
import {outputError} from '../../../utils/emasser/outputError'
import {readFile} from 'fs/promises'
import _ from 'lodash'
import fs from 'fs'

interface CloudResource {
  provider: string,
  resourceId: string,
  resourceName: string,
  resourceType: string,
  cspAccountId?: string,
  cspRegion?: string,
  initiatedBy?: string,
  isBaseline?: boolean,
  tags?: Tags|any,
  complianceResults: ComplianceResults[]
}

interface Tags {
  [key: string]: string;
}

interface ComplianceResults {
  cspPolicyDefinitionId: string,
  isCompliant: boolean,
  policyDefinitionTitle: string,
  assessmentProcedure?: string,
  complianceCheckTimestamp?: string,
  complianceReason?: string,
  control?: string,
  policyDeploymentName?: string,
  policyDeploymentVersion?: string,
  severity?: string
}

function printRedMsg(msg: string) {
  console.log('\x1B[91m', msg, '\x1B[0m')
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

export default class EmasserPostCloudResources extends Command {
  static usage = '<%= command.id %> [options]'

  static description = 'Add a cloud resource and their scan results in the assets module for a system'

  static examples = ['<%= config.bin %> <%= command.id %> [-s,--systemId] [-f,--cloudResourceFile]',
    'The input file should be a well formed JSON containing the cloud resources and their scan results information.',
    'Required JSON parameter/fields are: ',
    colorize(JSON.stringify(getJsonExamples('cloud_resources-required'), null, 2)),
    'Optional JSON parameters/fields are:',
    colorize(JSON.stringify(getJsonExamples('cloud_resources-optional'), null, 2))]

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
    if (fs.existsSync(flags.cloudResourceFile)) {
      let data: any
      try {
        data = JSON.parse(await readFile(flags.cloudResourceFile, 'utf8'))
      } catch (error: any) {
        if (error.code === 'ENOENT') {
          console.log('Cloud Resource JSON file not found!')
          process.exit(1)
        } else {
          console.log('Error reading Cloud Resource file, possible malformed json. Please use the -h flag for help.')
          console.log('Error message was:', error.message)
          process.exit(1)
        }
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
      console.error('Invalid or Cloud Resource JSON file not found on the provided directory:', flags.cloudResourceFile)
      process.exit(1)
    }

    addCloudResource.addCloudResourcesBySystemId(flags.systemId, requestBodyArray).then((response: CloudResourcesResponsePost) => {
      console.log(colorize(outputFormat(response, false)))
    }).catch((error:any) => console.error(colorize(outputError(error))))
  }
}
