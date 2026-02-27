import fs from 'fs';
import _ from 'lodash';
import { readFile } from 'fs/promises';
import { colorize } from 'json-colorizer';
import { Command, Flags } from '@oclif/core';

import { ApiConnection } from '../../../utils/emasser/apiConnection';
import { outputFormat } from '../../../utils/emasser/outputFormatter';
import { displayError, FlagOptions, getFlagsForEndpoint, getJsonExamples, printRedMsg } from '../../../utils/emasser/utilities';

import { StaticCodeScansApi } from '@mitre/emass_client';
import {
  StaticCodeApplicationPost, StaticCodeResponsePost,
  StaticCodeRequestPostBody as StaticCodeRequest,
  StaticCodeRequestPostBodyApplication as ApplicationRequestBody,
} from '@mitre/emass_client/dist/api';

/**
 * Generates a JSON string based on the provided action.
 *
 * @param action - The action to determine which JSON examples to merge.
 *                 Valid values are 'add' and 'clear'.
 *                 - 'add': Merges 'scan_findings-application' and 'scan_findings-applicationFindings'.
 *                 - 'clear': Merges 'scan_findings-application' and 'scan_findings-clearFindings'.
 * @returns A JSON string representing the merged examples for the specified action.
 *          Returns an empty string if the action is not recognized.
 */
function getAllJsonExamples(action: string): string {
  if (action === 'add') {
    return JSON.stringify(
      _.merge({},
        getJsonExamples('scan_findings-application'),
        getJsonExamples('scan_findings-applicationFindings'),
      ),
    );
  }

  if (action === 'clear') {
    return JSON.stringify(
      _.merge({},
        getJsonExamples('scan_findings-application'),
        getJsonExamples('scan_findings-clearFindings'),
      ),
    );
  }

  return '';
}

/**
 * Asserts that a parameter exists and is not undefined.
 *
 * @param {string} object - The name of the parameter or field being checked.
 * @param {string | boolean | number | undefined | null} value - The value of the parameter or field to check.
 * @throws {Error} Throws an error if the value is undefined.
 */
function assertParamExists(object: string, value: string | boolean | number | undefined | null): void {
  if (value === undefined) {
    printRedMsg(`Missing required parameter/field: ${object}`);
    throw new Error('Value not defined');
  }
}

/**
 * Adds application details to the request body for a static code scan.
 *
 * @param {StaticCodeRequest} dataObj - The input data object containing application details.
 * @returns {StaticCodeRequest} The request body with the application details added.
 * @throws Will throw an error if required application details are missing.
 */
function addApplicationToRequestBody(dataObj: StaticCodeRequest): StaticCodeRequest {
  const bodyObj: ApplicationRequestBody = { applicationName: '', version: '' };
  const requestBody: StaticCodeRequest = {};

  try {
    assertParamExists('application.applicationName', dataObj.application?.applicationName);
    assertParamExists('application.version', dataObj.application?.version);
  } catch (error) {
    console.log('Required JSON fields are:');
    console.log(colorize(JSON.stringify(getJsonExamples('scan_findings-application'), null, 2)));
    throw error;
  }

  bodyObj.applicationName = dataObj.application?.applicationName;
  bodyObj.version = dataObj.application?.version;

  requestBody.application = bodyObj;

  return requestBody;
}

/**
 * Adds application findings fields from the data object to the body object.
 *
 * @param bodyObject - The object to which the application findings will be added.
 * @param dataObj - The object containing the application findings data.
 *
 * @throws Will throw an error if required fields are missing in the application findings.
 *
 * The function processes each finding in the `dataObj.applicationFindings` array.
 * If a finding has the `clearFindings` property, it adds it directly to the `findingsArray`.
 * Otherwise, it validates the presence of required fields (`codeCheckName`, `count`,
 * `cweId`, `scanDate`) and optionally includes the `rawSeverity` field if present.
 *
 * The processed findings are then added to the `bodyObject.applicationFindings` array.
 */
function addApplicationFindingsFields(bodyObject: StaticCodeRequest, dataObj: StaticCodeRequest): void {
  const findingsArray: StaticCodeApplicationPost[] = [];

  try {
    let findingsObj: StaticCodeApplicationPost = {};
    let i = 0;
    dataObj.applicationFindings?.forEach((appFindings: StaticCodeApplicationPost) => {
      // If clearing findings
      if (Object.prototype.hasOwnProperty.call(appFindings, 'clearFindings')) {
        findingsObj.clearFindings = appFindings.clearFindings;
        findingsArray.push(findingsObj);
      // Adding findings
      } else {
        assertParamExists(`applicationFindings[${i}].codeCheckName`, appFindings.codeCheckName);
        assertParamExists(`applicationFindings[${i}].count`, appFindings.count);
        assertParamExists(`applicationFindings[${i}].cweId`, appFindings.cweId);
        assertParamExists(`applicationFindings[${i}].scanDate`, appFindings.scanDate);
        i++;

        findingsObj.codeCheckName = appFindings.codeCheckName;
        findingsObj.count = appFindings.count;
        findingsObj.cweId = appFindings.cweId;
        findingsObj.scanDate = appFindings.scanDate;

        // rawSeverity is an optional field
        if (Object.prototype.hasOwnProperty.call(appFindings, 'rawSeverity')) {
          findingsObj.rawSeverity = appFindings.rawSeverity;
        }

        findingsArray.push(findingsObj);
        findingsObj = {};
      }
    });
  } catch (error) {
    console.log('Required JSON fields are:');
    console.log(colorize(JSON.stringify(getJsonExamples('scan_findings-applicationFindings'), null, 2)));
    throw error;
  }

  bodyObject.applicationFindings = findingsArray;
}

