import { Flags } from '@oclif/core';
import fs from 'fs';
import { XMLParser } from 'fast-xml-parser';
import { InSpecMetaData, InspecReadme } from '../../types/inspec';
import path from 'path';
import { createWinstonLogger } from '../../utils/logging';
import { processOVAL, processXCCDF, Profile } from '@mitre/inspec-objects';
import { basename } from '../../utils/global';
import { BaseCommand } from '../../utils/oclif/baseCommand';
import { Logger } from 'winston';
import _ from 'lodash';

export default class InspecProfile extends BaseCommand<typeof InspecProfile> {
  static readonly usage
    = '<%= command.id %> -X <[stig or cis]-xccdf-xml> [--interactive] [-L info|warn|debug|verbose] '
      + '[-m <metadata-json>] [-s] [-T rule|group|cis|version] [-O <oval-xccdf-xml>] [-o <output-folder>]';

  static readonly description
    = 'Generate a new skeleton profile based on a (STIG or CIS) XCCDF benchmark file';

  static readonly examples = [
    {
      description: '\u001B[93mBase Command\u001B[0m',
      command: '<%= config.bin %> <%= command.id %> -X ./U_RHEL_6_STIG_V2R2_Manual-xccdf.xml',
    },
    {
      description: '\u001B[93mSpecifying OVAL and Output location\u001B[0m',
      command: '<%= config.bin %> <%= command.id %> -X ./U_RHEL_9_STIG_V1R2_Manual-xccdf.xml -O ./RHEL_9_Benchmark-oval.xml -o ./output/directory',
    },
  ];

  static readonly aliases = ['generate:xccdf_benchmark2inspec_stub'];

  static readonly flags = {
    xccdfXmlFile: Flags.string({
      char: 'X',
      required: true,
      description: 'Path to the XCCDF benchmark file',
    }),
    metadata: Flags.string({
      char: 'm',
      required: false,
      description: 'Path to a JSON file with additional metadata for the inspec.yml\n'
        + 'The metadata Json is of the following format:\n'
        + '  {"maintainer": string, "copyright": string, "copyright_email": string, "license": string, "version": string}',
    }),
    singleFile: Flags.boolean({
      char: 's',
      required: false,
      default: false,
      description: 'Output the resulting controls to a single file - if false (default) each control is written to a file',
    }),
    idType: Flags.string({
      char: 'T',
      required: false,
      default: 'rule',
      options: ['rule', 'group', 'cis', 'version'],
      description: "Control ID Types: 'rule' - Vulnerability IDs (ex. 'SV-XXXXX'),\n"
        + "'group' - Group IDs (ex. 'V-XXXXX'), 'cis' - CIS Rule IDs (ex. C-1.1.1.1),\n"
        + "'version' - Version IDs (ex. RHEL-07-010020 - also known as STIG IDs)",
    }),
    ovalDefinitions: Flags.string({
      char: 'O',
      required: false,
      description: 'Path to an OVAL definitions file to populate profile elements that reference OVAL definitions',
    }),
    output: Flags.string({
      char: 'o',
      required: false,
      default: 'profile',
      description: 'The output folder to write the generated InSpec content (defaults to profile if unable to translate xccdf title)',
    }),
  };

  async run() {
    const { flags } = await this.parse(InspecProfile);

    const logger = createWinstonLogger('generate:inspect_profile', flags.logLevel);

    // Process the XCCDF XML file containing the profile guidance
    let xccdf: any = {};
    try {
      if (fs.lstatSync(flags.xccdfXmlFile).isFile()) {
        const xccdfXmlFile = flags.xccdfXmlFile;
        xccdf = fs.readFileSync(xccdfXmlFile, 'utf8');
        const inputFirstLine = xccdf.split('\n').slice(0, 10).join('').toLowerCase();
        if (!inputFirstLine.includes('xccdf')) {
          logger.error(`ERROR: The file ${xccdfXmlFile} is not a valid XCCDF file`);
          throw new Error('File provided is not a valid or well-formed XCCDF file');
        }

        logger.debug(`Loaded ${xccdfXmlFile} as XCCDF`);
      } else {
        throw new Error('No benchmark (XCCDF) file was provided.');
      }
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        logger.error(`ERROR: File not found: "${flags.xccdfXmlFile}". Run the --help command to more information on expected input file.`);
        process.exit(1);
      } else {
        logger.error(`ERROR: Unable to process the XCCDF XML file "${flags.xccdfXmlFile}" because: ${error}`);
        process.exit(1);
      }
    }

    // Generate the output folder based on the XCCDF Benchmark.title
    // if the default name is provided (profile) by the output -o flag
    const options = {
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
    };
    const xmlDoc = new XMLParser(options).parse(xccdf);
    let outDir = '';
    const isSTIG = (_.get(xmlDoc, 'xccdf:Benchmark.xccdf:title.#text') === undefined);
    logger.info(`Processing Benchmark Type: ${(isSTIG) ? 'STIG' : 'CIS'}`);
    if (flags.output === 'profile') {
      const benchmarkTitle = isSTIG ? _.get(xmlDoc, 'Benchmark.title') : _.get(xmlDoc, 'xccdf:Benchmark.xccdf:title.#text');
      outDir = (benchmarkTitle === undefined)
        ? flags.output
        : basename(benchmarkTitle.replace('Security Technical Implementation Guide', 'stig-baseline').replaceAll(' ', '-').toLowerCase());
    } else {
      outDir = flags.output;
    }

