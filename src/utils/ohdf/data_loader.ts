import fs from 'fs';
import { convertFileContextual, type ContextualizedEvaluation } from 'inspecjs';
import { createWinstonLogger } from '../logging';

/**
* The logger for this command.
 * It uses a Winston logger with the label 'view summary:'.
 * @property {ReturnType<typeof createWinstonLogger>} logger - The logger for this command. It uses a Winston logger with the label 'view summary:'.
 */
const logger: ReturnType<typeof createWinstonLogger> = createWinstonLogger('View Summary:');

export function loadExecJSONs(files: string[]): Record<string, ContextualizedEvaluation> {
  logger.verbose('In loadExecJSONs');
  const execJSONs: Record<string, ContextualizedEvaluation> = {};
  for (const file of files) {
    execJSONs[file] = convertFileContextual(fs.readFileSync(file, 'utf8')) as ContextualizedEvaluation;
  }
  return execJSONs;
}
