import {Command, Flags} from '@oclif/core'
import {getFlags, getFlagsForEndpoint} from '../../emasscommands/flags'

export default class EmassGetClient extends Command {
    static flags = {
      url: Flags.string({char: 'u', description: 'Your eMASS API url'}),
      ...getFlagsForEndpoint(process.argv) as any,
    }

    static args = getFlags('get')

    async run() {
      const {flags} = await this.parse(EmassGetClient)
      console.log(flags)
    }
}
