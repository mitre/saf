import {Command, Flags} from '@oclif/core'
import fs from 'fs'
import https from 'https'
import {FromHdfToAsffMapper as Mapper} from '@mitre/hdf-converters'
import path from 'path'
import AWS from 'aws-sdk'
import {checkSuffix, convertFullPathToFilename} from '../../utils/global'
import _ from 'lodash'
import {BatchImportFindingsRequestFindingList} from 'aws-sdk/clients/securityhub'

export default class HDF2ASFF extends Command {
  static usage = 'convert hdf2asff -a <account-id> -r <region> -i <hdf-scan-results-json> -t <target> [-h] [-R] (-u [-I -C <certificate>] | [-o <asff-output-folder>])'

  static description = 'Translate a Heimdall Data Format JSON file into AWS Security Findings Format JSON file(s) and/or upload to AWS Security Hub'

  static examples = ['saf convert hdf2asff -i rhel7-scan_02032022A.json -a 123456789 -r us-east-1 -t rhel7_example_host -o rhel7.asff', 'saf convert hdf2asff -i rds_mysql_i123456789scan_03042022A.json -a 987654321 -r us-west-1 -t Instance_i123456789 -u', 'saf convert hdf2asff -i snyk_acme_project5_hdf_04052022A.json -a 2143658798 -r us-east-1 -t acme_project5 -o snyk_acme_project5 -u']

  static flags = {
    help: Flags.help({char: 'h'}),
    accountId: Flags.string({char: 'a', required: true, description: 'AWS Account ID'}),
    region: Flags.string({char: 'r', required: true, description: 'SecurityHub Region'}),
    specifyRegionAttribute: Flags.boolean({char: 'R', required: false, description: 'Manually specify the top-level `Region` attribute - SecurityHub populates this attribute automatically and prohibits one from updating it using `BatchImportFindings` or `BatchUpdateFindings`'}),
    input: Flags.string({char: 'i', required: true, description: 'Input HDF JSON File'}),
    target: Flags.string({char: 't', required: true, description: 'Unique name for target to track findings across time'}),
    upload: Flags.boolean({char: 'u', required: false, description: 'Upload findings to AWS Security Hub'}),
    output: Flags.string({char: 'o', required: false, description: 'Output ASFF JSON Folder'}),
    insecure: Flags.boolean({char: 'I', required: false, default: false, description: 'Disable SSL verification, this is insecure.'}),
    certificate: Flags.string({char: 'C', required: false, description: 'Trusted signing certificate file'}),
  }

  async run() {
    const {flags} = await this.parse(HDF2ASFF)

    const converted = new Mapper(JSON.parse(fs.readFileSync(flags.input, 'utf8')), {
      awsAccountId: flags.accountId,
      region: flags.region,
      regionAttribute: flags.specifyRegionAttribute,
      target: flags.target,
      input: flags.input,
    }).toAsff()

    if (flags.output) {
      const convertedSlices = _.chunk(converted, 100) // AWS doesn't allow uploading more than 100 findings at a time so we need to split them into chunks
      const outputFolder = flags.output?.replace('.json', '') || 'asff-output'
      fs.mkdirSync(outputFolder)
      if (convertedSlices.length === 1) {
        const outfilePath = path.join(outputFolder, convertFullPathToFilename(checkSuffix(flags.output)))
        fs.writeFileSync(outfilePath, JSON.stringify(convertedSlices[0]))
      } else {
        convertedSlices.forEach((slice, index) => {
          const outfilePath = path.join(outputFolder, `${convertFullPathToFilename(checkSuffix(flags.output || '')).replace('.json', '')}.p${index}.json`)
          fs.writeFileSync(outfilePath, JSON.stringify(slice))
        })
      }
    }

    if (flags.upload) {
      const profileInfoFinding = converted.pop()
      const convertedSlices = _.chunk(converted, 100) as BatchImportFindingsRequestFindingList[]

      if (flags.insecure) {
        console.warn('WARNING: Using --insecure will make all connections to AWS open to MITM attacks, if possible pass a certificate file with --certificate')
      }

      const clientOptions: AWS.SecurityHub.ClientConfiguration = {
        region: flags.region,
      }
      AWS.config.update({
        httpOptions: {
          agent: new https.Agent({
            rejectUnauthorized: !flags.insecure,
            ca: flags.certificate ? fs.readFileSync(flags.certificate, 'utf8') : undefined,
          }),
        },
      })
      const client = new AWS.SecurityHub(clientOptions)

      try {
        await Promise.all(
          convertedSlices.map(async chunk => {
            try {
              const result = await client.batchImportFindings({Findings: chunk}).promise()
              console.log(
                `Uploaded ${chunk.length} controls. Success: ${result.SuccessCount}, Fail: ${result.FailedCount}`,
              )
              if (result.FailedFindings?.length) {
                console.error(`Failed to upload ${result.FailedCount} Findings`)
                console.log(result.FailedFindings)
              }
            } catch (error) {
              if (_.isObject(error) && _.get(error, 'code') === 'NetworkingError') {
                console.error(`Failed to upload controls: ${error}; Using --certificate to provide your own SSL intermediary certificate (in .crt format) or use the flag --insecure to ignore SSL might resolve this issue`)
              } else {
                console.error(`Failed to upload controls: ${error}`)
              }
            }
          }),
        )
      } catch (error) {
        if (error instanceof Error) {
          console.error(error.message)
        } else {
          console.error('Unexpected error', error)
        }
      }

      try {
        if (profileInfoFinding) {
          profileInfoFinding.UpdatedAt = new Date().toISOString()
          const result = await client.batchImportFindings({Findings: [profileInfoFinding as unknown] as BatchImportFindingsRequestFindingList}).promise()
          console.info(`Statistics: ${profileInfoFinding.Description}`)
          console.info(
            `Uploaded Results Set Info Finding(s) - Success: ${result.SuccessCount}, Fail: ${result.FailedCount}`,
          )
          if (result.FailedFindings?.length) {
            console.error(`Failed to upload ${result.FailedCount} Results Set Info Finding`)
            console.log(result.FailedFindings)
          }
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error(error.message)
        } else {
          console.error('Unexpected error', error)
        }
      }
    }
  }
}
