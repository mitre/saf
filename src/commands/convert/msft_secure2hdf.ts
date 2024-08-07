import {ExecJSON} from 'inspecjs'
import {Command, Flags} from '@oclif/core'
import fs from 'fs'
import https from 'https'
import {MsftSecureScoreResults as Mapper} from '@mitre/hdf-converters'
import {ClientSecretCredential} from '@azure/identity'
import {Client, ClientOptions, PageIterator, PageIteratorCallback} from '@microsoft/microsoft-graph-client'
import {
  SecureScore,
  SecureScoreControlProfile,
} from '@microsoft/microsoft-graph-types'
import {TokenCredentialAuthenticationProvider} from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials'
import _ from 'lodash'

function processInputs(
  scoreDoc: SecureScore,
  profiles: { value: SecureScoreControlProfile[] },
  output: string,
  withRaw: boolean,
) {
  const converter = new Mapper(
    JSON.stringify({
      secureScore: scoreDoc,
      profiles,
    }),
    withRaw,
  )

  for (const hdfReport of converter.toHdf()) {
    const auxData = ((hdfReport as ExecJSON.Execution & {passthrough: Record<string, unknown>}).passthrough?.auxiliary_data as Record<string, unknown>[]).find(auxDat => auxDat?.name === 'Microsoft Secure Score')?.data as Record<string, unknown>
    const reportId = auxData?.reportId as string
    fs.writeFileSync(`${output.replaceAll(/\.json/gi, '')}-${reportId}.json`, JSON.stringify(hdfReport))
  }
}

export default class MsftSecure2HDF extends Command {
  static usage = [
    'convert msft_secure2hdf -r <secureScore-json> -p <secure-score-control-profiles> -o <hdf-scan-results-json> [-h]',
    'convert msft_secure2hdf -t <azure-tenant-id> -a <azure-app-id> -s <azure-app-secret> -o <hdf-scan-results-json> [-h]',
    'convert msft_secure2hdf -i <combined-inputs> -o <hdf-scan-results-json> [-h]',
  ];

  static description =
    'Translate a Microsoft Secure Score report and Secure Score Control to a Heimdall Data Format JSON file.';

  static examples = [
    'saf convert msft_secure2hdf -p secureScore.json -r secureScoreControlProfiles -o output-hdf-name.json',
    'saf convert msft_secure2hdf -t "12345678-1234-1234-1234-1234567890abcd" -a "12345678-1234-1234-1234-1234567890abcd" -s "aaaaa~bbbbbbbbbbbbbbbbbbbbbbbbb-cccccccc" -o output-hdf-name.json [-I | -C <certificate>] [-t <target>...]',
    'saf convert msft_secure2hdf -i <(jq \'{"secureScore": .[0], "profiles": .[1]}\' secureScore.json secureScoreControlProfiles.json) -o output-hdf-name.json',
  ];

  static flags = {
    help: Flags.help({char: 'h'}),
    combinedInputs: Flags.string({char: 'i', required: false, description: '{secureScore: <CONTENTS_OF_INPUT_SCORE_DOC>}, profiles: <CONTENTS_OF_INPUT_PROFILES_DOC>', exclusive: ['inputProfiles']}),
    inputProfiles: Flags.string({char: 'p', required: false, description: 'Input Microsoft Graph API "GET /security/secureScoreControlProfiles" output JSON File', dependsOn: ['inputScoreDoc', 'inputProfiles'], exclusive: ['tenantId', 'combinedInputs']}),
    inputScoreDoc: Flags.string({char: 'r', required: false, description: 'Input Microsoft Graph API "GET /security/secureScores" output JSON File', dependsOn: ['inputScoreDoc', 'inputProfiles'], exclusive: ['tenantId', 'combinedInputs']}),
    tenantId: Flags.string({char: 't', required: false, description: 'Azure tenant ID', dependsOn: ['tenantId', 'appId', 'appSecret'], exclusive: ['inputProfiles', 'combinedInputs']}),
    appId: Flags.string({char: 'a', required: false, description: 'Azure application ID', dependsOn: ['tenantId', 'appId', 'appSecret'], exclusive: ['inputProfiles', 'combinedInputs']}),
    appSecret: Flags.string({char: 's', required: false, description: 'Azure application secret', dependsOn: ['tenantId', 'appId', 'appSecret'], exclusive: ['inputProfiles', 'combinedInputs']}),
    output: Flags.string({char: 'o', required: true, description: 'Output HDF JSON file'}),
    'with-raw': Flags.boolean({char: 'w', required: false, description: 'Include raw input file in HDF JSON file'}),
    certificate: Flags.string({char: 'C', required: false, description: 'Trusted signing certificate file', exclusive: ['input', 'insecure']}),
    insecure: Flags.boolean({char: 'I', required: false, default: false, description: 'Disable SSL verification, this is insecure.', exclusive: ['input', 'certificate']}),
  };

  async run() {
    const {flags} = await this.parse(MsftSecure2HDF)
    let scoreDoc: SecureScore
    let profilesDoc: { value: SecureScoreControlProfile[] }

    if (
      flags.inputProfiles !== undefined &&
      flags.inputScoreDoc !== undefined
    ) {
      // load from pre-downloaded files
      scoreDoc = JSON.parse(fs.readFileSync(flags.inputScoreDoc, 'utf8'))
      profilesDoc = JSON.parse(fs.readFileSync(flags.inputProfiles, 'utf8'))
      processInputs(scoreDoc, profilesDoc, flags.output, flags['with-raw'])
    } else if (flags.combinedInputs !== undefined) {
      const combined = JSON.parse(fs.readFileSync(flags.combinedInputs, 'utf8'))
      const scoreDoc = combined.secureScore
      const profilesDoc = combined.profiles
      processInputs(scoreDoc, profilesDoc, flags.output, flags['with-raw'])
    } else if (
      flags.tenantId !== undefined &&
      flags.appId !== undefined &&
      flags.appSecret !== undefined
    ) {
      // attempt to use the Graph API to pull files
      const tenantId = flags.tenantId
      const appId = flags.appId
      const appSecret = flags.appSecret
      const creds = new ClientSecretCredential(tenantId, appId, appSecret)
      const graphClientOpts: ClientOptions = {
        authProvider: new TokenCredentialAuthenticationProvider(creds, {
          scopes: ['https://graph.microsoft.com/.default'],
        }),
        fetchOptions: {
          agent: new https.Agent({
            // Disable HTTPS verification if requested
            rejectUnauthorized: !flags.insecure,
            // Pass an SSL certificate to trust
            ca: flags.certificate ? fs.readFileSync(flags.certificate, 'utf8') : undefined,
          }),
        },
      }
      const graphClient: Client = Client.initWithMiddleware(graphClientOpts)

      scoreDoc = await  graphClient.api('/security/secureScores').get()
      profilesDoc = await graphClient.api('/security/secureScoreControlProfiles').get()

      const allProfiles:  SecureScoreControlProfile[] = []

      const callback: PageIteratorCallback = (v: SecureScoreControlProfile) => {
        allProfiles.push(v)
        return true
      }

      const pagingIterator = new PageIterator(graphClient, profilesDoc, callback)

      await pagingIterator.iterate()
      profilesDoc.value = allProfiles

      processInputs(scoreDoc, profilesDoc, flags.output, flags['with-raw'])
    } else {
      throw new Error(
        'Invalid arguments provided.  Include (-a, -s, -t) or (-r, -p) or (-h)',
      )
    }
  }
}
