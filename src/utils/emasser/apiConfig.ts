import fs from 'fs'
import dotenv from 'dotenv'

function printYellowMsg(msg: string) {
  console.log('\x1B[93m', msg, '\x1B[0m')
}

function printRedMsg(msg: string) {
  console.log('\x1B[91m', msg, '\x1B[0m')
}

function printHelpMessage() {
  printYellowMsg('Use the emasser CLI command "saf emasser configure" to generate or update an eMASS configuration file.')
  printYellowMsg('If the configuration file is generated, it is placed in the directory where the emasser command is executed.')
}

export class ApiConfig {
  private envConfig: {[key: string]: string | undefined};

  public url: string;
  public port: number|any;
  public keyCert: string;
  public clientCert: string;
  public apiPassPhrase: string;
  public apiKey: string;
  public userUid: string;
  public sslVerify: boolean;
  public reqCert: boolean;
  public debugging: string;
  public displayNulls: string;
  public displayDateTime: string;

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
    this.port = this.getOptionalEnv('EMASSER_PORT', 443)
    this.sslVerify = this.getOptionalEnv('EMASSER_REJECT_UNAUTHORIZED', false)
    this.reqCert = this.getOptionalEnv('EMASSER_REQUEST_CERT', false)
    this.debugging = this.getOptionalEnv('EMASSER_DEBUGGING', false)
    this.displayNulls = this.getOptionalEnv('EMASSER_CLI_DISPLAY_NULL', true)
    this.displayDateTime = this.getOptionalEnv('EMASSER_EPOCH_TO_DATETIME', false)

    // Required Environment Variables
    try {
      this.apiKey = this.getRequiredEnv('EMASSER_API_KEY_API_KEY')
      this.userUid = this.getRequiredEnv('EMASSER_API_KEY_USER_UID')
      this.url = this.getRequiredEnv('EMASSER_HOST')
      this.keyCert = this.getRequiredEnv('EMASSER_KEY_FILE_PATH')
      this.clientCert = this.getRequiredEnv('EMASSER_CERT_FILE_PATH')
      this.apiPassPhrase = this.getRequiredEnv('EMASSER_KEY_PASSWORD')
    } catch (error: any) {
      if (error.name === 'EVNF') {
        printHelpMessage()
      } else {
        console.error(error.message)
      }

      process.exit(0)
    }
  }

  getRequiredEnv(key: string): string | any {
    if (Object.prototype.hasOwnProperty.call(this.envConfig, key)) {
      return this.envConfig[key]
    }  // skipcq: JS-0056

    printRedMsg('No configuration was provided for variable: ' + key)
    const err = new Error('Environment variable not found')
    err.name = 'EVNF'
    throw err
  }

  getOptionalEnv(key: string, defaultValue: any): string | any {
    if (Object.prototype.hasOwnProperty.call(this.envConfig, key)) {
      return this.envConfig[key]
    }  // skipcq: JS-0056

    return defaultValue
  }
}
