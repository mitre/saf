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

export default class ASFF2HDF extends Command {
  static usage =
    'convert asff2hdf -i <asff-finding-json> [--securityhub <standard-1-json> ... <standard-n-json>] -o <hdf-scan-results-json-folder>';

  static description =
    'Translate a AWS Security Finding Format JSON into a Heimdall Data Format JSON file(s)';

  static examples = [
    'saf convert asff2hdf -i asff-findings.json -o output-folder-name',
    'saf convert asff2hdf -i asff-findings.json --securityhub <standard-1-json> ... --securityhub <standard-n-json> -o output-folder-name',
  ];

  static flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', required: false, description: 'Input ASFF JSON file', exclusive: ['aws']}),
    aws: Flags.boolean({char: 'a', required: false, description: 'Pull findings from AWS Security Hub', exclusive: ['input']}),
    region: Flags.string({char: 'r', required: false, description: 'Security Hub region to pull findings from'}),
    insecure: Flags.boolean({char: 'I', required: false, default: false, description: 'Disable SSL verification, this is insecure.'}),
    securityhub: Flags.string({required: false, multiple: true, description: 'Additional input files to provide context that an ASFF file needs such as the CIS AWS Foundations or AWS Foundational Security Best Practices documents (in ASFF compliant JSON form)'}),
    output: Flags.string({char: 'o', required: true, description: 'Output HDF JSON folder'}),
    certificate: Flags.string({char: 'C', required: false, description: 'Trusted signing certificate file'}),
    logLevel: Flags.string({char: 'L', required: false, default: 'info', options: ['info', 'warn', 'debug', 'verbose']}),
    target: Flags.string({char: 't', required: false, multiple: true, description: 'Target ID(s) to pull from Security Hub (maximum 10), leave blank for non-HDF findings'}),
  };

  async run() {
    const {flags} = await this.parse(ASFF2HDF)
    const logger = createWinstonLogger('asff2hdf', flags.logLevel)
    let securityhub

    const findings: string[] = []
    // If we've been passed an input file
    if (flags.input) {
      const data = fs.readFileSync(flags.input, 'utf-8')
      // Attempt to convert to one finding per line
      try {
        const convertedJson = JSON.parse(data)
        if (Array.isArray(convertedJson)) {
          findings.push(...convertedJson.map(finding => JSON.stringify(finding)))
        } else if ('Findings' in convertedJson) {
          findings.push(...convertedJson.Findings.map((finding: Record<string, unknown>) => JSON.stringify(finding)))
        } else {
          logger.error('Invalid ASFF findings format')
        }
      } catch {
        findings.push(...data.split('\n'))
      }

      // If we've been passed a Security Standards JSON
      if (flags.securityhub) {
        securityhub = flags.securityhub.map(file =>
          fs.readFileSync(file, 'utf-8'),
        )
      }
    } else if (flags.aws) { // Flag to pull findings from AWS Security Hub
      AWS.config.update({
        httpOptions: {
          agent: new https.Agent({
            // Disable HTTPS verification if requested
            rejectUnauthorized: !flags.insecure,
            // Pass an SSL certificate to trust
            ca: flags.certificate ? fs.readFileSync(flags.certificate, 'utf-8') : undefined,
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
      let queryParams: Record<string, unknown> = {Filters: filters, MaxResults: 100}
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

      logger.info('Starting collection of security standards')
      const enabledStandards: AWS.SecurityHub.StandardsSubscriptions = []

      queryParams = _.omit(queryParams, ['Filters'])

      // Get active security standards subscriptions (enabled standards)
      while (nextToken !== undefined) {
        logger.debug(`Querying for NextToken: ${nextToken}`)
        
        const getStandardsResult = await client.getEnabledStandards({NextToken: nextToken}).promise()
        console.log(getStandardsResult)
        logger.debug(`Received: ${getStandardsResult.StandardsSubscriptions?.length} standards`)
        if (getStandardsResult.StandardsSubscriptions?.length === 100) {
          enabledStandards.push(...getStandardsResult.StandardsSubscriptions)
          nextToken = getStandardsResult.NextToken
          _.set(queryParams, 'NextToken', nextToken)
        } else {
          if (getStandardsResult.StandardsSubscriptions) {
            enabledStandards.push(...getStandardsResult.StandardsSubscriptions)
          } else {
            logger.debug('No more enabled standards found')
          }
          break
        }
      }
      
      securityhub = []
      // Describe the controls to give context to the mapper
      for (const standard of enabledStandards) {
        nextToken = null
        const standardsControls: AWS.SecurityHub.StandardsControls = []

        while (nextToken !== undefined) {
          logger.debug(`Querying for NextToken: ${nextToken}`)
          _.set(queryParams, 'NextToken', nextToken)
          const getStandardsResult = await client.describeStandardsControls({StandardsSubscriptionArn: standard.StandardsSubscriptionArn}).promise()
          console.log(getStandardsResult)
          logger.info(`Received: ${getStandardsResult.Controls?.length} Controls`)
          if (getStandardsResult.Controls) {
            standardsControls.push(...getStandardsResult.Controls)
            nextToken = getStandardsResult.NextToken
          } else {
            logger.debug('No more enabled standards found')
            break
          }
        }
        securityhub.push(JSON.stringify({Controls: standardsControls}))
      }
      console.log(securityhub)
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
