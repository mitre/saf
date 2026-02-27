import fs from 'fs';
import dotenv from 'dotenv';
import { printHelpMsg, printRedMsg } from './utilities';

function printHelpMessage(showLocation: boolean) {
  printHelpMsg('Use the eMASSer CLI command "saf emasser configure" to generate or update an eMASS configuration file.');
  if (showLocation) {
    printHelpMsg('If a configuration file exists, it should be placed in the directory where the emasser command is executed.');
  }
}

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
  private readonly envConfig: { [key: string]: string | undefined };

  public url: string;
  public port: number;
  public caCert: string | undefined;
  public keyCert: string | undefined;
  public clientCert: string | undefined;
  public apiPassPhrase: string;
  public apiKey: string;
  public userUid: string;
  public sslVerify: boolean;
  public reqCert: boolean;
  public debugging: boolean;
  public displayNulls: boolean;
  public displayDateTime: boolean;
  public downloadDir: string;

  constructor() {
    try {
      this.envConfig = dotenv.parse(fs.readFileSync('.env'));
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && typeof (error as { code?: unknown }).code === 'string' && (error as { code: string }).code === 'ENOENT') {
        this.envConfig = {};
        // File probably does not exist
        printRedMsg('An eMASS configuration file (.env) was not found.');
        printHelpMessage(true);
        process.exit(0);
      }
      throw error; // Rethrow if it's not an expected error
    }

    // Option Environment Variable
    // The userUid is required by some eMASS instances for actionable requests (post,put,delete)
    this.userUid = this.getOptionalEnv('EMASSER_USER_UID', '');
    this.port = this.getOptionalEnv('EMASSER_PORT', 443);
    this.sslVerify = this.getOptionalEnv('EMASSER_REJECT_UNAUTHORIZED', false);
    this.reqCert = this.getOptionalEnv('EMASSER_REQUEST_CERT', false);
    this.debugging = this.getOptionalEnv('EMASSER_DEBUGGING', false);
    this.displayNulls = this.getOptionalEnv('EMASSER_CLI_DISPLAY_NULL', true);
    this.displayDateTime = this.getOptionalEnv('EMASSER_EPOCH_TO_DATETIME', false);
    this.downloadDir = this.getOptionalEnv('EMASSER_DOWNLOAD_DIR', 'eMASSerDownloads');

    // Required Environment Variables
    try {
      this.apiKey = this.getRequiredEnv('EMASSER_API_KEY');
      this.url = this.getRequiredEnv('EMASSER_HOST_URL');
      this.apiPassPhrase = this.getRequiredEnv('EMASSER_KEY_FILE_PASSWORD');
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'EVNF') {
        printHelpMessage(false);
      } else if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error('An unknown error occurred:', error);
      }
      process.exit(0);
    }

    // Get provided certificate(s). Require either a .pfx certificate,
    // or a client and key .pem certificates
    if (Object.prototype.hasOwnProperty.call(this.envConfig, 'EMASSER_CA_FILE_PATH') && this.envConfig.EMASSER_CA_FILE_PATH !== '') {
      this.caCert = this.envConfig.EMASSER_CA_FILE_PATH;
    } else if (Object.prototype.hasOwnProperty.call(this.envConfig, 'EMASSER_KEY_FILE_PATH') && this.envConfig.EMASSER_KEY_FILE_PATH !== ''
      && Object.prototype.hasOwnProperty.call(this.envConfig, 'EMASSER_CERT_FILE_PATH') && this.envConfig.EMASSER_CERT_FILE_PATH !== '') {
      // We have the .pem certificate files
      this.keyCert = this.envConfig.EMASSER_KEY_FILE_PATH;
      this.clientCert = this.envConfig.EMASSER_CERT_FILE_PATH;
    } else {
      // We don't have neither a .pfx or .pem(s) certificates
      printRedMsg('A CA certificate (.cer/.crt/.pem) or a Key and Client (.pem) certificate files were expected');
      printRedMsg('If providing PEM certificates, the required certs are "key.pem" and "client.pem"');
      process.exit(0);
    }
  }

  /**
   * Retrieves the value of the specified environment variable key from the configuration.
   * If the key is not found or the value is not a string, an error is thrown.
   *
   * @param key - The environment variable key to retrieve.
   * @returns The value of the specified environment variable key.
   * @throws {Error} If the environment variable is not found or its value is not a string.
   * The error will have a name property set to 'EVNF'.
   */
  getRequiredEnv(key: string): string {
    if (this.envConfig && Object.prototype.hasOwnProperty.call(this.envConfig, key)) {
      const value = this.envConfig[key];

      if (typeof value === 'string') {
        return value;
      }
    }

    printRedMsg(`No configuration was provided for variable: ${key}`);
    const err = new Error('Environment variable not found');
    err.name = 'EVNF';
    throw err;
  }

  /**
   * Retrieves an environment variable value from the `envConfig` object.
   * If the key exists in `envConfig`, it attempts to parse the value to a
   * boolean or number if applicable. If the parsed value matches the type of
   * the provided default value and is not zero or an empty string, it returns
   * the parsed value. Otherwise, it returns the default value.
   *
   * NOTE: The library dotenv, by default returns all environment variables as
   *       strings. We evaluate if the casting of the variables is either a
   *       string, number, of boolean to properly process the provided value.
   *
   * @template T - The type of the default value.
   * @param {string} key - The key of the environment variable to retrieve.
   * @param {T} defaultValue - The default value to return if the environment variable is not found or is invalid.
   * @returns {T} - The environment variable value if valid, otherwise the default value.
   */
  getOptionalEnv<T>(key: string, defaultValue: T): T {
    if (this.envConfig && Object.prototype.hasOwnProperty.call(this.envConfig, key)) {
      const envValue = this.envConfig[key];
      const value = envValue === 'true'
        ? true
        : envValue === 'false'
          ? false
          : isNaN(Number(envValue))
            ? envValue
            : Number(envValue);

      const isNotZeroOrEmpty = (value: string | number | boolean | undefined): boolean => {
        return value !== 0 && value !== '';
      };

      return typeof value === typeof defaultValue && isNotZeroOrEmpty(value) ? value as T : defaultValue;
    }
    return defaultValue;
  }
}
