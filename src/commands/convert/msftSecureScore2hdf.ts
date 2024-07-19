import {Command, Flags} from '@oclif/core'
import fs from 'fs'
import {MsftSecureScoreMapper as Mapper} from '@mitre/hdf-converters'
import {checkInput, checkSuffix} from '../../utils/global'

import {ClientSecretCredential} from '@azure/identity'
import {Client, ClientOptions} from '@microsoft/microsoft-graph-client'
import {
  SecureScore,
  ControlScore,
  SecureScoreControlProfile,
} from '@microsoft/microsoft-graph-types'
import {TokenCredentialAuthenticationProvider} from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials'

export default class MsftSecureScore2HDF extends Command {
  static usage =
    'convert msftsecure2hdf -i <gosec-json> -o <hdf-scan-results-json> [-h]';

  static description =
    'Translate a GoSec (Golang Security Checker) results JSON to a Heimdall Data Format JSON file';

  static examples = [
    'saf convert gosec2hdf -i gosec_results.json -o output-hdf-name.json',
  ];

  static flags = {
    help: Flags.help({char: 'h'}),
    inputProfiles: Flags.string({
      char: 'p',
      required: true,
      description: 'Input GoSec Results JSON File',
    }),
    inputScoreDoc: Flags.string({
      char: 'r',
      required: true,
      description: 'Input GoSec Results JSON File',
    }),
    tenantId: Flags.string({
      char: 't',
      required: false,
      description: 'Azure tenantID',
    }),
    tokenId: Flags.string({
      char: 'a',
      required: false,
      description: 'Azure appId',
    }),
    tokenSecret: Flags.string({
      char: 's',
      required: false,
      description: 'Azure appSecret',
    }),
    output: Flags.string({
      char: 'o',
      required: true,
      description: 'Output HDF JSON File',
    }),
  };

  async run() {
    console.log('pre')

    const {flags} = await this.parse(MsftSecureScore2HDF)
    // console.log(`post ${JSON.stringify(flags, null, 4)}`)

    // Check for correct input type
    // checkInput({data, filename: flags.input}, 'gosec', 'GoSec results JSON')

    let scoreDoc:object
    let profilesDoc:object

    if (flags.inputProfiles !== undefined && flags.inputScoreDoc !== undefined) {
      scoreDoc = JSON.parse(fs.readFileSync(flags.inputScoreDoc, 'utf8'))
      profilesDoc = JSON.parse(fs.readFileSync(flags.inputProfiles, 'utf8'))
    } else if (flags.tenantId !== undefined && flags.tokenId !== undefined && flags.tokenSecret !== undefined) {
      const tenantId = flags.tenantId
      const clientId = flags.tokenId
      const clientSecret = flags.tokenSecret
      const creds = new ClientSecretCredential(tenantId, clientId, clientSecret)
      const graphClientOpts: ClientOptions = {
        authProvider: new TokenCredentialAuthenticationProvider(creds, {
          scopes: ['https://graph.microsoft.com/.default'],
        }),
        fetchOptions: {
          // agent: new NodeHttpHandler({
          //   httpsAgent: new https.Agent({
          //     // Disable HTTPS verification if requested
          //     rejectUnauthorized: verifySSLCertificates,
          //     // Pass an SSL certificate to trust
          //     ca: certificate
          //   })
          // })
        },
      }
      const graphClient: Client = Client.initWithMiddleware(graphClientOpts)

      scoreDoc = JSON.parse((await graphClient.api('/security/secureScores').get()).body) as SecureScore
      profilesDoc = JSON.parse((await graphClient.api('/security/secureScores').get()).body).value as SecureScoreControlProfile[]
    } else {
      this.exit(-1)
    }

    const converter = new Mapper(
      JSON.stringify({
        secureScore: scoreDoc,
        profiles: profilesDoc,
      }),
    )
    fs.writeFileSync(
      checkSuffix(flags.output),
      JSON.stringify(converter.toHdf()),
    )
  }
}
