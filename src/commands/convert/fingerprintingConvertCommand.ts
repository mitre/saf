import { Command, Flags } from '@oclif/core'
import * as fs from 'fs'
import {
  ASFFResults as ASFFResultsMapper,
  BurpSuiteMapper,
  DBProtectMapper,
  fingerprint,
  IonChannelMapper,
  JfrogXrayMapper,
  NessusResults,
  NetsparkerMapper,
  NiktoMapper,
  PrismaMapper,
  SarifMapper,
  ScoutsuiteMapper,
  SnykResults,
  TwistlockMapper,
  XCCDFResultsMapper,
  ZapMapper
} from '@mitre/hdf-converters';
import { checkSuffix } from '../../utils/global'
import { matchesProperty } from 'lodash';
import { OutputFlags, Input } from '@oclif/core/lib/interfaces/parser';

export default abstract class FingerprintingConvertCommand extends Command {
  static flags = {
    input: Flags.string({ required: true }),
    output: Flags.string({ required: true })
  }

  static additionalFlags = {};

  protected static detectedType = "";

  protected parsedFlags?: OutputFlags<typeof FingerprintingConvertCommand.flags>;

  async init() {
    const { flags } = await this.parse(this.constructor as Input<typeof FingerprintingConvertCommand.flags>)
    this.parsedFlags = flags
    const fileType = fingerprint(fs.readFileSync(this.parsedFlags.input, 'utf-8'))

    switch (fileType) {
      case 'asff':
        FingerprintingConvertCommand.additionalFlags = {
          securityhub: Flags.string({
            required: false,
            multiple: true,
            description: 'Additional input files to provide context that an ASFF file needs such as the CIS AWS Foundations or AWS Foundational Security Best Practices documents (in ASFF compliant JSON form)'
          })
        };
        FingerprintingConvertCommand.detectedType = 'asff';
        break;
      case 'burp':
        FingerprintingConvertCommand.detectedType = 'burp';
        break;
      case 'dbProtect':
        FingerprintingConvertCommand.detectedType = 'dbProtect';
        break;
      case 'fortify':
        FingerprintingConvertCommand.detectedType = 'fortify';
        break;
      case 'jfrog':
        FingerprintingConvertCommand.detectedType = 'jfrog';
        break;
      case 'nessus':
        FingerprintingConvertCommand.detectedType = 'nessus';
        break;
      case 'netsparker':
        FingerprintingConvertCommand.detectedType = 'netsparker';
        break;
      case 'nikto':
        FingerprintingConvertCommand.detectedType = 'nikto';
        break;
      case 'sarif':
        FingerprintingConvertCommand.detectedType = 'sarif';
        break;
      case 'scoutsuite':
        FingerprintingConvertCommand.detectedType = 'scoutsuite';
        break;
      case 'snyk':
        FingerprintingConvertCommand.detectedType = 'snyk';
        break;
      case 'twistlock':
        FingerprintingConvertCommand.detectedType = 'twistlock';
        break;
      case 'xccdf':
        FingerprintingConvertCommand.detectedType = 'xccdf';
        break;
      case 'zap':
        FingerprintingConvertCommand.additionalFlags = {
          name: Flags.string({
            char: 'n',
            required: true
          })
        };
        FingerprintingConvertCommand.detectedType = 'zap';
        break;

      default:
        throw new Error(`Unknown filetype provided: `); // TODO figure out what error we wanna print out
    }

  }
}
