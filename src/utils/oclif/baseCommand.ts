/* eslint-disable @typescript-eslint/no-explicit-any */
import type {Interfaces} from '@oclif/core'
import {Command, Flags} from '@oclif/core'

export type CommandFlags<T extends typeof Command> = Interfaces.InferredFlags<typeof BaseCommand['baseFlags'] & T['flags']>
export type CommandArgs<T extends typeof Command> = Interfaces.InferredArgs<T['args']>

export abstract class HelpBaseCommand extends Command {
  static readonly baseFlags = {
    help: Flags.help({
      char: 'h',
      aliases: ['explain', 'tell-me-more'],
      // Show this flag under a separate GLOBAL section in help.
      helpGroup: 'GLOBAL',
      description: 'Show CLI help',
    }),
  }
}
export abstract class InteractiveBaseCommand extends Command {
  static readonly baseFlags = {
    interactive: Flags.boolean({
      aliases: ['interactive', 'ask-me'],
      // Show this flag under a separate GLOBAL section in help.
      helpGroup: 'GLOBAL',
      description: 'Collect input tags interactively \x1B[31m(not available on all CLI commands)\x1B[0m',
    }),
  }
}

export abstract class BaseCommand<T extends typeof Command> extends Command {
  // define flags that can be inherited by any command that extends BaseCommand
  static readonly baseFlags = {
    ...HelpBaseCommand.baseFlags,
    ...InteractiveBaseCommand.baseFlags,
    logLevel: Flags.option({
      char: 'L',
      default: 'info',
      helpGroup: 'GLOBAL',
      options: ['info', 'warn', 'debug', 'verbose'] as const,
      description: 'Specify level for logging \x1B[31m(if implemented by the CLI command)\x1B[0m',
    })(),
  }

  protected flags!: CommandFlags<T>
  protected args!: CommandArgs<T>

  public async init(): Promise<void> {
    await super.init()
    const {args, flags} = await this.parse({
      flags: this.ctor.flags,
      baseFlags: (super.ctor as typeof BaseCommand).baseFlags,
      enableJsonFlag: this.ctor.enableJsonFlag,
      args: this.ctor.args,
      strict: this.ctor.strict,
    })
    this.flags = flags as CommandFlags<T>
    this.args = args as CommandArgs<T>
  }

  protected async catch(err: Error & {exitCode?: number}): Promise<void> { // skipcq: JS-0116
    // If error message is for missing flags, display what fields
    // are required, otherwise show the error
    if (err?.message?.includes('See more help with --help')) {
      this.warn(err.message.replace('--help', `\x1B[93m${process.argv.at(-2)} ${process.argv.at(-1)} -h or --help\x1B[0m`))
    } else {
      this.warn(err)
    }
  }

  protected async finally(_: Error | undefined): Promise<any> { // skipcq: JS-0116
    // called after run and catch regardless of whether or not the command errored
    return super.finally(_)
  }
}
