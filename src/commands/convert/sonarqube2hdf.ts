import { Flags } from '@oclif/core';
import fs from 'fs';
import { SonarqubeResults as Mapper } from '@mitre/hdf-converters';
import { checkSuffix } from '../../utils/global';
import { BaseCommand } from '../../utils/oclif/baseCommand';

export default class Sonarqube2HDF extends BaseCommand<typeof Sonarqube2HDF> {
  static readonly usage
    = '<%= command.id %> -n <sonar-project-key> -u <http://your.sonar.instance:9000> -a <your-sonar-api-key>'
      + '[ -b <target-branch> | -p <pull-request-id> ] [ -g <organization-name> ] -o <hdf-scan-results-json> [-h] [-w]';

  static readonly description
    = 'Pull SonarQube vulnerabilities for the specified project name and optional branch \n'
      + 'or pull/merge request ID name from an API and convert into a Heimdall Data Format JSON file';

  static readonly examples = ['<%= config.bin %> <%= command.id %> -n sonar_project_key -u http://sonar:9000 --auth abcdefg -p 123 -o scan_results.json -w'];

  static readonly flags = {
    auth: Flags.string({
      char: 'a',
      required: true,
      description: 'SonarQube API Key / User Token - please ensure that the user has permissions for the project (including seeing the code)',
    }),
    projectKey: Flags.string({
      char: 'n',
      required: true,
      description: 'SonarQube Project Key',
    }),
    url: Flags.string({
      char: 'u',
      required: true,
      description: "SonarQube Base URL (excluding '/api')",
    }),
    branch: Flags.string({
      char: 'b',
      required: false,
      exclusive: ['pullRequestID'],
      description: 'Requires Sonarqube Developer Edition or above',
    }),
    pullRequestID: Flags.string({
      char: 'p',
      required: false,
      exclusive: ['branch'],
      description: 'Requires Sonarqube Developer Edition or above',
    }),
    organization: Flags.string({
      char: 'g',
      required: false,
      description: 'SonarQube organization name - used as a default when necessary to access rule descriptions',
    }),
    output: Flags.string({
      char: 'o',
      required: true,
      description: 'Output HDF JSON File',
    }),
    includeRaw: Flags.boolean({
      char: 'w',
      required: false,
      description: 'Include raw input requests in HDF JSON file',
    }),
  };

  async run() {
    const { flags } = await this.parse(Sonarqube2HDF);
    const converter = new Mapper(
      flags.url,
      flags.projectKey,
      flags.auth,
      flags.branch,
      flags.pullRequestID,
      flags.organization,
      flags.includeRaw,
    );
    fs.writeFileSync(
      checkSuffix(flags.output),
      JSON.stringify(await converter.toHdf(), null, 2),
    );
  }
}
