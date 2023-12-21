import {AwsConfigMapper as Mapper} from '@mitre/hdf-converters'
import {Command, Flags} from '@oclif/core'
import fs from 'fs'
import {ExecJSON} from 'inspecjs'

import {checkSuffix} from '../../utils/global'

export default class AWSConfig2HDF extends Command {
  static description = 'Pull Configuration findings from AWS Config and convert into a Heimdall Data Format JSON file'

  static examples = ['saf convert aws_config2hdf -a ABCDEFGHIJKLMNOPQRSTUV -s +4NOT39A48REAL93SECRET934 -r us-east-1 -o output-hdf-name.json']

  static flags = {
    accessKeyId: Flags.string({char: 'a', description: 'Access key ID', required: false}),
    certificate: Flags.string({char: 'C', description: 'Trusted signing certificate file', exclusive: ['insecure'], required: false}),
    help: Flags.help({char: 'h'}),
    insecure: Flags.boolean({char: 'i', default: false, description: 'Disable SSL verification, this is insecure.', exclusive: ['certificate'], required: false}),
    output: Flags.string({char: 'o', description: 'Output HDF JSON File', required: true}),
    region: Flags.string({char: 'r', description: 'Region to pull findings from', required: true}),
    secretAccessKey: Flags.string({char: 's', description: 'Secret access key', required: false}),
    sessionToken: Flags.string({char: 't', description: 'Session token', required: false}),
  }

  static usage = 'convert aws_config2hdf -r <region> -o <hdf-scan-results-json> [-h] [-a <access-key-id>] [-s <secret-access-key>] [-t <session-token>] [-i]'

  // Refs may not be defined if no resources were found
  ensureRefs(output: ExecJSON.Execution): ExecJSON.Execution {
    return {
      ...output,
      profiles: output.profiles.map(profile => {
        return {
          ...profile,
          controls: profile.controls.map(control => {
            if (!control.refs || !control.results) {
              return {
                ...control,
                refs: [],
                results: [],
              }
            }

            return control
          }),
        }
      }),
    }
  }

  async run() {
    const {flags} = await this.parse(AWSConfig2HDF)

    const converter = flags.accessKeyId && flags.secretAccessKey ? new Mapper({
      credentials: {
        accessKeyId: flags.accessKeyId || '',
        secretAccessKey: flags.secretAccessKey || '',
        sessionToken: flags.sessionToken,
      },
      region: flags.region,
    }, !flags.insecure, flags.certificate ? fs.readFileSync(flags.certificate, 'utf8') : undefined) : new Mapper({region: flags.region}, !flags.insecure, flags.certificate ? fs.readFileSync(flags.certificate, 'utf8') : undefined)

    fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(this.ensureRefs(await converter.toHdf())))
  }
}
