import { Flags } from '@oclif/core';
import fs from 'fs';
import { PrismaMapper as Mapper } from '@mitre/hdf-converters';
import path from 'path';
import _ from 'lodash';
import { basename } from '../../utils/global';
import { BaseCommand } from '../../utils/oclif/baseCommand';

export default class Prisma2HDF extends BaseCommand<typeof Prisma2HDF> {
  static readonly usage
    = '<%= command.id %> -i <prisma-cloud-csv> -o <hdf-output-folder> [-h]';

  static readonly description
    = 'Translate a Prisma Cloud Scan Report CSV file into Heimdall Data Format JSON files';

  static readonly examples = ['<%= config.bin %> <%= command.id %> -i prismacloud-report.csv -o output-hdf-name.json'];

  static readonly flags = {
    input: Flags.string({
      char: 'i',
      required: true,
      description: 'Prisma Cloud Scan Report CSV',
    }),
    output: Flags.string({
      char: 'o',
      required: true,
      description: 'Output HDF JSON File',
    }),
  };

  async run() {
    const { flags } = await this.parse(Prisma2HDF);

    const converter = new Mapper(
      fs.readFileSync(flags.input, { encoding: 'utf8' }),
    );
    const results = converter.toHdf();

    if (!fs.existsSync(flags.output)) {
      fs.mkdirSync(flags.output);
    }

    _.forOwn(results, (result) => {
      fs.writeFileSync(
        path.join(flags.output, basename(`${_.get(result, 'platform.target_id')}.json`)),
        JSON.stringify(result, null, 2),
      );
    });
  }
}