const CMD_HELP = 'saf emasser post static_code_scans -h or --help';
export default class EmasserPostStaticCodeScans extends Command {
  static readonly usage = '<%= command.id %> [FLAGS]\n\u001B[93m NOTE: see EXAMPLES for command usages\u001B[0m';

  static readonly description = "Upload application scan findings into a system's assets module";

  static readonly examples = [
    '<%= config.bin %> <%= command.id %> [-s,--systemId] [-f,--dataFile]',
    'The input file should be a well formed JSON containing static code scan findings.',
    '\u001B[1m\u001B[46mAdd Findings\u001B[0m',
    'Required "application" JSON object parameter/fields are: ',
    colorize(JSON.stringify(getJsonExamples('scan_findings-application'), null, 2)),
    'Required "applicationFindings" JSON array parameters/fields are:',
    colorize(JSON.stringify(getJsonExamples('scan_findings-applicationFindings'), null, 2)),
    '\u001B[1m\u001B[32mAll accepted parameters/fields are:\u001B[0m',
    colorize(getAllJsonExamples('add')),
    '\u001B[1m\u001B[46mClear Findings\u001B[0m \u001B[33m(can only be used on a single application with a single finding)\u001B[0m',
    'Required "application" JSON object parameter/fields are: ',
    colorize(JSON.stringify(getJsonExamples('scan_findings-application'), null, 2)),
    'Required "applicationFindings" JSON array object field(s):',
    colorize(JSON.stringify(getJsonExamples('scan_findings-clearFindings'), null, 2)),
    '\u001B[1m\u001B[32mAll accepted parameters/fields are:\u001B[0m',
    colorize(getAllJsonExamples('clear')),
  ];

  static readonly flags = {
    help: Flags.help({ char: 'h', description: 'Show eMASSer CLI help for the POST Static Code Scans command' }),
    ...getFlagsForEndpoint(process.argv) as FlagOptions, // skipcq: JS-0349
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(EmasserPostStaticCodeScans);
    const apiCxn = new ApiConnection();
    const addStaticCodeScans = new StaticCodeScansApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances);

    const requestBodyArray: StaticCodeRequest[] = [];

    // Check if a Cloud Resource json file was provided
    if (fs.existsSync(flags.dataFile)) {
      let data: unknown;
      try {
        const fileContent = await readFile(flags.dataFile, 'utf8');
        data = JSON.parse(fileContent);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error('\u001B[91m» Error reading Static Code Scans data file, possible malformed JSON. Please use the -h flag for help.\u001B[0m');
          console.error('\u001B[93m→ Error message was:', error.message, '\u001B[0m');
        } else {
          console.error('\u001B[91m» Unknown error occurred while reading the file:', flags.dataFile, '\u001B[0m');
        }
        process.exit(1);
      }

      // Ensure `data` is either an array or object before using it
      if (!data || (typeof data !== 'object' && !Array.isArray(data))) {
        console.error('\u001B[91m» Invalid data format: Expected an object or array.\u001B[0m');
        process.exit(1);
      }

      // Create request body based on key/pair values provide in the input file
      if (Array.isArray(data)) {
        for (const item of data) {
          if (typeof item !== 'object' || item === null) {
            console.error('\u001B[91m» Invalid item in array: Expected an object.\u001B[0m');
            process.exit(1);
          }

          let bodyObj: StaticCodeRequest = {} as StaticCodeRequest;
          try {
            bodyObj = addApplicationToRequestBody(item as StaticCodeRequest);
            addApplicationFindingsFields(bodyObj, item as StaticCodeRequest);
            requestBodyArray.push(bodyObj);
          } catch {
            process.exit(1);
          }
        }
      } else if (typeof data === 'object') {
        // Ensure it's a valid object
        const dataObject = data as StaticCodeRequest;
        let bodyObj: StaticCodeRequest = {} as StaticCodeRequest;
        try {
          bodyObj = addApplicationToRequestBody(dataObject);
          addApplicationFindingsFields(bodyObj, dataObject);
          requestBodyArray.push(bodyObj);
        } catch {
          process.exit(1);
        }
      }
    } else {
      console.error('\u001B[91m» Static Code Scans data file (.json) not found or invalid:', flags.dataFile, '\u001B[0m');
      process.exit(1);
    }

    // Call the API endpoint
    addStaticCodeScans.addStaticCodeScansBySystemId(flags.systemId, requestBodyArray).then((response: StaticCodeResponsePost) => {
      console.log(colorize(outputFormat(response, false)));
    }).catch((error: unknown) => displayError(error, 'Static Code Scans'));
  }

  // skipcq: JS-0116 - Base class (CommandError) expects expected catch to return a Promise
  protected async catch(err: Error & { exitCode?: number }): Promise<void> {
    // If error message is for missing flags, display
    // what fields are required, otherwise show the error
    if (err.message.includes('See more help with --help')) {
      this.warn(err.message.replace('with --help', `with: \u001B[93m${CMD_HELP}\u001B[0m`));
    } else {
      this.warn(err);
    }
  }
}
