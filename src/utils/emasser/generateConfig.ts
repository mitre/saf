import fse from 'fs-extra'
import dotenv from 'dotenv'
import _ from 'lodash'
import colors from 'colors'
import {input, confirm, password, select} from '@inquirer/prompts'

const PROMPT_MESSAGE = [
  'Provide the eMASS API key (EMASSER_API_KEY) - valid key is > 30 alpha numeric characters:',
  'Provide the eMASS server FQDN (EMASSER_HOST_URL) :',
  'Provide the eMASS private encrypting file (key.pem) - include the path (EMASSER_KEY_FILE_PATH)):',
  'Provide the eMASS client certificate file (cert.pem) - include the path (EMASSER_CERT_FILE_PATH):',
  'Provide the eMASS CA certificate file (.cer, crt, or .pem) - include the path (EMASSER_CA_FILE_PATH):',
  'Provide the secret phrase used to protect the encryption key:',
  'Provide the eMASS User unique identifier (EMASSER_USER_UID):',
  'Provide the server communication port number (default is 443):',
  'Server requests a certificate from connecting clients - true or false (default true):',
  'Reject clients with invalid certificates - true or false (default true):',
  'Set debugging on (true) or off (false) (default false):',
  'Display null value fields - true or false (default false):',
  'Convert epoch to data/time value - true or false (default true):',
  'Directory where exported files are saved (default eMASSerDownloads):',
]

const PROMPT_NAMES_REQUIRED = [
  '# -----------------------------------------------------------------------------',
  '# Required environment variables',
  'EMASSER_API_KEY',
  'EMASSER_HOST_URL',
  'EMASSER_KEY_FILE_PATH',
  'EMASSER_CERT_FILE_PATH',
  'EMASSER_CA_FILE_PATH',
  'EMASSER_KEY_FILE_PASSWORD',
  '# Not required by certain eMASS instances (required by most)',
  'EMASSER_USER_UID',
]

const PROMPT_NAMES_OPTIONAL = [
  '# -----------------------------------------------------------------------------',
  '# Optional environment variables',
  'EMASSER_PORT',
  'EMASSER_REQUEST_CERT',
  'EMASSER_REJECT_UNAUTHORIZED',
  'EMASSER_DEBUGGING',
  'EMASSER_CLI_DISPLAY_NULL',
  'EMASSER_EPOCH_TO_DATETIME',
  'EMASSER_DOWNLOAD_DIR',
]

const OPTIONAL_DEFAULT_VALUES = [
  443,
  true,
  true,
  false,
  true,
  false,
  "'eMASSerDownloads'",
]

/**
 * Generates a new `.env` file with required and optional environment variables.
 *
 * This function constructs the content for a new `.env` file by iterating over
 * the `PROMPT_NAMES_REQUIRED` and `PROMPT_NAMES_OPTIONAL` arrays. Required variables
 * are added with empty values, while optional variables are added with their respective
 * default values from the `OPTIONAL_DEFAULT_VALUES` array.
 *
 * The generated content is then written to a file named `.env` in the current directory.
 *
 * @remarks
 * - Lines starting with `#` are treated as comments and are added as-is.
 * - The `OPTIONAL_DEFAULT_VALUES` array is expected to have a length that matches the
 *   `PROMPT_NAMES_OPTIONAL` array, with the first two elements being placeholders.
 *
 * @throws Will throw an error if the file cannot be written.
 */
function generateNewdotEnv() {
  let data = ''
  PROMPT_NAMES_REQUIRED.forEach((element) => {
    data += element.startsWith('#') ? element + '\n' : element + "=''\n"
  })

  PROMPT_NAMES_OPTIONAL.forEach((element, index) => {
    data += element.startsWith('#') ? element + '\n' : element + '=' + OPTIONAL_DEFAULT_VALUES[index - 2] + '\n'
  })

  fse.writeFileSync('.env', data)
}

