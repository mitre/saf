import {
  ASFFMapper,
  BurpSuiteMapper,
  DBProtectMapper,
  JfrogXrayMapper,
  NessusResults,
  NetsparkerMapper,
  NiktoMapper,
  SarifMapper,
  ScoutsuiteMapper,
  SnykResults,
  XCCDFResultsMapper,
  ZapMapper,
} from '@mitre/hdf-converters'
import {Command, flags} from '@oclif/command'
import fs from 'fs'
import _ from 'lodash'
import {convertFullPathToFilename} from '../../utils/global'

// Fields to look for inside of JSON structures to determine type before passing to hdf-converters
export const fileTypeFingerprints = {
  asff: ['Findings', 'AwsAccountId', 'ProductArn'],
  fortify: ['FVDL', 'FVDL.EngineData.EngineVersion', 'FVDL.UUID'],
  jfrog: ['total_count', 'data'],
  nikto: ['banner', 'host', 'ip', 'port', 'vulnerabilities'],
  sarif: ['$schema', 'version', 'runs'],
  snyk: [
    'projectName',
    'policy',
    'summary',
    'vulnerabilities',
    'vulnerabilities[0].identifiers',
  ],
  zap: ['@generated', '@version', 'site'],
}

export default class Convert extends Command {
  static usage =
    'convert -i, --input=INPUT -o, --output=OUTPUT-HDF.json';

  static description =
    'Translate an unknown filetype into a Heimdall Data Format JSON';

  static examples = [
    'saf convert -i burpsuite_results.xml -o output-hdf-name.json',
    'saf convert -i check_results_details_report.xml -o output-hdf-name.json',
    'saf convert -i xray_results.json -o output-hdf-name.json',
    'saf convert -i nessus_results.xml -o output-hdf-name.json',
  ];

  static flags = {
    help: flags.help({char: 'h'}),
    input: flags.string({
      char: 'i',
      required: true,
      description: 'Input file',
    }),
    output: flags.string({char: 'o', required: true}),
  };

  async run() {
    const {flags} = this.parse(Convert)
    const inputData = fs.readFileSync(flags.input, 'utf-8')
    const filename = convertFullPathToFilename(flags.input)
    const typeGuess = await this.guessType({
      data: inputData,
      filename: convertFullPathToFilename(flags.input),
    })
    const convertedData = await this.convertData(typeGuess, inputData, filename)
    fs.writeFileSync(flags.output, JSON.stringify(convertedData))
  }

  async convertData(typeGuess: string, data: string, filename: string) {
    switch (typeGuess) {
    case 'jfrog':
      return new JfrogXrayMapper(data).toHdf()
    case 'asff':
      return new ASFFMapper(data).toHdf()
    case 'zap':
      return new ZapMapper(data).toHdf()
    case 'nikto':
      return new NiktoMapper(data).toHdf()
    case 'sarif':
      return new SarifMapper(data).toHdf()
    case 'snyk':
      return new SnykResults(data).toHdf()
    case 'nessus':
      return new NessusResults(data).toHdf()
    case 'xccdf':
      return new XCCDFResultsMapper(data).toHdf()
    case 'burp':
      return new BurpSuiteMapper(data).toHdf()
    case 'scoutsuite':
      return new ScoutsuiteMapper(data).toHdf()
    case 'dbProtect':
      return new DBProtectMapper(data).toHdf()
    case 'netsparker':
      return new NetsparkerMapper(data).toHdf()
    default:
      throw new Error(`Invalid file (${filename}), no fingerprints matched.`)
    }
  }

  async guessType(guessOptions: {
    data: string;
    filename: string;
  }): Promise<string> {
    try {
      const parsed = JSON.parse(guessOptions.data)
      const object = Array.isArray(parsed) ? parsed[0] : parsed
      // Find the fingerprints that have the most matches
      const fingerprinted = Object.entries(fileTypeFingerprints).reduce(
        (a, b) => {
          return a[1].filter(value => _.get(object, value)).length >
            b[1].filter(value => _.get(object, value)).length ?
            {
              ...a,
              count: a[1].filter(value => _.get(object, value)).length,
            } :
            {
              ...b,
              count: b[1].filter(value => _.get(object, value)).length,
            }
        },
      ) as unknown as Array<string> & { count: number }
      const result = fingerprinted[0]
      if (fingerprinted.count !== 0) {
        return result
      }
    } catch {
      // If we don't have valid json, look for known strings inside the file text
      if (guessOptions.filename.toLowerCase().endsWith('.nessus') || /<NessusClientData_v2>/g.test(guessOptions.data)) {
        return 'nessus'
      }

      if (
        /xmlns.*http.*\/xccdf/.test(guessOptions.data) || // Keys matching (hopefully) all xccdf formats
        guessOptions.filename.toLowerCase().includes('xccdf')
      ) {
        return 'xccdf'
      }

      if (/<netsparker-.*generated.*>/.test(guessOptions.data)) {
        return 'netsparker'
      }

      if (
        guessOptions.data.includes('"AwsAccountId"') &&
        guessOptions.data.includes('"SchemaVersion"')
      ) {
        return 'asff'
      }

      if (guessOptions.data.includes('issues burpVersion')) {
        return 'burp'
      }

      if (guessOptions.data.includes('scoutsuite_results')) {
        return 'scoutsuite'
      }

      if (
        guessOptions.data.includes('Policy') &&
        guessOptions.data.includes('Job Name') &&
        guessOptions.data.includes('Check ID') &&
        guessOptions.data.indexOf('Result Status')
      ) {
        return 'dbProtect'
      }
    }

    return ''
  }
}
