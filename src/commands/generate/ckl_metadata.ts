import { Flags } from '@oclif/core';
import fs from 'fs';
import {
  Assettype,
  ChecklistMetadata,
  Role,
  Techarea,
  validateChecklistMetadata,
} from '@mitre/hdf-converters';
import path from 'path';
import { BaseCommand } from '../../utils/oclif/baseCommand';
import { colorize } from 'json-colorizer';
import { getJsonMetaDataExamples } from '../../utils/global';
import { printGreen, printYellow } from '../../utils/oclif/cliHelper';
import { input, confirm, select, number } from '@inquirer/prompts';
import _, { isEmpty } from 'lodash';
import { hostname } from 'os';

export default class GenerateCKLMetadata extends BaseCommand<typeof GenerateCKLMetadata> {
  static readonly usage = '<%= command.id %> [-h] [-L info|warn|debug|verbose] [-o <value> | --interactive]';

  static readonly description = 'Generate a checklist metadata template for use by the "saf convert hdf2ckl" CLI command';

  static readonly examples = [
    '<%= config.bin %> <%= command.id %> -o rhel_metadata.json',
    'The metadata file contains checklist supplemental data.',
    'The metadata file is composed of "profile(s)" and "asset" data.',
    '\u001B[1mExample of "One Profile" metadata:\u001B[0m',
    colorize(JSON.stringify(getJsonMetaDataExamples('ckl-one-metadata'), null, 2)),
    '\u001B[1mExample of "Multiple Profiles" metadata:\u001B[0m',
    colorize(JSON.stringify(getJsonMetaDataExamples('ckl-multiple-metadata'), null, 2)),
  ];

  static readonly flags = {
    output: Flags.string({
      char: 'o', exclusive: ['interactive'],
      description: '\u001B[31m(required -o or --interactive)\u001B[34mThe Output metadata JSON File to be generate',
    }),
  };

  async run() {
    const { flags } = await this.parse(GenerateCKLMetadata);

    // If not interactive must provide -o 0r --output
    if (!flags.interactive && !flags.output) {
      this.error('\u001B[31mIf not interactive you must specify the metadata output json file [-o]\u001B[0m');
    }
    // Flag variables
    let metadataJsonFile = '';

    if (flags.interactive) {
      const interactiveFlags = await getFlags();
      if ((interactiveFlags as { outputDirectory?: string }).outputDirectory) {
        metadataJsonFile = path.join(
          (interactiveFlags as { outputDirectory: string }).outputDirectory,
          (interactiveFlags as { outputFileName: string }).outputFileName,
        );
      }
    } else {
      metadataJsonFile = flags.output || 'metadata.json';
    }

    const cklMetadata = await getCklMetaData();

    const validationResults = validateChecklistMetadata(cklMetadata as ChecklistMetadata);
    if (validationResults.ok) {
      fs.writeFileSync(metadataJsonFile, JSON.stringify(cklMetadata, null, 2));
      console.log(`Checklist metadata file written at: ${path.resolve(metadataJsonFile)}`);
    } else {
      console.error(`Unable to generate checklist metadata:\n${validationResults.error.message}`);
    }
  }
}

/**
 * Asynchronously prompts the user to select an output directory and specify a
 * metadata file name, validates input ends with a `.json` extension.
 *
 * @returns {Promise<unknown>} A promise that resolves to an object containing
 * the user's input values.
 * The object includes:
 * - `outputDirectory`: The selected output directory for the metadata file.
 * - `outputFileName`: The specified metadata file name with a `.json` extension.
 */
async function getFlags(): Promise<unknown> {
  // Dynamically import inquirer-file-selector and chalk
  // Once we move the SAF CLI from a CommonJS to an ES modules we can use the regular import
  const { default: fileSelector } = await import('inquirer-file-selector');
  const { default: chalk } = await import('chalk');

  const fileSelectorTheme = {
    style: {
      file: (text: unknown) => chalk.green(text),
      currentDir: (text: string) => chalk.blueBright(text),
      help: (text: unknown) => chalk.yellow(text),
    },
  };

  // Variable used to store the prompts (question and answers)
  const interactiveValues: { [key: string]: unknown } = {};
  printYellow('Provide the necessary information:');
  printGreen('  Required flag - The metadata json file to be generated (full path to include file name)');

  const answers = {
    outputDirectory: await fileSelector({
      message: 'Select the output directory for the Metadata file:',
      pageSize: 15,
      loop: true,
      type: 'directory',
      allowCancel: true,
      emptyText: 'Directory is empty',
      theme: fileSelectorTheme,
    }),
    outputFileName: await input({
      message: 'Specify the output metadata filename (must have an extension of .json):',
      default: 'ckl_metadata.json',
      validate(input: string) {
        if (/^[\w]+\.json$/i.test(input)) { // skipcq: JS-0113
          return true;
        }
        return 'Please enter a metadata file name that ends with .json';
      },
    }),
  };

  for (const tagName in answers) {
    if (Object.prototype.hasOwnProperty.call(answers, tagName)) {
      const answerValue = _.get(answers, tagName);
      if (answerValue !== null) {
        interactiveValues[tagName] = answerValue;
      }
    }
  }

  return interactiveValues;
}

