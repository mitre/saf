import { Flags } from '@oclif/core';
import { ExecJSON } from 'inspecjs';
import fs from 'fs';
import { BaseCommand } from '../../../utils/oclif/baseCommand';

export default class WritePassthrough extends BaseCommand<typeof WritePassthrough> {
  static readonly usage = '<%= command.id %> -i <input-hdf-json> (-f <input-passthrough-json> | -d <passthrough-json>) [-o <output-hdf-json>]';

  static readonly summary = 'Overwrite the `passthrough` attribute in a given HDF file with the provided `passthrough` JSON data';

  static readonly description = 'Passthrough data can be any context/structure. See sample ideas at https://github.com/mitre/saf/wiki/Supplement-HDF-files-with-additional-information-(ex.-%60passthrough%60,-%60target%60)';

  static readonly examples = [
    {
      description: '\u001B[93mProviding passthrough-data\u001B[0m',
      command: '<%= config.bin %> <%= command.id %> -i hdf.json -d \'{"a": 5}\'',
    },
    {
      description: '\u001B[93mUsing passthrough-data file\u001B[0m',
      command: '<%= config.bin %> <%= command.id %> -i hdf.json -f passthrough.json -o new-hdf.json',
    },
  ];

  static readonly flags = {
    input: Flags.string({ char: 'i', required: true, description: 'An input Heimdall Data Format file' }),
    passthroughFile: Flags.string({ char: 'f', exclusive: ['passthroughData'], description: 'An input passthrough-data file (can contain any valid JSON); this flag or `passthroughData` must be provided' }),
    passthroughData: Flags.string({ char: 'd', exclusive: ['passthroughFile'], description: 'Input passthrough-data (can be any valid JSON); this flag or `passthroughFile` must be provided' }),
    output: Flags.string({ char: 'o', description: 'An output Heimdall Data Format JSON file (otherwise the input file is overwritten)' }),
  };

  async run() {
    const { flags } = await this.parse(WritePassthrough);

    const input: ExecJSON.Execution & { passthrough?: unknown } = JSON.parse(fs.readFileSync(flags.input, 'utf8'));
    const output: string = flags.output || flags.input;

    let passthrough: unknown;
    if (flags.passthroughFile) {
      try {
        passthrough = JSON.parse(fs.readFileSync(flags.passthroughFile, 'utf8'));
      } catch (error: unknown) {
        throw new Error(
          `Couldn't parse passthrough data: ${
            error instanceof Error ? error.message : JSON.stringify(error)
          }`,
        );
      }
    } else if (flags.passthroughData) {
      try {
        passthrough = JSON.parse(flags.passthroughData);
      } catch {
        passthrough = flags.passthroughData;
      }
    } else {
      throw new Error('One out of passthroughFile or passthroughData must be passed');
    }

    input.passthrough = passthrough;

    fs.writeFileSync(output, JSON.stringify(input, null, 2));
  }
}
