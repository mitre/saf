import fs from 'fs';
import { readFile } from 'fs/promises';
import { ArtifactsApi } from '@mitre/emass_client';
import type { ArtifactsResponseGetDataInner as Artifacts, ArtifactsResponsePutPost } from '@mitre/emass_client/dist/api';
import { Command, Flags } from '@oclif/core';
import { colorize } from 'json-colorizer';
import _ from 'lodash';
import { ApiConnection } from '../../../utils/emasser/api_connection';
import { outputFormat } from '../../../utils/emasser/output_formatter';
import { displayError, getFlagsForEndpoint, getJsonExamples, printRedMsg } from '../../../utils/emasser/utilities';

function getAllJsonExamples(): Record<string, unknown> {
  return {
    ...getJsonExamples('artifacts-put-required'),
    ...getJsonExamples('artifacts-put-optional'),
  };
}

function assertParamExists(object: string, value: string | number | boolean | undefined | null): void {
  if (value === undefined) {
    printRedMsg(`Missing required parameter/field: ${object}`);
    throw new Error('Value not defined');
  }
}

function addRequiredFieldsToRequestBody(dataObj: Artifacts): Artifacts {
  const bodyObj: Artifacts = {};
  try {
    assertParamExists('filename', dataObj.filename);
    assertParamExists('isTemplate', dataObj.isTemplate);
    assertParamExists('type', dataObj.type);
    assertParamExists('category', dataObj.category);
  } catch (error) {
    console.log('Required JSON fields are:');
    console.log(colorize(JSON.stringify(getJsonExamples('artifacts-put-required'), null, 2)));
    throw error;
  }

  bodyObj.filename = dataObj.filename;
  bodyObj.isTemplate = dataObj.isTemplate;
  bodyObj.type = dataObj.type;
  bodyObj.category = dataObj.category;

  return bodyObj;
}

function addOptionalFields(bodyObject: Artifacts, dataObj: Artifacts): void {
  if (Object.hasOwn(dataObj, 'name')) {
    bodyObject.name = dataObj.name;
  }

  if (Object.hasOwn(dataObj, 'description')) {
    bodyObject.description = dataObj.description;
  }

  if (Object.hasOwn(dataObj, 'referencePageNumber')) {
    bodyObject.referencePageNumber = dataObj.referencePageNumber;
  }

  if (Object.hasOwn(dataObj, 'controls')) {
    bodyObject.controls = dataObj.controls;
  }

  if (Object.hasOwn(dataObj, 'assessmentProcedures')) {
    bodyObject.assessmentProcedures = dataObj.assessmentProcedures;
  }

  if (Object.hasOwn(dataObj, 'expirationDate')) {
    bodyObject.expirationDate = dataObj.expirationDate;
  }

  if (Object.hasOwn(dataObj, 'lastReviewedDate')) {
    bodyObject.lastReviewedDate = dataObj.lastReviewedDate;
  }

  if (Object.hasOwn(dataObj, 'signedDate')) {
    bodyObject.signedDate = dataObj.signedDate;
  }
}

function generateBodyObj(dataObject: Artifacts): Artifacts {
  let bodyObj: Artifacts = {};
  try {
    bodyObj = addRequiredFieldsToRequestBody(dataObject);
    addOptionalFields(bodyObj, dataObject);
  } catch {
    process.exit(1);
  }

  return bodyObj;
}

const CMD_HELP = 'saf emasser put artifacts -h or --help';
export default class EmasserPutArtifacts extends Command {
  static readonly usage = '<%= command.id %> [FLAGS]\n\u001B[93m NOTE: see EXAMPLES for command usages\u001B[0m';

  static readonly description = 'Updates artifacts for a system with provided entries';

  static readonly examples = [
    '<%= config.bin %> <%= command.id %> [-s,--systemId] [-f,--dataFile]',
    'The input file should be a well formed JSON containing the POA&M information based on defined business rules.',
    'Required JSON parameter/fields are: ',
    colorize(JSON.stringify(getJsonExamples('artifacts-put-required'), null, 2)),
    'Optional JSON parameters/fields are:',
    colorize(JSON.stringify(getJsonExamples('artifacts-put-optional'), null, 2)),
    '\u001B[1m\u001B[32mAll accepted parameters/fields are:\u001B[0m',
    colorize(getAllJsonExamples()),
  ];

  static readonly flags = {
    help: Flags.help({ char: 'h', description: 'Show eMASSer CLI help for the PUT Artifacts command' }),
    ...getFlagsForEndpoint(process.argv), // skipcq: JS-0349
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(EmasserPutArtifacts);
    const apiCxn = new ApiConnection();
    const artifactApi = new ArtifactsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances);

    const requestBodyArray: Artifacts[] = [];

    // Check if a Artifacts json file was provided
    if (!fs.existsSync(flags.dataFile)) {
      console.error('\u001B[91m» Artifacts data file (.json) not found or invalid:', flags.dataFile, '\u001B[0m');
      process.exit(1);
    }

    try {
      // Read and parse the JSON file
      const fileContent = await readFile(flags.dataFile, 'utf8');
      const data: unknown = JSON.parse(fileContent);

      // Process the Artifacts data
      if (Array.isArray(data)) {
        // Generate the PUT request object based on business logic
        requestBodyArray.push(...data.map(dataObject => generateBodyObj(dataObject)));
      } else if (_.isObject(data) && data !== null) {
        const dataObject: Artifacts = data;
        // Generate the PUT request object based on business logic
        requestBodyArray.push(generateBodyObj(dataObject));
      } else {
        console.error('\u001B[91m» Invalid data format in Artifacts file\u001B[0m');
        process.exit(1);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('\u001B[91m» Error reading Artifacts data file, possible malformed JSON. Please use the -h flag for help.\u001B[0m');
        console.error('\u001B[93m→ Error message was:', error.message, '\u001B[0m');
      } else {
        console.error('\u001B[91m» Unknown error occurred while reading the file:', flags.dataFile, '\u001B[0m');
      }
      process.exit(1);
    }

    // Call API endpoint
    artifactApi.updateArtifactBySystemId(flags.systemId, requestBodyArray).then((response: ArtifactsResponsePutPost) => {
      console.log(colorize(outputFormat(response, false)));
    }).catch((error: unknown) => displayError(error, 'Artifacts'));
  }

  protected catch(err: Error & { exitCode?: number }): Promise<void> {
    // If error message is for missing flags, display what fields are required, otherwise show the error
    if (err.message.includes('See more help with --help')) {
      this.warn(err.message.replace('with --help', `with: \u001B[93m${CMD_HELP}\u001B[0m`));
    } else {
      this.warn(err);
    }
    return Promise.resolve();
  }
}
