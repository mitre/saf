import fs from 'fs';
import { readFile } from 'fs/promises';
import { SoftwareBaselineApi } from '@mitre/emass_client';
import type { SwBaselineResponsePostPut } from '@mitre/emass_client/dist/api';
import { Command, Flags } from '@oclif/core';
import { colorize } from 'json-colorizer';
import { ApiConnection } from '../../../utils/emasser/api_connection';
import { outputFormat } from '../../../utils/emasser/output_formatter';
import { displayError, getFlagsForEndpoint, getJsonExamples, printRedMsg, type FlagOptions } from '../../../utils/emasser/utilities';
import { getErrorMessage } from '../../../utils/global';

/**
 * Interface representing software details.
 *
 * @property {string} [softwareVendor] - The vendor of the software. (Required)
 * @property {string} [softwareName] - The name of the software. (Required)
 * @property {string} [version] - The version of the software. (Required)
 * @property {number} [approvalDate] - The date the software was approved. (Conditional)
 * @property {string} [softwareType] - The type of the software. (Optional)
 * @property {string} [parentSystem] - The parent system of the software. (Optional)
 * @property {string} [subsystem] - The subsystem of the software. (Optional)
 * @property {string} [network] - The network the software is part of. (Optional)
 * @property {string} [hostingEnvironment] - The hosting environment of the software. (Optional)
 * @property {string} [softwareDependencies] - The dependencies of the software. (Optional)
 * @property {string} [cryptographicHash] - The cryptographic hash of the software. (Optional)
 * @property {string} [inServiceData] - The in-service data of the software. (Optional)
 * @property {string} [itBudgetUii] - The IT budget UII of the software. (Optional)
 * @property {string} [fiscalYear] - The fiscal year of the software. (Optional)
 * @property {string} [popEndDate] - The end date of the period of performance. (Optional)
 * @property {string} [licenseOrContract] - The license or contract details of the software. (Optional)
 * @property {string} [licenseTerm] - The term of the license. (Optional)
 * @property {number} [costPerLicense] - The cost per license. (Optional)
 * @property {number} [totalLicenses] - The total number of licenses. (Optional)
 * @property {number} [totalLicenseCost] - The total cost of licenses. (Optional)
 * @property {number} [licensesUsed] - The number of licenses used. (Optional)
 * @property {string} [licensePoc] - The point of contact for the license. (Optional)
 * @property {number} [licenseRenewalDate] - The date the license needs to be renewed. (Optional)
 * @property {number} [licenseExpirationDate] - The expiration date of the license. (Optional)
 * @property {string} [approvalStatus] - The approval status of the software. (Optional)
 * @property {number} [releaseDate] - The release date of the software. (Optional)
 * @property {number} [maintenanceDate] - The maintenance date of the software. (Optional)
 * @property {number} [retirementDate] - The retirement date of the software. (Optional)
 * @property {number} [endOfLifeSupportDate] - The end-of-life support date of the software. (Optional)
 * @property {number} [extendedEndOfLifeSupportDate] - The extended end-of-life support date of the software. (Optional)
 * @property {boolean} [criticalAsset] - Indicates if the software is a critical asset. (Optional)
 * @property {string} [location] - The location of the software. (Optional)
 * @property {string} [purpose] - The purpose of the software. (Optional)
 * @property {boolean} [unsupportedOperatingSystem] - Indicates if the software is running on an unsupported operating system. (VA Only)
 * @property {boolean} [unapprovedSoftwareFromTrm] - Indicates if the software is unapproved from TRM. (VA Only)
 * @property {boolean} [approvedWaiver] - Indicates if there is an approved waiver for the software. (VA Only)
 */
