import {Command, flags} from '@oclif/command'
import {Input, OutputFlags} from '@oclif/parser'
import _ from 'lodash'
import winston from 'winston'
import {createWinstonLogger} from './logging'

async function read(stream: NodeJS.ReadStream, logger: any) {
  logger.debug('Looking for input by reading from stream')
  const chunks: Uint8Array[] = []
  for await (const chunk of stream) chunks.push(chunk as Uint8Array)
  return Buffer.concat(chunks).toString('utf8')
}

export function omitFlags(flagsToOmit: string[]): typeof BaseCommand.flags {
  return _.omit(flags, flagsToOmit) as unknown as typeof BaseCommand.flags
}

export default abstract class BaseCommand extends Command {
  static flags = {
    help: flags.help({char: 'h'}),
    input: flags.string({char: 'i', required: false, description: 'Input file to be converted'}),
    output: flags.string({char: 'o', required: false}),
    logLevel: flags.string({char: 'L', required: false, default: 'info', options: ['info', 'warn', 'debug', 'verbose']}),
    listAllCommands: flags.boolean({char: 'A', required: false, description: 'List all SAF CLI commands'}),
  }

  // static stdin: string
  static inputFileData: string

  logger!: winston.Logger

  protected parsedFlags?: OutputFlags<typeof BaseCommand.flags>;

  async init(): Promise<void> {
    const {flags} = this.parse(this.constructor as Input<typeof BaseCommand.flags>)
    this.parsedFlags = flags
    this.logger = createWinstonLogger(this.constructor.name, flags.logLevel as unknown as string)

    if (!flags.input) {
      BaseCommand.inputFileData = await read(process.stdin, this.logger)
    }

    if (flags.listAllCommands) {
      this.logger.info(`SAF CLI Commands: ${this.constructor.name}`)
    }
  }
}
