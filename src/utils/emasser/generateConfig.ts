import path from 'path'
import colors from 'colors' // eslint-disable-line no-restricted-imports
import fse from 'fs-extra'
import dotenv from 'dotenv'
import inquirer from 'inquirer'
import inquirerFileTreeSelection from 'inquirer-file-tree-selection-prompt'

const PROMPT_MESSAGE = [
  'Provide the eMASS API key (EMASSER_API_KEY) - valid key is > 30 alpha numeric characters:',
  'Provide the eMASS User unique identifier (EMASSER_USER_UID):',
  'Provide the eMASS server FQDN (EMASSER_HOST_URL) :',
  'Provide the eMASS private encrypting file (key.pem) - include the path (EMASSER_KEY_FILE_PATH)):',
  'Provide the eMASS client certificate file (cert.pem) - include the path (EMASSER_CERT_FILE_PATH):',
  'Provide the password for the private encryption key.pem file (EMASSER_KEY_FILE_PASSWORD):',
  'Provide the server communication port number (default is 443):',
  'Server requests a certificate from connecting clients - true or false (default true):',
  'Reject clients with invalid certificates - true or false (default true):',
  'Set debugging on (true) or off (false) (default false):',
  'Display null value fields - true or false (default true):',
  'Convert epoch to data/time value - true or false (default false):',
]

const PROMPT_NAMES_REQUIRED = [
  'EMASSER_API_KEY',
  'EMASSER_USER_UID',
  'EMASSER_HOST_URL',
  'EMASSER_KEY_FILE_PATH',
  'EMASSER_CERT_FILE_PATH',
  'EMASSER_KEY_FILE_PASSWORD',
]

const PROMPT_NAMES_OPTIONAL = [
  'EMASSER_PORT',
  'EMASSER_REQUEST_CERT',
  'EMASSER_REJECT_UNAUTHORIZED',
  'EMASSER_DEBUGGING',
  'EMASSER_CLI_DISPLAY_NULL',
  'EMASSER_EPOCH_TO_DATETIME',
]

const OPTIONAL_DEFAULT_VALUES = [
  443,
  true,
  true,
  false,
  true,
  false,
]

function generateNewdotEnv() {
  // data contains the .env variables with optional default values.
  let data = ''
  PROMPT_NAMES_REQUIRED.forEach(element => {
    data = data + element + '=\n'
  })
  PROMPT_NAMES_OPTIONAL.forEach((element, index) => {
    data = data + element + '=' + OPTIONAL_DEFAULT_VALUES[index] + '\n'
  })

  fse.writeFileSync('.env', data)
}

function processPrompt() {
  const envConfig = dotenv.parse(fse.readFileSync('.env'))
  inquirer.registerPrompt('file-tree-selection', inquirerFileTreeSelection)

  const questions = [
    {
      type: 'input',
      name: PROMPT_NAMES_REQUIRED[0],
      message: PROMPT_MESSAGE[0],
      default() {
        return envConfig.EMASSER_API_KEY
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
        return envConfig.EMASSER_USER_UID
      },
    },
    {
      type: 'input',
      name: PROMPT_NAMES_REQUIRED[2],
      message: PROMPT_MESSAGE[2],
      default() {
        return envConfig.EMASSER_HOST_URL
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
      pageSize: 15,
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
      pageSize: 15,
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
        return envConfig.EMASSER_KEY_FILE_PASSWORD
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
    let envGenerated = true
    for (const envVar in answers) {
      if (answers[envVar] !== null) {
        // eslint-disable-next-line unicorn/prefer-number-properties
        data = isNaN(answers[envVar]) ? data + envVar + "='" + answers[envVar] + "'\n" : data + envVar + '=' + answers[envVar] + '\n'
      }
    }

    // Write the .env file
    try {
      fse.writeFileSync('.env', data)
    } catch {
      envGenerated = false
    }

    // Output the content of the new or updated .env configuration file
    if (envGenerated) {
      const table: string[][] = fse.readFileSync('.env', 'utf8').split('\n').map(pair => pair.split('='))
      const envData: object = Object.fromEntries(table)

      console.log('\n', colors.yellow('An eMASS configuration file with the following environment variables was created:'))

      for (const [key, value] of Object.entries(envData)) {
        if (key.trim() !== '') {
          console.log(`\t${colors.blue(key)}=${colors.green(value)}`)
        }
      }

      console.log('\n', colors.yellow('To modify any of the entries, simple run the configure command again.'))
      console.log('\n', colors.cyan.bold('To verify connection to the eMASS services use the command: '), colors.green.underline('saf emasser get test_connection'))
      console.log('\n', colors.cyan.bold('For additional help on available eMASS CLI API commands use: '), colors.green.underline('saf emasser -h or -help'))
    }
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
