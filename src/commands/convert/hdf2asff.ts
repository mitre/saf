import {Command, flags} from '@oclif/command'
import * as fs from 'fs'
import https from 'https'
import {FromHdfToAsffMapper as Mapper} from '@mitre/hdf-converters'
import path from 'path'
import AWS from 'aws-sdk'
import {checkSuffix, sliceIntoChunks} from '../../utils/global'

export default class HDF2ASFF extends Command {
  static usage = 'convert:hdf2asff -i, --input=HDF-JSON -o, --output=ASFF-JSON'

  static description = 'Translate a Heimdall Data Format JSON file into AWS Security Findings Format JSON file(s)'

  static examples = ['saf convert:hdf2asff -i rhel7.scan.json -a 123456789 -r us-east-1 -t rhel7_example_host -o rhel7.asff']

  static flags = {
    help: flags.help({char: 'h'}),
    accountId: flags.string({char: 'a', required: true, description: 'AWS Account ID'}),
    region: flags.string({char: 'r', required: true, description: 'SecurityHub Region'}),
    input: flags.string({char: 'i', required: true, description: 'Input HDF JSON File'}),
    target: flags.string({char: 't', required: true, description: 'Unique name for target to track findings across time'}),
    upload: flags.boolean({char: 'u', required: false, description: 'Upload findings to AWS Security Hub'}),
    output: flags.string({char: 'o', required: false, description: 'Output ASFF JSON Folder'}),
    insecure: flags.boolean({char: 'I', required: false, default: false, description: 'Disable SSL verification, this is insecure.'}),
  }

  async run() {
    const {flags} = this.parse(HDF2ASFF)

    const converted = new Mapper(JSON.parse(fs.readFileSync(flags.input, 'utf-8')), {
      awsAccountId: flags.accountId,
      region: flags.region,
      target: flags.target,
      input: flags.input,
    }).toAsff()
    let convertedSlices = sliceIntoChunks(converted, 100)
    const outputFolder = flags.output?.replace('.json', '') || 'asff-output'

    if (flags.output) {
      fs.mkdirSync(outputFolder)
      if (convertedSlices.length === 1) {
        const outfilePath = path.join(outputFolder, checkSuffix(flags.output))
        fs.writeFileSync(outfilePath, JSON.stringify(convertedSlices[0]))
      } else {
        convertedSlices.forEach((slice, index) => {
          const outfilePath = path.join(outputFolder, `${checkSuffix(flags.output || '').replace('.json', '')}.p${index}.json`)
          fs.writeFileSync(outfilePath, JSON.stringify(slice))
        })
      }
    }

    if (flags.upload) {
      const profileInfoFinding = converted.pop()
      convertedSlices = sliceIntoChunks(converted, 100)

      const clientOptions: AWS.SecurityHub.ClientConfiguration = {
        region: flags.region,
      }
      AWS.config.update({
        httpOptions: {
          agent: new https.Agent({
            rejectUnauthorized: !flags.insecure,
          }),
        },
      })
      const client = new AWS.SecurityHub(clientOptions)

      Promise.all(
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
            console.error(`Failed to upload controls: ${error}`)
          }
        }),
      ).then(async () => {
        if (profileInfoFinding) {
          profileInfoFinding.UpdatedAt = new Date().toISOString()
          const result = await client.batchImportFindings({Findings: [profileInfoFinding as any]}).promise()
          console.info(`Statistics: ${profileInfoFinding.Description}`)
          console.info(
            `Uploaded Results Set Info Finding(s) - Success: ${result.SuccessCount}, Fail: ${result.FailedCount}`,
          )
          if (result.FailedFindings?.length) {
            console.error(`Failed to upload ${result.FailedCount} Results Set Info Finding`)
            console.log(result.FailedFindings)
          }
        }
      })
    }
  }
}