    // Check if the output folder already exists
    logger.info('Processing output directory...');
    if (fs.existsSync(outDir)) {
      // Folder should not exist already
      logger.error(`ERROR: Profile output folder ${outDir} already exists, please specify a new folder`);
      process.exit(1);
    } else {
      logger.debug('Creating output folder with controls and libraries directories');
      fs.mkdirSync(outDir);
      fs.mkdirSync(path.join(outDir, 'controls'));
      fs.mkdirSync(path.join(outDir, 'libraries'));
    }

    // This will get overridden if a metadata file is passed
    logger.info('Processing metadata file...');
    let metadata: InSpecMetaData = {};
    // Read metadata file if passed
    if (flags.metadata) {
      if (fs.existsSync(flags.metadata)) {
        logger.debug(`Reading metadata file: ${flags.metadata}.`);
        metadata = JSON.parse(fs.readFileSync(flags.metadata, 'utf8'));
      } else {
        logger.error(`ERROR: File not found: "${flags.metadata}". Run the --help command to more information on expected input file.`);
        process.exit(1);
      }
    }

    // Read OVAL definitions file if passed
    logger.info('Processing Oval file...');
    let ovalDefinitions;
    if (flags.ovalDefinitions) {
      if (fs.existsSync(flags.ovalDefinitions)) {
        logger.debug(`Reading oval definitions file: ${flags.ovalDefinitions}.`);
        ovalDefinitions = processOVAL(fs.readFileSync(flags.ovalDefinitions, 'utf8'));
      } else {
        logger.error(`ERROR: File not found: "${flags.ovalDefinitions}". Run the --help command to more information on expected input file.`);
        process.exit(1);
      }
    }

    // Process the XCCDF file
    logger.info('Processing XCCDF file...');
    let profile: Profile;
    logger.debug(`Processing XCCDF Benchmark file using ${flags.idType} id.`);
    const idTypes = ['rule', 'group', 'cis', 'version'];
    if (idTypes.includes(flags.idType)) {
      profile = processXCCDF(xccdf, false, flags.idType as 'cis' | 'version' | 'rule' | 'group', ovalDefinitions);
    } else {
      logger.error(`Invalid ID Type: ${flags.idType}. Check the --help command for the available ID Type options.`);
      process.exit(1);
    }

    // Set profile default values (values used to generate the inspect.yml file)
    logger.info('Generating markdown and yaml files...');
    const readmeObj = (isSTIG)
      ? getDISAReadmeContent(xmlDoc)
      : getCISReadmeContent(xmlDoc);

    // Set default values for the inspec.yml file
    profile.name = readmeObj.profileName;
    profile.title = readmeObj.profileTitle; // readmeObj.inspecTitle (includes ver/release info)
    profile.maintainer = 'MITRE SAF Team';
    profile.copyright = 'MITRE';
    profile.copyright_email = 'saf@groups.mitre.org';
    profile.license = 'Apache-2.0';
    profile.summary = `InSpec profile aligned to ${readmeObj.profileGuidance} for ${readmeObj.profileTitle}`;
    profile.description = null;
    profile.depends = [];
    profile.supports = [];
    profile.version = readmeObj.profileVersion;
    profile.inspec_version = '~>6.0';

    // Add metadata if provided
    if (flags.metadata) {
      profile.maintainer = metadata.maintainer;
      profile.copyright = metadata.copyright;
      profile.copyright_email = metadata.copyright_email;
      profile.license = metadata.license;
      profile.version = metadata.version || readmeObj.profileVersion;
    }

    // Generate files
    generateYaml(profile, outDir, logger);
    generateReadme(readmeObj, outDir, logger);
    generateLicense(outDir, logger);
    generateNotice(outDir, logger);
    generateRubocopYml(outDir, logger);
    generateGemRc(outDir, logger);
    generateGemFile(outDir, logger);
    generateRakeFile(outDir, logger);
    generateGitIgnoreFile(outDir, logger);
    logger.debug(`Saved generated files to output directory: ${outDir}`);

    // Write all controls
    logger.info('Generating profile controls...');
    if (flags.singleFile) {
      const controls = profile.controls
        .map(control => control.toRuby())
        .join('\n\n');
      logger.debug(`Writing control to: ${path.join(outDir, 'controls', 'controls.rb')}`);
      fs.writeFileSync(
        path.join(outDir, 'controls', 'controls.rb'),
        controls,
      );
    } else {
      for (const control of profile.controls) {
        const controlId = basename(control.id); // Ensure valid filename
        logger.debug(`Writing control to: ${path.join(outDir, 'controls', controlId + '.rb')}`);
        fs.writeFileSync(
          path.join(outDir, 'controls', controlId + '.rb'),
          control.toRuby(),
        );
      }
    }

    logger.info('Generation of skeleton profile completed - All done now');
  }
}

