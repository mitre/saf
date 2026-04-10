import { mkdir, readFile } from 'fs/promises';
import path from 'path';
import { Flags } from '@oclif/core';
import { XMLParser } from 'fast-xml-parser';
import _ from 'lodash';
import moment from 'moment';
import promptSync from 'prompt-sync';
import XlsxPopulate from 'xlsx-populate';
import files from '../../resources/files.json';
import type { STIG, Vulnerability, STIGHolder } from '../../types/stig';
import {
  cci2nist,
  cklSeverityToImpact,
  cklSeverityToLikelihood,
  cklSeverityToPOAMSeverity,
  cklSeverityToRelevanceOfThreat,
  cklSeverityToResidualRiskLevel,
  cleanStatus,
  combineComments,
  convertToRawSeverity,
  createCVD,
  extractSolution,
  extractSTIGUrl,
  replaceSpecialCharacters,
} from '../../utils/ckl2poam';
import { basename, dataURLtoU8Array } from '../../utils/global';
import { createWinstonLogger } from '../../utils/logging';
import { BaseCommand } from '../../utils/oclif/base_command';

const prompt = promptSync();

const STARTING_ROW = 8; // The row we start inserting controls into

export default class CKL2POAM extends BaseCommand<typeof CKL2POAM> {
  static readonly usage
    = '<%= command.id %> -i <disa-checklist>... -o <poam-output-folder> [-h] [-O <office/org>] [-d <device-name>] [-s <num-rows>]';

  static readonly description
    = 'Translate DISA Checklist CKL file(s) to POA&M files';

  static readonly aliases = ['convert:ckl2POAM'];

  static readonly examples = ['<%= config.bin %> <%= command.id %> -i checklist_file.ckl -o output-folder -d abcdefg -s 2'];

  static readonly flags = {
    help: Flags.help({ char: 'h' }),
    input: Flags.string({
      char: 'i',
      required: true,
      multiple: true,
      description: 'Path to the DISA Checklist File(s)',
    }),
    officeOrg: Flags.string({
      char: 'O',
      required: false,
      default: '',
      description:
        'Default value for Office/org (prompts for each file if not set)',
    }),
    deviceName: Flags.string({
      char: 'd',
      required: false,
      default: '',
      description: 'Name of target device (prompts for each file if not set)',
    }),
    rowsToSkip: Flags.integer({
      char: 's',
      required: false,
      default: 4,
      description: 'Rows to leave between POA&M Items for milestones',
    }),
    output: Flags.string({
      char: 'o',
      required: true,
      description: 'Path to output PO&M File(s)',
    }),
  };

