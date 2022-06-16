import {Command, Flags} from '@oclif/core'
import * as fs from 'fs'
import {
  fingerprint,
} from '@mitre/hdf-converters'
import {OutputFlags, Input} from '@oclif/core/lib/interfaces/parser'
import {convertFullPathToFilename} from '../../utils/global'

export default abstract class FingerprintingConvertCommand extends Command {
  static flags = {
    input: Flags.string({required: true, description: 'Input results set file'}),
    output: Flags.string({required: true, description: 'Output results sets'}),
  }

  protected additionalFlags = {};

  protected static detectedType = '';

  protected parsedFlags?: OutputFlags<typeof FingerprintingConvertCommand.flags>;

  getFlagsForInputFile(path: string) {
    const fileType = fingerprint({data: fs.readFileSync(path, 'utf8'), filename: convertFullPathToFilename(path)})

    switch (fileType) {
    case 'asff':
      FingerprintingConvertCommand.detectedType = 'asff'
      return {
        securityhub: Flags.string({
          required: false,
          multiple: true,
          description: 'Additional input files to provide context that an ASFF file needs such as the CIS AWS Foundations or AWS Foundational Security Best Practices documents (in ASFF compliant JSON form)',
        }),
      }
    case 'burp':
      FingerprintingConvertCommand.detectedType = 'burp'
      break
    case 'dbProtect':
      FingerprintingConvertCommand.detectedType = 'dbProtect'
      break
    case 'fortify':
      FingerprintingConvertCommand.detectedType = 'fortify'
      break
    case 'jfrog':
      FingerprintingConvertCommand.detectedType = 'jfrog'
      break
    case 'nessus':
      FingerprintingConvertCommand.detectedType = 'nessus'
      break
    case 'netsparker':
      FingerprintingConvertCommand.detectedType = 'netsparker'
      break
    case 'nikto':
      FingerprintingConvertCommand.detectedType = 'nikto'
      break
    case 'sarif':
      FingerprintingConvertCommand.detectedType = 'sarif'
      break
    case 'scoutsuite':
      FingerprintingConvertCommand.detectedType = 'scoutsuite'
      break
    case 'snyk':
      FingerprintingConvertCommand.detectedType = 'snyk'
      break
    case 'twistlock':
      FingerprintingConvertCommand.detectedType = 'twistlock'
      break
    case 'xccdf':
      FingerprintingConvertCommand.detectedType = 'xccdf'
      break
    case 'zap':
      FingerprintingConvertCommand.detectedType = 'zap'
      return {
        name: Flags.string({
          char: 'n',
          required: true,
        }),
      }
    default:
      throw new Error(`Unknown filetype provided: ${path}`)
    }
  }

  async init() {
    const {flags} = await this.parse(this.constructor as Input<typeof FingerprintingConvertCommand.flags>)
    this.parsedFlags = flags
  }
}
