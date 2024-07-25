import {Command, Flags} from '@oclif/core'
import fs from 'fs'
import {MsftSecureScoreMapper as Mapper} from '@mitre/hdf-converters'
import {checkSuffix} from '../../utils/global'
import {ClientSecretCredential} from '@azure/identity'
import {Client, ClientOptions} from '@microsoft/microsoft-graph-client'
import {
  SecureScore,
  SecureScoreControlProfile,
} from '@microsoft/microsoft-graph-types'
import {TokenCredentialAuthenticationProvider} from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials'

function processInputs(
  scoreDoc: SecureScore,
  profiles: { value: SecureScoreControlProfile[] },
  output: string,
  withRaw: boolean,
): any {
  const converter = new Mapper(
    JSON.stringify({
      secureScore: scoreDoc,
      profiles: profiles,
    }),
    withRaw,
  )
  fs.writeFileSync(checkSuffix(output), JSON.stringify(converter.toHdf()))
}

export default class MsftSecure2HDF extends Command {
  static usage = [
    'convert msft_secure2hdf -p <secureScoreProfile-json> -r <secureScore-json> [-h]',
    'convert msft_secure2hdf -t <azure-tenant-id> -a <app-id> -s <app-secret> [-h]',
  ];

  static description =
    'Translate a Microsoft365 Secure Score report to a Heimdall Data Format JSON file';

  static examples = [
    'saf convert msft_secure2hdf -p secureScoreProfile.json -r secureScoreControlProfiles -o output-hdf-name.json',
  ];

  static flags = {
    help: Flags.help({char: 'h'}),
    inputProfiles: Flags.string({
      char: 'p',
      required: false,
      description:
        'Input Microsoft Graph API "GET /security/secureScoreControlProfiles" output JSON File',
    }),
    inputScoreDoc: Flags.string({
      char: 'r',
      required: false,
      description:
        'Input Microsoft Graph API "GET /security/secureScores" output JSON File',
    }),
    tenantId: Flags.string({
      char: 't',
      required: false,
      description: 'Azure tenant ID',
    }),
    appId: Flags.string({
      char: 'a',
      required: false,
      description: 'Azure application ID',
    }),
    appSecret: Flags.string({
      char: 's',
      required: false,
      description: 'Azure application secret',
    }),
    output: Flags.string({
      char: 'o',
      required: true,
      description: 'Output HDF JSON file',
    }),
    'with-raw': Flags.boolean({
      char: 'w',
      required: false,
      description: 'Include raw input file in HDF JSON file',
    }),
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
      }
      const graphClient: Client = Client.initWithMiddleware(graphClientOpts);

      (async function () {
        const results = await Promise.all([
          graphClient.api('/security/secureScores').get(),
          graphClient.api('/security/secureScoreControlProfiles').get(),
        ])

        scoreDoc = results[0]
        profilesDoc = results[1]

        processInputs(scoreDoc, profilesDoc, flags.output, flags['with-raw'])
      })()
    } else {
      throw new Error(
        'Invalid arguments provided.  Include (-a, -s, -t) or (-r, -p) or (-h)',
      )
    }
  }
}
