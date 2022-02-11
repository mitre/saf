import {Command, flags} from '@oclif/command'
import * as fs from 'fs'
import {FromHdfToAsffMapper as Mapper} from '@mitre/hdf-converters'
import path from 'path'
import {
  SecurityHubClient,
  BatchImportFindingsCommand,
} from '@aws-sdk/client-securityhub'
import {checkSuffix, sliceIntoChunks} from '../../utils/global'

export default class HDF2ASFF extends Command {
  static usage = 'convert:hdf2asff -i, --input=HDF-JSON -o, --output=ASFF-JSON'

  static description = 'Translate a Heimdall Data Format JSON file into AWS Security Findings Format JSON file(s)'

  static examples = ['saf convert:hdf2asff -i rhel7.scan.json -a 123456789 -r us-east-1 -t rhel7_example_host -o rhel7.asff.json']

  static flags = {
    help: flags.help({char: 'h'}),
    accountId: flags.string({char: 'a', required: true, description: 'AWS Account ID'}),
    region: flags.string({char: 'r', required: true, description: 'SecurityHub Region'}),
    input: flags.string({char: 'i', required: true, description: 'Input HDF JSON File'}),
    target: flags.string({char: 't', required: true, description: 'Unique name for target to track findings across time'}),
    upload: flags.boolean({char: 'u', required: false, description: 'Upload findings to AWS Security Hub'}),
    output: flags.string({char: 'o', required: false, description: 'Output ASFF JSON Folder'}),
  }

  async run() {
    const {flags} = this.parse(HDF2ASFF)

    const converted = new Mapper(JSON.parse(fs.readFileSync(flags.input, {encoding: 'utf-8'})), {
      awsAccountId: flags.accountId,
      region: flags.region,
      target: flags.target,
      input: flags.input,
    }).toAsff()
    const profileInfoFinding: any = converted.pop()
    const convertedSlices = sliceIntoChunks(converted, 100)
    const outputFolder = flags.output?.replace('.json', '') || 'asff-output'

    if (flags.upload) {
      const client = new SecurityHubClient({region: flags.region})
      Promise.all(
        convertedSlices.map(async chunk => {
          const uploadCommand = new BatchImportFindingsCommand({
            Findings: chunk,
          })
          try {
            const result = await client.send(uploadCommand)
            console.log(
              `Uploaded ${chunk.length} controls. Success: ${result.SuccessCount}, Fail: ${result.FailedCount}`
            )
            if (result.FailedFindings?.length) {
              console.error(`Failed to upload ${result.FailedCount} Findings`)
              console.log(result.FailedFindings)
            }
          } catch (error) {
            console.error(`Failed to upload controls: ${error}`)
          }
        })
      ).then(async () => {
        profileInfoFinding.UpdatedAt = new Date().toISOString()
        const profileInfoUploadCommand = new BatchImportFindingsCommand({
          Findings: [profileInfoFinding],
        })
        const result = await client.send(profileInfoUploadCommand)
        console.info(`Statistics: ${profileInfoFinding.Description}`)
        console.info(
          `Uploaded Results Set Info Finding(s) - Success: ${result.SuccessCount}, Fail: ${result.FailedCount}`
        )
        if (result.FailedFindings?.length) {
          console.error(`Failed to upload ${result.FailedCount} Results Set Info Finding`)
          console.log(result.FailedFindings)
        }
      })
    }
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
  }
}
