import {AwsSecurityFindingFilters, DescribeStandardsControlsCommandOutput, GetEnabledStandardsCommandOutput, SecurityHub, SecurityHubClientConfig, StandardsControl, StandardsSubscription} from '@aws-sdk/client-securityhub'
import {ASFFResults as Mapper} from '@mitre/hdf-converters'
import {Command, Flags} from '@oclif/core'
import {NodeHttpHandler} from '@smithy/node-http-handler'
import fs from 'fs'
import https from 'https'
import _ from 'lodash'
import path from 'path'

import {checkInput, checkSuffix} from '../../utils/global'
import {createWinstonLogger} from '../../utils/logging'

// Should be no more than 100
const API_MAX_RESULTS = 100

export default class ASFF2HDF extends Command {
  static description =
    'Translate a AWS Security Finding Format JSON into a Heimdall Data Format JSON file(s)'

  static examples = [
    'saf convert asff2hdf -i asff-findings.json -o output-folder-name',
    'saf convert asff2hdf -i asff-findings.json --securityhub standard-1.json standard-2.json -o output-folder-name',
    'saf convert asff2hdf --aws -o out -r us-west-2 --target rhel7',
  ]

  static flags = {
    aws: Flags.boolean({char: 'a', dependsOn: ['region'], description: 'Pull findings from AWS Security Hub', exclusive: ['input'], required: false}),
    certificate: Flags.string({char: 'C', description: 'Trusted signing certificate file', exclusive: ['input', 'insecure'], required: false}),
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', description: 'Input ASFF JSON file', exclusive: ['aws', 'region', 'insecure', 'certificate', 'target'], required: false}),
    insecure: Flags.boolean({char: 'I', default: false, description: 'Disable SSL verification, this is insecure.', exclusive: ['input', 'certificate'], required: false}),
    logLevel: Flags.string({char: 'L', default: 'info', options: ['info', 'warn', 'debug', 'verbose'], required: false}),
    output: Flags.string({char: 'o', description: 'Output HDF JSON folder', required: true}),
    region: Flags.string({char: 'r', description: 'Security Hub region to pull findings from', exclusive: ['input'], required: false}),
    securityhub: Flags.string({description: 'Additional input files to provide context that an ASFF file needs such as the CIS AWS Foundations or AWS Foundational Security Best Practices documents (in ASFF compliant JSON form)', multiple: true, required: false}),
    target: Flags.string({char: 't', description: 'Target ID(s) to pull from Security Hub (maximum 10), leave blank for non-HDF findings', exclusive: ['input'], multiple: true, required: false}),
  }

  static usage = 'convert asff2hdf -o <hdf-output-folder> [-h] (-i <asff-json> [--securityhub <standard-json>...] | -a -r <region> [-I | -C <certificate>] [-t <target>...]) [-L info|warn|debug|verbose]'

