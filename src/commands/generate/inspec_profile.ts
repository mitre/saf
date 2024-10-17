
import {Flags} from '@oclif/core'
import fs from 'fs'
import parser from 'fast-xml-parser'
import _ from 'lodash'
import {InSpecMetaData, InspecReadme} from '../../types/inspec'
import path from 'path'
import {createWinstonLogger} from '../../utils/logging'
import {processOVAL, processXCCDF} from '@mitre/inspec-objects'
import Profile from '@mitre/inspec-objects/lib/objects/profile'
import {BaseCommand} from '../../utils/oclif/baseCommand'
import {Logger} from 'winston'

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
    const options = {
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
    }
    const xmlDoc = new parser.XMLParser(options).parse(xccdf)
    const benchmarkTitle = _.get(xmlDoc, 'Benchmark.title')
    let outDir = ''
    if (flags.output === 'profile') {
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
The following inputs must be configured in an inputs ".yml" file for the profile to run
correctly for your specific environment. More information about InSpec inputs can be
found in the [InSpec Profile Documentation](https://www.inspec.io/docs/reference/profiles/).

\`\`\`
# Set to either the string "true" or "false"
sensitive_system: false

# List of temporary accounts on the domain
temp_accounts_domain: []

# List of temporary accounts on local system
temp_accounts_local: []

# List of emergency accounts on the domain
emergency_accounts_domain: []

# List of emergency accounts on the system
emergency_accounts_local: []

# List of authorized users in the local Administrators group for a domain controller
local_administrators_dc: []

# List of authorized users in the local Administrators group for a member server
local_administrators_member: []

# Local Administrator Account on Windows Server
local_administrator: ""

# List of authorized users in the Backup Operators Group
backup_operators: []

# List Application or Service Accounts domain
application_accounts_domain: []

# List Excluded Accounts domain
excluded_accounts_domain: []

# List Application Local Accounts
application_accounts_local: []

# List of authorized users in the local Administrators group
administrators: []
\`\`\`

[top](#table-of-contents)
## Running the Profile
### Directly from Github
This options is best used when network connectivity is available and policies permit
access to the hosting repository.

\`\`\`
# Using \`ssh\` transport
inspec exec https://github.com/mitre/${contentObj.profileTitle}/archive/main.tar.gz --input-file=<your_inputs_file.yml> -t ssh://<hostname>:<port> --sudo --reporter=cli json:<your_results_file.json>

# Using \`winrm\` transport
inspec exec https://github.com/mitre/${contentObj.profileTitle}/archive/master.tar.gz --target winrm://<hostip> --user '<admin-account>' --password=<password> --input-file=<path_to_your_inputs_file/name_of_your_inputs_file.yml> --reporter=cli json:<path_to_your_output_file/name_of_your_output_file.json>
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
inspec archive ${contentObj.profileTitle}

# Using \`ssh\` transport
inspec exec <name of generated archive> --input-file=<your_inputs_file.yml> -t ssh://<hostname>:<port> --sudo --reporter=cli json:<your_results_file.json>

# Using \`winrm\` transport
inspec exec <name of generated archive> --target winrm://<hostip> --user '<admin-account>' --password=<password> --input-file=<path_to_your_inputs_file/name_of_your_inputs_file.yml> --reporter=cli json:<path_to_your_output_file/name_of_your_output_file.json>    
\`\`\`

For every successive run, follow these steps to always have the latest version of this profile baseline:

\`\`\`
cd ${contentObj.profileTitle}
git pull
cd ..
inspec archive ${contentObj.profileTitle} --overwrite

# Using \`ssh\` transport
inspec exec <name of generated archive> --input-file=<your_inputs_file.yml> -t ssh://<hostname>:<port> --sudo --reporter=cli json:<your_results_file.json>

# Using \`winrm\` transport
inspec exec <name of generated archive> --target winrm://<hostip> --user '<admin-account>' --password=<password> --input-file=<path_to_your_inputs_file/name_of_your_inputs_file.yml> --reporter=cli json:<path_to_your_output_file/name_of_your_output_file.json>    
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
For a more detail features capabilities see [Heimdall Features](https://github.com/mitre/heimdall2?tab=readme-ov-file#features)

Heimdall can **_export your results into a DISA Checklist (CKL) file_** for easily upload into eMass using the \`Heimdall Export\` function.

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
