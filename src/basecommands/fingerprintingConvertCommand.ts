import {Command, Flags} from '@oclif/core'
import fs from 'fs'
import {fingerprint} from '@mitre/hdf-converters'
import {OutputFlags, Input} from '@oclif/core/lib/interfaces/parser'
import {convertFullPathToFilename} from '../utils/global'

export default abstract class FingerprintingConvertCommand extends Command {
  static flags = {
    input: Flags.string({char: 'i', required: true, description: 'Input results set file'}),
    output: Flags.string({char: 'o', required: true, description: 'Output results sets'}),
  }

  protected additionalFlags = {};

  protected static detectedType = '';

  protected parsedFlags?: OutputFlags<typeof FingerprintingConvertCommand.flags>;

  getFlagsForInputFile(path: string) {
    if (path) {
      FingerprintingConvertCommand.detectedType = fingerprint({data: fs.readFileSync(path, 'utf8'), filename: convertFullPathToFilename(path)})
      switch (FingerprintingConvertCommand.detectedType) {
      case 'asff':
        return {
          securityhub: Flags.string({
            required: false,
            multiple: true,
            description: 'Additional input files to provide context that an ASFF file needs such as the CIS AWS Foundations or AWS Foundational Security Best Practices documents (in ASFF compliant JSON form)',
          }),
        }
      case 'zap':
        return {
          name: Flags.string({
            char: 'n',
            required: true,
          }),
        }
      case 'burp':
      case 'dbProtect':
      case 'fortify':
      case 'jfrog':
      case 'nessus':
      case 'netsparker':
      case 'nikto':
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

  async init() {
    const {flags} = await this.parse(this.constructor as Input<typeof FingerprintingConvertCommand.flags>)
    this.parsedFlags = flags
  }
}
