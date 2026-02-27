import fs from 'fs';
import _ from 'lodash';
import path from 'path';
import {
  AnchoreGrypeMapper,
  ASFFResults,
  BurpSuiteMapper,
  ChecklistResults,
  ConveyorResults,
  CycloneDXSBOMResults,
  DBProtectMapper,
  DependencyTrackMapper,
  fingerprint,
  FortifyMapper,
  JfrogXrayMapper,
  MsftSecureScoreMapper,
  NessusResults,
  NetsparkerMapper,
  NeuVectorMapper,
  NiktoMapper,
  PrismaMapper,
  SarifMapper,
  ScoutsuiteMapper,
  SnykResults,
  TrufflehogResults,
  TwistlockResults,
  XCCDFResultsMapper,
  ZapMapper,
} from '@mitre/hdf-converters';
import { Flags } from '@oclif/core';
import { basename, checkSuffix } from '../../utils/global';
import { BaseCommand } from '../../utils/oclif/baseCommand';
import ASFF2HDF from './asff2hdf';
import Zap2HDF from './zap2hdf';

function getInputFilename(): string {
  const inputFileIndex = process.argv.findIndex(
    param => param.toLowerCase() === '-i' || param.toLowerCase() === '--input',
  );
  if (inputFileIndex === -1) {
    return process.env.INPUT_FILE ?? '';
  }

  return process.argv[inputFileIndex + 1];
}

// export default class Convert extends Command {
export default class Convert extends BaseCommand<typeof Convert> {
  static readonly description
    = 'The generic convert command translates any supported file-based security results set into the Heimdall Data Format';

  static readonly examples = ['<%= config.bin %> <%= command.id %> -i input -o output'];

  static readonly flags = {
    input: Flags.string({
      char: 'i',
      required: true,
      description: 'Input results set file',
    }),
    output: Flags.string({
      char: 'o',
      required: true,
      description: 'Output results sets',
    }),
    ...Convert.getFlagsForInputFile(getInputFilename()),
  };

  static detectedType: string;

  static getFlagsForInputFile(filePath: string) {
    if (filePath) {
      Convert.detectedType = fingerprint({
        data: fs.readFileSync(filePath, 'utf8'),
        filename: basename(filePath),
      });
      switch (
        Convert.detectedType // skipcq: JS-0047
      ) {
        case 'asff': {
          return ASFF2HDF.flags;
        }

        case 'zap': {
          return Zap2HDF.flags;
        }

        // catch all other cases:
        // 'anchoregrype', 'burp', 'conveyor' 'checklist', 'dbProtect', 'dependencyTrack', 'fortify',
        // 'jfrog', 'msft_secure_score', 'nessus', 'netsparker', 'neuvector' 'nikto',
        // 'prisma', 'sarif', 'cyclonedx_sbom', 'scoutsuite', 'snyk', 'trufflehog',
        // 'twistlock', 'xccdf'
        default: {
          return {};
        }
      }
    }

    return {};
  }

