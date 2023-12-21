import colors from 'colors' // eslint-disable-line no-restricted-imports
import {Command} from '@oclif/core'

import {generateConfig} from '../../utils/emasser/generateConfig'

export default class EmasserBuildConfig extends Command {
  static description =
    `
   ${colors.yellow('The following variables are required:')}
   ${colors.blue('\tEMASSER_API_KEY') + colors.green('           <The eMASS API key (api-key) - valid key is > 30 alpha numeric characters>\b')}
   ${colors.blue('\tEMASSER_USER_UID') + colors.green('          <The eMASS User Unique Identifier (user-uid)>\b')}
   ${colors.blue('\tEMASSER_HOST_URL') + colors.green('          <The Full Qualified Domain Name (FQDN) for the eMASS server>')}
   ${colors.blue('\tEMASSER_KEY_FILE_PATH') + colors.green('     <The eMASS key.pem private encrypting the key in PEM format (file, include the path)>')}
   ${colors.blue('\tEMASSER_CERT_FILE_PATH') + colors.green('    <The eMASS cert.pem containing the certificate information in PEM format (file, include the path)>')}
   ${colors.blue('\tEMASSER_KEY_FILE_PASSWORD') + colors.green(' <The password for the private encryption key.pem file>')}
   ${colors.yellow('The following variables are optional, if not provided defaults are used:')}
   ${colors.blue('\tEMASSER_PORT') + colors.green('                <The server communication port number (default is 443)>\b')}
   ${colors.blue('\tEMASSER_REQUEST_CERT') + colors.green('        <Server requests a certificate from connecting clients - true or false (default true)>')}
   ${colors.blue('\tEMASSER_REJECT_UNAUTHORIZED') + colors.green(' <Reject clients with invalid certificates - true or false (default true)>')}
   ${colors.blue('\tEMASSER_DEBUGGING') + colors.green('           <Set debugging on (true) or off (false) (default false)>')}
   ${colors.blue('\tEMASSER_CLI_DISPLAY_NULL') + colors.green('    <Display null value fields - true or false (default true)>')}
   ${colors.blue('\tEMASSER_EPOCH_TO_DATETIME') + colors.green('   <Convert epoch to data/time value - true or false (default false)>')}
  `

  static examples = ['<%= config.bin %> <%= command.id %>']

  static summary = 'Generate a configuration file (.env) for accessing an eMASS instances.'

  async run(): Promise<void> { // skipcq: JS-0116, JS-0105
    generateConfig()
  }
}
