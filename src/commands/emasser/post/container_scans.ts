import colorize from 'json-colorizer'
import {Command, Flags} from '@oclif/core'
import {ContainersApi} from '@mitre/emass_client'
import {ContainersResponsePost} from '@mitre/emass_client/dist/api'
import {ApiConnection} from '../../../utils/emasser/apiConnection'
import {outputFormat} from '../../../utils/emasser/outputFormatter'
import {FlagOptions, getFlagsForEndpoint, getJsonExamples} from '../../../utils/emasser/utilities'
import {outputError} from '../../../utils/emasser/outputError'
import {readFile} from 'fs/promises'
import _ from 'lodash'
import fs from 'fs'

interface ContainerResource {
  containerId: string,
  containerName: string,
  podName?: string,
  podIp?: string,
  namespace?: string,
  time: number,
  tags?: Tags|any,
  benchmarks: Benchmarks[]
}

interface Tags {
  [key: string]: string;
}

interface Benchmarks {
  benchmark: string,
  isBaseline?: boolean,
  results: Results[],
}

interface Results {
  ruleId: string,
  status: StatusEnum,
  lastSeen: number,
  message?: string,
}

export declare const StatusEnum: {
  readonly Pass: 'Pass';
  readonly Fail: 'Fail';
  readonly Other: 'Other';
  readonly NotReviewed: 'Not Reviewed';
  readonly NotChecked: 'Not Checked';
  readonly NotApplicable: 'Not Applicable';
}
export declare type StatusEnum = typeof StatusEnum[keyof typeof StatusEnum];

function printRedMsg(msg: string) {
  console.log('\x1B[91m', msg, '\x1B[0m')
}

function assertParamExists(object: string, value: string|boolean|number|undefined|null): void {
  if (value === undefined) {
    printRedMsg(`Missing required parameter/field: ${object}`)
    throw new Error('Value not defined')
  }
}

function addRequiredFieldsToRequestBody(dataObj: ContainerResource): ContainerResource {
  const bodyObj: ContainerResource = {
    containerId: '',
    containerName: '',
    time: 0,
    benchmarks: [],
  }
  const benchmarksArray: Benchmarks[] = []
  const resultsArray: Results[] = []
  try {
    assertParamExists('containerId', dataObj.containerId)
    assertParamExists('containerName', dataObj.containerName)
    assertParamExists('time', dataObj.time)

    let i = 0
    let j = 0
    dataObj.benchmarks.forEach((entryObject: Benchmarks) => {
      assertParamExists(`benchmarks[${i}].benchmark`, entryObject.benchmark)

      entryObject.results.forEach((resultObj: Results) => {
        assertParamExists(`benchmarks.results[${j}].ruleId`, resultObj.ruleId)
        assertParamExists(`benchmarks.results[${j}].lastSeen`, resultObj.lastSeen)
        assertParamExists(`benchmarks.results[${j}].status`, resultObj.status)
        j++

        const resultsObj: Results = {
          ruleId: '',
          status: 'Pass',
          lastSeen: 0,
        }
        resultsObj.ruleId = resultObj.ruleId
        resultsObj.lastSeen = resultObj.lastSeen
        resultsObj.status = resultObj.status
        resultsArray.push(resultsObj)
      })

      i++
      const benchMarksObj: Benchmarks = {
        benchmark: '',
        results: [],
      }
      benchMarksObj.benchmark = entryObject.benchmark
      benchMarksObj.results = resultsArray
      benchmarksArray.push(benchMarksObj)
    })
  } catch (error) {
    console.log('Required JSON fields are:')
    console.log(colorize(JSON.stringify(getJsonExamples('container_scans-required'), null, 2)))
    throw error
  }

  bodyObj.containerId = dataObj.containerId
  bodyObj.containerName = dataObj.containerName
  bodyObj.time = dataObj.time
  bodyObj.benchmarks = benchmarksArray

  return bodyObj
}