  // skipcq: JS-R1005
  async run() {
    // skipcq: JS-0044
    const { flags } = await this.parse(Convert);
    let converter;
    switch (Convert.detectedType) {
      case 'anchoregrype': {
        converter = new AnchoreGrypeMapper(
          fs.readFileSync(flags.input, 'utf8'),
        );
        fs.writeFileSync(
          checkSuffix(flags.output),
          JSON.stringify(converter.toHdf(), null, 2),
        );
        break;
      }

      case 'asff': {
        const securityhub = _.get(flags, 'securityhub') as unknown as string[];
        const files = securityhub?.map(file => fs.readFileSync(file, 'utf8'));

        converter = new ASFFResults(
          fs.readFileSync(flags.input, 'utf8'),
          files,
        );

        const results = converter.toHdf();

        fs.mkdirSync(flags.output);
        _.forOwn(results, (result, filename) => {
          fs.writeFileSync(
            path.join(flags.output, checkSuffix(basename(filename))),
            JSON.stringify(result, null, 2),
          );
        });
        break;
      }

      case 'burp': {
        converter = new BurpSuiteMapper(fs.readFileSync(flags.input, 'utf8'));
        fs.writeFileSync(
          checkSuffix(flags.output),
          JSON.stringify(converter.toHdf(), null, 2),
        );
        break;
      }

      case 'conveyor': {
        converter = new ConveyorResults(fs.readFileSync(flags.input, 'utf8'));
        const results = converter.toHdf();
        fs.mkdirSync(flags.output);
        for (const [filename, result] of Object.entries(results)) {
          fs.writeFileSync(
            path.join(flags.output, checkSuffix(basename(filename as string))),
            JSON.stringify(result, null, 2),
          );
        }

        break;
      }

      case 'checklist': {
        converter = new ChecklistResults(fs.readFileSync(flags.input, 'utf8'));
        fs.writeFileSync(
          checkSuffix(flags.output),
          JSON.stringify(converter.toHdf(), null, 2),
        );
        break;
      }

      case 'dbProtect': {
        converter = new DBProtectMapper(fs.readFileSync(flags.input, 'utf8'));
        fs.writeFileSync(
          checkSuffix(flags.output),
          JSON.stringify(converter.toHdf(), null, 2),
        );
        break;
      }

      case 'dependencyTrack': {
        converter = new DependencyTrackMapper(fs.readFileSync(flags.input, 'utf8'));
        fs.writeFileSync(
          checkSuffix(flags.output),
          JSON.stringify(converter.toHdf(), null, 2),
        );
        break;
      }

      case 'cyclonedx_sbom': {
        converter = new CycloneDXSBOMResults(
          fs.readFileSync(flags.input, 'utf8'),
        );
        fs.writeFileSync(
          checkSuffix(flags.output),
          JSON.stringify(converter.toHdf(), null, 2),
        );
        break;
      }

      case 'fortify': {
        converter = new FortifyMapper(fs.readFileSync(flags.input, 'utf8'));
        fs.writeFileSync(
          checkSuffix(flags.output),
          JSON.stringify(converter.toHdf(), null, 2),
        );
        break;
      }

      case 'jfrog': {
        converter = new JfrogXrayMapper(fs.readFileSync(flags.input, 'utf8'));
        fs.writeFileSync(
          checkSuffix(flags.output),
          JSON.stringify(converter.toHdf(), null, 2),
        );
        break;
      }

      case 'msft_secure_score': {
        converter = new MsftSecureScoreMapper(
          fs.readFileSync(flags.input, 'utf8'),
        );
        fs.writeFileSync(
          checkSuffix(flags.output),
          JSON.stringify(converter.toHdf(), null, 2),
        );
        break;
      }

      case 'nessus': {
        converter = new NessusResults(fs.readFileSync(flags.input, 'utf8'));
        const result = converter.toHdf();
        const pluralResults = Array.isArray(result) ? result : [];
        const singularResult = pluralResults.length === 0;
        for (const element of pluralResults) {
          fs.writeFileSync(
            `${flags.output.replaceAll(/\.json/gi, '')}-${basename(_.get(element, 'platform.target_id') || '')}.json`,
            JSON.stringify(element, null, 2),
          );
        }

        if (singularResult) {
          fs.writeFileSync(
            `${checkSuffix(flags.output)}`,
            JSON.stringify(result, null, 2),
          );
        }

        break;
      }

      case 'neuvector': {
        converter = new NeuVectorMapper(fs.readFileSync(flags.input, 'utf8'));
        fs.writeFileSync(
          checkSuffix(flags.output),
          JSON.stringify(converter.toHdf(), null, 2),
        );
        break;
      }

      case 'netsparker': {
        converter = new NetsparkerMapper(fs.readFileSync(flags.input, 'utf8'));
        fs.writeFileSync(
          checkSuffix(flags.output),
          JSON.stringify(converter.toHdf(), null, 2),
        );
        break;
      }

      case 'nikto': {
        converter = new NiktoMapper(fs.readFileSync(flags.input, 'utf8'));
        fs.writeFileSync(
          checkSuffix(flags.output),
          JSON.stringify(converter.toHdf(), null, 2),
        );
        break;
      }

      case 'prisma': {
        converter = new PrismaMapper(
          fs.readFileSync(flags.input, { encoding: 'utf8' }),
        );
        const results = converter.toHdf();

        fs.mkdirSync(flags.output);
        _.forOwn(results, (result) => {
          fs.writeFileSync(
            path.join(
              flags.output,
              basename(`${_.get(result, 'platform.target_id')}.json`),
            ),
            JSON.stringify(result, null, 2),
          );
        });
        break;
      }

      case 'sarif': {
        converter = new SarifMapper(fs.readFileSync(flags.input, 'utf8'));
        fs.writeFileSync(
          checkSuffix(flags.output),
          JSON.stringify(converter.toHdf(), null, 2),
        );
        break;
      }

      case 'scoutsuite': {
        converter = new ScoutsuiteMapper(fs.readFileSync(flags.input, 'utf8'));
        fs.writeFileSync(
          checkSuffix(flags.output),
          JSON.stringify(converter.toHdf(), null, 2),
        );
        break;
      }

      case 'snyk': {
        converter = new SnykResults(fs.readFileSync(flags.input, 'utf8'));
        const result = converter.toHdf();
        const pluralResults = Array.isArray(result) ? result : [];
        const singularResult = pluralResults.length === 0;
        for (const element of pluralResults) {
          fs.writeFileSync(
            `${flags.output.replaceAll(/\.json/gi, '')}-${basename(_.get(element, 'platform.target_id') || '')}.json`,
            JSON.stringify(element, null, 2),
          );
        }

        if (singularResult) {
          fs.writeFileSync(
            `${checkSuffix(flags.output)}`,
            JSON.stringify(result, null, 2),
          );
        }

        break;
      }

      case 'trufflehog': {
        converter = new TrufflehogResults(fs.readFileSync(flags.input, 'utf8'));
        fs.writeFileSync(
          checkSuffix(flags.output),
          JSON.stringify(converter.toHdf(), null, 2),
        );
        break;
      }

      case 'twistlock': {
        converter = new TwistlockResults(fs.readFileSync(flags.input, 'utf8'));
        fs.writeFileSync(
          checkSuffix(flags.output),
          JSON.stringify(converter.toHdf(), null, 2),
        );
        break;
      }

      case 'xccdf': {
        converter = new XCCDFResultsMapper(
          fs.readFileSync(flags.input, 'utf8'),
        );
        fs.writeFileSync(
          checkSuffix(flags.output),
          JSON.stringify(converter.toHdf(), null, 2),
        );
        break;
      }

      case 'zap': {
        converter = new ZapMapper(
          fs.readFileSync(flags.input, 'utf8'),
          _.get(flags, 'name') as unknown as string,
        );
        fs.writeFileSync(
          checkSuffix(flags.output),
          JSON.stringify(converter.toHdf(), null, 2),
        );
        break;
      }

      default: {
        throw new Error(`Unknown filetype provided: ${getInputFilename()}
        The generic convert command should only be used for taking supported file-based security results and converting into Heimdall Data Format
        For more information, run "saf convert --help"`);
      }
    }
  }
}
