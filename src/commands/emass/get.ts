import {Command, Flags} from '@oclif/core'
import {getFlagsForEndpoint} from '../../emasscommands/flags'

export default class EmassGetClient extends Command {
    static flags = {
      url: Flags.string({char: 'u', description: 'Your eMASS API url'}),
      ...getFlagsForEndpoint(process.argv) as any,
    }

    static args = [
      {name: 'artifacts'},
      {name: 'cac'},
      {name: 'cmmc'},
      {name: 'controls'},
      {name: 'milestones'},
      {name: 'pac'},
      {name: 'poams'},
      {name: 'roles'},
    ]

    async run() {
      const {flags} = await this.parse(EmassGetClient)
      console.log(flags)
    }
}
