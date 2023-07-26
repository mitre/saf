import {Command, Flags} from '@oclif/core'
import {ASFFResults as Mapper} from '@mitre/hdf-converters'
import {checkInput, checkSuffix} from '../../utils/global'
import _ from 'lodash'
import path from 'path'
import {createFolderIfNotExists, readFileURI, writeFileURI} from '../../utils/io'

export default class Trivy2HDF extends Command {
  static usage = 'convert trivy2hdf -i <trivy-finding-json> -o <hdf-output-folder>'

  static description = 'Translate a Trivy-derived AWS Security Finding Format results from JSONL into a Heimdall Data Format JSON file'

  static examples = ['saf convert trivy2hdf -i trivy-asff.json -o output-folder']

  static flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', required: true, description: 'Input Trivy ASFF JSON File'}),
    output: Flags.string({char: 'o', required: true, description: 'Output HDF JSON Folder'}),
  }

  async run() {
    const {flags} = await this.parse(Trivy2HDF)
    // comes as an _asff.json file which is basically the array of findings but without the surrounding object; however, could also be properly formed asff since it depends on the template used
    const input = await readFileURI(flags.input, 'utf8')

    checkInput({data: input.trim(), filename: flags.input}, 'asff', 'Trivy-derived AWS Security Finding Format results')

    const converter = new Mapper(input.trim())
    const results = converter.toHdf()

    await createFolderIfNotExists(flags.output)

    _.forOwn(results, async (result, filename) => {
      await writeFileURI(
        path.join(flags.output, checkSuffix(filename)),
        JSON.stringify(result),
      )
    })
  }
}

