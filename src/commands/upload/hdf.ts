import fs from 'fs';
import axios from 'axios';
import FormData from 'form-data';
import { Flags } from '@oclif/core';
import { basename } from '../../utils/global';
import { BaseCommand } from '../../utils/oclif/base_command';
import { createWinstonLogger } from '../../utils/logging';

export default class UploadHDF extends BaseCommand<typeof UploadHDF> {
  static readonly usage
    = '<%= command.id %> -i <hdf-scan-results-json>... -H <heimdall-host> -k <api-key> [-n <filename>] [-m <last-modified>] [-g <group-id>]... [-t <tag>]... [-p] [-L info|warn|debug|verbose] [-h]';

  static readonly description
    = 'Upload one or more Heimdall Data Format JSON file(s) to a running Heimdall2 instance';

  static readonly examples = [
    '<%= config.bin %> <%= command.id %> -i hdf_input.json -H https://heimdall.example.com -k <api-key>',
    '<%= config.bin %> <%= command.id %> -i a.json -i b.json -H https://heimdall.example.com -k <api-key> -g <group-id>'
  ];

  static readonly flags = {
    input: Flags.string({
      char: 'i',
      required: true,
      multiple: true,
      description: 'Input HDF JSON file(s)'
    }),
    host: Flags.string({
      char: 'H',
      required: true,
      description: 'Heimdall2 instance URL, e.g. https://heimdall.example.com'
    }),
    apiKey: Flags.string({
      char: 'k',
      required: true,
      description: 'Heimdall2 API key'
    }),
    filename: Flags.string({
      char: 'n',
      required: false,
      description:
        'Custom filename for the evaluation (only honored for single-file uploads)'
    }),
    lastModified: Flags.string({
      char: 'm',
      required: false,
      description:
        'Last modified timestamp (ISO 8601) applied to all uploaded files; defaults to each file\u2019s own mtime'
    }),
    groups: Flags.string({
      char: 'g',
      required: false,
      multiple: true,
      description: 'Group ID(s) to attach the evaluation(s) to'
    }),
    public: Flags.boolean({
      char: 'p',
      required: false,
      default: false,
      description: 'Mark the evaluation(s) as public'
    }),
    tags: Flags.string({
      char: 't',
      required: false,
      multiple: true,
      description: 'Evaluation tag(s)'
    })
  };

  async run() {
    const { flags } = await this.parse(UploadHDF);
    const logger = createWinstonLogger({ module: 'upload:hdf', level: flags.logLevel });

    const formData = new FormData();
    for (const input of flags.input) {
      formData.append('file', fs.createReadStream(input), basename(input));
    }
    if (flags.input.length === 1 && flags.filename) {
      formData.append('filename', flags.filename);
    }
    formData.append('public', String(flags.public));
    formData.append(
      'lastModified',
      flags.lastModified ?? fs.statSync(flags.input[0]).mtime.toISOString()
    );
    for (const group of flags.groups ?? []) {
      formData.append('groups[]', group);
    }
    for (const tag of flags.tags ?? []) {
      formData.append('evaluationTags[]', tag);
    }

    try {
      const response = await axios.post(
        `${flags.host.replace(/\/$/, '')}/evaluations`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            Authorization: `Api-Key ${flags.apiKey}`
          }
        }
      );
      const results = Array.isArray(response.data)
        ? response.data
        : [response.data];
      for (const result of results) {
        logger.info(
          `Uploaded evaluation ${result.id ?? ''} (${result.filename ?? 'unknown filename'})`
        );
      }
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data as { message?: string })?.message ?? error.message
        : String(error);
      logger.error(`Upload failed: ${message}`);
      this.exit(1);
    }
  }
}
