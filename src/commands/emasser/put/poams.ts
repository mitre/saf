import colorize from 'json-colorizer';
import { Command, Flags } from "@oclif/core"
import { POAMApi } from '@mitre/emass_client';
import { MilestonesGet, PoamResponsePut } from '@mitre/emass_client/dist/api';
import { PoamGet as Poams } from '@mitre/emass_client/dist/api';
import { ApiConnection } from "../../../utils/emasser/apiConnection"
import { outputFormat } from '../../../utils/emasser/outputFormatter';
import { FlagOptions, getFlagsForEndpoint, getJsonExamples } from '../../../utils/emasser/utilities';
import { outputError } from '../../../utils/emasser/outputError';
import { readFile } from 'fs/promises';
import _ from 'lodash';
import fs from 'fs'

export default class EmasserPutPoams extends Command {
  static usage = '<%= command.id %> [ARGUMENTS]'

  static description = "Update a Plan of Action and Milestones (POA&M) into a systems."
  
  static examples = ['<%= config.bin %> <%= command.id %> [-s,--systemId] [-f,--poamFile]',
      'The input file should be a well formed JSON containing the POA&M information based on defined business rules.',
      'Required JSON parameter/fields are: ',
      colorize(JSON.stringify(getJsonExamples('poams-put-required'), null,2)),
      'Conditional JSON parameters/fields are: ',
      colorize(JSON.stringify(getJsonExamples('poams-put-conditional'), null,2)),
      'Optional JSON parameters/fields are:',
      colorize(JSON.stringify(getJsonExamples('poams-optional'), null,2)),
    ]

  static flags = {
    help: Flags.help({char: 'h', description: 'Put (update) a Plan of Action and Milestones (POA&M) item(s) in a system. See emasser Features (emasserFeatures.md) for additional information.'}),
    ...getFlagsForEndpoint(process.argv) as FlagOptions,
  }
  
  async run(): Promise<void> {
    const {flags} = await this.parse(EmasserPutPoams)
    const apiCxn = new ApiConnection();
    const updatePoam = new POAMApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances);
    
    let requestBodyArray: Poams[] = [];    
    
    // Check if a POA&Ms json file was provided
    if(fs.existsSync(flags.poamFile)) {
      let data: any;
      try {
        data = JSON.parse(await readFile(flags.poamFile, "utf8"));
      } catch (error: any) {
        if (error.code === 'ENOENT') {
          console.log('POA&Ms JSON file not found!');
          process.exit(1);
        } else {
          console.log('Error reading POA&Ms file, possible malformed json. Please use the -h flag for help.')
          console.log('Error message was: ', error.message);
          process.exit(1);
        }
      }

      // POA&Ms json file provided, check if we have multiple POA&Ms to process
      if (Array.isArray(data)) {
        data.forEach(function(dataObject: Poams) {
          let bodyObj: Poams = {};
          // Add required fields to request array object based on business logic
          try {
            bodyObj = addRequiredFieldsToRequestBody(dataObject);
            processBusinessLogic(bodyObj, dataObject);
            addConditionalFields(bodyObj, dataObject);
            addOptionalFields(bodyObj, dataObject);
            requestBodyArray.push(bodyObj);
          } catch (error) {
            process.exit(1);
          }
        });
      } else if (typeof data === 'object') {
        let bodyObj: Poams = {};
        let dataObject: Poams = data;
        // Add required fields to request array object based on business logic
        try {
          bodyObj = addRequiredFieldsToRequestBody(dataObject);
          processBusinessLogic(bodyObj, dataObject);
          addConditionalFields(bodyObj, dataObject);
          addOptionalFields(bodyObj, dataObject);
          requestBodyArray.push(bodyObj);
        } catch (error) {
          process.exit(1);
        }
      }
    } else {
      console.error('Invalid or POA&M JSON file not found on the provided directory: ', flags.poamFile);
      process.exit(1);
    }

    updatePoam.updatePoamBySystemId(flags.systemId, requestBodyArray).then((response: PoamResponsePut) => {
      console.log(colorize(outputFormat(response)));
    }).catch((error:any) => console.error(colorize(outputError(error))));
  }
}

