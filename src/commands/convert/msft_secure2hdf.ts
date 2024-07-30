import {Command, Flags} from '@oclif/core'
import fs from 'fs'
import {MsftSecureScoreMapper as Mapper} from '@mitre/hdf-converters'
import {checkSuffix} from '../../utils/global'
import {ClientSecretCredential} from '@azure/identity'
import {Client, ClientOptions, PageIterator, PageIteratorCallback} from '@microsoft/microsoft-graph-client'
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
    'convert msftsecure2hdf (-s <SECRET> -a <APP_ID> -t <TENANT>) -o <OUT_PATH> [-w]',
    'convert msftsecure2hdf (-r <SECURE_REPORT> -p <PROFILES>) -o <OUT_PATH> [-w]',
    'convert msftsecure2hdf -h',
  ]

  static description =
    'Translate a Microsoft365 Secure Score results JSON to a Heimdall Data Format JSON file';

  static examples = [
    'saf convert msftsecure2hdf -p secureScoreProfile.json -r secureScoreControlProfiles -o output-hdf-name.json',
  ];

  static flags = {
    help: Flags.help({char: 'h'}),
    inputProfiles: Flags.string({
      char: 'p',
      required: false,
      dependsOn: ['inputScoreDoc', 'inputProfiles'],
      exclusive: ['tenantId'],
      description:
        'Input Microsoft Graph API "GET /security/secureScoreControlProfiles" output JSON File',
    }),
    inputScoreDoc: Flags.string({
      char: 'r',
      required: false,
      dependsOn: ['inputScoreDoc', 'inputProfiles'],
      exclusive: ['tenantId'],
      description:
        'Input Microsoft Graph API "GET /security/secureScores" output JSON File',
    }),
    tenantId: Flags.string({
      char: 't',
      required: false,
      dependsOn: ['tenantId', 'appId', 'appSecret'],
      exclusive: ['inputProfiles'],
      description: 'Azure tenantID',
    }),
    appId: Flags.string({
      char: 'a',
      required: false,
      dependsOn: ['tenantId', 'appId', 'appSecret'],
      exclusive: ['inputProfiles'],
      description: 'Azure application ID',
    }),
    appSecret: Flags.string({
      char: 's',
      required: false,
      dependsOn: ['tenantId', 'appId', 'appSecret'],
      exclusive: ['inputProfiles'],
      description: 'Azure application Secret',
    }),
    output: Flags.string({
      char: 'o',
      required: true,
      description: 'Output HDF JSON File',
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
