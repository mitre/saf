import {Command, Flags} from '@oclif/core'
import _ from 'lodash'
import fs from 'fs'
import {Assettype, ChecklistMetadata, ChecklistResults as Mapper, Role, Techarea, validateChecklistMetadata} from '@mitre/hdf-converters'

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

  static examples = ['saf convert hdf2ckl -i rhel7-results.json -o rhel7.ckl --fqdn reverseproxy.example.org --hostname reverseproxy --ip 10.0.0.3 --mac 12:34:56:78:90:AB']

  async run() {
    const {flags} = await this.parse(HDF2CKL)

    /* Order of precedence for checklist metadata:
      command flags (hostname, ip, etc.)
      metadata flag
      input hdf file passthrough.metadata
      input hdf file passthrough.checklist.asset */

    const defaultMetadata: ChecklistMetadata = {
      role: Role.None, assettype: Assettype.Computing, webordatabase: 'false', profiles: [],
      hostfqdn: '', hostip: '', hostmac: '', marking: '', techarea: Techarea.Empty, vulidmapping: 'id',
      hostname: '', targetcomment: '', webdbinstance: '', webdbsite: '',
    }
    const inputHDF = JSON.parse(fs.readFileSync(flags.input, 'utf8'))
    const flagMetadata = {hostname: flags.hostname, hostip: flags.ip, hostmac: flags.mac, hostfqdn: flags.fqdn}
    const fileMetadata = flags.metadata ? JSON.parse(fs.readFileSync(flags.metadata, 'utf8')) : {}
    const hdfMetadata = _.get(inputHDF, 'passthrough.metadata', _.get(inputHDF, 'passthrough.checklist.asset', {}))
    const metadata = _.merge(defaultMetadata, hdfMetadata, fileMetadata, flagMetadata)
    _.set(inputHDF, 'passthrough.metadata', metadata)

    const validationResults = validateChecklistMetadata(metadata)
    if (validationResults.ok) {
      fs.writeFileSync(flags.output, new Mapper(inputHDF).toCkl())
    } else {
      console.error(`Error creating checklist:\n${validationResults.error.message}`)
    }
  }
}
