import fs from 'fs'
import _ from 'lodash'
import {readFile} from 'fs/promises'
import colorize from 'json-colorizer'
import {Command, Flags} from '@oclif/core'

import {outputError} from '../../../utils/emasser/outputError'
import {ApiConnection} from '../../../utils/emasser/apiConnection'
import {outputFormat} from '../../../utils/emasser/outputFormatter'
import {FlagOptions, getFlagsForEndpoint, getJsonExamples} from '../../../utils/emasser/utilities'

import {StaticCodeScansApi} from '@mitre/emass_client'
import {StaticCodeApplication, StaticCodeResponsePost,
  StaticCodeRequestPostBody as StaticCodeRequest,
  StaticCodeRequestPostBodyApplication as ApplicationRequestBody} from '@mitre/emass_client/dist/api'

function printRedMsg(msg: string) {
  console.log('\x1B[91m', msg, '\x1B[0m')
}

function assertParamExists(object: string, value: string|boolean|number|undefined|null): void {
  if (value === undefined) {
    printRedMsg(`Missing required parameter/field: ${object}`)
    throw new Error('Value not defined')
  }
}

function addApplicationToRequestBody(dataObj: StaticCodeRequest): StaticCodeRequest {
  const bodyObj: ApplicationRequestBody = {
    applicationName: '',
    version: '',
  }
  const requestBody: StaticCodeRequest = {}

  try {
    assertParamExists('application.applicationName', dataObj.application?.applicationName)
    assertParamExists('application.version', dataObj.application?.version)
  } catch (error) {
    console.log('Required JSON fields are:')
    console.log(colorize(JSON.stringify(getJsonExamples('scan_findings-application'), null, 2)))
    throw error
  }

  bodyObj.applicationName = dataObj.application?.applicationName
  bodyObj.version = dataObj.application?.version

  requestBody.application = bodyObj

  return requestBody
}

function addApplicationFindingsFields(bodyObject: StaticCodeRequest, dataObj: StaticCodeRequest): void {
  const findingsArray: StaticCodeApplication[] = []

  try {
    let findingsObj: StaticCodeApplication = {}
    let i = 0
    dataObj.applicationFindings?.forEach((appFindings: StaticCodeApplication) => {
      if (Object.prototype.hasOwnProperty.call(appFindings, 'clearFindings')) {
        findingsObj.clearFindings = appFindings.clearFindings
        findingsArray.push(findingsObj)
      } else {
        assertParamExists(`applicationFindings[${i}].codeCheckName`, appFindings.codeCheckName)
        assertParamExists(`applicationFindings[${i}].count`, appFindings.count)
        assertParamExists(`applicationFindings[${i}].cweId`, appFindings.cweId)
        assertParamExists(`applicationFindings[${i}].scanDate`, appFindings.scanDate)
        i++

        findingsObj.codeCheckName = appFindings.codeCheckName
        findingsObj.count = appFindings.count
        findingsObj.cweId = appFindings.cweId
        findingsObj.scanDate = appFindings.scanDate

        // rawSeverity is an optional field
        if (Object.prototype.hasOwnProperty.call(appFindings, 'rawSeverity')) {
          findingsObj.rawSeverity = appFindings.rawSeverity
        }

        findingsArray.push(findingsObj)
        findingsObj = {}
      }
    })
  } catch (error) {
    console.log('Required JSON fields are:')
    console.log(colorize(JSON.stringify(getJsonExamples('scan_findings-applicationFindings'), null, 2)))
    throw error
  }

  bodyObject.applicationFindings = findingsArray
}

export default class EmasserPostStaticCodeScans extends Command {
  static usage = '<%= command.id %> [options]'

  static description = "upload application scan findings into a system's assets module"

  static examples = ['<%= config.bin %> <%= command.id %> [-s,--systemId] [-f,--cloudResourceFile]',
    'The input file should be a well formed JSON containing application scan findings.',
    'Required "application" JSON object parameter/fields are: ',
    colorize(JSON.stringify(getJsonExamples('scan_findings-application'), null, 2)),
    'Required "applicationFindings" JSON array parameters/fields are:',
    colorize(JSON.stringify(getJsonExamples('scan_findings-applicationFindings'), null, 2)),
    'Required "applicationFindings" JSON array for clearing findings for an application is:',
    colorize(JSON.stringify(getJsonExamples('scan_findings-clearFindings'), null, 2))]

  static flags = {
    help: Flags.help({char: 'h', description: 'Post (upload) static code scans, can also clear application\'s findings'}),
    ...getFlagsForEndpoint(process.argv) as FlagOptions, // skipcq: JS-0349
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(EmasserPostStaticCodeScans)
    const apiCxn = new ApiConnection()
    const addStaticCodeScans = new StaticCodeScansApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)

    const requestBodyArray: StaticCodeRequest[] = []

    // Check if a Cloud Resource json file was provided
    if (fs.existsSync(flags.statiCodeScanFile)) {
      let data: any
      try {
        data = JSON.parse(await readFile(flags.statiCodeScanFile, 'utf8'))
      } catch (error: any) {
        if (error.code === 'ENOENT') {
          console.log('Scan Findings JSON file not found!')
          process.exit(1)
        } else {
          console.log('Error reading Scan Findings file, possible malformed json. Please use the -h flag for help.')
          console.log('Error message was:', error.message)
          process.exit(1)
        }
      }

      // Create request body based on key/pair values provide in the input file
      if (Array.isArray(data)) {
        data.forEach((dataObject: StaticCodeRequest) => {
          let bodyObj: StaticCodeRequest = {}
          // Add required fields to request array object based on business logic
          try {
            bodyObj = addApplicationToRequestBody(dataObject)
            addApplicationFindingsFields(bodyObj, dataObject)
            requestBodyArray.push(bodyObj)
          } catch {
            process.exit(1)
          }
        })
      } else if (typeof data === 'object') {
        const dataObject: StaticCodeRequest = data
        let bodyObj: StaticCodeRequest = {}
        // Add required fields to request array object based on business logic
        try {
          bodyObj = addApplicationToRequestBody(dataObject)
          addApplicationFindingsFields(bodyObj, dataObject)
          requestBodyArray.push(bodyObj)
        } catch {
          process.exit(1)
        }
      }
    } else {
      console.error('Invalid or Scan Findings JSON file not found on the provided directory:', flags.statiCodeScanFile)
      process.exit(1)
    }

    addStaticCodeScans.addStaticCodeScansBySystemId(flags.systemId, requestBodyArray).then((response: StaticCodeResponsePost) => {
      console.log(colorize(outputFormat(response, false)))
    }).catch((error:any) => console.error(colorize(outputError(error))))
  }
}