/**
 * Collects metadata information necessary for generating a checklist
 * used by the "saf convert hdf2ckl" command.
 *
 * This function prompts the user to provide various fields of information
 * interactively. If a value is not available, the user can leave the field empty.
 *
 * @returns {Promise<unknown>} A promise that resolves to an object containing
 * the collected metadata values.
 */
async function getCklMetaData(): Promise<unknown> {
  // Variable used to store the prompts (question and answers)
  const interactiveValues: { [key: string]: unknown } = {};

  printYellow('This process collects information necessary to generate a checklist metadata used by the "saf convert hdf2ckl" command.');
  printYellow('Not all fields are visible in the STIG Viewer, some are used for references and may not generate a ckl exactly as the STIG Viewer.\n');
  printGreen('Please fill in the following fields to the best of your ability, if you do not have a value, please leave the field empty.');

  // Collect the "profiles" metadata information
  let addProfile = true;
  const profiles: {
    name: string | undefined;
    title: string | undefined;
    version: number | undefined;
    releasenumber: number | undefined;
    releasedate: string | undefined;
    showCalendar: boolean;
  }[] = [];
  while (addProfile) {
    const profile = {
      name: await input({
        message: 'What is the benchmark name? (Must match the profile name listed in HDF):',
      }),
      title: await input({
        message: 'What is the benchmark title?:',
      }),
      version: await number({
        message: 'What is the benchmark version?:',
        default: 1,
      }),
      releasenumber: await number({
        message: 'What is the benchmark release number?:',
        default: 1,
      }),
      releasedate: await input({
        message: 'What is the benchmark release date (dd mmm yyyy)?:',
        default: '01 Jan 2025',
        validate(input: string) {
          if (/^\d{2} \w{3} \d{4}$/.test(input)) { // skipcq: JS-0113
            return true;
          }
          return 'Please enter a date in the format dd mmm yyyy';
        },
      }),
      showCalendar: await confirm({ message: 'Show the calendar?', default: true }),
    };
    profiles.push(profile);
    addProfile = await confirm({ message: 'Do you want to add another profile?', default: false });
  }

  interactiveValues.profiles = profiles;

  // Collect the "assets" metadata information
  const assets: {
    marking: string;
    hostname: string;
    hostip: string;
    hostmac: string;
    hostfqdn: string;
    targetcomment: string;
    role: unknown;
    assettype: unknown;
    techarea: unknown;
    stigguid: string;
    targetkey: string;
    webordatabase: unknown;
    vulidmapping: unknown;
    webdbsite?: string; // Added property
    webdbinstance?: string; // Added property
  } = {
    marking: await input({
      message: 'What is the classification marking? [Unclass, CUI, etc]:',
    }),
    hostname: await input({
      message: 'What is the asset hostname?:',
      default: hostname(),
      validate(input: string) {
        if (isEmpty(input) || /^[\w.-]+$/.test(input)) { // skipcq: JS-0113
          return true;
        }
        return 'Please enter a valid hostname or leave blank';
      },
    }),
    hostip: await input({
      message: 'What is the asset IP address?:',
      validate(input: string) {
        if (isEmpty(input) || /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/.test(input)) { // skipcq: JS-0113
          return true;
        }
        return 'Please enter a valid IP address or leave blank';
      },
    }),
    hostmac: await input({
      message: 'What is the asset MAC address?:',
      validate(input: string) {
        if (isEmpty(input) || /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(input)) { // skipcq: JS-0113
          return true;
        }
        return 'Please enter a valid MAC address or leave blank';
      },
    }),
    hostfqdn: await input({
      message: 'What is the asset FQDN?:',
      validate(input: string) {
        if (isEmpty(input) || /^[\w.-]+\.[a-z]{2,}$/.test(input)) { // skipcq: JS-0113
          return true;
        }
        return 'Please enter a valid FQDN or leave blank';
      },
    }),
    targetcomment: await input({
      message: 'What are the target comments?:',
    }),
    role: await select({
      message: 'What is the computing role?:',
      choices: Object.values(Role),
    }),
    assettype: await select({
      message: 'What is the asset type?:',
      choices: Object.values(Assettype),
    }),
    techarea: await select({
      message: 'What is the tech area?:',
      choices: Object.values(Techarea),
      // Filter out empty strings from the choices (currently not used as user may not have a value)
      // choices: Object.values(Techarea).filter(item => item !== ''),
    }),
    stigguid: await input({
      message: 'What is the STIG ID (DISA reference identifier profile belongs too)?:',
    }),
    targetkey: await input({
      message: 'What is the target key (DISA reference identifier control belongs too)?:',
    }),
    webordatabase: await select({
      message: 'Is the target a web or database?:',
      choices: ['y', 'n'],
    }),
    vulidmapping: await select({
      message: 'Use gid or id for vuln number?:',
      choices: ['gid', 'id'],
    }),
  };

  if (assets.webordatabase === 'y') {
    assets.webdbsite = await input({
      message: 'What is the Web or DB site?:',
    });
    assets.webdbinstance = await input({
      message: 'What is the Web or DB instance?:',
    });
  }

  for (const tagName in assets) {
    if (Object.prototype.hasOwnProperty.call(assets, tagName)) {
      const answerValue = _.get(assets, tagName);
      if (!isEmpty(answerValue)) {
        interactiveValues[tagName] = answerValue;
      }
    }
  }

  return interactiveValues;
}
