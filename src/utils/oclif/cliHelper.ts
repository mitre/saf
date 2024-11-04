import fs from 'fs'
import colors from 'colors' // eslint-disable-line no-restricted-imports

const processLogData: Array<string> = []
let logFileName = ''

export function setProcessLogFileName(fileName: string) {
  logFileName = fileName
}

export function getProcessLogData():  Array<string> {
  return processLogData
}

export function addToProcessLogData(str: string) {
  processLogData.push(str)
}

export function saveProcessLogData() {
  if (!logFileName) {
    logFileName = 'CliProcessOutput.log'
  }

  const file = fs.createWriteStream(logFileName)
  file.on('error', () => {
    throw new Error('Error saving the CLI process log data')
  })

  processLogData.forEach(value => file.write(`${value}\n`))
  file.end()
}

// Print Yellow and various combination
export function printYellow(info: string) {
  console.log(colors.yellow(info))
  processLogData.push(`${info}`)
}

export function printBgYellow(info: string) {
  console.log(colors.bgYellow(info))
  processLogData.push(`${info}`)
}

export function printYellowGreen(title: string, info: string) {
  console.log(colors.yellow(title), colors.green(info))
  processLogData.push(`${title} ${info}`)
}

export function printYellowBgGreen(title: string, info: string) {
  console.log(colors.yellow(title), colors.bgGreen(info))
  processLogData.push(`${title} ${info}`)
}

// Print Red and various combination
export function printRed(info: string) {
  console.log(colors.red(info))
  processLogData.push(`${info}`)
}

export function printBoldRedGreen(title: string, info: string) {
  console.log(colors.bold.red(title), colors.green(info))
  processLogData.push(`${title} ${info}`)
}

export function printBgRed(info: string) {
  console.log(colors.bgRed(info))
  processLogData.push(`${info}`)
}

export function printBgRedRed(title: string, info: string) {
  console.log(colors.bgRed(title), colors.red(info))
  processLogData.push(`${title} ${info}`)
}

// Print Magenta and various combination
export function printMagenta(info: string) {
  console.log(colors.magenta(info))
  processLogData.push(`${info}`)
}

export function printBgMagentaRed(title: string, info: string) {
  console.log(colors.bgMagenta(title), colors.red(info))
  processLogData.push(`${title} ${info}`)
}

// Print Cyan
export function printCyan(info: string) {
  console.log(colors.cyan(info))
  processLogData.push(`${info}`)
}

// Print Green
export function printGreen(info: string) {
  console.log(colors.green(info))
  processLogData.push(`${info}`)
}
