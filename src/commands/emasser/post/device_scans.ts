import {colorize} from 'json-colorizer'
import {Command, Flags} from '@oclif/core'
import {CLIError} from '@oclif/core/errors'
import {DeviceScanResultsApi} from '@mitre/emass_client'
import type {DeviceScanResultsResponsePost} from '@mitre/emass_client/dist/api'
import {ApiConnection} from '../../../utils/emasser/apiConnection'
import {outputFormat} from '../../../utils/emasser/outputFormatter'
import fs from 'fs'
import path from 'path'
import {displayError} from '../../../utils/emasser/utilities'

const CMD_HELP = 'saf emasser post device_scans -h or --help'
export default class EmasserPostDeviceScans extends Command {
  static readonly usage = '<%= command.id %> [FLAGS]'

  static readonly description = 'Add (upload) device scan results in the assets module for a system\n'
    + 'Supported scan types: ACAS, DISA STIG Viewer, Policy Auditor, SCAP Compliance Checker\n'
    + 'See the [-S, --scanType] command line flag for acceptable option names for scan type'

  static readonly examples = [
    {
      description: 'Add a DISA STIG Viewer file (disaStigViewerCklCklb)',
      command: '<%= config.bin %> <%= command.id %> [-s, --systemId] <value> [-f, --dataFile] <filename.ckl or filename.cklb> [-S, --scanType] <disaStigViewerCklCklb>  [-B, --[no-]isBaseline]',
    },
    {
      description: 'Add an ACAS (acasAsrArf) or Policy Auditor (policyAuditor)',
      command: '<%= config.bin %> <%= command.id %> [-s, --systemId] <value> [-f, --dataFile] <filename.zip> [-S, --scanType] <acasAsrArf or policyAuditor> [-B, --[no-]isBaseline]',
    },
    {
      description: 'All other supported scan types, a single file is expected',
      command: '<%= config.bin %> <%= command.id %> [-s, --systemId] <value> [-f, --dataFile] <path-to-file> [-S, --scanType] <acasNessus or disaStigViewerCmrs or scapComplianceChecker>  [-B, --[no-]isBaseline]',
    },
  ]

  static readonly flags = {
    help: Flags.help({char: 'h', description: 'Show eMASSer CLI help for the POST Device Scan Results command'}),
    systemId: Flags.integer({char: 's', description: 'The system identification number', required: true}),
    filename: Flags.string({char: 'f', description: 'The device scan result file to be uploaded.', required: true}),
    scanType: Flags.string({char: 'S', description: 'The type of scan being uploaded', required: true,
      options: ['acasAsrArf', 'acasNessus', 'disaStigViewerCklCklb', 'disaStigViewerCmrs', 'policyAuditor', 'scapComplianceChecker']}),
    isBaseline: Flags.boolean({char: 'B', description: 'Indicates if the scan is a baseline scan', default: false, allowNo: true}),
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(EmasserPostDeviceScans)
    const apiCxn = new ApiConnection()
    const addDeviceScans = new DeviceScanResultsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)

    /**
     * Upload device scans (delivery method can be a file or a zip file)
     * Specific file extensions are expected depending upon the scanType parameter.
     *
     * Scan Type                    File Type
     * ───────────────────────────  ─────────────
     * disaStigViewerCklCklb        .ckl or .cklb
     * acasAsrArf or policyAuditor  .zip
     *
     * Single files are expected for all other scan types as this endpoint
     * requires files to be uploaded consecutively as opposed to in bulk.
     *
     * Current scan types that are supported:
     *   ACAS: acasAsrArf or acasNessus
     *   DISA STIG Viewer: disaStigViewerCklCklb or disaStigViewerCmrs
     *   Policy Auditor: policyAuditor
     *   SCAP Compliance Checker: scapComplianceChecker
     */
    try {
      if (!fs.existsSync(flags.filename)) {
        throw new CLIError(`The file ${flags.filename} does not exist. Please provide a valid file path.`)
      } else if (flags.scanType === 'disaStigViewerCklCklb' && !flags.filename.includes('.ckl')) {
        throw new CLIError(`If the scan type is "disaStigViewerCklCklb" a .ckl or .cklb file is expected not a ${path.extname(flags.filename)} file`)
      } else if ((flags.scanType === 'acasAsrArf' || flags.scanType === 'policyAuditor') && !flags.filename.includes('.zip')) {
        throw new CLIError(`If the scan type is "acasAsrArf" or "policyAuditor" a .zip file is expected not a ${path.extname(flags.filename)} file`)
      }
    } catch (error) {
      console.error(`\x1B[91m » ${error} \x1B[0m`)
      process.exit(1)
    }

    const fileStream: fs.ReadStream = fs.createReadStream(flags.filename)

    addDeviceScans.addScanResultsBySystemId(flags.systemId, flags.scanType, fileStream, flags.isBaseline).then((response: DeviceScanResultsResponsePost) => {
      console.log(colorize(outputFormat(response, false)))
    }).catch((error: unknown) => displayError(error, 'Device Scans'))
  }

  // skipcq: JS-0116 - Base class (CommandError) expects expected catch to return a Promise
  protected async catch(err: Error & {exitCode?: number}): Promise<void> {
    // If error message is for missing flags, display
    // what fields are required, otherwise show the error
    if (err.message.includes('See more help with --help')) {
      this.warn(err.message.replace('with --help', `with: \x1B[93m${CMD_HELP}\x1B[0m`))
    } else {
      this.warn(err)
    }
  }
}
