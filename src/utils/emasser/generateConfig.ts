import path from 'path'
import colors from 'colors' // eslint-disable-line no-restricted-imports
import fse from 'fs-extra'
import dotenv from 'dotenv'
import inquirer from 'inquirer'
import dotenvParseVariables from 'dotenv-parse-variables'
import inquirerFileTreeSelection from 'inquirer-file-tree-selection-prompt'

const PROMPT_MESSAGE = [
  'Provide the eMASS API key (api-key) - valid key is > 30 alpha numeric characters:',
  'Provide the eMASS User unique identifier (user-uid):',
  'Provide the FQDN for the eMASS server:',
  'Provide the eMASS key.pem private encrypting the key in PEM format (file, include the path):',
  'Provide the eMASS cert.pem containing the certificate information in PEM format (file, include the path):',
  'Provide the password for the private encryption key.pem file:',
  'Provide the server communication port number (default is 443):',
  'Server requests a certificate from clients - true or false (default true):',
  'Reject connection not authorized with the list of supplied CAs- true or false (default true):',
  'Set debugging on or off - true or false (default false):',
  'Display null value fields - true or false (default true):',
  'Convert epoch to data/time value - true or false (default false):',
]

const PROMPT_NAMES_REQUIRED = [
  'EMASSER_API_KEY_API_KEY',
  'EMASSER_API_KEY_USER_UID',
  'EMASSER_HOST',
  'EMASSER_KEY_FILE_PATH',
  'EMASSER_CERT_FILE_PATH',
  'EMASSER_KEY_PASSWORD',
]

const PROMPT_NAMES_OPTIONAL = [
  'EMASSER_PORT',
  'EMASSER_REQUEST_CERT',
  'EMASSER_REJECT_UNAUTHORIZED',
  'EMASSER_DEBUGGING',
  'EMASSER_CLI_DISPLAY_NULL',
  'EMASSER_EPOCH_TO_DATETIME',
]

const OTIONAL_DEFAULT_VALUES = [
  443,
  true,
  true,
  false,
  true,
  false,
]

function generateNewdotEnv() {
  // data contains the .env variables without values.
  let data = ''
  PROMPT_NAMES_REQUIRED.forEach(element => {
    data = data + element + '=\n'
  })
  PROMPT_NAMES_OPTIONAL.forEach((element, index) => {
    data = data + element + '=' + OTIONAL_DEFAULT_VALUES[index] + '\n'
  })

  fse.writeFile('.env', data, err => {
    if (err) throw err
  })
}

