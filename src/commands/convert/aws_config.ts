import {Command, flags} from '@oclif/command'
import fs from 'fs'
import {AwsConfigMapper as Mapper} from '@mitre/hdf-converters'
import {ExecJSON} from 'inspecjs'

function checkSuffix(input: string) {
  if (input.endsWith('.json')) {
    return input
  }
  return `${input}.json`
}

export default class AWSConfigMapper extends Command {
  static usage = 'convert:aws_config -a, --accessKeyId=accessKeyId -r, --region=region -s, --secretAccessKey=secretAccessKey -t, --sessionToken=sessionToken -o, --output=OUTPUT'

  static description = 'Pull Configuration findings from AWS Config and convert into a Heimdall Data Format JSON file'

  static examples = ['saf convert:aws_config -a ABCDEFGHIJKLMNOPQRSTUV -s +4NOT39A48REAL93SECRET934 -r us-east-1 -o output-hdf-name.json']

  static flags = {
    help: flags.help({char: 'h'}),
    accessKeyId: flags.string({char: 'a', required: false}),
    secretAccessKey: flags.string({char: 's', required: false}),
    sessionToken: flags.string({char: 't', required: false}),
    region: flags.string({char: 'r', required: true}),
    insecure: flags.boolean({char: 'i', required: false, default: false, description: 'Bypass SSL verification, this is insecure.'}),
    output: flags.string({char: 'o', required: true}),
  }

  // Refs may not be defined if no resources were found
  ensureRefs(output: ExecJSON.Execution): ExecJSON.Execution {
    return {
      ...output,
      profiles: output.profiles.map(profile => {
        return {...profile,
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
    const {flags} = this.parse(AWSConfigMapper)

    const converter = flags.accessKeyId && flags.secretAccessKey ? new Mapper({
      credentials: {
        accessKeyId: flags.accessKeyId || '',
        secretAccessKey: flags.secretAccessKey || '',
        sessionToken: flags.sessionToken,
      },
      region: flags.region,
    }, flags.insecure) : new Mapper({region: flags.region}, flags.insecure)

    fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(this.ensureRefs(await converter.toHdf())))
  }
}
