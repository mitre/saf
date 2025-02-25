import colors from 'colors' // eslint-disable-line no-restricted-imports
import {Command} from '@oclif/core'
import {generateConfig} from '../../utils/emasser/generateConfig'

export default class EmasserBuildConfig extends Command {
  static summary = 'Generate a configuration file (.env) for accessing an eMASS instances.\n' +
                   'Authentication to an eMASS instances requires a PKI-valid/trusted client\n' +
                   'certificate. The eMASSer CLI accepts a Key/Client pair certificates (.pem) or\n' +
                   'a CA certificate (.pem or .crt). A Unique user identifier (user-uid) is used by\n' +
                   'most eMASS integration, however certain integrations, the user-uid is not required'

  static description =
  `
   ${colors.yellow('Required eMASS configuration variables:')}
   ${colors.blue('\tEMASSER_API_KEY') + colors.green('           <The eMASS API key (api-key) - valid key is > 30 alpha numeric characters>\b')}
   ${colors.blue('\tEMASSER_HOST_URL') + colors.green('          <The Full Qualified Domain Name (FQDN) for the eMASS server>')}
   ${colors.blue('\tEMASSER_KEY_FILE_PATH') + colors.green('     <The eMASS key.pem private key file in PEM format (if provided the CERT is required)>')}
   ${colors.blue('\tEMASSER_CERT_FILE_PATH') + colors.green('    <The eMASS client.pem certificate file in PEM format (if provided the KEY is required)>')}
   ${colors.blue('\tEMASSER_CA_FILE_PATH') + colors.green('      <The eMASS CA certificate (if provided no Key or Client PEM is needed)>')}
   ${colors.blue('\tEMASSER_KEY_FILE_PASSWORD') + colors.green(' <The password for the private encryption key.pem file>')}
   ${colors.yellow('Certain eMASS integrations may not require (most do) this variable:')}
   ${colors.blue('\tEMASSER_USER_UID') + colors.green('          <The eMASS User Unique Identifier (user-uid)>\b')}   
   
   ${colors.yellow('Optional eMASS configuration variables, if not provided defaults are used:')}
   ${colors.blue('\tEMASSER_PORT') + colors.green('                <The server communication port number (default is 443)>\b')}
   ${colors.blue('\tEMASSER_REQUEST_CERT') + colors.green('        <Server requests a certificate from connecting clients - true or false (default true)>')}
   ${colors.blue('\tEMASSER_REJECT_UNAUTHORIZED') + colors.green(' <Reject clients with invalid certificates - true or false (default true)>')}
   ${colors.blue('\tEMASSER_DEBUGGING') + colors.green('           <Set debugging on (true) or off (false) (default false)>')}
   ${colors.blue('\tEMASSER_CLI_DISPLAY_NULL') + colors.green('    <Display null value fields - true or false (default true)>')}
   ${colors.blue('\tEMASSER_EPOCH_TO_DATETIME') + colors.green('   <Convert epoch to data/time value - true or false (default false)>')}
   ${colors.blue('\tEMASSER_DOWNLOAD_DIR') + colors.green('         <Directory where the CLI exports files (default eMASSerDownloads)>')}
  `

  static examples = ['<%= config.bin %> <%= command.id %>']

  // configure axios to use a CA certificate - can be .pem or crt
  // configure Axios to use a key and client certificate (.pem)

  // skipcq: JS-0116, JS-0105
  async run(): Promise<void> {
    generateConfig() // skipcq: JS-0328
  }
}
