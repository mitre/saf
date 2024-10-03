import {Command, Flags, Interfaces} from '@oclif/core'

export type Flags<T extends typeof Command> = Interfaces.InferredFlags<typeof BaseCommand['baseFlags'] & T['flags']>
export type Args<T extends typeof Command> = Interfaces.InferredArgs<T['args']>

export abstract class InteractiveBaseCommand extends Command {
  static baseFlags = {
    interactive: Flags.boolean({
      aliases: ['interactive', 'ask-me'],
      // Show this flag under a separate GLOBAL section in help.
      helpGroup: 'GLOBAL',
      description: 'Collect input tags interactively - not available for all CLI commands',
      // summary: 'Run command in interactive mode',
    }),
  };
}

export abstract class BaseCommand<T extends typeof Command> extends Command {
  // add the --json flag
  static enableJsonFlag = true

  // define flags that can be inherited by any command that extends BaseCommand
  static baseFlags = {
    ...InteractiveBaseCommand.baseFlags,
    logLevel: Flags.option({
      char: 'L',
      default: 'info',
      helpGroup: 'GLOBAL',
      options: ['info', 'warn', 'debug', 'verbose'] as const,
      description: 'Specify level for logging.',
      // summary: 'Specify log level',
    })(),
  }

  protected flags!: Flags<T>
  protected args!: Args<T>

  public async init(): Promise<void> {
    await super.init()
    const {args, flags} = await this.parse({
      flags: this.ctor.flags,
      baseFlags: (super.ctor as typeof BaseCommand).baseFlags,
      enableJsonFlag: this.ctor.enableJsonFlag,
      args: this.ctor.args,
      strict: this.ctor.strict,
    })
    this.flags = flags as Flags<T>
    this.args = args as Args<T>
  }

  protected async catch(err: Error & {exitCode?: number}): Promise<any> {
    // If error message is for missing flags, display what fields
    // are required, otherwise show the error
    if (err.message.includes('See more help with --help')) {
      this.warn(err.message)
    } else {
      this.error(err)
      //  super.catch(err)
    }
  }

  protected async finally(_: Error | undefined): Promise<any> {
    // called after run and catch regardless of whether or not the command errored
    return super.finally(_)
  }
}
