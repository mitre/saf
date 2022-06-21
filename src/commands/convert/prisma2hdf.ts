import { Command, Flags } from '@oclif/core'
import fs from 'fs'
import { PrismaMapper as Mapper } from '@mitre/hdf-converters'
import { checkSuffix } from '../../utils/global'

export default class Prisma2HDF extends Command {
  static usage = 'convert prisma2hdf -i, --input=CSV -o, --output=OUTPUT'

  static description = 'Translate a Prisma Cloud Scan Report CSV file into a Heimdall Data Format JSON file'

  static examples = ['saf convert prisma2hdf -i prismacloud-report.csv -o output-hdf-name.json']

  static flags = {
    help: Flags.help({ char: 'h' }),
    input: Flags.string({ char: 'i', required: true }),
    output: Flags.string({ char: 'o', required: true }),
  }

  async run() {
    const { flags } = await this.parse(Prisma2HDF)

    const converter = new Mapper(fs.readFileSync(flags.input, 'utf8'))
    fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
  }
}
