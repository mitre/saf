import dotenv from 'dotenv'
import fs from 'fs'

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
      this.envConfig = dotenv.parse(fs.readFileSync('.env'));
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        this.envConfig = {};
        // File probably does not exist
        printRedMsg("An eMASS variables configuration file (.env) was not found.");
        printYellowMsg("Create a .env file containing required variables, place it in the root directory where the emasser command is executed.");
        printHelpMessage();
        process.exit(0);
      } else {
        throw error;
      }
    }

    // Option Environment Variable
    this.port = this.getOptionalEnv('EMASSER_PORT', 443);
    this.sslVerify = this.getOptionalEnv('EMASSER_CLIENT_SIDE_VALIDATION', false);
    this.reqCert = this.getOptionalEnv('EMASSER_REQUEST_CERT', false);
    this.debugging = this.getOptionalEnv('EMASSER_DEBUGGING', false);
    this.displayNulls = this.getOptionalEnv('EMASSER_CLI_DISPLAY_NULL', true);
    this.displayDateTime = this.getOptionalEnv('EMASSER_EPOCH_TO_DATETIME', false);    

    // Required Environment Variables
    try {
      this.apiKey = this.getRequiredEnv('EMASSER_API_KEY_API_KEY');
      this.userUid = this.getRequiredEnv('EMASSER_API_KEY_USER_UID');  
      this.url = this.getRequiredEnv('EMASSER_HOST'); 
      this.keyCert = this.getRequiredEnv('EMASSER_KEY_FILE_PATH'); 
      this.clientCert = this.getRequiredEnv('EMASSER_CERT_FILE_PATH');
      this.apiPassPhrase = this.getRequiredEnv('EMASSER_KEY_PASSWORD');
    } catch (error: any) {
      printHelpMessage();
      process.exit(0);
    }
  }
  
  getRequiredEnv(key: string): string | any {
    if(this.envConfig.hasOwnProperty(key)) {
      return this.envConfig[key];
    } else {
      printRedMsg("No configuration was provided for variable: "+ key);
      throw new Error("Environment variable not found");
    }
  }

  getOptionalEnv(key: string, defaultValue: any): string | any {
    if(this.envConfig.hasOwnProperty(key)) {
      return this.envConfig[key];
    } else {
        return defaultValue;
    }
  }
}

function printHelpMessage() {
  printYellowMsg("Required environment variables are:");
  let envArray: Array<string> = [
    "export EMASSER_API_KEY_API_KEY=<API key>",
    "export EMASSER_API_KEY_USER_UID=<unique identifier of the eMASS user EMASSER_API_KEY_API_KEY belongs to>",
    "export EMASSER_HOST=<FQDN of the eMASS server>",
    "export EMASSER_KEY_FILE_PATH=<path to your emass key in PEM format>",
    "export EMASSER_CERT_FILE_PATH=<path to your emass certificate in PEM format>",
    "export EMASSER_KEY_PASSWORD=<password for the key given in EMASSER_KEY_FILE_PATH>"
  ]
  envArray.forEach(function(entry:string) {
    printGreenMsg('\t'+entry);
  });
}

function printRedMsg(msg: string) {
  console.log('\x1b[91m',msg,'\x1b[0m');
}

function printGreenMsg(msg: string) {
  console.log('\x1b[92m',msg,'\x1b[0m');
}

function printYellowMsg(msg: string) {
  console.log('\x1b[93m',msg,'\x1b[0m');
}