function getDISAReadmeContent(_xmlDoc: any): InspecReadme {
  const readmeObj: InspecReadme = {
    profileName: '',
    profileTitle: '',
    profileVersion: '',
    benchmarkVersion: '',
    benchmarkDate: '',
    profileShortName: '',
    profileType: 'STIG',
    profileGuidance: 'STIG Guidance',
    profileGuidanceAgency: 'Defense Information Systems Agency (DISA)',
    profileDeveloperPartner: ' in partnership between the DISA Services Directorate (SD) and the DISA Risk Management Executive (RME) office',
    profileCompliance: '[Department of Defense (DoD) STIG](https://public.cyber.mil/stigs/)',
    profileDevelopers: 'DISA RME and DISA SD Office, along with their vendor partners, create and maintain a set of Security Technical Implementation Guides',
    inspecTitle: '',
  };

  const benchmarkTitle = _.get(_xmlDoc, 'Benchmark.title');
  const stigVersion = _.get(_xmlDoc, 'Benchmark.version');
  const plainTextObj = _xmlDoc.Benchmark['plain-text'];

  // releaseInfoObj is in the form of:
  // {"#text":"Release: 1 Benchmark Date: 24 Jul 2024","@_id":"release-info"}
  const releaseInfoObj = Array.isArray(plainTextObj)
    ? _.find(plainTextObj, { '@_id': 'release-info' })
    : plainTextObj;

  // stigRelDate is in the form of: ["Release"," 1 Benchmark Date"," 24 Jul 2024"]
  const stigRelDate = releaseInfoObj['#text'].split(':');
  const stigRelease = stigRelDate[1].trim().split(' ')[0];
  const stigDisplayVersion = `Version ${stigVersion} Release ${stigRelease} (V${stigVersion}R${stigRelease})`;
  const stigDate = stigRelDate[2];

  readmeObj.profileName = benchmarkTitle.replace(
    'Security Technical Implementation Guide', 'stig-baseline')
    .replaceAll(' ', '-').toLowerCase();
  readmeObj.profileShortName = benchmarkTitle.replace('Security Technical Implementation Guide', '').trim();
  readmeObj.profileTitle = benchmarkTitle;
  readmeObj.profileVersion = `${stigVersion}.${stigRelease}.0`;
  readmeObj.inspecTitle = `${benchmarkTitle} :: Version ${stigVersion}, Release ${stigRelease} Benchmark Date: ${stigDate}`;
  readmeObj.benchmarkDate = stigDate;
  readmeObj.benchmarkVersion = stigDisplayVersion;

  return readmeObj;
}

function getCISReadmeContent(_xmlDoc: any): InspecReadme {
  const readmeObj: InspecReadme = {
    profileName: '',
    profileTitle: '',
    profileVersion: '',
    benchmarkVersion: '',
    benchmarkDate: '',
    profileShortName: '',
    profileType: 'CIS',
    profileGuidance: 'CIS Guidance',
    profileGuidanceAgency: 'Center for Internet Security (CIS)',
    profileDeveloperPartner: '',
    profileCompliance: '[Center for Internet Security (CIS) Benchmark](https://www.cisecurity.org/cis-benchmarks)',
    profileDevelopers: 'Center for Internet Security, Inc. (CIS®) create and maintain a set of Critical Security Controls (CIS Controls)',
    inspecTitle: '',
  };

  const benchmarkTitle = _.get(_xmlDoc, 'xccdf:Benchmark.xccdf:title.#text');
  const cisVersion = _.get(_xmlDoc, 'xccdf:Benchmark.xccdf:version');
  const cisDate = _.get(_xmlDoc, 'xccdf:Benchmark.xccdf:status.@_date');

  readmeObj.profileName = benchmarkTitle.replaceAll(' ', '-').toLowerCase();
  readmeObj.profileShortName = benchmarkTitle.replace('Benchmark', '').trim();
  readmeObj.profileTitle = benchmarkTitle;
  readmeObj.profileVersion = cisVersion;
  readmeObj.inspecTitle = `${benchmarkTitle} :: Version ${cisVersion} Benchmark Date: ${cisDate}`;
  readmeObj.benchmarkDate = cisDate;
  readmeObj.benchmarkVersion = cisVersion;

  return readmeObj;
}

