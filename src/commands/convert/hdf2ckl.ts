import {Command, Flags} from '@oclif/core'
import fs from 'fs'
import {contextualizeEvaluation} from 'inspecjs'
import _ from 'lodash'
import Mustache from 'mustache'
import {v4} from 'uuid'

import {default as files} from '../../resources/files.json'
import {CKLMetadata} from '../../types/checklist'
import {getDetails} from '../../utils/checklist'
import {convertFullPathToFilename, getProfileInfo} from '../../utils/global'

export default class HDF2CKL extends Command {
  static description = 'Translate a Heimdall Data Format JSON file into a DISA checklist file'

  static examples = ['saf convert hdf2ckl -i rhel7-results.json -o rhel7.ckl --fqdn reverseproxy.example.org --hostname reverseproxy --ip 10.0.0.3 --mac 12:34:56:78:90']

  static flags = {
    fqdn: Flags.string({char: 'F', description: 'FQDN for CKL metadata', required: false}),
    help: Flags.help({char: 'h'}),
    hostname: Flags.string({char: 'H', description: 'Hostname for CKL metadata', required: false}),
    input: Flags.string({char: 'i', description: 'Input HDF file', required: true}),
    ip: Flags.string({char: 'I', description: 'IP address for CKL metadata', required: false}),
    mac: Flags.string({char: 'M', description: 'MAC address for CKL metadata', required: false}),
    metadata: Flags.string({char: 'm', description: 'Metadata JSON file, generate one with "saf generate ckl_metadata"', required: false}),
    output: Flags.string({char: 'o', description: 'Output CKL file', required: true}),
  }

  static usage = 'convert hdf2ckl -i <hdf-scan-results-json> -o <output-ckl> [-h] [-m <metadata>] [-H <hostname>] [-F <fqdn>] [-M <mac-address>] [-I <ip-address>]'

  async run() {
    const {flags} = await this.parse(HDF2CKL)
    const contextualizedEvaluation = contextualizeEvaluation(JSON.parse(fs.readFileSync(flags.input, 'utf8')))
    const profileName = contextualizedEvaluation.data.profiles[0].name
    const controls = contextualizedEvaluation.contains.flatMap(profile => profile.contains) || []
    const rootControls = _.uniqBy(controls, control =>
      _.get(control, 'root.hdf.wraps.id'),
    ).map(({root}) => root)
    let cklData = {}
    const cklMetadata: CKLMetadata = {
      benchmark: {
        plaintext: null,
        title: profileName || null,
        version: '1',
      },
      fileName: convertFullPathToFilename(flags.input),
      fqdn: flags.fqdn || _.get(contextualizedEvaluation, 'evaluation.data.passthrough.fqdn') || null,
      hostname: flags.hostname || _.get(contextualizedEvaluation, 'evaluation.data.passthrough.hostname') || null,
      ip: flags.ip || _.get(contextualizedEvaluation, 'evaluation.data.passthrough.ip') || null,
      mac: flags.mac || _.get(contextualizedEvaluation, 'evaluation.data.passthrough.mac') || null,
      role: 'None',
      stigid: profileName || null,
      target_key: '0',
      tech_area: null,
      type: 'Computing',
      web_db_instance: null,
      web_db_site: null,
      web_or_database: 'false',
    }

    if (flags.metadata) {
      const cklMetadataInput: CKLMetadata = JSON.parse(fs.readFileSync(flags.metadata, 'utf8'))
      for (const field in cklMetadataInput) {
        if (typeof cklMetadata[field] === 'string' || typeof cklMetadata[field] === 'object') {
          cklMetadata[field] = cklMetadataInput[field]
        }
      }
    }

    cklData = {
      releaseInfo: cklMetadata.benchmark.plaintext,
      ...cklMetadata,
      controls: rootControls.map(control => getDetails(control, profileName)),
      profileInfo: getProfileInfo(contextualizedEvaluation, cklMetadata.fileName),
      uuid: v4(),
    }
    fs.writeFileSync(flags.output, Mustache.render(files['cklExport.ckl'].data, cklData).replaceAll(/[^\x00-\x7F]/g, ''))
  }
}
