// utils/dataLoader.ts

import fs from 'fs'
import {ContextualizedEvaluation, convertFileContextual} from 'inspecjs'
import {createWinstonLogger} from '../../utils/logging'

const UTF8_ENCODING = 'utf8'

/**
* The logger for this command.
 * It uses a Winston logger with the label 'view summary:'.
 * @property {ReturnType<typeof createWinstonLogger>} logger - The logger for this command. It uses a Winston logger with the label 'view summary:'.
 */
const logger: ReturnType<typeof createWinstonLogger> = createWinstonLogger('View Summary:')

export function loadExecJSONs(files: string[]): Record<string, ContextualizedEvaluation> {
  logger.verbose('In loadExecJSONs')
  const execJSONs: Record<string, ContextualizedEvaluation> = {}
  files.forEach((file: string) => {
    execJSONs[file] = convertFileContextual(fs.readFileSync(file, UTF8_ENCODING)) as ContextualizedEvaluation
  })
  return execJSONs
}