function generateReadme(contentObj: InspecReadme, outDir: string, logger: Logger) {
  const readmeContent
    = `# ${contentObj.profileTitle}
This InSpec Profile was created to facilitate testing and auditing of \`${contentObj.profileShortName}\`
infrastructure and applications when validating compliancy with ${contentObj.profileCompliance}
requirements.

- Profile Version: **${contentObj.profileVersion.trim()}**
- Benchmark Date: **${contentObj.benchmarkDate.trim()}**
- Benchmark Version: **${contentObj.benchmarkVersion.trim()}**


This profile was developed to reduce the time it takes to perform a security checks based upon the
${contentObj.profileGuidance} from the ${contentObj.profileGuidanceAgency}${contentObj.profileDeveloperPartner}.

The results of a profile run will provide information needed to support an Authority to Operate (ATO)
decision for the applicable technology.

The ${contentObj.profileShortName} ${contentObj.profileType} Profile uses the [InSpec](https://github.com/inspec/inspec)
open-source compliance validation language to support automation of the required compliance, security
and policy testing for Assessment and Authorization (A&A) and Authority to Operate (ATO) decisions
and Continuous Authority to Operate (cATO) processes.

Table of Contents
=================
* [${contentObj.profileType} Benchmark  Information](#benchmark-information)
* [Getting Started](#getting-started)
    * [Intended Usage](#intended-usage)
    * [Tailoring to Your Environment](#tailoring-to-your-environment)
    * [Testing the Profile Controls](#testing-the-profile-controls)
* [Running the Profile](#running-the-profile)
    * [Directly from Github](#directly-from-github)
    * [Using a local Archive copy](#using-a-local-archive-copy)
    * [Different Run Options](#different-run-options)
* [Using Heimdall for Viewing Test Results](#using-heimdall-for-viewing-test-results)

## Benchmark Information
The ${contentObj.profileDevelopers} for applications, computer systems and networks
connected to the Department of Defense (DoD). These guidelines are the primary security standards
used by the DoD agencies. In addition to defining security guidelines, the ${contentObj.profileType}s also stipulate
how security training should proceed and when security checks should occur. Organizations must
stay compliant with these guidelines or they risk having their access to the DoD terminated.

Requirements associated with the ${contentObj.profileShortName} ${contentObj.profileType} are derived from the
[Security Requirements Guides](https://csrc.nist.gov/glossary/term/security_requirements_guide)
and align to the [National Institute of Standards and Technology](https://www.nist.gov/) (NIST)
[Special Publication (SP) 800-53](https://csrc.nist.gov/Projects/risk-management/sp800-53-controls/release-search#!/800-53)
Security Controls, [DoD Control Correlation Identifier](https://public.cyber.mil/stigs/cci/) and related standards.

The ${contentObj.profileShortName} ${contentObj.profileType} profile checks were developed to provide technical implementation
validation to the defined DoD requirements, the guidance can provide insight for any organizations wishing
to enhance their security posture and can be tailored easily for use in your organization.

[top](#table-of-contents)
## Getting Started
### InSpec (CINC-auditor) setup
For maximum flexibility/accessibility \`cinc-auditor\`, the open-source packaged binary version of Chef InSpec should be used,
compiled by the CINC (CINC Is Not Chef) project in coordination with Chef using Chef's always-open-source InSpec source code.
For more information see [CINC Home](https://cinc.sh/)

It is intended and recommended that CINC-auditor and this profile executed from a __"runner"__ host
(such as a DevOps orchestration server, an administrative management system, or a developer's workstation/laptop)
against the target. This can be any Unix/Linux/MacOS or Windows runner host, with access to the Internet.

> [!TIP]
> **For the best security of the runner, always install on the runner the latest version of CINC-auditor and any other supporting language components.**

To install CINC-auditor on a UNIX/Linux/MacOS platform use the following command:
\`\`\`bash
curl -L https://omnitruck.cinc.sh/install.sh | sudo bash -s -- -P cinc-auditor
\`\`\`

To install CINC-auditor on a Windows platform (Powershell) use the following command:
\`\`\`powershell
. { iwr -useb https://omnitruck.cinc.sh/install.ps1 } | iex; install -project cinc-auditor
\`\`\`

To confirm successful install of cinc-auditor:
\`\`\`
cinc-auditor -v
\`\`\`

Latest versions and other installation options are available at [CINC Auditor](https://cinc.sh/start/auditor/) site.

[top](#table-of-contents)
### Intended Usage
1. The latest \`released\` version of the profile is intended for use in A&A testing, as well as
    providing formal results to Authorizing Officials and Identity and Access Management (IAM)s.
    Please use the \`released\` versions of the profile in these types of workflows.

2. The \`main\` branch is a development branch that will become the next release of the profile.
    The \`main\` branch is intended for use in _developing and testing_ merge requests for the next
    release of the profile, and _is not intended_ be used for formal and ongoing testing on systems.

[top](#table-of-contents)
### Tailoring to Your Environment
This profile uses InSpec Inputs to provide flexibility during testing. Inputs allow for
customizing the behavior of Chef InSpec profiles.

InSpec Inputs are defined in the \`inspec.yml\` file. The \`inputs\` configured in this
file are **profile definitions and defaults for the profile** extracted from the profile
guidances and contain metadata that describe the profile, and shouldn't be modified.

InSpec provides several methods for customizing profile behaviors at run-time that does not require
modifying the \`inspec.yml\` file itself (see [Using Customized Inputs](#using-customized-inputs)).

The following inputs are permitted to be configured in an inputs \`.yml\` file (often named inputs.yml)
for the profile to run correctly on a specific environment, while still complying with the security
guidance document intent. This is important to prevent confusion when test results are passed downstream
to different stakeholders under the *security guidance name used by this profile repository*

For changes beyond the inputs cited in this section, users can create an *organizationally-named overlay repository*.
For more information on developing overlays, reference the [MITRE SAF Training](https://mitre-saf-training.netlify.app/courses/beginner/10.html)

#### Example of tailoring Inputs *While Still Complying* with the security guidance document for the profile:

\`\`\`yaml
  # This file specifies the attributes for the configurable controls
  # used by the ${contentObj.profileShortName} ${contentObj.profileType} profile.

  # Disable controls that are known to consistently have long run times
  disable_slow_controls: [true or false]

  # A unique list of administrative users
  admins_list: [admin1, admin2, admin3]

  # List of configuration files for the specific system
  logging_conf_files: [
    <dir-path-1>/*.conf
    <dir-path-2>/*.conf
  ]

  ...
\`\`\`

> [!NOTE]
>Inputs are variables that are referenced by control(s) in the profile that implement them.
 They are declared (defined) and given a default value in the \`inspec.yml\` file.

#### Using Customized Inputs
Customized inputs may be used at the CLI by providing an input file or a flag at execution time.

1. Using the \`--input\` flag

    Example: \`[inspec or cinc-auditor] exec <my-profile.tar.gz> --input disable_slow_controls=true\`

2. Using the \`--input-file\` flag.

    Example: \`[inspec or cinc-auditor] exec <my-profile.tar.gz> --input-file=<my_inputs_file.yml>\`

>[!TIP]
> For additional information about \`input\` file examples reference the [MITRE SAF Training](https://mitre.github.io/saf-training/courses/beginner/06.html#input-file-example)

Chef InSpec Resources:
- [InSpec Profile Documentation](https://docs.chef.io/inspec/profiles/).
- [InSpec Inputs](https://docs.chef.io/inspec/profiles/inputs/).
- [inspec.yml](https://docs.chef.io/inspec/profiles/inspec_yml/).


[top](#table-of-contents)
### Testing the Profile Controls
The Gemfile provided contains all the necessary ruby dependencies for checking the profile controls.
#### Requirements
All action are conducted using \`ruby\` (gemstone/programming language). Currently \`inspec\`
commands have been tested with ruby version 3.1.2. A higher version of ruby is not guaranteed to
provide the expected results. Any modern distribution of Ruby comes with Bundler preinstalled by default.

Install ruby based on the OS being used, see [Installing Ruby](https://www.ruby-lang.org/en/documentation/installation/)

After installing \`ruby\` install the necessary dependencies by invoking the bundler command
(must be in the same directory where the Gemfile is located):
\`\`\`bash
bundle install
\`\`\`

#### Testing Commands

Linting and validating controls:
\`\`\`bash
  bundle exec rake [inspec or cinc-auditor]:check # Validate the InSpec Profile
  bundle exec rake lint                           # Run RuboCop Linter
  bundle exec rake lint:auto_correct              # Autocorrect RuboCop offenses (only when it's safe)
  bundle exec rake pre_commit_checks              # Pre-commit checks
\`\`\`

Ensure the controls are ready to be committed into the repo:
\`\`\`bash
  bundle exec rake pre_commit_checks
\`\`\`


[top](#table-of-contents)
## Running the Profile
### Directly from Github
This option is best used when network connectivity is available and policies permit
access to the hosting repository.

\`\`\`bash
# Using \`ssh\` transport
bundle exec [inspec or cinc-auditor] exec https://github.com/mitre/${contentObj.profileName}/archive/main.tar.gz --input-file=<your_inputs_file.yml> -t ssh://<hostname>:<port> --sudo --reporter=cli json:<your_results_file.json>

# Using \`winrm\` transport
bundle exec [inspec or cinc-auditor] exec https://github.com/mitre/${contentObj.profileName}/archive/master.tar.gz --target winrm://<hostip> --user '<admin-account>' --password=<password> --input-file=<path_to_your_inputs_file/name_of_your_inputs_file.yml> --reporter=cli json:<path_to_your_output_file/name_of_your_output_file.json>
\`\`\`

[top](#table-of-contents)
### Using a local Archive copy
If your runner is not always expected to have direct access to the profile's hosted location,
use the following steps to create an archive bundle of this overlay and all of its dependent tests:

Git is required to clone the InSpec profile using the instructions below.
Git can be downloaded from the [Git Web Site](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git).

When the **"runner"** host uses this profile overlay for the first time, follow these steps:

\`\`\`bash
mkdir profiles
cd profiles
git clone https://github.com/mitre/${contentObj.profileName}.git
bundle exec [inspec or cinc-auditor] archive ${contentObj.profileName}

# Using \`ssh\` transport
bundle exec [inspec or cinc-auditor] exec <name of generated archive> --input-file=<your_inputs_file.yml> -t ssh://<hostname>:<port> --sudo --reporter=cli json:<your_results_file.json>

# Using \`winrm\` transport
bundle exec [inspec or cinc-auditor] exec <name of generated archive> --target winrm://<hostip> --user '<admin-account>' --password=<password> --input-file=<path_to_your_inputs_file/name_of_your_inputs_file.yml> --reporter=cli json:<path_to_your_output_file/name_of_your_output_file.json>
\`\`\`

For every successive run, follow these steps to always have the latest version of this profile baseline:

\`\`\`bash
cd ${contentObj.profileName}
git pull
cd ..
bundle exec [inspec or cinc-auditor] archive ${contentObj.profileName} --overwrite

# Using \`ssh\` transport
bundle exec [inspec or cinc-auditor] exec <name of generated archive> --input-file=<your_inputs_file.yml> -t ssh://<hostname>:<port> --sudo --reporter=cli json:<your_results_file.json>

# Using \`winrm\` transport
bundle exec [inspec or cinc-auditor] exec <name of generated archive> --target winrm://<hostip> --user '<admin-account>' --password=<password> --input-file=<path_to_your_inputs_file/name_of_your_inputs_file.yml> --reporter=cli json:<path_to_your_output_file/name_of_your_output_file.json>
\`\`\`

[top](#table-of-contents)
## Different Run Options

[Full exec options](https://docs.chef.io/inspec/cli/#options-3)

[top](#table-of-contents)
## Using Heimdall for Viewing Test Results
The JSON results output file can be loaded into **[Heimdall-Lite](https://heimdall-lite.mitre.org/)**
or **[Heimdall-Server](https://github.com/mitre/heimdall2)** for a user-interactive, graphical view of the profile scan results.

Heimdall-Lite is a \`browser only\` viewer that allows you to easily view your results directly and locally rendered in your browser.
Heimdall-Server is configured with a \`data-services backend\` allowing for data persistency to a database (PostgreSQL).
For more detail on feature capabilities see [Heimdall Features](https://github.com/mitre/heimdall2?tab=readme-ov-file#features)

Heimdall can **_export your results into a DISA Checklist (CKL) file_** for easily uploading into eMass using the \`Heimdall Export\` function.

Depending on your environment restrictions, the [SAF CLI](https://saf-cli.mitre.org) can be used to run a local docker instance
of Heimdall-Lite via the \`saf view:heimdall\` command.

Additionally both Heimdall applications can be deployed via docker, kubernetes, or the installation packages.

[top](#table-of-contents)
## Authors
${contentObj.profileType === 'CIS'
    ? '[Center for Internet Security (CIS)](https://www.cisecurity.org/)'
    : '[Defense Information Systems Agency (DISA)](https://www.disa.mil/)\n\n'
      + '[STIG support by DISA Risk Management Team and Cyber Exchange](https://public.cyber.mil/)'
}

[MITRE Security Automation Framework Team](https://saf.mitre.org)

## NOTICE

© 2018-${new Date().getFullYear()} The MITRE Corporation.

Approved for Public Release; Distribution Unlimited. Case Number 18-3678.

## NOTICE

MITRE hereby grants express written permission to use, reproduce, distribute, modify, and otherwise leverage this software to the extent permitted by the licensed terms provided in the LICENSE.md file included with this project.

## NOTICE

This software was produced for the U. S. Government under Contract Number HHSM-500-2012-00008I, and is subject to Federal Acquisition Regulation Clause 52.227-14, Rights in Data-General.

No other use other than that granted to the U. S. Government, or to those acting on behalf of the U. S. Government under that Clause is authorized without the express written permission of The MITRE Corporation.

For further information, please contact The MITRE Corporation, Contracts Management Office, 7515 Colshire Drive, McLean, VA  22102-7539, (703) 983-6000.

## NOTICE
${contentObj.profileType === 'CIS'
    ? '[CIS Benchmarks are published by Center for Internet Security](https://www.cisecurity.org/cis-benchmarks)'
    : '[DISA STIGs are published by DISA IASE](https://public.cyber.mil/stigs/)'
}
`;
  fs.writeFile(path.join(outDir, 'README.md'), readmeContent, (err) => {
    if (err) {
      logger.error(`Error saving the README.md file to: ${outDir}. Cause: ${err}`);
    } else {
      logger.debug('README.md generated successfully!');
    }
  });
}

