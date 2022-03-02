import {Command, flags} from '@oclif/command'
import * as fs from 'fs'
import https from 'https'
import {FromHdfToAsffMapper as Mapper} from '@mitre/hdf-converters'
import path from 'path'
import AWS from 'aws-sdk'
import {checkSuffix, sliceIntoChunks} from '../../utils/global'
import _ from 'lodash'
import {BatchImportFindingsRequestFindingList} from 'aws-sdk/clients/securityhub'
import {createWinstonLogger} from '../../utils/logging'

export default class HDF2ASFF extends Command {
  static usage = 'convert:hdf2asff -i, --input=HDF-JSON -o, --output=ASFF-JSON-Folder -a, --accountId=accountId -r, --region=region -t, --target=target -u, --upload'

  static description = 'Translate a Heimdall Data Format JSON file into AWS Security Findings Format JSON file(s) and/or upload to AWS Security Hub'

  static examples = ['saf convert:hdf2asff -i rhel7-scan_02032022A.json -a 123456789 -r us-east-1 -t rhel7_example_host -o rhel7.asff', 'saf convert:hdf2asff -i rds_mysql_i123456789scan_03042022A.json -a 987654321 -r us-west-1 -t Instance_i123456789 -u', 'saf convert:hdf2asff -i snyk_acme_project5_hdf_04052022A.json -a 2143658798 -r us-east-1 -t acme_project5 -o snyk_acme_project5 -u']

  static flags = {
    help: flags.help({char: 'h'}),
    accountId: flags.string({char: 'a', required: true, description: 'AWS Account ID'}),
    region: flags.string({char: 'r', required: true, description: 'SecurityHub Region'}),
    input: flags.string({char: 'i', required: true, description: 'Input HDF JSON File'}),
    target: flags.string({char: 't', required: true, description: 'Unique name for target to track findings across time'}),
    upload: flags.boolean({char: 'u', required: false, description: 'Upload findings to AWS Security Hub'}),
    output: flags.string({char: 'o', required: false, description: 'Output ASFF JSON Folder'}),
    insecure: flags.boolean({char: 'I', required: false, default: false, description: 'Disable SSL verification, this is insecure.'}),
    certificate: flags.string({char: 'C', required: false, description: 'Trusted signing certificate file'}),
    logLevel: flags.string({char: 'L', required: false, default: 'info', options: ['info', 'warn', 'debug', 'verbose']}),
  }

  async run() {
    const {flags} = this.parse(HDF2ASFF)
    const logger = createWinstonLogger('hdf2asff', flags.logLevel)

    // Read Data
    logger.verbose(`Reading HDF file: ${flags.input}`)
    const inputDataText = fs.readFileSync(flags.input, 'utf-8')

    const converter = new Mapper(JSON.parse(inputDataText), {
      awsAccountId: flags.accountId,
      region: flags.region,
      target: flags.target,
      input: flags.input,
    })
    logger.info('Starting conversion from HDF to ASFF')
    const converted = converter.toAsff()

    if (flags.output) {
      const convertedSlices = sliceIntoChunks(converted, 100)
      const outputFolder = flags.output?.replace('.json', '') || 'asff-output'
      fs.mkdirSync(outputFolder)
      logger.verbose(`Created output folder: ${outputFolder}`)
      if (convertedSlices.length === 1) {
        const outfilePath = path.join(outputFolder, checkSuffix(flags.output))
        fs.writeFileSync(outfilePath, JSON.stringify(convertedSlices[0]))
        logger.verbose(`ASFF successfully written to ${outfilePath}`)
      } else {
        convertedSlices.forEach((slice, index) => {
          const outfilePath = path.join(outputFolder, `${checkSuffix(flags.output || '').replace('.json', '')}.p${index}.json`)
          fs.writeFileSync(outfilePath, JSON.stringify(slice))
          logger.verbose(`ASFF successfully written to ${outfilePath}`)
        })
      }
    }

    if (flags.upload) {
      const profileInfoFinding = converted.pop()
      const convertedSlices = sliceIntoChunks(converted, 100)

      if (flags.insecure) {
        logger.warn('WARNING: Using --insecure will make all connections to AWS open to MITM attacks, if possible pass a certificate file with --certificate')
      }

      const clientOptions: AWS.SecurityHub.ClientConfiguration = {
        region: flags.region,
      }
      AWS.config.update({
        httpOptions: {
          agent: new https.Agent({
            rejectUnauthorized: !flags.insecure,
            ca: flags.certificate ? fs.readFileSync(flags.certificate, 'utf-8') : undefined,
          }),
        },
      })
      const client = new AWS.SecurityHub(clientOptions)

      Promise.all(
        convertedSlices.map(async chunk => {
          try {
            const result = await client.batchImportFindings({Findings: chunk}).promise()
            logger.info(
              `Uploaded ${chunk.length} controls. Success: ${result.SuccessCount}, Fail: ${result.FailedCount}`,
            )
            if (result.FailedFindings?.length) {
              console.error(`Failed to upload ${result.FailedCount} Findings`)
              logger.info(result.FailedFindings)
            }
          } catch (error) {
            if (typeof error === 'object' && _.get(error, 'code', false) === 'NetworkingError') {
              console.error(`Failed to upload controls: ${error}; Using --certificate to provide your own SSL intermediary certificate (in .crt format) or use the flag --insecure to ignore SSL might resolve this issue`)
            } else {
              console.error(`Failed to upload controls: ${error}`)
            }
          }
        }),
      ).then(async () => {
        if (profileInfoFinding) {
          profileInfoFinding.UpdatedAt = new Date().toISOString()
          const result = await client.batchImportFindings({Findings: [profileInfoFinding as unknown] as BatchImportFindingsRequestFindingList}).promise()
          logger.info(`Statistics: ${profileInfoFinding.Description}`)
          logger.info(
            `Uploaded Results Set Info Finding(s) - Success: ${result.SuccessCount}, Fail: ${result.FailedCount}`,
          )
          if (result.FailedFindings?.length) {
            console.error(`Failed to upload ${result.FailedCount} Results Set Info Finding`)
            logger.info(result.FailedFindings)
          }
        }
      })
    }
  }
}
