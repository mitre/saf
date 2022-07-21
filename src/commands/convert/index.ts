import {ASFFResults, BurpSuiteMapper, DBProtectMapper, fingerprint, FortifyMapper, JfrogXrayMapper, NessusResults, NetsparkerMapper, NiktoMapper, PrismaMapper, SarifMapper, ScoutsuiteMapper, SnykResults, TwistlockMapper, XCCDFResultsMapper, ZapMapper} from '@mitre/hdf-converters'
import fs from 'fs'
import _ from 'lodash'
import {checkSuffix, convertFullPathToFilename} from '../../utils/global'
import path from 'path'
import ASFF2HDF from './asff2hdf'
import {Command, Flags} from '@oclif/core'
import Zap2HDF from './zap2hdf'

function getInputFilename(): string {
  const inputFileIndex = process.argv.findIndex(param => param.toLowerCase() === '-i' || param.toLowerCase() === '--input')
  if (inputFileIndex === -1) {
    return process.env.INPUT_FILE || ''
  }

  return process.argv[inputFileIndex + 1]
}

export default class Convert extends Command {
  static description = 'The generic convert command translates any supported file-based security results set into the Heimdall Data Format'

  static examples = ['saf convert -i input -o output']

  static flags = {
    input: Flags.string({char: 'i', required: true, description: 'Input results set file'}),
    output: Flags.string({char: 'o', required: true, description: 'Output results sets'}),
    ...Convert.getFlagsForInputFile(getInputFilename()),
  }

  static getFlagsForInputFile(path: string) {
    if (path) {
      Convert.detectedType = fingerprint({data: fs.readFileSync(path, 'utf8'), filename: convertFullPathToFilename(path)})
      switch (Convert.detectedType) {
      case 'asff':
        return ASFF2HDF.flags
      case 'zap':
        return Zap2HDF.flags
      case 'burp':
      case 'dbProtect':
      case 'fortify':
      case 'jfrog':
      case 'nessus':
      case 'netsparker':
      case 'nikto':
      case 'prisma':
      case 'sarif':
      case 'scoutsuite':
      case 'snyk':
      case 'twistlock':
      case 'xccdf':
        return {}
      }
    }

    return {}
  }

  static detectedType: string;

  async run() {
    console.log('Hello')
    console.log(Convert.flags)
    const {flags} = await this.parse(Convert)
    let converter
    switch (Convert.detectedType) {
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
      const result = converter.toHdf()
      if (Array.isArray(result)) {
        for (const element of result) {
          fs.writeFileSync(`${flags.output.replace(/.json/gi, '')}-${_.get(element, 'platform.target_id')}.json`, JSON.stringify(element))
        }
      } else {
        fs.writeFileSync(`${checkSuffix(flags.output)}`, JSON.stringify(result))
      }

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

    case 'prisma': {
      converter = new PrismaMapper(
        fs.readFileSync(flags.input, {encoding: 'utf8'}),
      )
      const results = converter.toHdf()

      fs.mkdirSync(flags.output)
      _.forOwn(results, result => {
        fs.writeFileSync(
          path.join(flags.output, `${_.get(result, 'platform.target_id')}.json`),
          JSON.stringify(result),
        )
      })
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