function addOptionalFields(bodyObject: ContainerResource, dataObj: ContainerResource): void {
  // Add object optional entries
  if (Object.prototype.hasOwnProperty.call(dataObj, 'namespace')) {
    bodyObject.namespace = dataObj.namespace
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'podIp')) {
    bodyObject.podIp = dataObj.podIp
  }

  if (Object.prototype.hasOwnProperty.call(dataObj, 'podName')) {
    bodyObject.podName = dataObj.podName
  }

  // Add optional tags objects if available
  if (Object.prototype.hasOwnProperty.call(dataObj, 'tags')) {
    const tagsObj: Tags = {};
    (Object.keys(dataObj.tags) as (keyof typeof dataObj.tags)[]).forEach(key => {
      tagsObj[key.toString()] = dataObj.tags[key]
    })
    bodyObject.tags = tagsObj
  }

  const benchmarksArray: Benchmarks[] = []
  const resultsArray: Results[] = []
  // Add the optional benchmark entries
  dataObj.benchmarks.forEach((entryObject: Benchmarks) => {
    const benchmarksObj: Benchmarks = {
      benchmark: '',
      results: [],
    }
    // These are required
    benchmarksObj.benchmark = entryObject.benchmark
    // Check for the optional entry
    if (Object.prototype.hasOwnProperty.call(entryObject, 'isBaseline')) {
      benchmarksObj.isBaseline = entryObject.isBaseline
    }

    // Add the optional results entries
    entryObject.results.forEach((resultObj: Results) => {
      const resultsObj: Results = {
        ruleId: '',
        status: 'Pass',
        lastSeen: 0,
      }
      // These are required
      resultsObj.ruleId = resultObj.ruleId
      resultsObj.status = resultObj.status
      resultsObj.lastSeen = resultObj.lastSeen
      // Check for the optional entry
      if (Object.prototype.hasOwnProperty.call(resultObj, 'isBaseline')) {
        resultsObj.message = resultObj.message
      }

      resultsArray.push(resultsObj)
    })
    benchmarksObj.results = resultsArray
    benchmarksArray.push(benchmarksObj)
  })

  bodyObject.benchmarks = benchmarksArray
}

export default class EmasserContainerScans extends Command {
  static usage = '<%= command.id %> [ARGUMENTS]'

  static description = 'Upload containers and their scan results in the assets module for a system'

  static examples = ['<%= config.bin %> <%= command.id %> [-s,--systemId] [-f,--containerCodeScanFile]',
    'The input file should be a well formed JSON containing the container scan results information.',
    'Required JSON parameter/fields are: ',
    colorize(JSON.stringify(getJsonExamples('container_scans-required'), null, 2)),
    'Optional JSON parameters/fields are:',
    colorize(JSON.stringify(getJsonExamples('container_scans-optional'), null, 2))]

  static flags = {
    help: Flags.help({char: 'h', description: 'Post (upload) one or many containers and their scan results for a system'}),
    ...getFlagsForEndpoint(process.argv) as FlagOptions, // skipcq: JS-0349
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(EmasserContainerScans)
    const apiCxn = new ApiConnection()
    const addContainer = new ContainersApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)

    const requestBodyArray: ContainerResource[] = []

    // Check if a Cloud Resource json file was provided
    if (fs.existsSync(flags.containerCodeScanFile)) {
      let data: any
      try {
        data = JSON.parse(await readFile(flags.containerCodeScanFile, 'utf8'))
      } catch (error: any) {
        if (error.code === 'ENOENT') {
          console.log('Container Scan Results JSON file not found!')
          process.exit(1)
        } else {
          console.log('Error reading Container Scan Results file, possible malformed json. Please use the -h flag for help.')
          console.log('Error message was:', error.message)
          process.exit(1)
        }
      }

      // Create request body based on key/pair values provide in the input file
      if (Array.isArray(data)) {
        data.forEach((dataObject: ContainerResource) => {
          let bodyObj: ContainerResource = {
            containerId: '',
            containerName: '',
            time: 0,
            benchmarks: [],
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
        const dataObject: ContainerResource = data
        let bodyObj: ContainerResource = {
          containerId: '',
          containerName: '',
          time: 0,
          benchmarks: [],
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
      console.error('Invalid or Container Scan Results JSON file not found on the provided directory:', flags.containerCodeScanFile)
      process.exit(1)
    }

    addContainer.addContainerSansBySystemId(flags.systemId, requestBodyArray).then((response: ContainersResponsePost) => {
      console.log(colorize(outputFormat(response, false)))
    }).catch((error:any) => console.error(colorize(outputError(error))))
  }
}
