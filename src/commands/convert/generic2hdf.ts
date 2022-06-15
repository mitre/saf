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

export default class Generic2HDF extends Command {

  // All this stuff should be finished up later
  static usage = 'convert fortify2hdf -i, --input=FVDL -o, --output=OUTPUT'

  static description = 'Translate a Fortify results FVDL file into a Heimdall Data Format JSON file'

  static examples = ['saf convert fortify2hdf -i audit.fvdl -o output-hdf-name.json']

  static flags = {
    help: Flags.help({ char: 'h' }),
    input: Flags.string({ char: 'i', required: true }),
    output: Flags.string({ char: 'o', required: true }),
  }

  async run() {
    const { flags } = await this.parse(Generic2HDF)

    let converter; // Make BaseConverter an exported member of hdf-converters? otherwise there's no generic way
    // unless we want to repeat lines

    if (flags.input) { // If we have an input file specified, run it through the fingerprint
      const filename = flags.input.split('/').pop();
      const data = fs.readFileSync(flags.input, 'utf8')

      const typeGuess = fingerprint({
        data: data,
        filename: filename
      });

      switch (typeGuess) {
        case 'jfrog':
          converter = new JfrogXrayMapper(data).toHdf();
        case 'asff':
          converter = Object.values(
            new ASFFResultsMapper(data).toHdf()
          );
        case 'zap':
          converter = new ZapMapper(data).toHdf();
        case 'nikto':
          converter = new NiktoMapper(data).toHdf();
        case 'sarif':
          converter = new SarifMapper(data).toHdf();
        case 'snyk':
          converter = new SnykResults(data).toHdf();
        case 'twistlock':
          converter = new TwistlockMapper(data).toHdf();
        case 'nessus':
          converter = new NessusResults(data).toHdf();
        case 'xccdf':
          converter = new XCCDFResultsMapper(data).toHdf();
        case 'burp':
          converter = new BurpSuiteMapper(data).toHdf();
        case 'ionchannel':
          converter = new IonChannelMapper(data).toHdf();
        case 'scoutsuite':
          converter = new ScoutsuiteMapper(data).toHdf();
        case 'dbProtect':
          converter = new DBProtectMapper(data).toHdf();
        case 'netsparker':
          converter = new NetsparkerMapper(data).toHdf();
        case 'prisma':
          converter = new PrismaMapper(data).toHdf();
        default:
        // Error message goes here
      }
    } else {

    }

    fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
  }
}