type Software = {
  // Required field
  softwareVendor?: string;
  softwareName?: string;
  version?: string;
  // Conditional Fields
  approvalDate?: number;
  // Optional Fields
  softwareType?: string;
  parentSystem?: string;
  subsystem?: string;
  network?: string;
  hostingEnvironment?: string;
  softwareDependencies?: string;
  cryptographicHash?: string;
  inServiceData?: string;
  itBudgetUii?: string;
  fiscalYear?: string;
  popEndDate?: string;
  licenseOrContract?: string;
  licenseTerm?: string;
  costPerLicense?: number;
  totalLicenses?: number;
  totalLicenseCost?: number;
  licensesUsed?: number;
  licensePoc?: string;
  licenseRenewalDate?: number;
  licenseExpirationDate?: number;
  approvalStatus?: string;
  releaseDate?: number;
  maintenanceDate?: number;
  retirementDate?: number;
  endOfLifeSupportDate?: number;
  extendedEndOfLifeSupportDate?: number;
  criticalAsset?: boolean;
  location?: string;
  purpose?: string;
  // VA Only
  unsupportedOperatingSystem?: boolean;
  unapprovedSoftwareFromTrm?: boolean;
  approvedWaiver?: boolean;
};

/**
 * Combines SON examples from multiple sources into a single obect.
 *
 * This function aggregates JSON examples by merging the results of
 * `getJsonExamples` for 'software-post-required', 'software-post-put-conditional',
 * and 'software-post-put-optional' into one object.
 *
 * @returns {string} A string representation of the combined JSON examples.
 */
function getAllJsonExamples(): string {
  const exampleBodyObj: Record<string, unknown> = {
    ...getJsonExamples('software-post-required'),
    ...getJsonExamples('software-post-put-conditional'),
    ...getJsonExamples('software-post-put-optional'),
  };

  return JSON.stringify(exampleBodyObj);
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
    printRedMsg(`Missing required parameter/field: ${object}`);
    throw new Error('Value not defined');
  }
}

/**
 * Adds required fields to the request body for a software baseline.
 *
 * This function ensures that the required fields `softwareVendor`, `softwareName`, and `version`
 * are present in the provided `dataObj`. If any of these fields are missing, an error is thrown
 * and an example JSON structure is logged to the console.
 *
 * @param dataObj - The software object containing the data to be validated and added to the request body.
 * @returns A new `Software` object containing only the required fields.
 * @throws Will throw an error if any of the required fields are missing in `dataObj`.
 */
function addRequiredFieldsToRequestBody(dataObj: Software): Software {
  const bodyObj: Software = {};

  try {
    assertParamExists('softwareVendor', dataObj.softwareVendor);
    assertParamExists('softwareName', dataObj.softwareName);
    assertParamExists('version', dataObj.version);
  } catch (error) {
    console.log('Required JSON fields are:');
    console.log(colorize(JSON.stringify(getJsonExamples('software-post-required'), null, 2)));
    throw error;
  }

  // The required parameter "systemId" is validated by oclif
  bodyObj.softwareVendor = dataObj.softwareVendor;
  bodyObj.softwareName = dataObj.softwareName;
  bodyObj.version = dataObj.version;

  return bodyObj;
}

/**
 * Adds conditional fields from the `dataObj` to the `bodyObject` if they exist.
 *
 * @param bodyObject - The target object to which fields will be added.
 * @param dataObj - The source object from which fields will be copied if they exist.
 */
function addConditionalFields(bodyObject: Software, dataObj: Software): void {
  if (Object.hasOwn(dataObj, 'publicFacingFqdn')) {
    bodyObject.approvalDate = dataObj.approvalDate;
  }
}

/**
 * Adds optional fields from the `dataObj` to the `bodyObject` if they exist.
 *
 * @param bodyObject - The target object to which optional fields will be added.
 * @param dataObj - The source object from which optional fields will be copied.
 */
// skipcq: JS-R1005 - Ignore Function cyclomatic complexity high threshold

