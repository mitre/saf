<<<<<<< HEAD
import BaseCommand, {omitFlags} from '../../utils/base-command'
import {OutputFlags} from '@oclif/parser'
import {flags} from '@oclif/command'
=======
import {Command, Flags} from '@oclif/core'
>>>>>>> main
import fs from 'fs'
import {AwsConfigMapper as Mapper} from '@mitre/hdf-converters'
import {ExecJSON} from 'inspecjs'
import {checkSuffix, convertFullPathToFilename} from '../../utils/global'
import {getHDFSummary} from '../../utils/logging'
import _ from 'lodash'

<<<<<<< HEAD
export default class AWSConfig2HDF extends BaseCommand {
  static usage = 'convert:aws_config2hdf -a, --accessKeyId=accessKeyId -r, --region=region -s, --secretAccessKey=secretAccessKey -t, --sessionToken=sessionToken -o, --output=OUTPUT'
=======
export default class AWSConfig2HDF extends Command {
  static usage = 'convert aws_config2hdf -a, --accessKeyId=accessKeyId -r, --region=region -s, --secretAccessKey=secretAccessKey -t, --sessionToken=sessionToken -o, --output=OUTPUT'
>>>>>>> main

  static description = 'Pull Configuration findings from AWS Config and convert into a Heimdall Data Format JSON file'

  static examples = ['saf convert aws_config2hdf -a ABCDEFGHIJKLMNOPQRSTUV -s +4NOT39A48REAL93SECRET934 -r us-east-1 -o output-hdf-name.json']

  static flags = {
<<<<<<< HEAD
    ...omitFlags(['input']),
    accessKeyId: flags.string({char: 'a', required: false}),
    secretAccessKey: flags.string({char: 's', required: false}),
    sessionToken: flags.string({char: 't', required: false}),
    region: flags.string({char: 'r', required: true}),
    insecure: flags.boolean({char: 'i', required: false, default: false, description: 'Disable SSL verification, this is insecure.'}),
=======
    help: Flags.help({char: 'h'}),
    accessKeyId: Flags.string({char: 'a', required: false}),
    secretAccessKey: Flags.string({char: 's', required: false}),
    sessionToken: Flags.string({char: 't', required: false}),
    region: Flags.string({char: 'r', required: true}),
    insecure: Flags.boolean({char: 'i', required: false, default: false, description: 'Disable SSL verification, this is insecure.'}),
    output: Flags.string({char: 'o', required: true}),
>>>>>>> main
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
<<<<<<< HEAD
    const flags = this.parsedFlags as OutputFlags<typeof AWSConfig2HDF.flags>
=======
    const {flags} = await this.parse(AWSConfig2HDF)
>>>>>>> main

    // Strip Extra .json from output filename
    const fileName = checkSuffix(flags.output)
    this.logger.verbose(`Output Filename: ${fileName}`)

    // Convert the data
    const converter = flags.accessKeyId && flags.secretAccessKey ? new Mapper({
      credentials: {
        accessKeyId: flags.accessKeyId || '',
        secretAccessKey: flags.secretAccessKey || '',
        sessionToken: flags.sessionToken,
      },
      region: flags.region,
    }, !flags.insecure) : new Mapper({region: flags.region}, !flags.insecure)
    this.logger.info('Starting conversion from AWS Config to HDF')

    const converted = this.ensureRefs(await converter.toHdf())
    this.logger.info('Converted AWS Config to HDF')

    // Write to file
    this.logger.info(`Output File "${convertFullPathToFilename(fileName)}": ${getHDFSummary(converted)}`)
    fs.writeFileSync(fileName, JSON.stringify(converted))
    this.logger.verbose(`HDF successfully written to ${fileName}`)
  }
}
