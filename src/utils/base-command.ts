import {Command, flags} from '@oclif/command'
import {Input, OutputFlags} from '@oclif/parser'
import winston from 'winston'
import {createWinstonLogger} from './logging'

export default abstract class BaseCommand extends Command {
  static flags = {
    help: flags.help({char: 'h'}),
    input: flags.string({char: 'i', required: true, description: 'Input file to be converted'}),
    output: flags.string({char: 'o', required: true}),
    logLevel: flags.string({char: 'L', required: false, default: 'info', options: ['info', 'warn', 'debug', 'verbose']}),
  };

  logger!: winston.Logger

  protected parsedFlags?: OutputFlags<typeof BaseCommand.flags>;

  async init(): Promise<void> {
    const {flags} = this.parse(this.constructor as Input<typeof BaseCommand.flags>)
    this.parsedFlags = flags
    this.logger = createWinstonLogger(this.constructor.name, flags.logLevel as unknown as string)
  }
}