function addOptionalFields(bodyObject: Software, dataObj: Software): void {
  if (Object.hasOwn(dataObj, 'softwareType')) {
    bodyObject.softwareType = dataObj.softwareType;
  }

  if (Object.hasOwn(dataObj, 'parentSystem')) {
    bodyObject.parentSystem = dataObj.parentSystem;
  }

  if (Object.hasOwn(dataObj, 'subsystem')) {
    bodyObject.subsystem = dataObj.subsystem;
  }

  if (Object.hasOwn(dataObj, 'network')) {
    bodyObject.network = dataObj.network;
  }

  if (Object.hasOwn(dataObj, 'hostingEnvironment')) {
    bodyObject.hostingEnvironment = dataObj.hostingEnvironment;
  }

  if (Object.hasOwn(dataObj, 'softwareDependencies')) {
    bodyObject.softwareDependencies = dataObj.softwareDependencies;
  }

  if (Object.hasOwn(dataObj, 'cryptographicHash')) {
    bodyObject.cryptographicHash = dataObj.cryptographicHash;
  }

  if (Object.hasOwn(dataObj, 'inServiceData')) {
    bodyObject.inServiceData = dataObj.inServiceData;
  }

  if (Object.hasOwn(dataObj, 'itBudgetUii')) {
    bodyObject.itBudgetUii = dataObj.itBudgetUii;
  }

  if (Object.hasOwn(dataObj, 'fiscalYear')) {
    bodyObject.fiscalYear = dataObj.fiscalYear;
  }

  if (Object.hasOwn(dataObj, 'popEndDate')) {
    bodyObject.popEndDate = dataObj.popEndDate;
  }

  if (Object.hasOwn(dataObj, 'licenseOrContract')) {
    bodyObject.licenseOrContract = dataObj.licenseOrContract;
  }

  if (Object.hasOwn(dataObj, 'licenseTerm')) {
    bodyObject.licenseTerm = dataObj.licenseTerm;
  }

  if (Object.hasOwn(dataObj, 'costPerLicense')) {
    bodyObject.costPerLicense = dataObj.costPerLicense;
  }

  if (Object.hasOwn(dataObj, 'totalLicenses')) {
    bodyObject.totalLicenses = dataObj.totalLicenses;
  }

  if (Object.hasOwn(dataObj, 'totalLicenseCost')) {
    bodyObject.totalLicenseCost = dataObj.totalLicenseCost;
  }

  if (Object.hasOwn(dataObj, 'licensesUsed')) {
    bodyObject.licensesUsed = dataObj.licensesUsed;
  }

  if (Object.hasOwn(dataObj, 'licensePoc')) {
    bodyObject.licensePoc = dataObj.licensePoc;
  }

  if (Object.hasOwn(dataObj, 'licenseRenewalDate')) {
    bodyObject.licenseRenewalDate = dataObj.licenseRenewalDate;
  }

  if (Object.hasOwn(dataObj, 'licenseExpirationDate ')) {
    bodyObject.licenseExpirationDate = dataObj.licenseExpirationDate;
  }

  if (Object.hasOwn(dataObj, 'approvalStatus')) {
    bodyObject.approvalStatus = dataObj.approvalStatus;
  }

  if (Object.hasOwn(dataObj, 'releaseDate')) {
    bodyObject.releaseDate = dataObj.releaseDate;
  }

  if (Object.hasOwn(dataObj, 'maintenanceDate')) {
    bodyObject.maintenanceDate = dataObj.maintenanceDate;
  }

  if (Object.hasOwn(dataObj, 'retirementDate')) {
    bodyObject.retirementDate = dataObj.retirementDate;
  }

  if (Object.hasOwn(dataObj, 'endOfLifeSupportDate')) {
    bodyObject.endOfLifeSupportDate = dataObj.endOfLifeSupportDate;
  }

  if (Object.hasOwn(dataObj, 'extendedEndOfLifeSupportDate')) {
    bodyObject.extendedEndOfLifeSupportDate = dataObj.extendedEndOfLifeSupportDate;
  }

  if (Object.hasOwn(dataObj, 'criticalAsset')) {
    bodyObject.criticalAsset = dataObj.criticalAsset;
  }

  if (Object.hasOwn(dataObj, 'location')) {
    bodyObject.location = dataObj.location;
  }

  if (Object.hasOwn(dataObj, 'purpose')) {
    bodyObject.purpose = dataObj.purpose;
  }

  // VA Only
  if (Object.hasOwn(dataObj, 'unsupportedOperatingSystem')) {
    bodyObject.unsupportedOperatingSystem = dataObj.unsupportedOperatingSystem;
  }

  if (Object.hasOwn(dataObj, 'unapprovedSoftwareFromTrm')) {
    bodyObject.unapprovedSoftwareFromTrm = dataObj.unapprovedSoftwareFromTrm;
  }

  if (Object.hasOwn(dataObj, 'approvedWaiver')) {
    bodyObject.approvedWaiver = dataObj.approvedWaiver;
  }
}

