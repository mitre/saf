
import {Flags} from '@oclif/core'
import fs from 'fs'
import parser from 'fast-xml-parser'
import {InSpecMetaData, InspecReadme} from '../../types/inspec'
import path from 'path'
import {createWinstonLogger} from '../../utils/logging'
import {processOVAL, processXCCDF} from '@mitre/inspec-objects'
import Profile from '@mitre/inspec-objects/lib/objects/profile'
import {BaseCommand} from '../../utils/oclif/baseCommand'
import {Logger} from 'winston'
import {execSync} from 'child_process'
import _ from 'lodash'

export default class InspecProfile extends BaseCommand<typeof InspecProfile> {
  static readonly usage =
    '<%= command.id %> -i <stig-xccdf-xml> [-o <output-folder>] [-h] [-m <metadata-json>]\n' +
    '[-T (rule|group|cis|version)] [-s] [-L (info|warn|debug|verbose)]'

  static readonly description =
    'Generate a new skeleton profile based on a XCCDF benchmark file'

  static readonly examples = [
    '<%= config.bin %> <%= command.id %> -i ./U_RHEL_6_STIG_V2R2_Manual-xccdf.xml -T group --logLevel debug -r rhel-6-update-report.md',
    '<%= config.bin %> <%= command.id %> -i ./CIS_Ubuntu_Linux_18.04_LTS_Benchmark_v1.1.0-xccdf.xml -O ./CIS_Ubuntu_Linux_18.04_LTS_Benchmark_v1.1.0-oval.xml --logLevel debug',
  ]

  static readonly aliases = ['generate:xccdf_benchmark2inspec_stub']