function generateYaml(profile: Profile, outDir: string, logger: Logger) {
  const inspecYmlContent = profile.createInspecYaml()
    + `

### INPUTS ###
# Inputs are variables that can be referenced by any control in the profile,
# and are defined and given a default value in this file.

# By default, each parameter is set to exactly comply with the profile baseline
# wherever possible. Some profile controls will require a unique value reflecting
# the necessary context for the supporting system.

# Values provided here can be overridden using an input file or a CLI flag at
# execution time. See InSpec's Inputs docs at https://docs.chef.io/inspec/profiles/inputs/
# for details.

# NOTE: DO NOT directly change the default values by editing this file. Use
# overrides instead.
###

inputs:
`;

  fs.writeFile(path.join(outDir, 'inspec.yml'), inspecYmlContent, (err) => {
    if (err) {
      logger.error(`Error saving the inspec.yml file to: ${outDir}. Cause: ${err}`);
    } else {
      logger.debug('inspec.yml generated successfully!');
    }
  });
}

function generateLicense(outDir: string, logger: Logger) {
  const licensesContent
    = `Licensed under the apache-2.0 license, except as noted below.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright/ digital rights legend,
  this list of conditions and the following Notice.
* Redistributions in binary form must reproduce the above copyright copyright/ digital
  rights legend, this list of conditions and the following Notice in the documentation
  and/or other materials provided with the distribution.
* Neither the name of The MITRE Corporation nor the names of its contributors may be
  used to endorse or promote products derived from this software without specific prior
  written permission.
`;
  fs.writeFile(path.join(outDir, 'LICENSE.md'), licensesContent, (err) => {
    if (err) {
      logger.error(`Error saving the LICENSE file to: ${outDir}. Cause: ${err}`);
    } else {
      logger.debug('LICENSE generated successfully!');
    }
  });
}

