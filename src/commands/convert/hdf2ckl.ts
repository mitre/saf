import {Command, flags} from '@oclif/command'
import {contextualizeEvaluation} from 'inspecjs'
import _ from 'lodash'
import fs from 'fs'
import {v4} from 'uuid'
import {default as files} from '../../resources/files.json'
import Mustache from 'mustache'
import {CKLMetadata} from '../../types/checklist'
import {convertFullPathToFilename, getProfileInfo} from '../../utils/global'
import {getDetails} from '../../utils/checklist'
import {createWinstonLogger, getHDFSummary} from '../../utils/logging'

export default class HDF2CKL extends Command {
  static usage = 'hdf2ckl -i, --input=<INPUT-JSON> -o, --output=<OUTPUT-CKL>'

  static description = 'Translate a Heimdall Data Format JSON file into a DISA checklist file'

  static flags = {
    help: flags.help({char: 'h'}),
    input: flags.string({char: 'i', required: true, description: 'Input HDF file'}),
    metadata: flags.string({char: 'm', required: false, description: 'Metadata JSON file, generate one with "saf generate:ckl_metadata"'}),
    output: flags.string({char: 'o', required: true, description: 'Output CKL file'}),
    hostname: flags.string({char: 'H', required: false, description: 'Hostname for CKL metadata'}),
    fqdn: flags.string({char: 'F', required: false, description: 'FQDN for CKL metadata'}),
    mac: flags.string({char: 'M', required: false, description: 'MAC address for CKL metadata'}),
    ip: flags.string({char: 'I', required: false, description: 'IP address for CKL metadata'}),
    logLevel: flags.string({char: 'L', required: false, default: 'info', options: ['info', 'warn', 'debug', 'verbose']}),
  }

  static examples = ['saf convert:hdf2ckl -i rhel7-results.json -o rhel7.ckl --fqdn reverseproxy.example.org --hostname reverseproxy --ip 10.0.0.3 --mac 12:34:56:78:90']

  async run() {
    const {flags} = this.parse(HDF2CKL)
    const logger = createWinstonLogger('hdf2ckl', flags.logLevel)

    // Read Data
    logger.verbose(`Reading HDF file: ${flags.input}`)
    const contextualizedEvaluation = contextualizeEvaluation(JSON.parse(fs.readFileSync(flags.input, 'utf-8')))

    // Strip Extra .json from output filename
    const fileName = flags.output
    logger.verbose(`Output Filename: ${fileName}`)

    const profileName = contextualizedEvaluation.data.profiles[0].name
    const controls = contextualizedEvaluation.contains.flatMap(profile => profile.contains) || []
    let cklData = {}
    const cklMetadata: CKLMetadata = {
      fileName: convertFullPathToFilename(flags.input),
      benchmark: {
        title: null,
        version: null,
        plaintext: null,
      },
      stigid: profileName || null,
      role: null,
      type: null,
      hostname: flags.hostname || _.get(contextualizedEvaluation, 'evaluation.data.passthrough.hostname') || null,
      ip: flags.ip || _.get(contextualizedEvaluation, 'evaluation.data.passthrough.ip') ||  null,
      mac: flags.mac || _.get(contextualizedEvaluation, 'evaluation.data.passthrough.mac') || null,
      fqdn: flags.fqdn || _.get(contextualizedEvaluation, 'evaluation.data.passthrough.fqdn') ||  null,
      tech_area: null,
      target_key: null,
      web_or_database: null,
      web_db_site: null,
      web_db_instance: null,
    }

    if (flags.metadata) {
      logger.verbose(`Reading CKL Metadata file: ${flags.metadata}`)
      const cklMetadataInput: CKLMetadata = JSON.parse(fs.readFileSync(flags.metadata, 'utf-8'))
      for (const field in cklMetadataInput) {
        if (typeof cklMetadata[field] === 'string' || typeof cklMetadata[field] === 'object') {
          cklMetadata[field] = cklMetadataInput[field]
        }
      }
    }

    logger.info('Starting conversion from HDF to CKL')
    cklData = {
      releaseInfo: cklMetadata.benchmark.plaintext,
      ...cklMetadata,
      profileInfo: getProfileInfo(contextualizedEvaluation, cklMetadata.fileName),
      uuid: v4(),
      controls: controls.map(control => getDetails(control, profileName)),
    }
    fs.writeFileSync(fileName, Mustache.render(files['cklExport.ckl'].data, cklData).replace(/[^\x00-\x7F]/g, ''))
    logger.info(`CKL successfully written to ${fileName}`)
  }
}
