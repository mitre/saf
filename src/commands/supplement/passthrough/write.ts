import {Command, Flags} from '@oclif/core'
import {ExecJSON} from 'inspecjs'
import fs from 'fs'

export default class WritePassthrough extends Command {
    static usage = 'supplement passthrough write -i <input-hdf-json> (-f <input-passthrough-json> | -d <passthrough-json>) [-o <output-hdf-json>]'

    static description = 'Overwrite the `passthrough` attribute in a given Heimdall Data Format JSON file with the provided `passthrough` JSON data'

    static examples = [
      'saf supplement passthrough write -i hdf.json -d \'{"a": 5}\'',
      'saf supplement passthrough write -i hdf.json -f passthrough.json -o new-hdf.json',
    ]

    static flags = {
      help: Flags.help({char: 'h'}),
      input: Flags.string({char: 'i', required: true, description: 'An input Heimdall Data Format file'}),
      passthroughFile: Flags.string({char: 'f', exclusive: ['passthroughData'], description: 'An input passthrough-data file (can contain any valid JSON); this flag or `passthroughData` must be provided \n\nSample passthrough json:\n	{"CDM":\n		{\n		"HWAM": {\n			"Asset_ID_Tattoo": "arn:aws:ec2:us-east-1:123456789012:instance/i-12345acbd5678efgh90",\n			"Data_Center_ID": "1234-5678-ABCD-1BB1-CC12DD34EE56FF78",\n			"FQDN": "i-12345acbd5678efgh90.ec2.internal",\n			"Hostname": "i-12345acbd5678efgh90",\n			"ipv4": "10.0.1.25",\n			"ipv6": "none defined",\n			"mac": "02:32:fd:e3:68:a1",\n			"os": "Linux",\n			"FISMA_ID": "ABCD2C21-7781-92AA-F126-FF987CZZZZ"\n			},\n		"CSM": {\n			"Server_Type": "member server",\n			"source_tool": "InSpec"\n			}\n		}\n	}'}),
      passthroughData: Flags.string({char: 'd', exclusive: ['passthroughFile'], description: 'Input passthrough-data (can be any valid JSON); this flag or `passthroughFile` must be provided'}),
      output: Flags.string({char: 'o', description: 'An output Heimdall Data Format JSON file (otherwise the input file is overwritten)'}),
    }

    async run() {
      const {flags} = await this.parse(WritePassthrough)

      const input: ExecJSON.Execution & {passthrough?: unknown} = JSON.parse(fs.readFileSync(flags.input, 'utf8'))
      const output: string = flags.output || flags.input

      let passthrough: unknown
      if (flags.passthroughFile) {
        try {
          passthrough = JSON.parse(fs.readFileSync(flags.passthroughFile, 'utf8'))
        } catch (error: unknown) {
          throw new Error(`Couldn't parse passthrough data: ${error}`)
        }
      } else if (flags.passthroughData) {
        try {
          passthrough = JSON.parse(flags.passthroughData)
        } catch {
          passthrough = flags.passthroughData
        }
      } else {
        throw new Error('One out of passthroughFile or passthroughData must be passed')
      }

      input.passthrough = passthrough

      fs.writeFileSync(output, JSON.stringify(input, null, 2))
    }
}