function generateNotice(outDir: string, logger: Logger) {
  const noticeContent
    = `MITRE grants permission to reproduce, distribute, modify, and otherwise use this
software to the extent permitted by the licensed terms provided in the LICENSE.md
file included with this project.

This software was produced by The MITRE Corporation for the U. S. Government under
contract. As such the U.S. Government has certain use and data rights in this software.
No use other than those granted to the U. S. Government, or to those acting on behalf
of the U. S. Government, under these contract arrangements is authorized without the
express written permission of The MITRE Corporation.

For further information, please contact The MITRE Corporation, Contracts Management
Office, 7515 Colshire Drive, McLean, VA 22102-7539, (703) 983-6000.
`;
  fs.writeFile(path.join(outDir, 'NOTICE.md'), noticeContent, (err) => {
    if (err) {
      logger.error(`Error saving the NOTICE.md file to: ${outDir}. Cause: ${err}`);
    } else {
      logger.debug('NOTICE.md generated successfully!');
    }
  });
}

function generateRubocopYml(outDir: string, logger: Logger) {
  const robocopContent
    = `AllCops:
  NewCops: enable
  Exclude:
  - "libraries/**/*"

Layout/LineLength:
  Max: 1500
  AllowURI: true
  IgnoreCopDirectives: true

Naming/FileName:
  Enabled: false

Metrics/BlockLength:
  Max: 1000

Layout/MultilineBlockLayout:
  Enabled: true

Lint/ConstantDefinitionInBlock:
  Enabled: false

# Required for Profiles as it can introduce profile errors
Style/NumericPredicate:
  Enabled: false

Style/WordArray:
  Description: "Use %w or %W for an array of words. (https://rubystyle.guide#percent-w)"
  Enabled: false

Style/RedundantPercentQ:
  Enabled: true

Style/NestedParenthesizedCalls:
  Enabled: false

Style/TrailingCommaInHashLiteral:
  Description: "https://docs.rubocop.org/rubocop/cops_style.html#styletrailingcommainhashliteral"
  Enabled: true
  EnforcedStyleForMultiline: no_comma

Style/TrailingCommaInArrayLiteral:
  Enabled: true
  EnforcedStyleForMultiline: no_comma

Style/BlockDelimiters:
  Enabled: false

Lint/AmbiguousBlockAssociation:
  Enabled: false

Metrics/BlockNesting:
  Enabled: false

Lint/ShadowingOuterLocalVariable:
  Enabled: false

Style/FormatStringToken:
  Enabled: false

Style/FrozenStringLiteralComment:
  Enabled: false

# The following cops were added to RuboCop, but are not configured.
# Please set Enabled to either \`true\` or \`false\` in your \`.rubocop.yml\` file.
# For more information: https://docs.rubocop.org/rubocop/versioning.html
Gemspec/DateAssignment: # new in 1.10
  Enabled: true
Gemspec/RequireMFA: # new in 1.23
  Enabled: true
Layout/LineEndStringConcatenationIndentation: # new in 1.18
  Enabled: true
Layout/SpaceBeforeBrackets: # new in 1.7
  Enabled: true
Lint/AmbiguousAssignment: # new in 1.7
  Enabled: true
Lint/AmbiguousOperatorPrecedence: # new in 1.21
  Enabled: true
Lint/AmbiguousRange: # new in 1.19
  Enabled: true
Lint/DeprecatedConstants: # new in 1.8
  Enabled: true
Lint/DuplicateBranch: # new in 1.3
  Enabled: true
Lint/DuplicateRegexpCharacterClassElement: # new in 1.1
  Enabled: true
Lint/EmptyBlock: # new in 1.1
  Enabled: true
Lint/EmptyClass: # new in 1.3
  Enabled: true
Lint/EmptyInPattern: # new in 1.16
  Enabled: true
Lint/IncompatibleIoSelectWithFiberScheduler: # new in 1.21
  Enabled: true
Lint/LambdaWithoutLiteralBlock: # new in 1.8
  Enabled: true
Lint/NoReturnInBeginEndBlocks: # new in 1.2
  Enabled: true
Lint/NumberedParameterAssignment: # new in 1.9
  Enabled: true
Lint/OrAssignmentToConstant: # new in 1.9
  Enabled: true
Lint/RedundantDirGlobSort: # new in 1.8
  Enabled: true
Lint/RequireRelativeSelfPath: # new in 1.22
  Enabled: true
Lint/SymbolConversion: # new in 1.9
  Enabled: true
Lint/ToEnumArguments: # new in 1.1
  Enabled: true
Lint/TripleQuotes: # new in 1.9
  Enabled: true
Lint/UnexpectedBlockArity: # new in 1.5
  Enabled: true
Lint/UnmodifiedReduceAccumulator: # new in 1.1
  Enabled: true
Lint/UselessRuby2Keywords: # new in 1.23
  Enabled: true
Naming/BlockForwarding: # new in 1.24
  Enabled: true
Security/IoMethods: # new in 1.22
  Enabled: true
Style/ArgumentsForwarding: # new in 1.1
  Enabled: true
Style/CollectionCompact: # new in 1.2
  Enabled: true
Style/DocumentDynamicEvalDefinition: # new in 1.1
  Enabled: true
Style/EndlessMethod: # new in 1.8
  Enabled: true
Style/FileRead: # new in 1.24
  Enabled: true
Style/FileWrite: # new in 1.24
  Enabled: true
Style/HashConversion: # new in 1.10
  Enabled: true
Style/HashExcept: # new in 1.7
  Enabled: true
Style/IfWithBooleanLiteralBranches: # new in 1.9
  Enabled: true
Style/InPatternThen: # new in 1.16
  Enabled: true
Style/MapToHash: # new in 1.24
  Enabled: true
Style/MultilineInPatternThen: # new in 1.16
  Enabled: true
Style/NegatedIfElseCondition: # new in 1.2
  Enabled: true
Style/NilLambda: # new in 1.3
  Enabled: true
Style/NumberedParameters: # new in 1.22
  Enabled: true
Style/NumberedParametersLimit: # new in 1.22
  Enabled: true
Style/OpenStructUse: # new in 1.23
  Enabled: true
Style/QuotedSymbols: # new in 1.16
  Enabled: true
Style/RedundantArgument: # new in 1.4
  Enabled: true
Style/RedundantSelfAssignmentBranch: # new in 1.19
  Enabled: true
Style/SelectByRegexp: # new in 1.22
  Enabled: true
Style/StringChars: # new in 1.12
  Enabled: true
Style/SwapValues: # new in 1.1
  Enabled: true
`;
  fs.writeFile(path.join(outDir, '.rubocop.yml'), robocopContent, (err) => {
    if (err) {
      logger.error(`Error saving the .rubocop.yml file to: ${outDir}. Cause: ${err}`);
    } else {
      logger.debug('.rubocop.yml generated successfully!');
    }
  });
}

