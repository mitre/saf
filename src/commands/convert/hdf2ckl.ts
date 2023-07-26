import {Command, Flags} from '@oclif/core'
import {contextualizeEvaluation} from 'inspecjs'
import _ from 'lodash'
import {v4} from 'uuid'
import {default as files} from '../../resources/files.json'
import Mustache from 'mustache'
import {CKLMetadata} from '../../types/checklist'
import {convertFullPathToFilename, getProfileInfo} from '../../utils/global'
import {getDetails} from '../../utils/checklist'
import {readFileURI, writeFileURI} from '../../utils/io'

export default class HDF2CKL extends Command {
  static usage = 'convert hdf2ckl -i <hdf-scan-results-json> -o <output-ckl> [-h] [-m <metadata>] [-H <hostname>] [-F <fqdn>] [-M <mac-address>] [-I <ip-address>]'

  static description = 'Translate a Heimdall Data Format JSON file into a DISA checklist file'

  static flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', required: true, description: 'Input HDF file'}),
    metadata: Flags.string({char: 'm', required: false, description: 'Metadata JSON file, generate one with "saf generate ckl_metadata"'}),
    output: Flags.string({char: 'o', required: true, description: 'Output CKL file'}),
    hostname: Flags.string({char: 'H', required: false, description: 'Hostname for CKL metadata'}),
    fqdn: Flags.string({char: 'F', required: false, description: 'FQDN for CKL metadata'}),
    mac: Flags.string({char: 'M', required: false, description: 'MAC address for CKL metadata'}),
    ip: Flags.string({char: 'I', required: false, description: 'IP address for CKL metadata'}),
  }

  static examples = ['saf convert hdf2ckl -i rhel7-results.json -o rhel7.ckl --fqdn reverseproxy.example.org --hostname reverseproxy --ip 10.0.0.3 --mac 12:34:56:78:90']

  async run() {
    const {flags} = await this.parse(HDF2CKL)
    const contextualizedEvaluation = contextualizeEvaluation(JSON.parse(await readFileURI(flags.input, 'utf8')))
    const profileName = contextualizedEvaluation.data.profiles[0].name
    const controls = contextualizedEvaluation.contains.flatMap(profile => profile.contains) || []
    const rootControls = _.uniqBy(controls, control =>
      _.get(control, 'root.hdf.wraps.id'),
    ).map(({root}) => root)
    let cklData = {}
    const cklMetadata: CKLMetadata = {
      fileName: convertFullPathToFilename(flags.input),
      benchmark: {
        title: profileName || null,
        version: '1',
        plaintext: null,
      },
      stigid: profileName || null,
      role: 'None',
      type: 'Computing',
      hostname: flags.hostname || _.get(contextualizedEvaluation, 'evaluation.data.passthrough.hostname') || null,
      ip: flags.ip || _.get(contextualizedEvaluation, 'evaluation.data.passthrough.ip') || null,
      mac: flags.mac || _.get(contextualizedEvaluation, 'evaluation.data.passthrough.mac') || null,
      fqdn: flags.fqdn || _.get(contextualizedEvaluation, 'evaluation.data.passthrough.fqdn') || null,
      tech_area: null,
      target_key: '0',
      web_or_database: 'false',
      web_db_site: null,
      web_db_instance: null,
    }

    if (flags.metadata) {
      const cklMetadataInput: CKLMetadata = JSON.parse(await readFileURI(flags.metadata, 'utf8'))
      for (const field in cklMetadataInput) {
        if (typeof cklMetadata[field] === 'string' || typeof cklMetadata[field] === 'object') {
          cklMetadata[field] = cklMetadataInput[field]
        }
      }
    }

    cklData = {
      releaseInfo: cklMetadata.benchmark.plaintext,
      ...cklMetadata,
      profileInfo: getProfileInfo(contextualizedEvaluation, cklMetadata.fileName),
      uuid: v4(),
      controls: rootControls.map(control => getDetails(control, profileName)),
    }
    await writeFileURI(flags.output, Mustache.render(files['cklExport.ckl'].data, cklData).replaceAll(/[^\x00-\x7F]/gu, ''))
  }
}
