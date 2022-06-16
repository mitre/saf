import { ASFFResults, BurpSuiteMapper, DBProtectMapper, FortifyMapper, JfrogXrayMapper, NessusResults, NetsparkerMapper, NiktoMapper, SarifMapper, ScoutsuiteMapper, SnykMapper, TwistlockMapper, XCCDFResultsMapper, ZapMapper } from "@mitre/hdf-converters";
import { Command, Flags } from '@oclif/core'
import fs from 'fs';
import _ from 'lodash';
import { checkSuffix } from '../../utils/global'
import path from 'path';
import FingerprintingConvertCommand from "./fingerprintingConvertCommand";

export default class Convert extends FingerprintingConvertCommand {
  static flags = {
    ...FingerprintingConvertCommand.flags,
    ...FingerprintingConvertCommand.additionalFlags
  }

  async run() {
    const flags = await this.parse(Convert);
    let converter;

    switch (FingerprintingConvertCommand.detectedType) {
      case 'asff':
        let securityhub = _.get(flags, 'securityhub') as string[]
        if (securityhub) {
          securityhub = securityhub.map(file =>
            fs.readFileSync(file, 'utf8'),
          )
        }

        converter = new ASFFResults(
          fs.readFileSync(flags.input, 'utf8'),
          securityhub,
        )
        const results = converter.toHdf()

        fs.mkdirSync(flags.output)
        _.forOwn(results, (result, filename) => {
          fs.writeFileSync(
            path.join(flags.output, checkSuffix(filename)),
            JSON.stringify(result),
          )
        })
        break;
      case 'burp':
        converter = new BurpSuiteMapper(fs.readFileSync(flags.input, 'utf8'))
        fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
        break;
      case 'dbProtect':
        converter = new DBProtectMapper(fs.readFileSync(flags.input, 'utf8'))
        fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
        break;
      case 'fortify':
        converter = new FortifyMapper(fs.readFileSync(flags.input, 'utf8'))
        fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
        break;
      case 'jfrog':
        converter = new JfrogXrayMapper(fs.readFileSync(flags.input, 'utf8'))
        fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
        break;
      case 'nessus':
        converter = new NessusResults(fs.readFileSync(flags.input, 'utf8'))
        fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
        break;
      case 'netsparker':
        converter = new NetsparkerMapper(fs.readFileSync(flags.input, 'utf8'))
        fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
        break;
      case 'nikto':
        converter = new NiktoMapper(fs.readFileSync(flags.input, 'utf8'))
        fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
        break;
      case 'sarif':
        converter = new SarifMapper(fs.readFileSync(flags.input, 'utf8'))
        fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
        break;
      case 'scoutsuite':
        converter = new ScoutsuiteMapper(fs.readFileSync(flags.input, 'utf8'))
        fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
        break;
      case 'snyk':
        converter = new SnykMapper(fs.readFileSync(flags.input, 'utf8'))
        fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
        break;
      case 'twistlock':
        converter = new TwistlockMapper(fs.readFileSync(flags.input, 'utf8'))
        fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
        break;
      case 'xccdf':
        converter = new XCCDFResultsMapper(fs.readFileSync(flags.input, 'utf8'))
        fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
        break;
      case 'zap':
        converter = new ZapMapper(fs.readFileSync(flags.input, 'utf8'), flags.name)
        fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
        break;
    }
  }
}