function generateGemRc(outDir: string, logger: Logger) {
  const gemRc
    = `gem: --no-document
`;
  fs.writeFile(path.join(outDir, '.gemrc'), gemRc, (err) => {
    if (err) {
      logger.error(`Error saving the .gemrc file to: ${outDir}. Cause: ${err}`);
    } else {
      logger.debug('.gemrc generated successfully!');
    }
  });
}

function generateGemFile(outDir: string, logger: Logger) {
  const gemFileContent
    = `# frozen_string_literal: true

source 'https://rubygems.org'
gem 'highline'
gem 'kitchen-ansible'
gem 'kitchen-docker'
gem 'kitchen-dokken'
gem 'kitchen-ec2'
gem 'kitchen-inspec'
gem 'kitchen-sync'
gem 'kitchen-vagrant'
gem 'berkshelf'
gem 'pry-byebug'
gem 'rake'
gem 'rubocop'
gem 'rubocop-rake'
gem 'test-kitchen'
gem 'train-awsssm'

source 'https://rubygems.cinc.sh/' do
  gem 'chef-config'
  gem 'chef-utils'
  gem 'cinc-auditor-bin'
  gem 'inspec'
  gem 'inspec-core'
end
`;
  fs.writeFile(path.join(outDir, 'Gemfile'), gemFileContent, (err) => {
    if (err) {
      logger.error(`Error saving the Gemfile file to: ${outDir}. Cause: ${err}`);
    } else {
      logger.debug('Gemfile generated successfully!');
    }
  });
}

