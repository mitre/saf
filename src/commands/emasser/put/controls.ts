import colorize from 'json-colorizer';
import {Command, Flags} from "@oclif/core"
import { ControlsApi } from '@mitre/emass_client';
import { ControlsResponsePut } from '@mitre/emass_client/dist/api';
import { ControlsGet as Controls } from '@mitre/emass_client/dist/api';
import { ApiConnection } from "../../../utils/emasser/apiConnection"
import { outputFormat } from '../../../utils/emasser/outputFormatter';
import { FlagOptions, getFlagsForEndpoint, getJsonExamples } from '../../../utils/emasser/utilities';
import { outputError } from '../../../utils/emasser/outputError';
import { readFile } from 'fs/promises';
import _ from 'lodash';
import fs from 'fs'

export default class EmasserPutControls extends Command {
  static usage = '<%= command.id %> [ARGUMENTS]'

  static description = "Update Security Control information of a system for both the Implementation Plan and Risk Assessment."
  
  static examples = ['<%= config.bin %> <%= command.id %> [-s,--systemId] [-f,--controlsFile]',
      'The input file should be a well formed JSON containing the Security Control information information based on defined business rules.',
      'Required JSON parameter/fields are: ',
      colorize(JSON.stringify(getJsonExamples('controls-required'), null,2)),
      'Conditional JSON parameters/fields are: ',
      colorize(JSON.stringify(getJsonExamples('controls-conditional'), null,2)),
      'Optional JSON parameters/fields are:',
      colorize(JSON.stringify(getJsonExamples('controls-optional'), null,2)),
    ]

  static flags = {
    help: Flags.help({char: 'h', description: 'Put (update) control information in a system for one or many controls. See emasser Features (emasserFeatures.md) for additional information.'}),
    ...getFlagsForEndpoint(process.argv) as FlagOptions,
  }
  
  async run(): Promise<void> {
    const {flags} = await this.parse(EmasserPutControls)
    const apiCxn = new ApiConnection();
    const updateControl = new ControlsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances);
    
    let requestBodyArray: Controls[] = [];    
    
