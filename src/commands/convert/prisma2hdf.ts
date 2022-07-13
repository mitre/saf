import {Command, Flags} from '@oclif/core'
import fs from 'fs'
import {PrismaMapper as Mapper} from '@mitre/hdf-converters'
import path from 'path'
import _ from 'lodash'

export default class Prisma2HDF extends Command {
  static description = 'Translate a Prisma Cloud Scan Report CSV file into Heimdall Data Format JSON files'

  static examples = ['saf convert prisma2hdf -i prismacloud-report.csv -o output-hdf-name.json']

  static flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', required: true}),
    output: Flags.string({char: 'o', required: true}),
  }

  async run() {
    const {flags} = await this.parse(Prisma2HDF)

    const converter = new Mapper(
      fs.readFileSync(flags.input, {encoding: 'utf8'}),
    )
    const results = converter.toHdf()

    fs.mkdirSync(flags.output)
    _.forOwn(results, result => {
      fs.writeFileSync(
        path.join(flags.output, `${_.get(result, 'platform.target_id')}.json`),
        JSON.stringify(result),
      )
    })
  }
}
