import {ASFFResults, BurpSuiteMapper, DBProtectMapper, FortifyMapper, JfrogXrayMapper, NessusResults, NetsparkerMapper, NiktoMapper, SarifMapper, ScoutsuiteMapper, SnykResults, TwistlockMapper, XCCDFResultsMapper, ZapMapper} from '@mitre/hdf-converters'
import fs from 'fs'
import _ from 'lodash'
import {checkSuffix} from '../../utils/global'
import path from 'path'
import FingerprintingConvertCommand from '../../basecommands/fingerprintingConvertCommand'

function getInputFilename(): string {
  const inputFileIndex = process.argv.findIndex(param => param.toLowerCase() === '-i' || param.toLowerCase() === '--input')
  if (inputFileIndex === -1) {
    return process.env.INPUT_FILE || ''
  }

  return process.argv[inputFileIndex + 1]
}

export default class Convert extends FingerprintingConvertCommand {
  static description = 'The generic convert command translates any supported file-based security results set into the Heimdall Data Format'

  static examples = ['saf convert -i input -o output']

  static flags = {
    ...FingerprintingConvertCommand.flags,
    ...FingerprintingConvertCommand.prototype.getFlagsForInputFile(getInputFilename()),
  }

  async run() {
    const {flags} = await this.parse(Convert)
    let converter
    switch (FingerprintingConvertCommand.detectedType) {
    case 'asff': {
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
      break
    }

    case 'burp': {
      converter = new BurpSuiteMapper(fs.readFileSync(flags.input, 'utf8'))
      fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
      break
    }

    case 'dbProtect': {
      converter = new DBProtectMapper(fs.readFileSync(flags.input, 'utf8'))
      fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
      break
    }

    case 'fortify': {
      converter = new FortifyMapper(fs.readFileSync(flags.input, 'utf8'))
      fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
      break
    }

    case 'jfrog': {
      converter = new JfrogXrayMapper(fs.readFileSync(flags.input, 'utf8'))
      fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
      break
    }

    case 'nessus': {
      converter = new NessusResults(fs.readFileSync(flags.input, 'utf8'))
      fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
      break
    }

    case 'netsparker': {
      converter = new NetsparkerMapper(fs.readFileSync(flags.input, 'utf8'))
      fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
      break
    }

    case 'nikto': {
      converter = new NiktoMapper(fs.readFileSync(flags.input, 'utf8'))
      fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
      break
    }

    case 'sarif': {
      converter = new SarifMapper(fs.readFileSync(flags.input, 'utf8'))
      fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
      break
    }

    case 'scoutsuite': {
      converter = new ScoutsuiteMapper(fs.readFileSync(flags.input, 'utf8'))
      fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
      break
    }

    case 'snyk': {
      converter = new SnykResults(fs.readFileSync(flags.input, 'utf8'))
      const result = converter.toHdf()
      if (Array.isArray(result)) {
        for (const element of result) {
          fs.writeFileSync(`${flags.output.replace(/.json/gi, '')}-${_.get(element, 'platform.target_id')}.json`, JSON.stringify(element))
        }
      } else {
        fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(result))
      }

      break
    }

    case 'twistlock': {
      converter = new TwistlockMapper(fs.readFileSync(flags.input, 'utf8'))
      fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
      break
    }

    case 'xccdf': {
      converter = new XCCDFResultsMapper(fs.readFileSync(flags.input, 'utf8'))
      fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
      break
    }

    case 'zap': {
      converter = new ZapMapper(fs.readFileSync(flags.input, 'utf8'), _.get(flags, 'name') as string)
      fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
      break
    }

    default: {
      throw new Error(`Unknown filetype provided: ${getInputFilename()}
        The generic convert command should only be used for taking supported file-based security results and converting into Heimdall Data Format
        For more information, run "saf convert --help"`)
    }
    }
  }
}