  async run() {
    const { flags } = await this.parse(CKL2POAM);
    const logger = createWinstonLogger('ckl2poam', flags.logLevel);

    const officeOrgsAndDeviceNames = Object.fromEntries(flags.input.map((fileName: string) => {
      let officeOrg = flags.officeOrg;
      if (!officeOrg) {
        officeOrg = prompt(`What should the default value be for Office/org for ${fileName}? `);
      }
      let deviceName = flags.deviceName;
      if (!deviceName) {
        deviceName = prompt(`What is the device name for ${fileName}? `);
      }
      return [fileName, { officeOrg, deviceName }];
    }));

    await mkdir(flags.output, { recursive: true });

    await Promise.all(flags.input.map(async (fileName: string) => {
      // Ignore files that start with . (e.g .gitignore)
      if (fileName.startsWith('.')) {
        return;
      }

      logger.info(`${fileName}: Opening file`);

      let data;
      try {
        data = await readFile(fileName, { encoding: 'utf8' });
      } catch (readFileError) {
        logger.error(`${fileName}: An error occurred opening the file ${fileName}: ${readFileError instanceof Error ? readFileError.message : JSON.stringify(readFileError)}`);
        throw readFileError;
      }

      let result: STIG;
      // https://stackoverflow.com/a/79876267 - parser options for fast-xml-parser that match xml2js' behavior; can look into removing exact compability later
      const parser = new XMLParser({
        ignoreAttributes: false,
        ignoreDeclaration: true,
        attributeNamePrefix: '',
        attributesGroupName: '$',
        textNodeName: '_',
        parseTagValue: false,
        parseAttributeValue: false,
        isArray: (name, jpath, isLeafNode, isAttribute) => {
          return !isAttribute && _.isString(jpath) && jpath.includes('.');
        },
        trimValues: false,
        tagValueProcessor: (_tagName, tagValue) => {
          if (typeof tagValue === 'string' && tagValue.includes('\n') && tagValue.trim().length === 0) {
            return '';
          }
          return tagValue;
        },
      });
      try {
        result = parser.parse(data);
      } catch (parseFileError) {
        logger.error(`${fileName}: An error occurred parsing the file: ${parseFileError instanceof Error ? parseFileError.message : JSON.stringify(parseFileError)}`);
        throw parseFileError;
      }

      const infos: Record<string, string> = {};
      let vulnerabilities: Vulnerability[] = [];
      const iStigs: STIGHolder[] = [];
      const stigs = result.CHECKLIST.STIGS;
      logger.info(`${fileName}: Found ${stigs?.length} STIGs`);

      // Get nested iSTIGs
      if (stigs) {
        for (const stig of stigs) {
          if (stig.iSTIG) {
            for (const iStig of stig.iSTIG) {
              iStigs.push(iStig);
            }
          }
        }
      }
      logger.info(`${fileName}: Found ${iStigs.length} iSTIGs`);

      // Get the controls/vulnerabilities from each stig
      for (const iSTIG of iStigs) {
        if (iSTIG.STIG_INFO) {
          for (const info of iSTIG.STIG_INFO) {
            if (info.SI_DATA) {
              for (const data of info.SI_DATA) {
                if (data.SID_DATA) {
                  infos[data.SID_NAME[0]] = data.SID_DATA[0];
                }
              }
            }
          }
        }
        if (iSTIG.VULN) {
          vulnerabilities = [
            ...vulnerabilities,
            ...iSTIG.VULN.map((vulnerability) => {
              const values: Record<string, unknown> = {};
              // Extract STIG_DATA
              if (vulnerability.STIG_DATA) {
                for (const data of vulnerability.STIG_DATA.toReversed()) {
                  values[data.VULN_ATTRIBUTE[0]] = data.ATTRIBUTE_DATA[0];
                }
              }
              // Extract remaining fields (status, finding details, comments, security override, and severity justification)
              for (const [key, value] of Object.entries(vulnerability)) {
                values[key] = value?.[0];
              }
              return values;
            }),
          ];
        }
      }
      logger.info(`${fileName}: Found ${vulnerabilities.length} vulnerabilities`);

      const officeOrg = officeOrgsAndDeviceNames[fileName].officeOrg;
      const deviceName = officeOrgsAndDeviceNames[fileName].deviceName;
      // Read our template
      const workBook = await XlsxPopulate.fromDataAsync(dataURLtoU8Array(files.POAMTemplate.data));
      // eMASS reads the first sheet in the notebook
      const sheet = workBook.sheet(0);
      // The current row we are on
      let currentRow = STARTING_ROW;
      // The scheduled completion date, default of one year from today
      const aYearFromNow = moment(
        new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      ).format('M/DD/YYYY');
      // For each vulnerability
      for (const vulnerability of vulnerabilities) {
        if (
          vulnerability.STATUS !== 'NotAFinding'
          && vulnerability.STATUS !== 'Not_Reviewed'
        ) {
          // Control Vulnerability Description
          if (vulnerability.STATUS === 'Not_Applicable') {
            sheet.cell(`C${currentRow}`).value('Not Applicable');
          } else {
            sheet
              .cell(`C${currentRow}`)
              .value(
                replaceSpecialCharacters(createCVD(vulnerability)),
              );
          }

          // Security Control Number
          sheet
            .cell(`D${currentRow}`)
            .value(cci2nist(vulnerability.CCI_REF || ''));
          // Office/org
          sheet.cell(`E${currentRow}`).value(officeOrg);
          // Security Checks
          sheet
            .cell(`F${currentRow}`)
            .value(vulnerability.Rule_ID?.split(',')[0]);
          // Resources Required
          sheet.cell(`G${currentRow}`).value('NA');
          // Scheduled Completion Date
          // Default is one year from today
          sheet.cell(`H${currentRow}`).value(aYearFromNow);
          // Source Identifying Vulnerability
          sheet.cell(`K${currentRow}`).value(infos.title || '');
          // Status
          sheet
            .cell(`L${currentRow}`)
            .value(cleanStatus(vulnerability.STATUS || ''));
          // Comments
          if (
            vulnerability.STATUS === 'Open'
            || vulnerability.STATUS === 'Not_Applicable'
          ) {
            if (deviceName.startsWith('Nessus')) {
              sheet
                .cell(`M${currentRow}`)
                .value(
                  combineComments(
                    vulnerability,
                    extractSTIGUrl(vulnerability.FINDING_DETAILS || ''),
                  ),
                );
            } else {
              sheet
                .cell(`M${currentRow}`)
                .value(combineComments(vulnerability, deviceName));
            }
          }

          // Raw Severity
          sheet
            .cell(`N${currentRow}`)
            .value(convertToRawSeverity(vulnerability.Severity || ''));
          // Severity
          sheet
            .cell(`P${currentRow}`)
            .value(
              cklSeverityToPOAMSeverity(vulnerability.Severity || ''),
            );
          // Relevance of Threat
          sheet
            .cell(`Q${currentRow}`)
            .value(
              cklSeverityToRelevanceOfThreat(),
            );
          // Likelihood
          sheet
            .cell(`R${currentRow}`)
            .value(
              cklSeverityToLikelihood(vulnerability.Severity || ''),
            );
          // Impact
          sheet
            .cell(`S${currentRow}`)
            .value(cklSeverityToImpact(vulnerability.Severity || ''));
          // Residual Risk Level
          sheet
            .cell(`U${currentRow}`)
            .value(
              cklSeverityToResidualRiskLevel(
                vulnerability.Severity || '',
              ),
            );
          // Impact Description
          sheet
            .cell(`T${currentRow}`)
            .value(
              replaceSpecialCharacters(vulnerability.Vuln_Discuss || ''),
            );
          // Recommendations
          sheet
            .cell(`V${currentRow}`)
            .value(
              replaceSpecialCharacters(
                vulnerability.Fix_Text
                || extractSolution(
                  vulnerability.FINDING_DETAILS || '',
                )
                || '',
              ),
            );
          // Go to the next row
          currentRow += flags.rowsToSkip + 1;
        }
      }
      return workBook.toFileAsync(path.join(flags.output, `${basename(fileName)}-${moment(new Date()).format('YYYY-MM-DD-HHmm')}.xlsm`));
    }));
  }
}