  async run() {
    const {flags} = await this.parse(ASFF2HDF)
    const logger = createWinstonLogger('asff2hdf', flags.logLevel)
    let securityhub

    // Check if output folder already exists
    if (fs.existsSync(flags.output)) {
      throw new Error(`Output folder ${flags.output} already exists`)
    }

    const findings: string[] = []
    // If we've been passed an input file
    if (flags.input) {
      const data = fs.readFileSync(flags.input, 'utf8')
      // Attempt to convert to one finding per line
      try {
        const convertedJson = JSON.parse(data)
        if (Array.isArray(convertedJson)) {
          findings.push(...convertedJson.map(finding => JSON.stringify(finding)))
        } else if ('Findings' in convertedJson) {
          findings.push(...convertedJson.Findings.map((finding: Record<string, unknown>) => JSON.stringify(finding)))
        } else if ('Controls' in convertedJson) {
          throw new Error('Invalid ASFF findings format - a standards standards was passed to --input instead of --securityhub')
        } else {
          checkInput({data: data, filename: flags.input}, 'asff', 'AWS Security Finding Format JSON')
        }
      } catch (error) {
        const splitLines = data.split('\n')

        if (splitLines.length === 0) {
          logger.error('Invalid ASFF findings format - no lines found')
          throw error
        }

        try {
          findings.push(...splitLines.map(finding => JSON.stringify(JSON.parse(finding))))
        } catch (error) {
          logger.error('Invalid ASFF findings format - unable to parse JSON')
          throw error
        }
      }

      // If we've been passed any Security Standards JSONs
      if (flags.securityhub) {
        securityhub = flags.securityhub.map((file: string) =>
          fs.readFileSync(file, 'utf8'),
        )
      }
    } else if (flags.aws) { // Flag to pull findings from AWS Security Hub
      const clientOptions: SecurityHubClientConfig = {
        region: flags.region,
        requestHandler: new NodeHttpHandler({
          httpsAgent: new https.Agent({
            // Pass an SSL certificate to trust
            ca: flags.certificate ? fs.readFileSync(flags.certificate, 'utf8') : undefined,
            // Disable HTTPS verification if requested
            rejectUnauthorized: !flags.insecure,
          }),
        }),
      }
      // Create our SecurityHub client
      const client = new SecurityHub(clientOptions)
      // Pagination
      let nextToken
      let first = true
      let filters: AwsSecurityFindingFilters = {}

      // Filter by target name
      if (flags.target) {
        filters = {
          Id: flags.target.map((target: string) => {
            return {Comparison: 'PREFIX', Value: target}
          }),
        }
      }

      logger.info('Starting collection of Findings')
      let queryParams: Record<string, unknown> = {Filters: filters, MaxResults: API_MAX_RESULTS}
      // Get findings
      while (first || nextToken !== undefined) {
        first = false
        logger.debug(`Querying for NextToken: ${nextToken}`)
        _.set(queryParams, 'NextToken', nextToken)

        const getFindingsResult = await client.getFindings(queryParams)
        logger.debug(`Received: ${getFindingsResult.Findings?.length} findings`)
        if (getFindingsResult.Findings) {
          findings.push(...getFindingsResult.Findings.map(finding => JSON.stringify(finding)))
        }

        nextToken = getFindingsResult.NextToken
      }

      nextToken = undefined
      first = true

      logger.info('Starting collection of enabled security standards')
      const enabledStandards: StandardsSubscription[] = []

      queryParams = _.omit(queryParams, ['Filters'])

      // Get active security standards subscriptions (enabled standards)
      while (first || nextToken !== undefined) {
        first = false
        logger.debug(`Querying for NextToken: ${nextToken}`)
        // type system seems to think that this call / the result is from the callback variant of the function instead of the promise based one and throwing fits
        const getEnabledStandardsResult: GetEnabledStandardsCommandOutput = (await client.getEnabledStandards({NextToken: nextToken})) as unknown as GetEnabledStandardsCommandOutput

        logger.debug(`Received: ${getEnabledStandardsResult.StandardsSubscriptions?.length} standards`)
        if (getEnabledStandardsResult.StandardsSubscriptions) {
          enabledStandards.push(...getEnabledStandardsResult.StandardsSubscriptions)
        }

        nextToken = getEnabledStandardsResult.NextToken
      }

      securityhub = []

      // Describe the controls to give context to the mapper
      for (const standard of enabledStandards) {
        nextToken = undefined
        first = true
        const standardsControls: StandardsControl[] = []

        while (nextToken !== undefined) {
          first = false
          logger.debug(`Querying for NextToken: ${nextToken}`)
          const getEnabledStandardsResult: DescribeStandardsControlsCommandOutput = await client.describeStandardsControls(
            {
              NextToken: nextToken || '',
              StandardsSubscriptionArn: standard.StandardsSubscriptionArn,
            },
          )
          logger.info(`Received: ${getEnabledStandardsResult.Controls?.length} Controls`)

          if (getEnabledStandardsResult.Controls) {
            standardsControls.push(...getEnabledStandardsResult.Controls)
          }

          nextToken = getEnabledStandardsResult.NextToken
        }

        securityhub.push(JSON.stringify({Controls: standardsControls}))
      }
    } else {
      throw new Error('Please select an input file or --aws to pull findings from AWS')
    }

    const converter = new Mapper(
      findings.join('\n'),
      securityhub,
    )

    const results = converter.toHdf()

    fs.mkdirSync(flags.output)
    _.forOwn(results, (result, filename) => {
      fs.writeFileSync(
        path.join(flags.output, checkSuffix(filename)),
        JSON.stringify(result),
      )
    })
  }
}
