import {Command, Flags} from '@oclif/core'
import fs from 'fs'
import {DependencyTrackMapper as Mapper} from '@mitre/hdf-converters'
import {checkSuffix} from '../../utils/global'

export default class DependencyTrack2HDF extends Command {
  static usage = 'convert dependency_track2hdf -i <dt-fpf-json> -o <hdf-scan-results-json>'

  static description = 'Translate a Dependency-Track output file into an HDF results set'

  static examples = ['saf convert dependency_track2hdf -i dt-fpf.json -o output-hdf-name.json']

  static flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', required: true, description: 'Input Dependency-Track FPF file'}),
    output: Flags.string({char: 'o', required: true, description: 'Output HDF file'}),
    'with-raw': Flags.boolean({char: 'w', required: false}),
  }

  async run() {
    const {flags} = await this.parse(DependencyTrack2HDF)
    const input = fs.readFileSync(flags.input, 'utf8')

    const converter = new Mapper(input, flags['with-raw'])
    fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
  }
}