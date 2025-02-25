import fse from 'fs-extra'
import fs from 'fs'
import dotenv from 'dotenv'
import _ from 'lodash'
// eslint-disable-next-line no-restricted-imports
import colors from 'colors'
// eslint-disable-next-line node/no-extraneous-import
import {input, confirm, password, select} from '@inquirer/prompts'

const PROMPT_MESSAGE = [
  'Provide the eMASS API key (EMASSER_API_KEY) - valid key is > 30 alpha numeric characters:',
  'Provide the eMASS server FQDN (EMASSER_HOST_URL) :',
  'Provide the eMASS private encrypting file (key.pem) - include the path (EMASSER_KEY_FILE_PATH)):',
  'Provide the eMASS client certificate file (cert.pem) - include the path (EMASSER_CERT_FILE_PATH):',
  'Provide the eMASS CA certificate file (.pem or .crt) - include the path (EMASSER_CA_FILE_PATH):',
  'Provide the password for the private encryption key.pem file (EMASSER_KEY_FILE_PASSWORD):',
  'Provide the eMASS User unique identifier (EMASSER_USER_UID):',
  'Provide the server communication port number (default is 443):',
  'Server requests a certificate from connecting clients - true or false (default true):',
  'Reject clients with invalid certificates - true or false (default true):',
  'Set debugging on (true) or off (false) (default false):',
  'Display null value fields - true or false (default false):',
  'Convert epoch to data/time value - true or false (default true):',
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

function generateNewdotEnv() {
  // data contains the .env variables with optional default values.
  let data = ''
  PROMPT_NAMES_REQUIRED.forEach(element => {
    data += element.startsWith('#') ? element + '\n' : element + "=''\n"
  })

  PROMPT_NAMES_OPTIONAL.forEach((element, index) => {
    data += element.startsWith('#') ? element + '\n' : element + '=' + OPTIONAL_DEFAULT_VALUES[index - 2] + '\n'
  })

  fse.writeFileSync('.env', data)
}

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
  const interactiveValues: {[key: string]: any} = {}

  // Required variables
  const requiredAnswers = {
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
  }

  // eslint-disable-next-line guard-for-in
  for (const tagName in requiredAnswers) {
    const answerValue = _.get(requiredAnswers, tagName)
    if (answerValue !== null) {
      interactiveValues[tagName] = answerValue
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

  // let requiredCerts
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
      filter: file => file.isDirectory() || file.name.endsWith('.pem') || file.name.endsWith('.crt'),
      theme: fileSelectorTheme,
    }),
  }

  // eslint-disable-next-line guard-for-in
  for (const tagName in requiredCerts) {
    const answerValue = _.get(requiredCerts, tagName)
    if (answerValue !== null) {
      interactiveValues[tagName] = answerValue
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

  console.log(`interactiveValues ARE: ${JSON.stringify(interactiveValues, null, 2)}`)
  updateFile('.env', interactiveValues)

  // const answers = {
  //   EMASSER_API_KEY: await input({
  //     message: PROMPT_MESSAGE[0],
  //     default: envConfig.EMASSER_API_KEY,
  //     validate(input: string) {
  //       if (/([a-zA-Z0-9-]{30,})/g.test(input)) { // skipcq: JS-0113
  //         return true
  //       }

  //       throw new Error('Invalid API key. Must have more than 30 alpha numeric characters, no special keys other than a dash(-)')
  //     },
  //   }),
  //   EMASSER_USER_UID: await input({
  //     message: PROMPT_MESSAGE[1],
  //     default: envConfig.EMASSER_USER_UID,
  //   }),
  //   EMASSER_HOST_URL: await input({
  //     message: PROMPT_MESSAGE[2],
  //     default: envConfig.EMASSER_HOST_URL,
  //     validate(input: string) {
  //       // eslint-disable-next-line no-useless-escape
  //       if (/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/g.test(input)) { // skipcq: JS-0113, JS-0097
  //         return true
  //       }

  //       throw new Error('Invalid eMASS FQDN (URL). Format: [protocol]://[hostname].[...].[domain].')
  //     },
  //   }),
  //   EMASSER_KEY_FILE_PATH: await fileSelector({
  //     message: PROMPT_MESSAGE[3],
  //     pageSize: 15,
  //     loop: true,
  //     type: 'file',
  //     allowCancel: true,
  //     cancelText: 'No Key (.pem) file was selected',
  //     emptyText: 'Directory is empty',
  //     showExcluded: false,
  //     filter: file => file.isDirectory() || file.name.endsWith('.pem'),
  //     theme: fileSelectorTheme,
  //   }),
  //   EMASSER_CERT_FILE_PATH: await fileSelector({
  //     message: PROMPT_MESSAGE[4],
  //     pageSize: 15,
  //     loop: true,
  //     type: 'file',
  //     allowCancel: true,
  //     cancelText: 'No Client (.pem) file was selected',
  //     emptyText: 'Directory is empty',
  //     showExcluded: false,
  //     filter: file => file.isDirectory() || file.name.endsWith('.pem'),
  //     theme: fileSelectorTheme,
  //   }),
  //   EMASSER_KEY_FILE_PASSWORD: await password({
  //     message: PROMPT_MESSAGE[5],
  //     mask: true,
  //   }),
  //   EMASSER_PORT: await input({
  //     message: PROMPT_MESSAGE[6],
  //     default: envConfig.EMASSER_PORT,
  //     validate(input: string) {
  //       if (/(^([1-9][0-9]{0,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$)/g.test(input)) { // skipcq: JS-0113
  //         return true
  //       }

  //       throw new Error('Invalid port provided. Must be a Well-known (0-1023), or Registered (1024-49151), or Private (49152-65535) port number')
  //     },
  //   }),
  //   EMASSER_REQUEST_CERT: await select({
  //     message: PROMPT_MESSAGE[7],
  //     default: true,
  //     choices: [
  //       {name: 'true', value: true},
  //       {name: 'false', value: false},
  //     ],
  //   }),
  //   EMASSER_REJECT_UNAUTHORIZED: await select({
  //     message: PROMPT_MESSAGE[8],
  //     default: true,
  //     choices: [
  //       {name: 'true', value: true},
  //       {name: 'false', value: false},
  //     ],
  //   }),
  //   EMASSER_DEBUGGING: await select({
  //     message: PROMPT_MESSAGE[9],
  //     default: false,
  //     choices: [
  //       {name: 'true', value: true},
  //       {name: 'false', value: false},
  //     ],
  //   }),
  //   EMASSER_CLI_DISPLAY_NULL: await select({
  //     message: PROMPT_MESSAGE[10],
  //     default: false,
  //     choices: [
  //       {name: 'true', value: true},
  //       {name: 'false', value: false},
  //     ],
  //   }),
  //   EMASSER_EPOCH_TO_DATETIME: await select({
  //     message: PROMPT_MESSAGE[11],
  //     default: true,
  //     choices: [
  //       {name: 'true', value: true},
  //       {name: 'false', value: false},
  //     ],
  //   }),
  // }

  // // Collect all of the provided answers
  // let data = ''
  // // eslint-disable-next-line guard-for-in
  // for (const tagName in answers) {
  //   const answerValue = _.get(answers, tagName)
  //   if (answerValue !== null) {
  //     // eslint-disable-next-line unicorn/prefer-number-properties
  //     data = isNaN(answerValue) ? data + tagName + "='" + answerValue + "'\n" : data + tagName + '=' + answerValue + '\n'
  //   }
  // }

  // // Write the .env file
  // let envGenerated = true
  // try {
  //   fse.writeFileSync('.env', data)
  // } catch {
  //   envGenerated = false
  // }

  // // Output the content of the new or updated .env configuration file
  // if (envGenerated) {
  //   const table: string[][] = fse.readFileSync('.env', 'utf8').split('\n').map(pair => pair.split('='))
  //   const envData: object = Object.fromEntries(table)

  //   console.log('\n', colors.yellow('An eMASS configuration file with the following environment variables was created:'))

  //   for (const [key, value] of Object.entries(envData)) {
  //     if (key.trim() !== '') {
  //       console.log(`\t${colors.blue(key)}=${colors.green(value)}`)
  //     }
  //   }

  //   console.log('\n', colors.yellow('To modify any of the entries, simple run the configure command again.'))
  //   console.log('\n', colors.cyan.bold('To verify connection to the eMASS services use the command: '), colors.green.underline('saf emasser get test_connection'))
  //   console.log('\n', colors.cyan.bold('For additional help on available eMASS CLI API commands use: '), colors.green.underline('saf emasser -h or -help'))
  // }
}

function updateFile(filePath: any, fieldUpdates: { [x: string]: any }) {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Failed to read file:', err)
      return
    }

    try {
      const jsonData = JSON.parse(data)
      // Update fields
      for (const field in fieldUpdates) {
        if (Object.prototype.hasOwnProperty.call(fieldUpdates, field)) {
          jsonData[field] = fieldUpdates[field]
        }
      }

      fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), err => {
        if (err) {
          console.error('Failed to write file:', err)
        } else {
          console.log('File updated successfully.')
        }
      })
    } catch (parseError) {
      console.error('Failed to parse JSON:', parseError)
    }
  })
}

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
