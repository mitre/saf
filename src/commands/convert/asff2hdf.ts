import {Command, Flags} from '@oclif/core'
import fs from 'fs'
import {ASFFResults as Mapper} from '@mitre/hdf-converters'
import {checkSuffix} from '../../utils/global'
import _ from 'lodash'
import path from 'path'
import AWS from 'aws-sdk'
import https from 'https'
import {AwsSecurityFindingFilters} from 'aws-sdk/clients/securityhub'
import {createWinstonLogger} from '../../utils/logging'

// Should be no more than 100
const API_MAX_RESULTS = 100;

export default class ASFF2HDF extends Command {
  static description =
    'Translate a AWS Security Finding Format JSON into a Heimdall Data Format JSON file(s)';

  static examples = [
    'saf convert asff2hdf -i asff-findings.json -o output-folder-name',
    'saf convert asff2hdf -i asff-findings.json --securityhub <standard-1-json> ... --securityhub <standard-n-json> -o output-folder-name',
    'saf convert asff2hdf --aws -o out -r us-west-2 --target rhel7',
  ];

  static flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', required: false, description: 'Input ASFF JSON file', exclusive: ['aws', 'region', 'insecure', 'certificate', 'target']}),
    aws: Flags.boolean({char: 'a', required: false, description: 'Pull findings from AWS Security Hub', exclusive: ['input'], dependsOn: ['region']}),
    region: Flags.string({char: 'r', required: false, description: 'Security Hub region to pull findings from', exclusive: ['input']}),
    insecure: Flags.boolean({char: 'I', required: false, default: false, description: 'Disable SSL verification, this is insecure.', exclusive: ['input', 'certificate']}),
    securityhub: Flags.string({required: false, multiple: true, description: 'Additional input files to provide context that an ASFF file needs such as the CIS AWS Foundations or AWS Foundational Security Best Practices documents (in ASFF compliant JSON form)'}),
    output: Flags.string({char: 'o', required: true, description: 'Output HDF JSON folder'}),
    certificate: Flags.string({char: 'C', required: false, description: 'Trusted signing certificate file', exclusive: ['input', 'insecure']}),
    logLevel: Flags.string({char: 'L', required: false, default: 'info', options: ['info', 'warn', 'debug', 'verbose']}),
    target: Flags.string({char: 't', required: false, multiple: true, description: 'Target ID(s) to pull from Security Hub (maximum 10), leave blank for non-HDF findings', exclusive: ['input']}),
  };

  async run() {
    const {flags} = await this.parse(ASFF2HDF)
    const logger = createWinstonLogger('asff2hdf', flags.logLevel)
    let securityhub

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
          throw new Error("Invalid ASFF findings format - a standards standards was passed to --input instead of --securityhub")
        } else {
          throw new Error("Invalid ASFF findings format - unknown input type")
        }
      } catch (exception) {
        const splitLines = data.split('\n')
        
        if (splitLines.length === 0) {
          logger.error('Invalid ASFF findings format - no lines found')
          throw exception
        } 

        try {
          findings.push(...splitLines.map(finding => JSON.stringify(JSON.parse(finding))))
        } catch (exception) {
          logger.error('Invalid ASFF findings format - unable to parse JSON')
          throw exception
        }
      }

      // If we've been passed any Security Standards JSONs
      if (flags.securityhub) {
        securityhub = flags.securityhub.map(file =>
          fs.readFileSync(file, 'utf8'),
        )
      }
    } else if (flags.aws) { // Flag to pull findings from AWS Security Hub
      AWS.config.update({
        httpOptions: {
          agent: new https.Agent({
            // Disable HTTPS verification if requested
            rejectUnauthorized: !flags.insecure,
            // Pass an SSL certificate to trust
            ca: flags.certificate ? fs.readFileSync(flags.certificate, 'utf8') : undefined,
          }),
        },
      })
      const clientOptions: AWS.SecurityHub.ClientConfiguration = {
        region: flags.region,
      }
      // Create our SecurityHub client
      const client = new AWS.SecurityHub(clientOptions)
      // Pagination
      let nextToken = null
      let filters: AwsSecurityFindingFilters = {}

      // Filter by target name
      if (flags.target) {
        filters = {
          Id: flags.target.map(target => {
            return {Value: target, Comparison: 'PREFIX'}
          }),
        }
      }

      logger.info('Starting collection of Findings')
      let queryParams: Record<string, unknown> = {Filters: filters, MaxResults: API_MAX_RESULTS}
      // Get findings
      while (nextToken !== undefined) {
        logger.debug(`Querying for NextToken: ${nextToken}`)
        _.set(queryParams, 'NextToken', nextToken)
        const getFindingsResult = await client.getFindings(queryParams).promise()
        logger.debug(`Received: ${getFindingsResult.Findings.length} findings`)
        findings.push(...getFindingsResult.Findings.map(finding => JSON.stringify(finding)))
        nextToken = getFindingsResult.NextToken
      }

      nextToken = null

      logger.info('Starting collection of enabled security standards')
      const enabledStandards: AWS.SecurityHub.StandardsSubscriptions = []

      queryParams = _.omit(queryParams, ['Filters'])

      // Get active security standards subscriptions (enabled standards)
      while (nextToken !== undefined) {
        logger.debug(`Querying for NextToken: ${nextToken}`)
        const getEnabledStandardsResult: any = await client.getEnabledStandards({NextToken: nextToken}).promise()
        
        logger.debug(`Received: ${getEnabledStandardsResult.StandardsSubscriptions?.length} standards`)
        enabledStandards.push(...getEnabledStandardsResult.StandardsSubscriptions)
        
        nextToken = getEnabledStandardsResult.NextToken
      }

      securityhub = []

      // Describe the controls to give context to the mapper
      for (const standard of enabledStandards) {
        nextToken = null
        const standardsControls: AWS.SecurityHub.StandardsControls = []

        while (nextToken !== undefined) {
          logger.debug(`Querying for NextToken: ${nextToken}`)
          const getEnabledStandardsResult: AWS.SecurityHub.DescribeStandardsControlsResponse = await client.describeStandardsControls({StandardsSubscriptionArn: standard.StandardsSubscriptionArn, NextToken: nextToken || ''}).promise()
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
