import {Command, flags} from '@oclif/command'
import {contextualizeEvaluation} from 'inspecjs'
import _ from 'lodash'
import fs from 'fs'
import {v4} from 'uuid'
import {default as files} from '../../resources/files.json'
import Mustache from 'mustache'
import {ExtendedEvaluationFile} from '../../types/checklist'
import {getProfileInfo} from '../../utils/global'
import {getDetails} from '../../utils/checklist'

export default class HDF2CKL extends Command {
  static usage = 'hdf2ckl -i, --input=<INPUT-CKL> -o, --output=<OUTPUT-CKL>'

  static description = 'Translate a Heimdall Data Format JSON file into a DISA checklist file'

  static flags = {
    help: flags.help({char: 'h'}),
    input: flags.string({char: 'i', required: true, description: 'Input HDF file'}),
    output: flags.string({char: 'o', required: true, description: 'Output CKL file'}),
    hostname: flags.string({char: 'H', required: false, description: 'Hostname for CKL metadata'}),
    fqdn: flags.string({char: 'F', required: false, description: 'FQDN for CKL metadata'}),
    mac: flags.string({char: 'M', required: false, description: 'MAC address for CKL metadata'}),
    ip: flags.string({char: 'I', required: false, description: 'IP address for CKL metadata'}),
  }

  static examples = ['saf convert:hdf2ckl -i rhel7-results.json -o rhel7.ckl --fqdn reverseproxy.example.org --hostname reverseproxy --ip 10.0.0.3 --mac 12:34:56:78:90']

  async run() {
    const {flags} = this.parse(HDF2CKL)
    let cklData = {}
    const contextualizedEvaluation = contextualizeEvaluation(JSON.parse(fs.readFileSync(flags.input, {encoding: 'utf-8'})))
    // Check for passthrough fields
    const extendedEvaluation: ExtendedEvaluationFile = {
      evaluation: contextualizedEvaluation,
      fileName: flags.input,
      hostname: _.get(contextualizedEvaluation, 'evaluation.data.passthrough.hostname') || flags.hostname || '',
      fqdn: _.get(contextualizedEvaluation, 'evaluation.data.passthrough.fqdn') || flags.fqdn || '',
      mac: _.get(contextualizedEvaluation, 'evaluation.data.passthrough.mac') || flags.mac || '',
      ip: _.get(contextualizedEvaluation, 'evaluation.data.passthrough.ip') || flags.ip || '',
    }
    const profileName = extendedEvaluation.evaluation.data.profiles[0].name
    const controls = extendedEvaluation.evaluation.contains.flatMap(profile => profile.contains) || []

    cklData = {
      fileName: flags.input,
      hostname: extendedEvaluation.hostname,
      ip: extendedEvaluation.ip,
      mac: extendedEvaluation.mac,
      fqdn: extendedEvaluation.fqdn,
      targetKey: 0,
      description: 'desc',
      startTime: new Date().toString(),
      profileTitle: profileName,
      profileInfo: getProfileInfo(extendedEvaluation),
      uuid: v4(),
      controls: controls.map(control => getDetails(control, profileName)),
    }
    fs.writeFileSync(flags.output, Mustache.render(files['cklExport.ckl'].data, cklData).replace(/[^\x00-\x7F]/g, ''))
  }
}