function generateRakeFile(outDir: string, logger: Logger) {
  const rakefileContent
    = `# frozen_string_literal: true

# !/usr/bin/env rake

require 'rake/testtask'
require 'rubocop/rake_task'

namespace :inspec do
  desc 'validate the profile'
  task :check do
    system 'bundle exec cinc-auditor check .'
  end
end

begin
  RuboCop::RakeTask.new(:lint) do |task|
    task.options += %w[--display-cop-names --no-color --parallel]
  end
rescue LoadError
  puts 'rubocop is not available. Install the rubocop gem to run the lint tests.'
end

desc 'pre-commit checks'
task pre_commit_checks: [:lint, 'inspec:check']
`;
  fs.writeFile(path.join(outDir, 'Rakefile'), rakefileContent, (err) => {
    if (err) {
      logger.error(`Error saving the Rakefile file to: ${outDir}. Cause: ${err}`);
    } else {
      logger.debug('Rakefile generated successfully!');
    }
  });
}

function generateGitIgnoreFile(outDir: string, logger: Logger) {
  const gitignoreContent
    = `.DS_Store
*.gem
*.rbc
/.config
/coverage/
/InstalledFiles
/pkg/
/spec/reports/
/spec/examples.txt
/test/tmp/
/test/version_tmp/
/tmp/
spec/results/**
.kitchen
.kitchen.local.yml
Gemfile.lock
inspec.lock
.kitchen
vendor/**
saf-cli.log

# Used by dotenv library to load environment variables.
# .env

# Ignore Byebug command history file.
.byebug_history

## Specific to RubyMotion:
.dat*
.repl_history
build/
*.bridgesupport
build-iPhoneOS/
build-iPhoneSimulator/

## Specific to RubyMotion (use of CocoaPods):
#
# We recommend against adding the Pods directory to your .gitignore. However
# you should judge for yourself, the pros and cons are mentioned at:
# https://guides.cocoapods.org/using/using-cocoapods.html#should-i-check-the-pods-directory-into-source-control
#
# vendor/Pods/

## Documentation cache and generated files:
/.yardoc/
/_yardoc/
/doc/
/rdoc/

## Environment normalization:
/.bundle/
/vendor/bundle
/lib/bundler/man/

# for a library or gem, you might want to ignore these files since the code is
# intended to run in multiple environments; otherwise, check them in:
# Gemfile.lock
# .ruby-version
# .ruby-gemset

# unless supporting rvm < 1.11.0 or doing something fancy, ignore this:
.rvmrc

# Used by RuboCop. Remote config files pulled in from inherit_from directive.
# .rubocop-https?--*

# VS CODE / VSCODIUM
.vscode

# delta files
delta.json
report.md
*xccdf.xml
check-results.txt
kitchen.local.ec2.yml
`;
  fs.writeFile(path.join(outDir, '.gitignore'), gitignoreContent, (err) => {
    if (err) {
      logger.error(`Error saving the .gitignore file to: ${outDir}. Cause: ${err}`);
    } else {
      logger.debug('.gitignore generated successfully!');
    }
  });
}
