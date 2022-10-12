import {Command, Flags} from '@oclif/core'
import {SnykResults as Mapper} from '@mitre/hdf-converters'
import _ from 'lodash'
import {checkInput, checkSuffix} from '../../utils/global'
import {readFileURI, writeFileURI} from '../../utils/io'

export default class Snyk2HDF extends Command {
  static usage = 'convert snyk2hdf -i <snyk-json> -o <hdf-scan-results-json> [-h]'

  static description = 'Translate a Snyk results JSON file into a Heimdall Data Format JSON file\nA separate HDF JSON is generated for each project reported in the Snyk Report.'

  static examples = ['saf convert snyk2hdf -i snyk_results.json -o output-file-prefix']

  static flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', required: true, description: 'Input Snyk Results JSON File'}),
    output: Flags.string({char: 'o', required: true, description: 'Output HDF JSON File'}),
  }

  async run() {
    const {flags} = await this.parse(Snyk2HDF)

    // Check for correct input type
    const data = await readFileURI(flags.input, 'utf8')
    checkInput({data: data, filename: flags.input}, 'snyk', 'Snyk results JSON')

    const converter = new Mapper(data)
    const result = converter.toHdf()
    if (Array.isArray(result)) {
      for (const element of result) {
        await writeFileURI(`${flags.output.replace(/.json/gi, '')}-${_.get(element, 'platform.target_id')}.json`, JSON.stringify(element))
      }
    } else {
      await writeFileURI(checkSuffix(flags.output), JSON.stringify(result))
    }
  }
}