function addRequiredFieldsToRequestBody(dataObj: Poams): Poams {
  let bodyObj: Poams  = {};  
  try {
    assertParamExists('poamId', dataObj.poamId);
    assertParamExists('displayPoamId', dataObj.displayPoamId);
    assertParamExists('status', dataObj.status);
    assertParamExists('vulnerabilityDescription', dataObj.vulnerabilityDescription);
    assertParamExists('sourceIdentVuln', dataObj.sourceIdentVuln);
    assertParamExists('pocOrganization', dataObj.pocOrganization);
    assertParamExists('resources', dataObj.resources);
    assertParamExists('mitigation', dataObj.mitigation);
  } catch (error) {
    console.log('Required JSON fields are:');
    console.log(colorize(JSON.stringify(getJsonExamples('poams-put-required'), null,2)));
    throw error;
  }
  bodyObj.poamId = dataObj.poamId;
  bodyObj.displayPoamId = dataObj.displayPoamId;
  bodyObj.status = dataObj.status;
  bodyObj.vulnerabilityDescription = dataObj.vulnerabilityDescription;
  bodyObj.sourceIdentVuln = dataObj.sourceIdentVuln;
  bodyObj.pocOrganization = dataObj.pocOrganization;
  bodyObj.resources = dataObj.resources;
  bodyObj.mitigation = dataObj.mitigation;

  return bodyObj;
}

function addConditionalFields(bodyObject: Poams, dataObj: Poams): void {
  if (dataObj.hasOwnProperty('pocFirstName')) { bodyObject.pocFirstName = dataObj.pocFirstName; }
  if (dataObj.hasOwnProperty('pocLastName')) { bodyObject.pocLastName = dataObj.pocLastName; }
  if (dataObj.hasOwnProperty('pocEmail')) { bodyObject.pocEmail = dataObj.pocEmail; }
  if (dataObj.hasOwnProperty('pocPhoneNumber')) { bodyObject.pocPhoneNumber = dataObj.pocPhoneNumber; }
  if (dataObj.hasOwnProperty('severity')) { bodyObject.severity = dataObj.severity; }
}

function addOptionalFields(bodyObject: Poams, dataObj: Poams): void {
  if (dataObj.hasOwnProperty('externalUid')) { bodyObject.externalUid = dataObj.externalUid; }
  if (dataObj.hasOwnProperty('controlAcronym')) { bodyObject.controlAcronym = dataObj.controlAcronym; }
  if (dataObj.hasOwnProperty('cci')) { bodyObject.cci = dataObj.cci; }
  if (dataObj.hasOwnProperty('securityChecks')) { bodyObject.securityChecks = dataObj.securityChecks; }
  if (dataObj.hasOwnProperty('rawSeverity')) { bodyObject.rawSeverity = dataObj.rawSeverity; }
  if (dataObj.hasOwnProperty('relevanceOfThreat')) { bodyObject.relevanceOfThreat = dataObj.relevanceOfThreat; }
  if (dataObj.hasOwnProperty('likelihood')) { bodyObject.likelihood = dataObj.likelihood; }
  if (dataObj.hasOwnProperty('impact')) { bodyObject.impact = dataObj.impact; }
  if (dataObj.hasOwnProperty('impactDescription')) { bodyObject.impactDescription = dataObj.impactDescription; }
  if (dataObj.hasOwnProperty('residualRiskLevel')) { bodyObject.residualRiskLevel = dataObj.residualRiskLevel; }
  if (dataObj.hasOwnProperty('recommendations')) { bodyObject.recommendations = dataObj.recommendations; }
  //if (dataObj.hasOwnProperty('mitigation')) { bodyObject.mitigation = dataObj.mitigation; }
}

function assertParamExists(object: string, value: string|number|undefined|null): void {
  if(typeof value === 'undefined') {
    printRedMsg(`Missing required parameter/field: ${object}`)
    throw new Error("Value not defined");
  }
}

