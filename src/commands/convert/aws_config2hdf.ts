import {Command, Flags} from '@oclif/core'
import {AwsConfigMapper as Mapper} from '@mitre/hdf-converters'
import {ExecJSON} from 'inspecjs'
import {checkSuffix} from '../../utils/global'
import {writeFileURI} from '../../utils/io'

export default class AWSConfig2HDF extends Command {
  static usage = 'convert aws_config2hdf -r <region> -o <hdf-scan-results-json> [-h] [-a <access-key-id>] [-s <secret-access-key>] [-t <session-token>] [-i]'

  static description = 'Pull Configuration findings from AWS Config and convert into a Heimdall Data Format JSON file'

  static examples = ['saf convert aws_config2hdf -a ABCDEFGHIJKLMNOPQRSTUV -s +4NOT39A48REAL93SECRET934 -r us-east-1 -o output-hdf-name.json']

  static flags = {
    help: Flags.help({char: 'h'}),
    accessKeyId: Flags.string({char: 'a', required: false, description: 'Access key ID'}),
    secretAccessKey: Flags.string({char: 's', required: false, description: 'Secret access key'}),
    sessionToken: Flags.string({char: 't', required: false, description: 'Session token'}),
    region: Flags.string({char: 'r', required: true, description: 'Region to pull findings from'}),
    insecure: Flags.boolean({char: 'i', required: false, default: false, description: 'Disable SSL verification, this is insecure.'}),
    output: Flags.string({char: 'o', required: true, description: 'Output HDF JSON File'}),
  }

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
    }, !flags.insecure) : new Mapper({region: flags.region}, !flags.insecure)

    await writeFileURI(checkSuffix(flags.output), JSON.stringify(this.ensureRefs(await converter.toHdf())))
  }
}
