import fs from 'fs'
import dotenv from 'dotenv'
import {printHelpMsg, printRedMsg} from './utilities'

function printHelpMessage() {
  printHelpMsg('Use the eMASSer CLI command "saf emasser configure" to generate or update an eMASS configuration file.')
  printHelpMsg('If a configuration file exists, it is placed in the directory where the emasser command is executed.')
}

// eslint-disable-next-line valid-jsdoc
/**
 * The `ApiConfig` class is responsible for loading and managing the configuration
 * settings required for connecting to the eMASS API. It reads environment variables
 * from a `.env` file and provides methods to retrieve required and optional configuration
 * values.
 *
 * @class ApiConfig
 * @property {string} url - The URL of the eMASS API host.
 * @property {number | any} port - The port number for the eMASS API.
 * @property {string | undefined} caCert - The path to the CA certificate file.
 * @property {string | undefined} keyCert - The path to the key certificate file.
 * @property {string | undefined} clientCert - The path to the client certificate file.
 * @property {string} apiPassPhrase - The passphrase for the API key file.
 * @property {string} apiKey - The API key for authenticating requests.
 * @property {string} userUid - The user UID required for actionable requests.
 * @property {boolean} sslVerify - Whether to verify SSL certificates.
 * @property {boolean} reqCert - Whether to request a certificate.
 * @property {string} debugging - Debugging mode flag.
 * @property {string} displayNulls - Flag to display null values.
 * @property {string} displayDateTime - Flag to display date and time.
 * @property {string} downloadDir - The directory for downloads.
 *
 * @constructor
 * Initializes a new instance of the `ApiConfig` class. Loads environment variables
 * from a `.env` file and sets the configuration properties. If required environment
 * variables are missing, it prints an error message and exits the process.
 */
export class ApiConfig {
  private envConfig: {[key: string]: string | undefined}; // skipcq: JS-0368

  public url: string;
  public port: number|any;
  public caCert: string | undefined;
  public keyCert: string | undefined;
  public clientCert: string | undefined;
  public apiPassPhrase: string;
  public apiKey: string;
  public userUid: string;
  public sslVerify: boolean;
  public reqCert: boolean;
  public debugging: string;
  public displayNulls: string;
  public displayDateTime: string;
  public downloadDir: string;

  constructor() {
    try {
      this.envConfig = dotenv.parse(fs.readFileSync('.env'))
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        this.envConfig = {}
        // File probably does not exist
        printRedMsg('An eMASS variables configuration file (.env) was not found.')
        printHelpMessage()
        process.exit(0)
      } else {
        throw error
      }
    }

    // Option Environment Variable
    // The userUid is required by some eMASS instances for actionable requests (post,put,delete)
    this.userUid = this.getOptionalEnv('EMASSER_USER_UID', '')
    this.port = this.getOptionalEnv('EMASSER_PORT', 443)
    this.sslVerify = this.getOptionalEnv('EMASSER_REJECT_UNAUTHORIZED', false)
    this.reqCert = this.getOptionalEnv('EMASSER_REQUEST_CERT', false)
    this.debugging = this.getOptionalEnv('EMASSER_DEBUGGING', false)
    this.displayNulls = this.getOptionalEnv('EMASSER_CLI_DISPLAY_NULL', true)
    this.displayDateTime = this.getOptionalEnv('EMASSER_EPOCH_TO_DATETIME', false)
    this.downloadDir = this.getOptionalEnv('EMASSER_DOWNLOAD_DIR', 'eMASSerDownloads')

    // Required Environment Variables
    try {
      this.apiKey = this.getRequiredEnv('EMASSER_API_KEY')
      this.url = this.getRequiredEnv('EMASSER_HOST_URL')
      this.apiPassPhrase = this.getRequiredEnv('EMASSER_KEY_FILE_PASSWORD')
    } catch (error: any) {
      if (error.name === 'EVNF') {
        printHelpMessage()
      } else {
        console.error(error.message)
      }

      process.exit(0)
    }

    // Get provided certificate(s). Require either a .pfx certificate,
    // or a client and key .pem certificates
    if (Object.prototype.hasOwnProperty.call(this.envConfig, 'EMASSER_CA_FILE_PATH') && this.envConfig.EMASSER_CA_FILE_PATH !== '') {
      this.caCert = this.envConfig.EMASSER_CA_FILE_PATH
    } else if (Object.prototype.hasOwnProperty.call(this.envConfig, 'EMASSER_KEY_FILE_PATH') && this.envConfig.EMASSER_KEY_FILE_PATH !== '' &&
      Object.prototype.hasOwnProperty.call(this.envConfig, 'EMASSER_CERT_FILE_PATH') && this.envConfig.EMASSER_CERT_FILE_PATH !== '') {
      // We have the .pem certificate files
      this.keyCert = this.envConfig.EMASSER_KEY_FILE_PATH
      this.clientCert = this.envConfig.EMASSER_CERT_FILE_PATH
    } else {
      // We don't have neither a .pfx or .pem(s) certificates
      printRedMsg('A CA certificate (.cer/.crt/.pem) or a Key and Client (.pem) certificate files were expected')
      printRedMsg('If providing PEM certificates, the required certs are "key.pem" and "client.pem"')
      process.exit(0)
    }
  }

  /**
   * Retrieves the value of the specified environment variable from the configuration.
   * If the environment variable is not found, an error is thrown.
   *
   * @param {string} key - The key of the environment variable to retrieve.
   * @returns {string | any} - The value of the environment variable.
   * @throws {Error} - Throws an error if the environment variable is not found.
   */
  getRequiredEnv(key: string): string | any {
    if (Object.prototype.hasOwnProperty.call(this.envConfig, key)) {
      return this.envConfig[key]
    }  // skipcq: JS-0056

    printRedMsg('No configuration was provided for variable: ' + key)
    const err = new Error('Environment variable not found')
    err.name = 'EVNF'
    throw err
  }

  /**
   * Retrieves the value of an environment variable if it exists, otherwise returns a default value.
   *
   * @param key - The key of the environment variable to retrieve.
   * @param defaultValue - The default value to return if the environment variable does not exist.
   * @returns The value of the environment variable if it exists, otherwise the default value.
   */
  getOptionalEnv(key: string, defaultValue: any): string | any {
    if (Object.prototype.hasOwnProperty.call(this.envConfig, key)) {
      return this.envConfig[key]
    }  // skipcq: JS-0056

    return defaultValue
  }
}
