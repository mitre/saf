import { Flags } from '@oclif/core';
import { FromHDFToSplunkMapper } from '@mitre/hdf-converters';
import { basename } from '../../utils/global';
import fs from 'fs';
import { createWinstonLogger, getHDFSummary } from '../../utils/logging';
import { BaseCommand } from '../../utils/oclif/baseCommand';

export default class HDF2Splunk extends BaseCommand<typeof HDF2Splunk> {
  static readonly usage
    = '<%= command.id %> -i <hdf-scan-results-json> -H <host> -I <index> [-h] [-P <port>] [-s http|https] [-u <username> | -t <token>] [-p <password>] [-L info|warn|debug|verbose]';

  static readonly description
    = 'Translate and upload a Heimdall Data Format JSON file into a Splunk server';

  static readonly examples = [
    {
      description: '\u001B[93mUser name/password Authentication\u001B[0m',
      command: '<%= config.bin %> <%= command.id %> -i rhel7-results.json -H 127.0.0.1 -u admin -p Valid_password! -I hdf',
    },
    {
      description: '\u001B[93mToken Authentication\u001B[0m',
      command: '<%= config.bin %> <%= command.id %> -i rhel7-results.json -H 127.0.0.1 -t your.splunk.token -I hdf',
    },
  ];

  static readonly flags = {
    input: Flags.string({
      char: 'i',
      required: true,
      description: 'Input HDF file',
    }),
    host: Flags.string({
      char: 'H',
      required: true,
      description: 'Splunk Hostname or IP',
    }),
    port: Flags.integer({
      char: 'P',
      required: false,
      description:
        'Splunk management port (also known as the Universal Forwarder port)',
      default: 8089,
    }),
    scheme: Flags.string({
      char: 's',
      required: false,
      description: 'HTTP Scheme used for communication with splunk',
      default: 'https',
      options: ['http', 'https'],
    }),
    username: Flags.string({
      char: 'u',
      required: false,
      description: 'Your Splunk username',
      exclusive: ['token'],
    }),
    password: Flags.string({
      char: 'p',
      required: false,
      description: 'Your Splunk password',
      exclusive: ['token'],
    }),
    token: Flags.string({
      char: 't',
      required: false,
      description: 'Your Splunk API Token',
      exclusive: ['username', 'password'],
    }),
    index: Flags.string({
      char: 'I',
      required: true,
      description: 'Splunk index to import HDF data into',
    }),
  };

  async run() {
    const { flags } = await this.parse(HDF2Splunk);
    const logger = createWinstonLogger('hdf2splunk', flags.logLevel);

    if (!(flags.username && flags.password) && !flags.token) {
      logger.error(
        'Please provide either a Username and Password or a Splunk token',
      );
      throw new Error(
        'Please provide either a Username and Password or a Splunk token',
      );
    }

    logger.warn(
      'Please ensure the necessary configuration changes for your Splunk server have been configured to prevent data loss. See https://github.com/mitre/saf/wiki/Splunk-Configuration',
    );
    const inputFile = JSON.parse(fs.readFileSync(flags.input, 'utf8'));
    logger.info(
      `Input File "${basename(flags.input)}": ${getHDFSummary(inputFile)}`,
    );
    await new FromHDFToSplunkMapper(inputFile, logger).toSplunk(
      {
        host: flags.host,
        port: flags.port,
        scheme: flags.scheme as 'http' | 'https', // Types as defined by flags
        username: flags.username,
        password: flags.password,
        sessionKey: flags.token,
        index: flags.index,
      },
      basename(flags.input),
    );
  }
}
