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
      //console.log(flags)
      const {args} = await this.parse(EmassGetClient)
      //console.log(args)
    }
}
// EmassGetClient.description = 'Grabs a random gif from giphy' 
// EmassGetClient.args = [
//   { 
//     name: 'tag', 
//     description: 'filters results by the specified tag',
//     required: false
//   }
// ]
 
// EmassGetClient.flags = {
//  rating: flags.string({ 
//  char: ‘r’, 
//  description: ‘filters results by specified rating’, 
//  default: ‘g’,
//  options: [ ‘y’, ‘g’, ‘pg’, ‘pg-13’, ‘r’ ]
//  })
// }