function processBusinessLogic(bodyObject: Poams, dataObj: Poams): void {

  //-----------------------------------------------------------------------------
  // Conditional fields that are required based on the "status" field value
  // "Risk Accepted"   comments, resources
  // "Ongoing"         scheduledCompletionDate, resources, milestones (at least 1)
  // "Completed"       scheduledCompletionDate, comments, resources,
  //                   completionDate, milestones (at least 1)
  // "Not Applicable"  POAM can not be created
  //-----------------------------------------------------------------------------
  switch (dataObj.status) {
    case "Risk Accepted":
      if (typeof dataObj.comments === 'undefined') {
        printRedMsg('When status is "Risk Accepted" the following parameters/fields are required:');
        printRedMsg( '    comments');
        printHelpMsg();
        process.exit(1);
      } else if ( dataObj.hasOwnProperty('scheduledCompletionDate') && dataObj.hasOwnProperty('milestone') ) {
        printRedMsg('When status is "Risk Accepted" POA&Ms CAN NOT be saved with the following parameters/field:');
        printRedMsg( '    scheduledCompletionDate, or milestone');
        printHelpMsg();
        process.exit(1);
      } else {
        bodyObject.comments = dataObj.comments;
      }

      break;
    case "Ongoing":
      if ( !(dataObj.hasOwnProperty('scheduledCompletionDate') && dataObj.hasOwnProperty('milestones')) ) {
        printRedMsg('When status is "Ongoing" the following parameters/fields are required:');
        printRedMsg('    scheduledCompletionDate, milestones');
        printHelpMsg();
        process.exit(1);        
      } else if ( (typeof (_.find(dataObj.milestones, function(obj) { return obj.description; })) === 'undefined') ||
                  (typeof (_.find(dataObj.milestones, function(obj) { return obj.scheduledCompletionDate; })) === 'undefined') ) {
        printRedMsg('At least one milestone parameters/fields object must be defined:');
        printRedMsg('    "milestones": [{ "description": "The milestone description", "scheduledCompletionDate": 1637342288 }],');
        process.exit(1);
      } else {
        // Add the POA&M completion date
        bodyObject.scheduledCompletionDate = dataObj.scheduledCompletionDate;

        // Add the milestone object
        let milestoneArray: Array<MilestonesGet> = [];
        dataObj.milestones?.forEach(function(milestone: MilestonesGet) {
          let milestoneObj: MilestonesGet = {};
          milestoneObj.milestoneId = milestone.milestoneId;
          milestoneObj.description = milestone.description;
          milestoneObj.scheduledCompletionDate = milestone.scheduledCompletionDate;
          milestoneArray.push(milestoneObj);
        });
        bodyObject.milestones = milestoneArray.slice();
      }
  
      break;
    case "Completed":
      if ( !(dataObj.hasOwnProperty('scheduledCompletionDate')) || !(dataObj.hasOwnProperty('comments')) ||
           !(dataObj.hasOwnProperty('completionDate')) || !(dataObj.hasOwnProperty('milestones')) ) {
        printRedMsg('When status is "Completed" the following parameters/fields are required:');
        printRedMsg('    scheduledCompletionDate, comments, completionDate, or milestone');
        printHelpMsg();
        process.exit(1);  
      } else {
        // Add the POA&M schedule and completion date, comments 
        bodyObject.comments = dataObj.comments;
        bodyObject.completionDate = dataObj.completionDate;
        bodyObject.scheduledCompletionDate = dataObj.scheduledCompletionDate;

        // Add the milestone object
        let milestoneArray: Array<MilestonesGet> = [];
        dataObj.milestones?.forEach(function(milestone: MilestonesGet) {
          let milestoneObj: MilestonesGet = {};
          milestoneObj.milestoneId = milestone.milestoneId;
          milestoneObj.description = milestone.description;
          milestoneObj.scheduledCompletionDate = milestone.scheduledCompletionDate;
          milestoneArray.push(milestoneObj);
        });
        bodyObject.milestones = milestoneArray.slice();
      }

      break;
  }

  // POC checks: If any poc information is provided all POC fields are required
  if (dataObj.hasOwnProperty('pocFirstName') || dataObj.hasOwnProperty('pocLastName') || 
      dataObj.hasOwnProperty('pocEmail') || dataObj.hasOwnProperty('pocPhoneNumber')) {

      if (!(dataObj.hasOwnProperty('pocFirstName')) || !(dataObj.hasOwnProperty('pocLastName')) || 
        !(dataObj.hasOwnProperty('pocEmail')) || !(dataObj.hasOwnProperty('pocPhoneNumber')) ) {
          printRedMsg('If any POC content is provided (pocFirstName, pocLastName, pocEmail, pocPhoneNumber) than all POC content is required:');
          printRedMsg('    pocFirstName, pocLastName, pocEmail, pocPhoneNumber');
          printHelpMsg();
          process.exit(1);   
      }
  }
}

function printHelpMsg() {
  console.log('\x1b[93m','\nInvoke \"saf emasser put poams [-h, --help] for additional help','\x1b[0m');
}

function printRedMsg(msg: string) {
  console.log('\x1b[91m',msg,'\x1b[0m');
}