  static readonly flags = {
    xccdfXmlFile: Flags.string({
      char: 'i',
      required: true,
      description: 'Path to the XCCDF benchmark file',
    }),
    metadata: Flags.string({
      char: 'm',
      required: false,
      description: 'Path to a JSON file with additional metadata for the inspec.yml\n' +
        'The metadata Json is of the following format:\n' +
        '  {"maintainer": string, "copyright": string, "copyright_email": string, "license": string, "version": string}',
    }),
    singleFile: Flags.boolean({
      char: 's',
      required: false,
      default: false,
      description: 'Output the resulting controls as a single file',
    }),
    idType: Flags.string({
      char: 'T',
      required: false,
      default: 'rule',
      options: ['rule', 'group', 'cis', 'version'],
      description: "Control ID Types: 'rule' - Vulnerability IDs (ex. 'SV-XXXXX'), 'group' - Group IDs (ex. 'V-XXXXX'), 'cis' - CIS Rule IDs (ex. C-1.1.1.1), 'version' - Version IDs (ex. RHEL-07-010020 - also known as STIG IDs)",
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
  }

  async run() {
    const {flags} = await this.parse(InspecProfile)

    const logger = createWinstonLogger('generate:inspect_profile', flags.logLevel)

    // Process the XCCDF XML file containing the profile guidance
    let xccdf: any = {}
    try {
      if (fs.lstatSync(flags.xccdfXmlFile).isFile()) {
        const xccdfXmlFile = flags.xccdfXmlFile
        xccdf = fs.readFileSync(xccdfXmlFile, 'utf8')
        const inputFirstLine = xccdf.split('\n').slice(0, 10).join('').toLowerCase()
        if (!inputFirstLine.includes('xccdf')) {
          logger.error(`ERROR: The file ${xccdfXmlFile} is not a valid XCCDF file`)
          throw new Error('File provided is not a valid or well-formed XCCDF file')
        }

        logger.debug(`Loaded ${xccdfXmlFile} as XCCDF`)
      } else {
        throw new Error('No benchmark (XCCDF) file was provided.')
      }
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        logger.error(`ERROR: File not found: "${flags.xccdfXmlFile}". Run the --help command to more information on expected input file.`)
        process.exit(1)
      } else {
        logger.error(`ERROR: Unable to process the XCCDF XML file "${flags.xccdfXmlFile}" because: ${error}`)
        process.exit(1)
      }
    }

    // Generate the output folder based on the XCCDF Benchmark.title
    // if the default name is provided (profile) by the output -o flag
    const options = {
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
    }
    const xmlDoc = new parser.XMLParser(options).parse(xccdf)
    let outDir = ''
    if (flags.output === 'profile') {
      const benchmarkTitle = _.get(xmlDoc, 'Benchmark.title')
      outDir = (benchmarkTitle === undefined) ?
        flags.output :
        benchmarkTitle.replace('Security Technical Implementation Guide', 'stig-baseline')
          .replaceAll(' ', '-').toLowerCase()
    } else {
      outDir = flags.output
    }

    // Check if the output folder already exists
    logger.info('Processing output directory...')
    if (fs.existsSync(outDir)) {
      // Folder should not exist already
      logger.error(`ERROR: Profile output folder ${outDir} already exists, please specify a new folder`)
      process.exit(1)
    } else {
      logger.debug('Creating output folder with controls and libraries directories')
      fs.mkdirSync(outDir)
      fs.mkdirSync(path.join(outDir, 'controls'))
      fs.mkdirSync(path.join(outDir, 'libraries'))
    }

    // This will get overridden if a metadata file is passed
    logger.info('Processing metadata file...')
    let metadata: InSpecMetaData = {}
    // Read metadata file if passed
    if (flags.metadata) {
      if (fs.existsSync(flags.metadata)) {
        logger.debug(`Reading metadata file: ${flags.metadata}.`)
        metadata = JSON.parse(fs.readFileSync(flags.metadata, 'utf8'))
      } else {
        logger.error(`ERROR: File not found: "${flags.metadata}". Run the --help command to more information on expected input file.`)
        process.exit(1)
      }
    }

    // Read OVAL definitions file if passed
    logger.info('Processing Oval file...')
    let ovalDefinitions
    if (flags.ovalDefinitions) {
      if (fs.existsSync(flags.ovalDefinitions)) {
        logger.debug(`Reading oval definitions file: ${flags.ovalDefinitions}.`)
        ovalDefinitions = processOVAL(fs.readFileSync(flags.ovalDefinitions, 'utf8'))
      } else {
        logger.error(`ERROR: File not found: "${flags.ovalDefinitions}". Run the --help command to more information on expected input file.`)
        process.exit(1)
      }
    }

    // Process the XCCDF file
    logger.info('Processing XCCDF file...')
    let profile: Profile
    logger.debug(`Processing XCCDF Benchmark file using ${flags.idType} id.`)
    const idTypes = ['rule', 'group', 'cis', 'version']
    if (idTypes.includes(flags.idType)) {
      profile = processXCCDF(xccdf, false, flags.idType as 'cis' | 'version' | 'rule' | 'group', ovalDefinitions)
    } else {
      logger.error(`Invalid ID Type: ${flags.idType}. Check the --help command for the available ID Type options.`)
      process.exit(1)
    }

    // Set profile default values (values used to generate the inspect.yml file)
    logger.info('Generating markdown and yaml files...')
    const readmeObj = getReadmeContent(xmlDoc)

    profile.name = readmeObj.profileName
    profile.title = readmeObj.profileTitle
    profile.maintainer = 'MITRE SAF Team'
    profile.copyright = 'MITRE'
    profile.copyright_email = 'saf@groups.mitre.org'
    profile.license = 'Apache-2.0'
    profile.summary = `InSpec profile aligned to DISA STIG for ${readmeObj.profileTitle}`
    profile.version = readmeObj.profileVersion
    // Get inspec installed version, use the major.0 if installed, otherwise set to 5.0
    const inspecVersion = execSync('inspec --version').toString()
    // match() allows matching single integer and multiple decimal places
    const isDecimal = inspecVersion.match(/^-?\d*(\.?\d+)+/)
    profile.inspec_version = (isDecimal === null) ? '>= 3.1.2' : `>=${inspecVersion.split('.')[0]}.0`

    // Add metadata if provided
    if (flags.metadata) {
      profile.maintainer = metadata.maintainer
      profile.copyright = metadata.copyright
      profile.copyright_email = metadata.copyright_email
      profile.license = metadata.license
      profile.version = metadata.version || readmeObj.profileVersion
    }

    // Write inspec.yml
    logger.debug(`Writing inspec.yml file to: ${path.join(outDir, 'inspec.yml')}`)
    fs.writeFileSync(
      path.join(outDir, 'inspec.yml'),
      profile.createInspecYaml(),
    )

    generateReadme(readmeObj, outDir, logger)
    generateLicenses(outDir, logger)
    generateNotice(outDir, logger)
    generateRubocopYml(outDir, logger)
    generateGemFile(outDir, logger)
    generateRakeFile(outDir, logger)
    generateGitIgnoreFile(outDir, logger)

    logger.info('Generating profile controls...')
    // Write all controls
    if (flags.singleFile) {
      const controls = profile.controls
        .map(control => control.toRuby())
        .join('\n\n')
      logger.debug(`Writing control to: ${path.join(outDir, 'controls', 'controls.rb')}`)
      fs.writeFileSync(
        path.join(outDir, 'controls', 'controls.rb'),
        controls,
      )
    } else {
      profile.controls.forEach(control => {
        logger.debug(`Writing control to: ${path.join(outDir, 'controls', control.id + '.rb')}`)
        fs.writeFileSync(
          path.join(outDir, 'controls', control.id + '.rb'),
          control.toRuby(),
        )
      })
    }
  }
}

function getReadmeContent(_xmlDoc: any): InspecReadme {
  const readmeObj: InspecReadme = {
    profileName: '',
    profileTitle: '',
    profileVersion: '',
    stigVersion: '',
    stigDate: '',
    profileShortName: '',
  }

  const benchmarkTitle = _.get(_xmlDoc, 'Benchmark.title')
  const stigVersion = _.get(_xmlDoc, 'Benchmark.version')
  const plainTextObj = _xmlDoc.Benchmark['plain-text']

  // releaseInfoObj is in the form of:
  // {"#text":"Release: 1 Benchmark Date: 24 Jul 2024","@_id":"release-info"}
  const releaseInfoObj = Array.isArray(plainTextObj) ?
    _.find(plainTextObj, {'@_id': 'release-info'}) : plainTextObj

  // stigRelDate is in the form of: ["Release"," 1 Benchmark Date"," 24 Jul 2024"]
  const stigRelDate = releaseInfoObj['#text'].split(':')
  const stigRelease = stigRelDate[1].trim().split(' ')[0]
  const sitVersion = `Version ${stigVersion} Release ${stigRelease} (V${stigVersion}R${stigRelease})`
  const stigDate = stigRelDate[2]

  readmeObj.profileName = benchmarkTitle.replace(
    'Security Technical Implementation Guide', 'stig-baseline')
    .replaceAll(' ', '-').toLowerCase()
  readmeObj.profileShortName = benchmarkTitle.replace('Security Technical Implementation Guide', '').trim()
  readmeObj.profileTitle = benchmarkTitle
  readmeObj.profileVersion = `${stigVersion}.${stigRelease}.0`
  readmeObj.stigDate = stigDate
  readmeObj.stigVersion = sitVersion

  return readmeObj
}

function generateReadme(contentObj: InspecReadme, outDir: string, logger: Logger) {
  const readmeContent =
`# ${contentObj.profileTitle}
This InSpec Profile was created to facilitate testing and auditing of \`${contentObj.profileShortName}\`
infrastructure and applications when validating compliancy with Department of [Defense (DoD) STIG](https://iase.disa.mil/stigs/)
requirements

- Profile Version: ${contentObj.profileVersion}
- STIG Date: ${contentObj.stigDate}    
- STIG Version: ${contentObj.stigVersion}


This profile was developed to reduce the time it takes to perform a security checks based upon the
STIG Guidance from the Defense Information Systems Agency (DISA) in partnership between the DISA
Services Directorate (SD) and the DISA Risk Management Executive (RME) office.

The results of a profile run will provide information needed to support an Authority to Operate (ATO)
decision for the applicable technology.

The ${contentObj.profileShortName} STIG Profile uses the [InSpec](https://github.com/inspec/inspec)
open-source compliance validation language to support automation of the required compliance, security
and policy testing for Assessment and Authorization (A&A) and Authority to Operate (ATO) decisions
and Continuous Authority to Operate (cATO) processes.

Table of Contents
=================
* [STIG Information](#stig-information)
* [Getting Started](#getting-started)
    * [Intended Usage](#intended-usage)
    * [Tailoring to Your Environment](#tailoring-to-your-environment)
    * [Testing the Profile Controls](#testing-the-profile-controls)
* [Running the Profile](#running-the-profile)
    * [Directly from Github](#directly-from-github) 
    * [Using a local Archive copy](#using-a-local-archive-copy)
    * [Different Run Options](#different-run-options)
* [Using Heimdall for Viewing Test Results](#using-heimdall-for-viewing-test-results)

## STIG Information
The DISA RME and DISA SD Office, along with their vendor partners, create and maintain a set
of Security Technical Implementation Guides for applications, computer systems and networks
connected to the Department of Defense (DoD). These guidelines are the primary security standards
used by the DoD agencies. In addition to defining security guidelines, the STIGs also stipulate
how security training should proceed and when security checks should occur. Organizations must
stay compliant with these guidelines or they risk having their access to the DoD terminated.

Requirements associated with the ${contentObj.profileShortName} STIG are derived from the
[Security Requirements Guides](https://csrc.nist.gov/glossary/term/security_requirements_guide)
and align to the [National Institute of Standards and Technology](https://www.nist.gov/) (NIST)
[Special Publication (SP) 800-53](https://csrc.nist.gov/Projects/risk-management/sp800-53-controls/release-search#!/800-53)
Security Controls, [DoD Control Correlation Identifier](https://public.cyber.mil/stigs/cci/) and related standards.

The ${contentObj.profileShortName} STIG profile checks were developed to provide technical implementation
validation to the defined DoD requirements, the guidance can provide insight for any organizations wishing
to enhance their security posture and can be tailored easily for use in your organization.

[top](#table-of-contents)
## Getting Started  
It is intended and recommended that InSpec run this profile from a __"runner"__ host
(such as a DevOps orchestration server, an administrative management system, or a developer's workstation/laptop)
against the target remotely over __winrm__.

__For the best security of the runner, always install the _latest version_ of InSpec on the runner
    and supporting Ruby language components.__ 

The latest versions and installation options are available at the [InSpec](http://inspec.io/) site.

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
The \`inspec.yml\` file contains metadata that describes the profile.

***[Update the \`inspec.yml\` file parameter \`inputs\` with a list of inputs appropriate for the profile and specific environment.]***

Chef InSpec Resources:
- [InSpec Profile Documentation](https://docs.chef.io/inspec/profiles/).
- [InSpec Inputs](https://docs.chef.io/inspec/profiles/inputs/).
- [inspec.yml](https://docs.chef.io/inspec/profiles/inspec_yml/).

>[!NOTE]
> Inputs are variables that can be referenced by any control in the profile, and are defined and given a default value in the \`inspec.yml\` file.

Below is an example how the \`inputs\` are defined in the \`inspec.yml\`:
\`\`\`
inputs:
  # Skip controls that take a long time to test 
  - name: disable_slow_controls
    description: Controls that are known to consistently have long run times can be disabled with this attribute
    type: Boolean
    value: false

  # List of configuration files for the specific system
  - name: logging_conf_files
    description: Configuration files for the logging service
    type: Array
    value:
      - <dir-path-1>/*.conf
      - <dir-path-2>/*.conf
\`\`\`

[top](#table-of-contents)
### Testing the Profile Controls
The Gemfile provided contains all necessary ruby dependencies for checking the profile controls.
#### Requirements
All action are conducted using \`ruby\` (gemstone/programming language). Currently \`inspec\` 
commands have been tested with ruby version 3.1.2. A higher version of ruby is not guaranteed to
provide the expected results. Any modern distribution of Ruby comes with Bundler preinstalled by default.

Install ruby based on the OS being used, see [Installing Ruby](https://www.ruby-lang.org/en/documentation/installation/)

After installing \`ruby\` install the necessary dependencies by invoking the bundler command
(must be in the same directory where the Gemfile is located):
\`\`\`
bundle install
\`\`\`

#### Testing Commands
Ensure the controls are chef-style formatted:
\`\`\`
  bundle exec cookstyle -a ./controls
\`\`\`

Linting and validating controls:
\`\`\`
  bundle exec rake inspec:check          # validate the inspec profile
  bundle exec rake lint                  # Run RuboCop
  bundle exec rake lint:autocorrect      # Autocorrect RuboCop offenses (only when it's safe)
  bundle exec rake lint:autocorrect_all  # Autocorrect RuboCop offenses (safe and unsafe)
  bundle exec rake pre_commit_checks     # pre-commit checks
\`\`\`

Ensure the controls are ready to be committed into the repo:
\`\`\`
  bundle exec rake pre_commit_checks
\`\`\`


[top](#table-of-contents)
## Running the Profile
### Directly from Github
This options is best used when network connectivity is available and policies permit
access to the hosting repository.

\`\`\`
# Using \`ssh\` transport
bundle exec inspec exec https://github.com/mitre/${contentObj.profileTitle}/archive/main.tar.gz --input-file=<your_inputs_file.yml> -t ssh://<hostname>:<port> --sudo --reporter=cli json:<your_results_file.json>

# Using \`winrm\` transport
bundle exec inspec exec https://github.com/mitre/${contentObj.profileTitle}/archive/master.tar.gz --target winrm://<hostip> --user '<admin-account>' --password=<password> --input-file=<path_to_your_inputs_file/name_of_your_inputs_file.yml> --reporter=cli json:<path_to_your_output_file/name_of_your_output_file.json>
\`\`\`

[top](#table-of-contents)
### Using a local Archive copy
If your runner is not always expected to have direct access to the profile's hosted location,
use the following steps to create an archive bundle of this overlay and all of its dependent tests:

(Git is required to clone the InSpec profile using the instructions below.
Git can be downloaded from the [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) site.)

When the **"runner"** host uses this profile overlay for the first time, follow these steps:

\`\`\`
mkdir profiles
cd profiles
git clone https://github.com/mitre/${contentObj.profileTitle}.git
bundle exec inspec archive ${contentObj.profileTitle}

# Using \`ssh\` transport
bundle exec inspec exec <name of generated archive> --input-file=<your_inputs_file.yml> -t ssh://<hostname>:<port> --sudo --reporter=cli json:<your_results_file.json>

# Using \`winrm\` transport
bundle exec inspec exec <name of generated archive> --target winrm://<hostip> --user '<admin-account>' --password=<password> --input-file=<path_to_your_inputs_file/name_of_your_inputs_file.yml> --reporter=cli json:<path_to_your_output_file/name_of_your_output_file.json>    
\`\`\`

For every successive run, follow these steps to always have the latest version of this profile baseline:

\`\`\`
cd ${contentObj.profileTitle}
git pull
cd ..
bundle exec inspec archive ${contentObj.profileTitle} --overwrite

# Using \`ssh\` transport
bundle exec inspec exec <name of generated archive> --input-file=<your_inputs_file.yml> -t ssh://<hostname>:<port> --sudo --reporter=cli json:<your_results_file.json>

# Using \`winrm\` transport
bundle exec inspec exec <name of generated archive> --target winrm://<hostip> --user '<admin-account>' --password=<password> --input-file=<path_to_your_inputs_file/name_of_your_inputs_file.yml> --reporter=cli json:<path_to_your_output_file/name_of_your_output_file.json>    
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

Additionally both Heimdall applications can be deployed via docker, kurbernetes, or the installation packages.

[top](#table-of-contents)
## Authors
Defense Information Systems Agency (DISA) https://www.disa.mil/

STIG support by DISA Risk Management Team and Cyber Exchange https://public.cyber.mil/

MITRE Security Automation Framework Team https://saf.mitre.org

## NOTICE
DISA STIGs are published by DISA IASE, see: https://iase.disa.mil/Pages/privacy_policy.aspx
`

  fs.writeFile(path.join(outDir, 'README.md'), readmeContent, err => {
    if (err) {
      logger.error(`Error saving the README.md file to: ${outDir}. Cause: ${err}`)
    } else {
      logger.debug('README.md generated successfully!')
    }
  })
}

function generateLicenses(outDir: string, logger: Logger) {
  const licensesContent =
`Licensed under the apache-2.0 license, except as noted below.  
    
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
`
  fs.writeFile(path.join(outDir, 'LICENSES.md'), licensesContent, err => {
    if (err) {
      logger.error(`Error saving the LICENSES.md file to: ${outDir}. Cause: ${err}`)
    } else {
      logger.debug('LICENSES.md generated successfully!')
    }
  })
}

function generateNotice(outDir: string, logger: Logger) {
  const noticeContent =
`MITRE grants permission to reproduce, distribute, modify, and otherwise use this
software to the extent permitted by the licensed terms provided in the LICENSE.md
file included with this project.
    
This software was produced by The MITRE Corporation for the U. S. Government under
contract. As such the U.S. Government has certain use and data rights in this software.
No use other than those granted to the U. S. Government, or to those acting on behalf
of the U. S. Government, under these contract arrangements is authorized without the
express written permission of The MITRE Corporation.

For further information, please contact The MITRE Corporation, Contracts Management
Office, 7515 Colshire Drive, McLean, VA 22102-7539, (703) 983-6000.
`
  fs.writeFile(path.join(outDir, 'NOTICE.md'), noticeContent, err => {
    if (err) {
      logger.error(`Error saving the NOTICE.md file to: ${outDir}. Cause: ${err}`)
    } else {
      logger.debug('NOTICE.md generated successfully!')
    }
  })
}

function generateRubocopYml(outDir: string, logger: Logger) {
  const robocopContent =
`AllCops:
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
`
  fs.writeFile(path.join(outDir, '.rubocop.yml'), robocopContent, err => {
    if (err) {
      logger.error(`Error saving the .rubocop.yml file to: ${outDir}. Cause: ${err}`)
    } else {
      logger.debug('.rubocop.yml generated successfully!')
    }
  })
}

function generateGemFile(outDir: string, logger: Logger) {
  const gemFileContent =
`# frozen_string_literal: true

source 'https://rubygems.org'

gem 'cookstyle'
gem 'highline'
gem 'inspec', '>= 6.6.0'
gem 'inspec-bin'
gem 'inspec-core'
gem 'kitchen-ansible'
gem 'kitchen-docker'
gem 'kitchen-dokken'
gem 'kitchen-ec2'
gem 'kitchen-inspec'
gem 'kitchen-sync'
gem 'kitchen-vagrant'
gem 'parser', '3.3.0.5'
gem 'pry-byebug'
gem 'rake'
gem 'rubocop'
gem 'rubocop-rake'
gem 'test-kitchen'
gem 'train-awsssm'
`
  fs.writeFile(path.join(outDir, 'Gemfile'), gemFileContent, err => {
    if (err) {
      logger.error(`Error saving the Gemfile file to: ${outDir}. Cause: ${err}`)
    } else {
      logger.debug('Gemfile generated successfully!')
    }
  })
}

function generateRakeFile(outDir: string, logger: Logger) {
  const rakefileContent =
`# frozen_string_literal: true

# !/usr/bin/env rake

require 'rake/testtask'
require 'rubocop/rake_task'

namespace :inspec do
  desc 'validate the inspec profile'
  task :check do
    system 'bundle exec inspec check .'
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
`
  fs.writeFile(path.join(outDir, 'Rakefile'), rakefileContent, err => {
    if (err) {
      logger.error(`Error saving the Rakefile file to: ${outDir}. Cause: ${err}`)
    } else {
      logger.debug('Rakefile generated successfully!')
    }
  })
}

function generateGitIgnoreFile(outDir: string, logger: Logger) {
  const gitignoreContent =
`.DS_Store
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
`
  fs.writeFile(path.join(outDir, '.gitignore'), gitignoreContent, err => {
    if (err) {
      logger.error(`Error saving the .gitignore file to: ${outDir}. Cause: ${err}`)
    } else {
      logger.debug('.gitignore generated successfully!')
    }
  })
}