    // Check if a Security Control information json file was provided
    if(fs.existsSync(flags.controlFile)) {
      let data: any;
      try {
        data = JSON.parse(await readFile(flags.controlFile, "utf8"));
      } catch (error: any) {
        if (error.code === 'ENOENT') {
          console.log('Security Control information JSON file not found!');
          process.exit(1);
        } else {
          console.log('Error reading Security Control information file, possible malformed json. Please use the -h flag for help.')
          console.log('Error message was: ', error.message);
          process.exit(1);
        }
      }

      // Security Control information json file provided, check if we have multiple content to process
      if (Array.isArray(data)) {
        data.forEach(function(dataObject: Controls) {
          let bodyObj: Controls = {};
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
        let bodyObj: Controls = {};
        let dataObject: Controls = data;
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
      console.error('Invalid or Security Control information JSON file not found on the provided directory: ', flags.controlFile);
      process.exit(1);
    }

    updateControl.updateControlBySystemId(flags.systemId, requestBodyArray).then((response: ControlsResponsePut) => {
      console.log(colorize(outputFormat(response)));
    }).catch((error:any) => console.error(colorize(outputError(error))));
  }
}

function addRequiredFieldsToRequestBody(dataObj: Controls): Controls {
  let bodyObj: Controls  = {};  
  try {
    assertParamExists('acronym', dataObj.acronym);
    assertParamExists('responsibleEntities', dataObj.responsibleEntities);
    assertParamExists('controlDesignation', dataObj.controlDesignation);
    assertParamExists('estimatedCompletionDate', dataObj.estimatedCompletionDate);
    assertParamExists('implementationNarrative', dataObj.implementationNarrative);
  } catch (error) {
    console.log('Required JSON fields are:');
    console.log(colorize(JSON.stringify(getJsonExamples('controls-required'), null,2)));
    throw error;
  }
  bodyObj.acronym = dataObj.acronym;
  bodyObj.responsibleEntities = dataObj.responsibleEntities;
  bodyObj.controlDesignation = dataObj.controlDesignation;
  bodyObj.estimatedCompletionDate = dataObj.estimatedCompletionDate;
  bodyObj.implementationNarrative = dataObj.implementationNarrative;

  return bodyObj;
}

function addConditionalFields(bodyObject: Controls, dataObj: Controls): void {
  if (dataObj.hasOwnProperty('commonControlProvider')) { bodyObject.commonControlProvider = dataObj.commonControlProvider; }
  if (dataObj.hasOwnProperty('naJustification')) { bodyObject.naJustification = dataObj.naJustification; }
  if (dataObj.hasOwnProperty('slcmCriticality')) { bodyObject.slcmCriticality = dataObj.slcmCriticality; }
  if (dataObj.hasOwnProperty('slcmFrequency')) { bodyObject.slcmFrequency = dataObj.slcmFrequency; }
  if (dataObj.hasOwnProperty('slcmMethod')) { bodyObject.slcmMethod = dataObj.slcmMethod; }
  if (dataObj.hasOwnProperty('slcmReporting')) { bodyObject.slcmReporting = dataObj.slcmReporting; }
  if (dataObj.hasOwnProperty('slcmTracking')) { bodyObject.slcmTracking = dataObj.slcmTracking; }
  if (dataObj.hasOwnProperty('slcmComments')) { bodyObject.slcmComments = dataObj.slcmComments; }
  
}

function addOptionalFields(bodyObject: Controls, dataObj: Controls): void {
  if (dataObj.hasOwnProperty('implementationStatus')) { bodyObject.implementationStatus = dataObj.implementationStatus; }
  if (dataObj.hasOwnProperty('severity')) { bodyObject.severity = dataObj.severity; }
  if (dataObj.hasOwnProperty('vulnerabiltySummary')) { bodyObject.vulnerabiltySummary = dataObj.vulnerabiltySummary; }
  if (dataObj.hasOwnProperty('recommendations')) { bodyObject.recommendations = dataObj.recommendations; }
  if (dataObj.hasOwnProperty('relevanceOfThreat')) { bodyObject.relevanceOfThreat = dataObj.relevanceOfThreat; }
  if (dataObj.hasOwnProperty('likelihood')) { bodyObject.likelihood = dataObj.likelihood; }
  if (dataObj.hasOwnProperty('impact')) { bodyObject.impact = dataObj.impact; }
  if (dataObj.hasOwnProperty('impactDescription')) { bodyObject.impactDescription = dataObj.impactDescription; }
  if (dataObj.hasOwnProperty('residualRiskLevel')) { bodyObject.residualRiskLevel = dataObj.residualRiskLevel; }
  if (dataObj.hasOwnProperty('testMethod')) { bodyObject.testMethod = dataObj.testMethod; }
}

function assertParamExists(object: string, value: string|number|undefined|null): void {
  if(typeof value === 'undefined') {
    printRedMsg(`Missing required parameter/field: ${object}`)
    throw new Error("Value not defined");
  }
}

function processBusinessLogic(bodyObject: Controls, dataObj: Controls): void {
  console.log(dataObj.hasOwnProperty('implementationStatus'));
  // console.log(dataObj.hasOwnProperty('milestone'));
  //----------------------------------------------------------------------------------------
  // Conditional fields that are required based on the "implementationStatus" value
  // "Planned" or        estimatedCompletionDate, responsibleEntities, slcmCriticality, 
  // "Implemenbted"      slcmFrequency, slcmMethod, slcmReporting, slcmTracking, slcmComments
  //
  // "Not Applicable"     naJustification, responsibleEntities
  //
  // "Manually Inherited" commonControlProvider, estimatedCompletionDate, 
  //                      responsibleEntities, slcmCriticality, slcmFrequency, slcmMethod, 
  //                      slcmReporting, slcmTracking, slcmComments
  //
  // "Inherited"          Only the following fields can be updated:
  //                      controlDesignation, commonnControlProvider
  //-----------------------------------------------------------------------------
  
  // Only process if we have an Implementation Status
  if ( dataObj.hasOwnProperty('implementationStatus') ) {
    // The implementation Status is always required in any of these cases
    bodyObject.implementationStatus = dataObj.implementationStatus;

    switch (dataObj.implementationStatus ) {
      case "Planned":
      case "Implemented":
        if (!(dataObj.hasOwnProperty('responsibleEntities')) || !(dataObj.hasOwnProperty('slcmCriticality')) || 
            !(dataObj.hasOwnProperty('slcmFrequency')) || !(dataObj.hasOwnProperty('slcmMethod')) ||
            !(dataObj.hasOwnProperty('slcmReporting')) || !(dataObj.hasOwnProperty('slcmTracking')) 
            || !(dataObj.hasOwnProperty('slcmComments')) ) {
          printRedMsg('Missing one of these parameters/fields:');
          printRedMsg( '    responsibleEntities, slcmCriticality, slcmFrequency,');
          printRedMsg( '    slcmMethod,slcmReporting, slcmTracking, slcmComments');
          printHelpMsg();
          process.exit(1);
        } else {
          bodyObject.responsibleEntities = dataObj.responsibleEntities;
          bodyObject.slcmCriticality = dataObj.slcmCriticality
          bodyObject.slcmFrequency = dataObj.slcmFrequency
          bodyObject.slcmMethod = dataObj.slcmMethod
          bodyObject.slcmReporting = dataObj.slcmReporting
          bodyObject.slcmTracking = dataObj.slcmTracking
          bodyObject.slcmComments = dataObj.slcmComments
        }

        break;
      case "Not Applicable":
        if ( !(dataObj.hasOwnProperty('naJustification') && dataObj.hasOwnProperty('responsibleEntities')) ) {
          printRedMsg('Missing one of these parameters/fields:');
          printRedMsg('    naJustification, responsibleEntities');
          printHelpMsg();
          process.exit(1);        
        } else {
          bodyObject.naJustification = dataObj.naJustification;
          bodyObject.responsibleEntities = dataObj.responsibleEntities;
        }
    
        break;
      case "Manually Inherited":
        if (!(dataObj.hasOwnProperty('commonControlProvider')) || !(dataObj.hasOwnProperty('responsibleEntities')) ||
            !(dataObj.hasOwnProperty('slcmCriticality')) || !(dataObj.hasOwnProperty('slcmFrequency')) || 
            !(dataObj.hasOwnProperty('slcmMethod')) || !(dataObj.hasOwnProperty('slcmReporting')) || 
            !(dataObj.hasOwnProperty('slcmTracking')) || !(dataObj.hasOwnProperty('slcmComments')) ) {
          printRedMsg('Missing one of these parameters/fields:');
          printRedMsg('    commonControlProvider, responsibleEntities, slcmCriticality,');
          printRedMsg('    slcmFrequency, slcmMethod, slcmReporting, slcmTracking, slcmComments');
          printHelpMsg();
          process.exit(1);  
        } else {
          bodyObject.commonControlProvider = dataObj.commonControlProvider;
          bodyObject.responsibleEntities = dataObj.responsibleEntities;
          bodyObject.slcmCriticality = dataObj.slcmCriticality
          bodyObject.slcmFrequency = dataObj.slcmFrequency
          bodyObject.slcmMethod = dataObj.slcmMethod
          bodyObject.slcmReporting = dataObj.slcmReporting
          bodyObject.slcmTracking = dataObj.slcmTracking
          bodyObject.slcmComments = dataObj.slcmComments
        }

        break;
      case "Inherited":
        if (!(dataObj.hasOwnProperty('commonControlProvider')) ) {
          printRedMsg('When implementationStatus value is "Inherited" only the following fields are updated:');
          printRedMsg('    controlDesignation and commonControlProvider');
          printHelpMsg();
          process.exit(1);  
        } else {
          bodyObject.commonControlProvider = dataObj.commonControlProvider;
        }

        break;        
    }
  }
}

function printHelpMsg() {
  console.log('\x1b[33m','\nInvoke \"saf emasser put contols [-h, --help] for additional help','\x1b[0m');
}

function printRedMsg(msg: string) {
  console.log('\x1b[31m',msg,'\x1b[0m');
}