function processPrompt() {
  const envParse = dotenv.parse(fse.readFileSync('.env'))
  const envConfig = dotenvParseVariables(envParse)

  inquirer.registerPrompt('file-tree-selection', inquirerFileTreeSelection)

  const questions = [
    {
      type: 'input',
      name: PROMPT_NAMES_REQUIRED[0],
      message: PROMPT_MESSAGE[0],
      default() {
        return envConfig.EMASSER_API_KEY_API_KEY
      },
      validate(input: string) {
        if (/([a-zA-Z0-9-]{30,})/g.test(input)) { // skipcq: JS-0113
          return true
        }

        throw new Error('Invalid API key. Must have more than 30 alpha numeric characters, no special keys other than a dash(-)')
      },
    },
    {
      type: 'input',
      name: PROMPT_NAMES_REQUIRED[1],
      message: PROMPT_MESSAGE[1],
      default() {
        return envConfig.EMASSER_API_KEY_USER_UID
      },
    },
    {
      type: 'input',
      name: PROMPT_NAMES_REQUIRED[2],
      message: PROMPT_MESSAGE[2],
      default() {
        return envConfig.EMASSER_HOST
      },
      validate(input: string) {
        // eslint-disable-next-line no-useless-escape
        if (/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/g.test(input)) { // skipcq: JS-0113, JS-0097
          return true
        }

        throw new Error('Invalid eMASS FQDN (URL). Format: [protocol]://[hostname].[...].[domain].')
      },
    },
    {
      type: 'file-tree-selection',
      name: PROMPT_NAMES_REQUIRED[3],
      message: PROMPT_MESSAGE[3],
      filters: 'pem',
      default() {
        return envConfig.EMASSER_KEY_FILE_PATH
      },
      enableGoUpperDirectory: true,
      transformer: (input: any) => {
        const name = input.split(path.sep).pop()
        const fileExtension =  name.split('.').slice(1).pop()
        if (name[0] === '.') {
          return colors.grey(name)
        }

        if (fileExtension === 'pem') {
          return colors.green(name)
        }

        return name
      },
      validate: (input: any) => {
        const name = input.split(path.sep).pop()
        const fileExtension =  name.split('.').slice(1).pop()
        if (fileExtension !== 'pem') {
          return 'Not a .pem file, please select another file'
        }

        return true
      },
    },
    {
      type: 'file-tree-selection',
      name: PROMPT_NAMES_REQUIRED[4],
      message: PROMPT_MESSAGE[4],
      filters: 'pem',
      default() {
        return envConfig.EMASSER_CERT_FILE_PATH
      },
      enableGoUpperDirectory: true,
      transformer: (input: any) => {
        const name = input.split(path.sep).pop()
        const fileExtension =  name.split('.').slice(1).pop()
        if (name[0] === '.') {
          return colors.grey(name)
        }

        if (fileExtension === 'pem') {
          return colors.green(name)
        }

        return name
      },
      validate: (input: any) => {
        const name = input.split(path.sep).pop()
        const fileExtension = name.split('.').slice(1).pop()
        if (fileExtension !== 'pem') {
          return 'Not a .pem file, please select another file'
        }

        return true
      },
    },
    {
      type: 'password',
      name: PROMPT_NAMES_REQUIRED[5],
      message: PROMPT_MESSAGE[5],
      default() {
        return envConfig.EMASSER_KEY_PASSWORD
      },
      validate(value: string) {
        if (/\w/.test(value) && /\d/.test(value)) {
          return true
        }

        throw new Error('Invalid password provided. Password need to have at least a letter and a number')
      },
    },
    {
      type: 'input',
      name: PROMPT_NAMES_OPTIONAL[0],
      message: PROMPT_MESSAGE[6],
      default() {
        return envConfig.EMASSER_PORT
      },
      validate(input: string) {
        if (/(^([1-9][0-9]{0,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$)/g.test(input)) { // skipcq: JS-0113
          return true
        }

        throw new Error('Invalid port provided. Must be a Well-known (0-1023), or Registered (1024-49151), or Private (49152-65535) port number')
      },
    },
    {
      type: 'list',
      name: PROMPT_NAMES_OPTIONAL[1],
      message: PROMPT_MESSAGE[7],
      choices: ['true', 'false'],
      default: true,
      filter(val: string) {
        return (val === 'true')
      },
    },
    {
      type: 'list',
      name: PROMPT_NAMES_OPTIONAL[2],
      message: PROMPT_MESSAGE[8],
      choices: ['true', 'false'],
      default: true,
      filter(val: string) {
        return (val === 'true')
      },
    },
    {
      type: 'list',
      name: PROMPT_NAMES_OPTIONAL[3],
      message: PROMPT_MESSAGE[9],
      choices: ['true', 'false'],
      default: true,
      filter(val: string) {
        return (val === 'true')
      },
    },
    {
      type: 'list',
      name: PROMPT_NAMES_OPTIONAL[4],
      message: PROMPT_MESSAGE[10],
      choices: ['true', 'false'],
      default: true,
      filter(val: string) {
        return (val === 'true')
      },
    },
    {
      type: 'list',
      name: PROMPT_NAMES_OPTIONAL[5],
      message: PROMPT_MESSAGE[11],
      choices: ['true', 'false'],
      default: true,
      filter(val: string) {
        return (val === 'true')
      },
    },
  ]

  inquirer.prompt(questions).then((answers: any) => {
    // Save the content to the .env file
    let data = ''

    for (const prop in answers) {
      if (answers[prop] !== null) {
        // eslint-disable-next-line unicorn/prefer-number-properties
        data = isNaN(answers[prop]) ? data + prop + "='" + answers[prop] + "'\n" : data + prop + '=' + answers[prop] + '\n'
      }
    }

    fse.writeFile('.env', data, err => {
      if (err) throw err
    })
  })
}

export function generateConfig() {
  if (fse.existsSync('.env')) {
    console.log(colors.yellow('A configuration file already exists, updating - Press Enter to accept the current value(s), otherwise provide new value'))
    processPrompt()
  } else {
    console.log(colors.yellow('No configuration file found, creating - Provide the environment variables values'))
    generateNewdotEnv()
    processPrompt()
  }
}