/**
 * Asynchronously processes user prompts to generate and update an eMASS configuration file.
 *
 * This function performs the following steps:
 * 1. Parses the `.env` file to retrieve existing environment variables.
 * 2. Dynamically imports `inquirer-file-selector` and `chalk` modules.
 * 3. Initializes a theme for the file selector prompts.
 * 4. Prompts the user for required eMASS configuration variables such as API key, host URL, and key file password.
 * 5. Prompts the user to select the type of certificate to use (Key/Client Certificate or Single CA Certificate).
 * 6. Based on the selected certificate type, prompts the user to select the appropriate certificate files.
 * 7. Optionally prompts the user to add a unique user identifier.
 * 8. Prompts the user for optional eMASS configuration variables such as port, request certificate, reject unauthorized, debugging, CLI display null, epoch to datetime, and download directory.
 * 9. Updates the `.env` file with the collected configuration variables.
 * 10. Outputs the content of the updated `.env` file to the console.
 *
 * @async
 * @function processPrompt
 * @returns {Promise<void>} A promise that resolves when the prompts have been processed and the `.env` file has been updated.
 */
async function processPrompt() {
  const envConfig = dotenv.parse(fse.readFileSync('.env'))

  // Dynamically import inquirer-file-selector and chalk
  // Once we move the SAF CLI from a CommonJS to an ES modules we can use the regular import
  const {default: fileSelector} = await import('inquirer-file-selector')
  const {default: chalk} = await import('chalk')

  const fileSelectorTheme = {
    style: {
      file: (text: unknown) => chalk.green(text),
      help: (text: unknown) => chalk.yellow(text),
    },
  }

  // Variable used to store the prompts (question and answers)
  const interactiveValues: {[key: string]: string | number} = {EMASSER_KEY_FILE_PATH: '', EMASSER_CERT_FILE_PATH: '', EMASSER_CA_FILE_PATH: ''}
  // Reset the certificates as the user will choose what cert type to use

  // Required variables
  const requiredContent = {
    EMASSER_API_KEY: await input({
      message: PROMPT_MESSAGE[0],
      default: envConfig.EMASSER_API_KEY,
      required: true,
      validate: (input: string) => {
        if (/([a-zA-Z0-9-]{30,})/g.test(input)) { // skipcq: JS-0113
          return true
        }

        return 'Invalid API key. Must have more than 30 alpha numeric characters, no special keys other than a dash(-)'
      },
    }),
    EMASSER_HOST_URL: await input({
      message: PROMPT_MESSAGE[1],
      default: envConfig.EMASSER_HOST_URL,
      required: true,
      validate: (input: string) => {
        // eslint-disable-next-line no-useless-escape
        if (/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/g.test(input)) { // skipcq: JS-0113, JS-0097
          return true
        }

        return 'Invalid eMASS FQDN (URL). Format: [protocol]://[hostname].[...].[domain].'
      },
    }),
    EMASSER_KEY_FILE_PASSWORD: await password({
      message: PROMPT_MESSAGE[5],
      mask: true,
    }),
  }

  // Add required content to the collection
  for (const tagName in requiredContent) {
    if (Object.prototype.hasOwnProperty.call(requiredContent, tagName)) {
      const answerValue = _.get(requiredContent, tagName)
      if (answerValue !== null) {
        interactiveValues[tagName] = answerValue
      }
    }
  }

  // What type od cert are we using?
  const certTypes = {
    certType: await select({
      message: 'What type of certificate to use with eMASS!',
      default: 'Key_Cert',
      choices: [
        {name: 'Key/Client Certificate', value: 'key_cert'},
        {name: 'Single CA Certificate', value: 'CA'},
      ],
    }),
  }

  // Get cert information
  const requiredCerts = certTypes.certType === 'key_cert' ? {
    EMASSER_KEY_FILE_PATH: await fileSelector({
      message: PROMPT_MESSAGE[2],
      pageSize: 15,
      loop: true,
      type: 'file',
      allowCancel: true,
      emptyText: 'Directory is empty',
      showExcluded: false,
      filter: file => file.isDirectory() || file.name.endsWith('.pem'),
      theme: fileSelectorTheme,
    }),
    EMASSER_CERT_FILE_PATH: await fileSelector({
      message: PROMPT_MESSAGE[3],
      pageSize: 15,
      loop: true,
      type: 'file',
      allowCancel: true,
      emptyText: 'Directory is empty',
      showExcluded: false,
      filter: file => file.isDirectory() || file.name.endsWith('.pem'),
      theme: fileSelectorTheme,
    }),
  } : {
    EMASSER_CA_FILE_PATH: await fileSelector({
      message: PROMPT_MESSAGE[4],
      pageSize: 15,
      loop: true,
      type: 'file',
      allowCancel: true,
      emptyText: 'Directory is empty',
      showExcluded: false,
      filter: file => file.isDirectory() || file.name.endsWith('.pem') || file.name.endsWith('.crt') || file.name.endsWith('.cer'),
      theme: fileSelectorTheme,
    }),
  }

  // Add certs content to the collection
  for (const tagName in requiredCerts) {
    if (Object.prototype.hasOwnProperty.call(requiredCerts, tagName)) {
      const answerValue = _.get(requiredCerts, tagName)
      if (answerValue !== null) {
        interactiveValues[tagName] = answerValue
      }
    }
  }

  // Use the unique user identifier?
  const addUserUid = await confirm({message: 'Add a unique user identifier (user-id)?'})
  if (addUserUid) {
    const EMASSER_USER_UID = await input({
      message: PROMPT_MESSAGE[6],
      default: envConfig.EMASSER_USER_UID,
      required: true,
    })
    interactiveValues.EMASSER_USER_UID = EMASSER_USER_UID
  }

  // Process the optional environment configuration variables
  const optionalContent = {
    EMASSER_PORT: await input({
      message: PROMPT_MESSAGE[7],
      default: envConfig.EMASSER_PORT,
      validate(input: string) {
        if (/(^([1-9][0-9]{0,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$)/g.test(input)) { // skipcq: JS-0113
          return true
        }

        return 'Invalid port provided. Must be a Well-known (0-1023), or Registered (1024-49151), or Private (49152-65535) port number'
      },
    }),
    EMASSER_REQUEST_CERT: await select({
      message: PROMPT_MESSAGE[8],
      default: true,
      choices: [
        {name: 'true', value: true},
        {name: 'false', value: false},
      ],
    }),
    EMASSER_REJECT_UNAUTHORIZED: await select({
      message: PROMPT_MESSAGE[9],
      default: true,
      choices: [
        {name: 'true', value: true},
        {name: 'false', value: false},
      ],
    }),
    EMASSER_DEBUGGING: await select({
      message: PROMPT_MESSAGE[10],
      default: false,
      choices: [
        {name: 'true', value: true},
        {name: 'false', value: false},
      ],
    }),
    EMASSER_CLI_DISPLAY_NULL: await select({
      message: PROMPT_MESSAGE[11],
      default: false,
      choices: [
        {name: 'true', value: true},
        {name: 'false', value: false},
      ],
    }),
    EMASSER_EPOCH_TO_DATETIME: await select({
      message: PROMPT_MESSAGE[12],
      default: true,
      choices: [
        {name: 'true', value: true},
        {name: 'false', value: false},
      ],
    }),
    EMASSER_DOWNLOAD_DIR: await input({
      message: PROMPT_MESSAGE[13],
      default: envConfig.EMASSER_DOWNLOAD_DIR,
    }),
  }

  // Add optional content to the collection
  for (const tagName in optionalContent) {
    if (Object.prototype.hasOwnProperty.call(optionalContent, tagName)) {
      const answerValue = _.get(optionalContent, tagName)
      if (answerValue !== null) {
        interactiveValues[tagName] = answerValue
      }
    }
  }
  // Save content to the .env file
  updateKeyValuePairs('.env', interactiveValues)

  // Output the content of the new or updated .env configuration file
  const table: string[][] = fse.readFileSync('.env', 'utf8').split('\n').map(pair => pair.split('='))
  const envData: object = Object.fromEntries(table)

  console.log('\n', colors.yellow('An eMASS configuration file with the following environment variables was created:'))

  for (const [key, value] of Object.entries(envData)) {
    // if ((key.trim() !== '' || !key.startsWith('#'))) {
    if (key.startsWith('#')) {
      console.log(`\t${colors.green(key)}`)
    } else if (key.trim() !== '') {
      console.log(`\t${colors.blue(key)}=${colors.dim(value)}`)
    }
  }

  console.log('\n', colors.yellow('To modify any of the entries, simple run the configure command again.'))
  console.log('\n', colors.cyan.bold('To verify connection to the eMASS services use the command: '), colors.green.underline('saf emasser get test_connection'))
  console.log('\n', colors.cyan.bold('For additional help on available eMASS CLI API commands use: '), colors.green.underline('saf emasser -h or -help'))
}

/**
 * Updates key-value pairs in a file based on the provided updates object.
 *
 * @param filePath - The path to the file to be updated.
 * @param updates  - An object containing key-value pairs to update in the file.
 *                   The keys represent the keys in the file, and the values
 *                   represent the new values to be set. If the value is a
 *                   string, it will be wrapped in single quotes.
 *
 * @throws Will throw an error if there is an issue reading or writing the file.
 *
 */
function updateKeyValuePairs(filePath: fse.PathOrFileDescriptor, updates: Record<string, string | number | boolean>): void {
  try {
    // Read the file content
    const fileContent = fse.readFileSync(filePath, 'utf8')

    // Split the content into lines
    const lines = fileContent.split('\n')

    // Iterate over each line to find and update key-value pairs
    const updatedLines = lines.map((line) => {
      // Trim the line to remove any leading/trailing whitespace
      const trimmedLine = line.trim()

      // Check if the line contains a key-value pair (e.g., key=value)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
      const [key, _value_] = trimmedLine.split('=') // skipcq: JS-0356

      // If the key exists in the updates object, update the value
      if (Object.prototype.hasOwnProperty.call(updates, key)) {
        // wrap string values with single-quotes
        return isNumeric(updates[key])
          ? `${key}=${updates[key]}`
          : ((typeof updates[key] === 'string')
            ? `${key}='${updates[key]}'`
            : `${key}=${updates[key]}`)
      }

      // Return the original line if no update is needed
      return line
    })

    // Join the updated lines back into a single string
    const updatedContent = updatedLines.join('\n')

    // Write the updated content back to the file
    fse.writeFileSync(filePath, updatedContent, 'utf8')

    console.log('File updated successfully.')
  } catch (error) {
    console.error('Error reading or writing file:', error)
    process.exit(1)
  }
}

/**
 * Checks if the given value is numeric.
 *
 * This function tests whether the provided value is a number or a string that represents a number.
 * It supports both integer and floating-point numbers, including negative values.
 *
 * @param value - The value to be checked. It can be a string or a number.
 * @returns `true` if the value is numeric, otherwise `false`.
 */
function isNumeric(value: unknown): boolean {
  return typeof value === 'number' || (!isNaN(Number(value)) && typeof value === 'string')
}

/**
 * Generates or updates a configuration file based on the presence of an existing `.env` file.
 *
 * If a `.env` file already exists, prompts the user to update the existing values or accept the current ones.
 * If no `.env` file is found, creates a new configuration file and prompts the user to provide the environment variable values.
 *
 * @returns {Promise<void>} A promise that resolves when the configuration process is complete.
 */
export async function generateConfig() {
  if (fse.existsSync('.env')) {
    console.log(colors.yellow('A configuration file already exists, updating - Press Enter to accept the current value(s), otherwise provide new value'))
    await processPrompt()
  } else {
    console.log(colors.yellow('No configuration file found, creating - Provide the environment variables values'))
    generateNewdotEnv()
    await processPrompt()
  }
}
