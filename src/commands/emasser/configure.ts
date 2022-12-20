import colors from 'colors' // eslint-disable-line no-restricted-imports
import {Command, Flags} from '@oclif/core'
import {generateConfig} from '../../utils/emasser/generateConfig'

export default class EmasserBuildConfig extends Command {
  static summary = 'Generate a configuration file (.env) for accessing an eMASS instances.'

  static description =
  `
   ${colors.yellow('The following variables are required:')}
   ${colors.blue('EMASSER_API_KEY_API_KEY') + colors.green('  <The eMASS API key (api-key) - valid key is > 30 alpha numeric characters>')}
   ${colors.blue('EMASSER_API_KEY_USER_UID') + colors.green(' <The eMASS User Unique Identifier (user-uid)>')}
   ${colors.blue('EMASSER_HOST') + colors.green('             <The Full Qualified Domain Name (FQDN) for the eMASS server>')}
   ${colors.blue('EMASSER_KEY_FILE_PATH') + colors.green('    <The eMASS key.pem private encrypting the key in PEM format (file, include the path)>')}
   ${colors.blue('EMASSER_CERT_FILE_PATH') + colors.green('   <The eMASS cert.pem containing the certificate information in PEM format (file, include the path)')}
   ${colors.blue('EMASSER_KEY_PASSWORD') + colors.green('     <The password for the private encryption key.pem file')}
   ${colors.yellow('The following variables are optional, if not provided defaults are used:')}
   ${colors.blue('EMASSER_PORT') + colors.green('                <The server communication port number (default is 443)')}
   ${colors.blue('EMASSER_REQUEST_CERT') + colors.green('        <Server requests a certificate from clients - true or false (default true)')}
   ${colors.blue('EMASSER_REJECT_UNAUTHORIZED') + colors.green(' <Reject connection not authorized with the list of supplied CAs- true or false (default true)')}
   ${colors.blue('EMASSER_DEBUGGING') + colors.green('           <Set debugging on or off - true or false (default false)')}
   ${colors.blue('EMASSER_CLI_DISPLAY_NULL') + colors.green('    <Display null value fields - true or false (default true)')}
   ${colors.blue('EMASSER_EPOCH_TO_DATETIME') + colors.green('   <Convert epoch to data/time value - true or false (default false)')}
  `

  static examples = ['<%= config.bin %> <%= command.id %>']

  async run(): Promise<void> { // skipcq: JS-0116, JS-0105
    generateConfig()
    // console.log('NOT COMPILING')
  }
}