/**
 * Generates a body object for a software baseline.
 *
 * This function takes a `Software` object as input and creates a new `Software` object
 * with required, conditional, and optional fields populated based on the input object.
 * If any error occurs during the process, the function will terminate the process with an exit code of 1.
 *
 * @param dataObject - The input `Software` object containing the data to populate the body object.
 * @returns The generated `Software` body object.
 */
function generateBodyObj(dataObject: Software): Software {
  let bodyObj: Software = {};

  try {
    bodyObj = addRequiredFieldsToRequestBody(dataObject);
    addConditionalFields(bodyObj, dataObject);
    addOptionalFields(bodyObj, dataObject);
  } catch {
    process.exit(1);
  }

  return bodyObj;
}

const CMD_HELP = 'saf emasser post software_baseline -h or --help';
export default class EmasserSoftwareBaseline extends Command {
  static readonly usage = '<%= command.id %> [FLAGS]\n\u001B[93m NOTE: see EXAMPLES for command usages\u001B[0m';

  static readonly description = 'Add one or many software assets to a system.\n'
    + 'The CLI expects an input JSON file containing the required, conditional\n'
    + 'and optional fields for the software asset(s) being added to the system.';

  static readonly examples = [
    '<%= config.bin %> <%= command.id %> [-s,--systemId] [-f,--dataFile]',
    'The input file should be a well formed JSON containing Software Assets.',
    '\u001B[1mRequired JSON parameter/field is:\u001B[0m',
    colorize(JSON.stringify(getJsonExamples('software-post-required'), null, 2)),
    '\u001B[1mConditional JSON parameters/fields are:\u001B[0m',
    colorize(JSON.stringify(getJsonExamples('software-post-put-conditional'), null, 2)),
    '\u001B[1mOptional JSON parameters/fields are:\u001B[0m',
    colorize(JSON.stringify(getJsonExamples('software-post-put-optional'), null, 2)),
    '\u001B[1m\u001B[32mAll accepted parameters/fields are:\u001B[0m',
    colorize(getAllJsonExamples()),
  ];

  static readonly flags = {
    help: Flags.help({ char: 'h', description: 'Show eMASSer CLI help for the POST Software Baseline command' }),
    ...getFlagsForEndpoint(process.argv), // skipcq: JS-0349
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(EmasserSoftwareBaseline);
    const apiCxn = new ApiConnection();
    const swBaseline = new SoftwareBaselineApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances);

    const requestBodyArray: Software[] = [];

    // Check if a Software json file was provided
    if (fs.existsSync(flags.dataFile)) {
      let data;
      try {
        data = JSON.parse(await readFile(flags.dataFile, 'utf8'));
      } catch (error: unknown) {
        console.error('\u001B[91m» Error reading Software data file, possible malformed json. Please use the -h flag for help.\u001B[0m');
        console.error('\u001B[93m→ Error message was:', getErrorMessage(error), '\u001B[0m');
        process.exit(1);
      }

      // Process the Software data file
      if (Array.isArray(data)) {
        data.forEach((dataObject: Software) => {
          // Generate the post request object based on business logic
          requestBodyArray.push(generateBodyObj(dataObject));
        });
      } else if (typeof data === 'object') {
        const dataObject: Software = data;
        // Generate the post request object based on business logic
        requestBodyArray.push(generateBodyObj(dataObject));
      }
    } else {
      console.error('\u001B[91m» Software data file (.json) not found or invalid:', flags.dataFile, '\u001B[0m');
      process.exit(1);
    }

    // Call the endpoint
    swBaseline.addSwBaselineAssets(flags.systemId, requestBodyArray).then((response: SwBaselineResponsePostPut) => {
      console.log(colorize(outputFormat(response, false)));
    }).catch((error: unknown) => displayError(error, 'Software Baseline'));
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
