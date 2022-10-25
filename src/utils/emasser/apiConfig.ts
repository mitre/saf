import colorize from 'json-colorizer';
import dotenv from 'dotenv'
import fs from 'fs'

export class ApiConfig {
  private envConfig: {[key: string]: string | undefined};

  public url: string;
  public port: number;
  public keyCert: string;
  public clientCert: string;
  public apiPassPhrase: string;
  public apiKey: string;
  public userUid: string;
  public sslVerify: boolean;
  public reqCert: boolean;
  public displayNulls: string;
  public displayDateTime: string;

  constructor() {
    try {
      this.envConfig = dotenv.parse(fs.readFileSync('.env'));
      // console.log('Read config!');
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        this.envConfig = {};
        // File probably does not exist
        console.error(colorize(JSON.stringify({error: 'A configuration file (.env) containing the expected environmental variable is required.'})));
        process.exit(0);
      } else {
        throw error;
      }
    }

    this.url = this.get('EMASSER_HOST'); 
    this.port = this.get('EMASSER_PORT');
    this.keyCert = this.get('EMASSER_KEY_FILE_PATH'); 
    this.clientCert = this.get('EMASSER_CERT_FILE_PATH');
    this.apiPassPhrase = this.get('EMASSER_KEY_PASSWORD');
    this.apiKey = this.get('EMASSER_API_KEY_API_KEY');
    this.userUid = this.get('EMASSER_API_KEY_USER_UID');
    this.sslVerify = this.get('EMASSER_CLIENT_SIDE_VALIDATION');
    this.reqCert = this.get('EMASSER_REQUEST_CERT');
    this.displayNulls = this.get('EMASSER_CLI_DISPLAY_NULL');
    this.displayDateTime = this.get('EMASSER_EPOCH_TO_DATETIME');
  }

  get(key: string): string | any {
    return this.envConfig[key];
  }

}