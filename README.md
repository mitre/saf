# Security Automation Framework CLI

The MITRE Security Automation Framework (SAF) Command Line Interface (CLI) brings together applications, techniques, libraries, and tools developed by MITRE and the security community to streamline security automation for systems and DevOps pipelines

The SAF CLI is the successor to [Heimdall Tools](https://github.com/mitre/heimdall_tools) and [InSpec Tools](https://github.com/mitre/inspec_tools).

## Terminology

- [Heimdall](https://github.com/mitre/heimdall2) - Our visualizer for all security result data
- [Heimdall Data Format (HDF)](https://saf.mitre.org/#/normalize) - Our common data format to preserve and transform security data

## Development Testing & Contribution

- [Development, Testing & Contribution Guide](#development-testing--contribution)

## Installation

  * [Via NPM](#installation-via-npm)
      * [Update via NPM](#update-via-npm)
  * [Via Brew](#installation-via-brew)
      * [Update via Brew](#update-via-brew)
  * [Via Docker](#installation-via-docker)
      * [Update via Docker](#update-via-docker)
  * [Via Windows Installer](#installation-via-windows-installer)
      * [Update via Windows Installer](#update-via-windows-installer)

## Usage

### Attest HDF Data

  * [Attest](#attest)
      * [Create Attestations](#create-attestations)
      * [Apply Attestations](#apply-attestations)
  
### Convert HDF to Other Formats

  * [Get Help with Convert](#convert)
  * [Convert From HDF](#convert-from-hdf)
      * [HDF to ASFF](#hdf-to-asff)
      * [HDF to Splunk](#hdf-to-splunk)
      * [HDF to XCCDF Results](#hdf-to-xccdf-results)
      * [HDF to Checklist](#hdf-to-checklist)
      * [HDF to CSV](#hdf-to-csv)
      * [HDF to Condensed JSON](#hdf-to-condensed-json)

### Convert Other Formats to HDF

  * [Convert To HDF](#convert-to-hdf)
      * [ASFF to HDF](#asff-to-hdf)
      * [AWS Config to HDF](#aws-config-to-hdf)
      * [Burp Suite to HDF](#burp-suite-to-hdf)
      * [CKL to POA&amp;M](#ckl-to-poam)
      * [DBProtect to HDF](#dbprotect-to-hdf)
      * [Fortify to HDF](#fortify-to-hdf)
      * [GoSec to HDF](#gosec-to-hdf)
      * [Ion Channel 2 HDF](#ion-channel-2-hdf)
      * [JFrog Xray to HDF](#jfrog-xray-to-hdf)
      * [Tenable Nessus to HDF](#tenable-nessus-to-hdf)
      * [Netsparker to HDF](#netsparker-to-hdf)
      * [Nikto to HDF](#nikto-to-hdf)
      * [Prisma to HDF](#prisma-to-hdf)
      * [Prowler to HDF](#prowler-to-hdf)
      * [Sarif to HDF](#sarif-to-hdf)
      * [Scoutsuite to HDF](#scoutsuite-to-hdf)
      * [Snyk to HDF](#snyk-to-hdf)
      * [SonarQube to HDF](#sonarqube-to-hdf)
      * [Splunk to HDF](#splunk-to-hdf)
      * [Trivy to HDF](#trivy-to-hdf)
      * [Twistlock to HDF](#twistlock-to-hdf)
      * [Veracode to HDF](#veracode-to-hdf)
      * [XCCDF Results to HDF](#xccdf-results-to-hdf)
      * [OWASP ZAP to HDF](#owasp-zap-to-hdf)

### eMasser Client

  * [eMASS API CLI](#emass-api-cli)

### View HDF Summaries and Data

  * [View](#view)
      * [Heimdall](#heimdall)
      * [Summary](#summary)

### Validate HDF Thresholds

  * [Validate](#validate)
      * [Thresholds](#thresholds)

### Generate Data Reports and More

  * [Generate](#generate)
      * [Delta](#delta)
      * [Delta Supporting Commands](#delta-supporting-options) 
      * [CKL Templates](#ckl-templates)
      * [InSpec Metadata](#inspec-metadata)
      * [Thresholds](#thresholds-1)
      * [Spreadsheet (csv/xlsx) to InSpec](#spreadsheet-csvxlsx-to-inspec)
      * [XCCDF Benchmark to InSpec Stubs](#xccdf-benchmark-to-inspec-stub)
        * [DoD Stub vs CIS Stub Formatting](#dod-stub-vs-cis-stub-formatting)
      * [Mapping Files](#mapping-files)

### Enhance and Supplement HDF Data

  * [Supplement](#supplement)
      * [Passthrough](#passthrough)
        * [Read](#read)
        * [Write](#write)
      * [Target](#target)
        * [Read](#read-1)
        * [Write](#write-1)

### License and Authors

* [License and Author](#license-and-author)

---

## Development, Testing and Contributing

See the [Contributor's Guide](./docs/contributors-guide.md) for more information

## Installation

___

### Installation via NPM

The SAF CLI can be installed and kept up to date using `npm`, which is included with most versions of [NodeJS](https://nodejs.org/en/).

```bash
npm install -g @mitre/saf
```


#### Update via NPM

To update the SAF CLI with `npm`:

```bash
npm update -g @mitre/saf
```
[top](#installation)

---

### Installation via Brew

The SAF CLI can be installed and kept up to date using `brew`.

```
brew install mitre/saf/saf-cli
```


#### Update via Brew

To update the SAF CLI with `brew`:

```
brew upgrade mitre/saf/saf-cli
```
[top](#installation)

---

### Installation via Docker

**On Linux and Mac:**

The docker command below can be used to run the SAF CLI one time, where `arguments` contains the command and flags you want to run. For ex: `--version` or `view summary -i hdf-results.json`.
```
docker run -it -v$(pwd):/share mitre/saf <arguments>
```

To run the SAF CLI with a persistent shell for one or more commands, use the following, then run each full command. For ex: `saf --version` or `saf view summary -i hdf-results.json`. You can change the entrypoint you wish to use. For example, run with `--entrypoint sh` to open in a shell terminal. If the specified entrypoint is not found, try using the path such as `--entrypoint /bin/bash`.

```
docker run --rm -it --entrypoint bash -v$(pwd):/share mitre/saf
```

**On Windows:**

The docker command below can be used to run the SAF CLI one time, where `arguments` contains the command and flags you want to run. For ex: `--version` or `view summary -i hdf-results.json`.

```
docker run -it -v%cd%:/share mitre/saf <arguments>
```

To run the SAF CLI with a persistent shell for one or more commands, use the following, then run each full command. For ex: `saf --version` or `saf view summary -i hdf-results.json`. You can change the entrypoint you wish to use. For example, run with `--entrypoint sh` to open in a shell terminal. If the specified entrypoint is not found, try using the path such as `--entrypoint /bin/bash`.

```
docker run --rm -it --entrypoint sh -v%cd%:/share mitre/saf
```

**NOTE:**

Remember to use Docker CLI flags as necessary to run the various subcommands.

For example, to run the `emasser configure` subcommand, you need to pass in a volume that contains your certificates and where you can store the resultant .env.  Furthermore, you need to pass in flags for enabling the pseudo-TTY and interactivity.

```
docker run -it -v "$(pwd)":/share mitre/saf emasser configure
```

Other commands might not require the `-i` or `-t` flags and instead only need a bind-mounted volume, such as a file based `convert`.

```
docker run --rm -v "$(pwd)":/share mitre/saf convert -i test/sample_data/trivy/sample_input_report/trivy-image_golang-1.12-alpine_sample.json -o test.json
```

Other flags exist to open up network ports or pass through environment variables so make sure to use whichever ones are required to successfully run a command.


#### Update via Docker

To update the SAF CLI with `docker`:

```bash
docker pull mitre/saf:latest
```
[top](#installation)

---

### Installation via Windows Installer

To install the latest release of the SAF CLI on Windows, download and run the most recent installer for your system architecture from the [Releases](https://github.com/mitre/saf/releases) 🌬️ page.

#### Update via Windows Installer

To update the SAF CLI on Windows, uninstall any existing version from your system and then download and run the most recent installer for your system architecture from the [Releases](https://github.com/mitre/saf/releases) 🌬️ page.

[top](#installation)
## Usage
---

### Attest

Attest to 'Not Reviewed' controls: sometimes requirements can’t be tested automatically by security tools and hence require manual review, whereby someone interviews people and/or examines a system to confirm (i.e., attest as to) whether the control requirements have been satisfied.

#### Create Attestations
```
attest create              Create attestation files for use with `saf attest apply`

USAGE
  $ saf attest create -o <attestation-file> [-i <hdf-json> -t <json | xlsx | yml | yaml>]

FLAGS
  -h, --help             Show CLI help.
  -i, --input=<value>    (optional) An input HDF file to search for controls
  -o, --output=<value>   (required) The output filename
  -t, --format=<option>  [default: json] (optional) The output file type
                         <options: json|xlsx|yml|yaml>

EXAMPLES
  $ saf attest create -o attestation.json -i hdf.json

  $ saf attest create -o attestation.xlsx -t xlsx
```
[top](#usage)
#### Apply Attestations
```
attest apply              Apply one or more attestation files to one or more HDF results sets

USAGE
  $ saf attest apply -i <input-hdf-json>... <attestation>... -o <output-hdf-path>

FLAGS
  -h, --help              Show CLI help.
  -i, --input=<value>...  (required) Your input HDF and Attestation file(s)
  -o, --output=<value>    (required) Output file or folder (for multiple executions)

EXAMPLES
  $ saf attest apply -i hdf.json attestation.json -o new-hdf.json

  $ saf attest apply -i hdf1.json hdf2.json attestation.xlsx -o outputDir
```
[top](#usage)
### Convert

Translating your data to and from Heimdall Data Format (HDF) is done using the `saf convert` command.

Want to Recommend or Help Develop a Converter? See [the wiki](https://github.com/mitre/saf/wiki/How-to-recommend-development-of-a-mapper) 📰 on how to get started.


### Convert From HDF


#### HDF to ASFF

***Note:*** Uploading findings into AWS Security hub requires configuration of the AWS CLI, see 👉 [the AWS documentation](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html) or configuration of environment variables via Docker.

```
convert hdf2asff              Translate a Heimdall Data Format JSON file into
                              AWS Security Findings Format JSON file(s) and/or
                              upload to AWS Security Hub
  USAGE
    $ saf convert hdf2asff -a <account-id> -r <region> -i <hdf-scan-results-json> -t <target> [-h] [-R] (-u [-I -C <certificate>] | [-o <asff-output-folder>])

  FLAGS
    -C, --certificate=<certificate>           Trusted signing certificate file
    -I, --insecure                            Disable SSL verification, this is insecure.
    -R, --specifyRegionAttribute              Manually specify the top-level `Region` attribute - SecurityHub
                                              populates this attribute automatically and prohibits one from
                                              updating it using `BatchImportFindings` or `BatchUpdateFindings`
    -a, --accountId=<account-id>              (required) AWS Account ID
    -h, --help                                Show CLI help.
    -i, --input=<hdf-scan-results-json>       (required) Input HDF JSON File
    -o, --output=<asff-output-folder>         Output ASFF JSON Folder
    -r, --region=<region>          (required) SecurityHub Region
    -t, --target=<target>          (required) Unique name for target to track findings across time
    -u, --upload                  Upload findings to AWS Security Hub
  EXAMPLES
    $ saf convert hdf2asff -i rhel7-scan_02032022A.json -a 123456789 -r us-east-1 -t rhel7_example_host -o rhel7.asff
    $ saf convert hdf2asff -i rds_mysql_i123456789scan_03042022A.json -a 987654321 -r us-west-1 -t Instance_i123456789 -u
    $ saf convert hdf2asff -i snyk_acme_project5_hdf_04052022A.json -a 2143658798 -r us-east-1 -t acme_project5 -o snyk_acme_project5 -u
```
[top](#convert-hdf-to-other-formats)
#### HDF to Splunk

**Notice**: HDF to Splunk requires configuration on the Splunk server. See 👉 [Splunk Configuration](https://github.com/mitre/saf/wiki/Splunk-Configuration).

```
convert hdf2splunk            Translate and upload a Heimdall Data Format JSON file into a Splunk server

  USAGE
    $ saf convert hdf2splunk -i <hdf-scan-results-json> -H <host> -I <index> [-h] [-P <port>] [-s http|https] [-u <username> | -t <token>] [-p <password>] [-L info|warn|debug|verbose]

  FLAGS
    -H, --host=<host>                       (required) Splunk Hostname or IP
    -I, --index=<index>                     (required) Splunk index to import HDF data into
    -L, --logLevel=<option>                 [default: info]
                                            <options: info|warn|debug|verbose>
    -P, --port=<port>                       [default: 8089] Splunk management port (also known as the Universal Forwarder port)
    -h, --help                              Show CLI help.
    -i, --input=<hdf-scan-results-json>     (required) Input HDF file
    -p, --password=<password>               Your Splunk password
    -s, --scheme=<option>                   [default: https] HTTP Scheme used for communication with splunk
                                            <options: http|https>
    -t, --token=<token>                     Your Splunk API Token
    -u, --username=<username>               Your Splunk username

  EXAMPLES
    $ saf convert hdf2splunk -i rhel7-results.json -H 127.0.0.1 -u admin -p Valid_password! -I hdf
    $ saf convert hdf2splunk -i rhel7-results.json -H 127.0.0.1 -t your.splunk.token -I hdf
```

For HDF Splunk Schema documentation visit 👉 [Heimdall converter schemas](https://github.com/mitre/heimdall2/blob/master/libs/hdf-converters/src/converters-from-hdf/splunk/Schemas.md#schemas)

**Previewing HDF Data Within Splunk:**

An example of a full raw search query:
```sql
index="<<YOUR INDEX>>" meta.subtype=control | stats  values(meta.filename) values(meta.filetype) list(meta.profile_sha256) values(meta.hdf_splunk_schema) first(meta.status)  list(meta.status)  list(meta.is_baseline) values(title) last(code) list(code) values(desc) values(descriptions.*)  values(id) values(impact) list(refs{}.*) list(results{}.*) list(source_location{}.*) values(tags.*)  by meta.guid id
| join  meta.guid
    [search index="<<YOUR INDEX>>"  meta.subtype=header | stats values(meta.filename) values(meta.filetype) values(meta.hdf_splunk_schema) list(statistics.duration)  list(platform.*) list(version)  by meta.guid]
| join meta.guid
    [search index="<<YOUR INDEX>>"  meta.subtype=profile | stats values(meta.filename) values(meta.filetype) values(meta.hdf_splunk_schema) list(meta.profile_sha256) list(meta.is_baseline)  last(summary) list(summary) list(sha256) list(supports{}.*) last(name) list(name) list(copyright) list(maintainer) list(copyright_email) last(version) list(version) list(license) list(title) list(parent_profile) list(depends{}.*) list(controls{}.*) list(attributes{}.*) list(status) by meta.guid]

```
An example of a formatted table search query:
```sql
index="<<YOUR INDEX>>" meta.subtype=control | stats  values(meta.filename) values(meta.filetype) list(meta.profile_sha256) values(meta.hdf_splunk_schema) first(meta.status)  list(meta.status)  list(meta.is_baseline) values(title) last(code) list(code) values(desc) values(descriptions.*)  values(id) values(impact) list(refs{}.*) list(results{}.*) list(source_location{}.*) values(tags.*)  by meta.guid id
| join  meta.guid
    [search index="<<YOUR INDEX>>"  meta.subtype=header | stats values(meta.filename) values(meta.filetype) values(meta.hdf_splunk_schema) list(statistics.duration)  list(platform.*) list(version)  by meta.guid]
| join meta.guid
    [search index="<<YOUR INDEX>>"  meta.subtype=profile | stats values(meta.filename) values(meta.filetype) values(meta.hdf_splunk_schema) list(meta.profile_sha256) list(meta.is_baseline)  last(summary) list(summary) list(sha256) list(supports{}.*) last(name) list(name) list(copyright) list(maintainer) list(copyright_email) last(version) list(version) list(license) list(title) list(parent_profile) list(depends{}.*) list(controls{}.*) list(attributes{}.*) list(status) by meta.guid]
| rename values(meta.filename) AS "Results Set", values(meta.filetype) AS "Scan Type", list(statistics.duration) AS "Scan Duration", first(meta.status) AS "Control Status", list(results{}.status) AS "Test(s) Status", id AS "ID", values(title) AS "Title", values(desc) AS "Description", values(impact) AS "Impact", last(code) AS Code, values(descriptions.check) AS "Check", values(descriptions.fix) AS "Fix", values(tags.cci{}) AS "CCI IDs", list(results{}.code_desc) AS "Results Description",  list(results{}.skip_message) AS "Results Skip Message (if applicable)", values(tags.nist{}) AS "NIST SP 800-53 Controls", last(name) AS "Scan (Profile) Name", last(summary) AS "Scan (Profile) Summary", last(version) AS "Scan (Profile) Version"
| table meta.guid "Results Set" "Scan Type" "Scan (Profile) Name" ID "NIST SP 800-53 Controls" Title "Control Status" "Test(s) Status" "Results Description" "Results Skip Message (if applicable)"  Description Impact Severity  Check Fix "CCI IDs" Code "Scan Duration" "Scan (Profile) Summary" "Scan (Profile) Version"
```
[top](#convert-hdf-to-other-formats)
#### HDF to XCCDF Results
```
convert hdf2xccdf             Translate an HDF file into an XCCDF XML

  USAGE
    $ saf convert hdf2xccdf -i <hdf-scan-results-json> -o <output-xccdf-xml> [-h]

  FLAGS
    -h, --help                              Show CLI help.
    -i, --input=<hdf-scan-results-json>     (required) Input HDF file
    -o, --output=<output-xccdf-xml>         (required) Output XCCDF XML File

  EXAMPLES
    $ saf convert hdf2xccdf -i hdf_input.json -o xccdf-results.xml
```
[top](#convert-hdf-to-other-formats)
#### HDF to Checklist
```
convert hdf2ckl               Translate a Heimdall Data Format JSON file into a
                              DISA checklist file

  USAGE
    $ saf convert hdf2ckl -i <hdf-scan-results-json> -o <output-ckl> [-h] [-m <metadata>] [-H <hostname>] [-F <fqdn>] [-M <mac-address>] [-I <ip-address>]

  FLAGS
    -F, --fqdn=<fqdn>                       FQDN for CKL metadata
    -H, --hostname=<hostname>               Hostname for CKL metadata
    -I, --ip=<ip-address>                   IP address for CKL metadata
    -M, --mac=<mac-address>                 MAC address for CKL metadata
    -h, --help                              Show CLI help.
    -i, --input=<hdf-scan-results-json>     (required) Input HDF file
    -m, --metadata=<metadata>               Metadata JSON file, generate one with "saf generate ckl_metadata"
    -o, --output=<output-ckl>               (required) Output CKL file

  EXAMPLES
    $ saf convert hdf2ckl -i rhel7-results.json -o rhel7.ckl --fqdn reverseproxy.example.org --hostname reverseproxy --ip 10.0.0.3 --mac 12:34:56:78:90
```
[top](#convert-hdf-to-other-formats)
#### HDF to CSV
```
convert hdf2csv               Translate a Heimdall Data Format JSON file into a
                              Comma Separated Values (CSV) file

  USAGE
    $ saf convert hdf2csv -i <hdf-scan-results-json> -o <output-csv> [-h] [-f <csv-fields>] [-t]

  FLAGS
    -f, --fields=<csv-fields>               [default: All Fields] Fields to include in output CSV, separated by commas
    -h, --help                              Show CLI help.
    -i, --input=<hdf-scan-results-json>     (required) Input HDF file
    -o, --output=<output-csv>               (required) Output CSV file
    -t, --noTruncate                        Do not truncate fields longer than 32,767 characters (the cell limit in Excel)

  EXAMPLES
    $ saf convert hdf2csv -i rhel7-results.json -o rhel7.csv --fields "Results Set,Status,ID,Title,Severity"
```
[top](#convert-hdf-to-other-formats)
#### HDF to Condensed JSON
```
convert hdf2condensed         Condensed format used by some community members
                              to pre-process data for elasticsearch and custom dashboards

  USAGE
    $ saf convert hdf2condensed -i <hdf-scan-results-json> -o <condensed-json> [-h]

  FLAGS
    -h, --help            Show CLI help.
    -i, --input=<hdf-scan-results-json>     (required) Input HDF file
    -o, --output=<condensed-json>           (required) Output condensed JSON file

  EXAMPLES
    $ saf convert hdf2condensed -i rhel7-results.json -o rhel7-condensed.json
```
[top](#convert-hdf-to-other-formats)

---
### Convert To HDF

#### ASFF to HDF

Output|Use|Command
---|---|---
ASFF json|All the findings that will be fed into the mapper|aws securityhub get-findings > asff.json
AWS SecurityHub enabled standards json|Get all the enabled standards so you can get their identifiers|aws securityhub get-enabled-standards > asff_standards.json
AWS SecurityHub standard controls json|Get all the controls for a standard that will be fed into the mapper|aws securityhub describe-standards-controls --standards-subscription-arn "arn:aws:securityhub:us-east-1:123456789123:subscription/cis-aws-foundations-benchmark/v/1.2.0" > asff_cis_standard.json


```
convert asff2hdf              Translate a AWS Security Finding Format JSON into a
                              Heimdall Data Format JSON file(s)
  USAGE
    $ saf convert asff2hdf -o <hdf-output-folder> [-h] (-i <asff-json> [--securityhub <standard-json>]... | -a -r <region> [-I | -C <certificate>] [-t <target>]) [-L info|warn|debug|verbose]

  FLAGS
    -C, --certificate=<certificate>       Trusted signing certificate file
    -I, --insecure                        Disable SSL verification, this is insecure.
    -L, --logLevel=<option>               [default: info]
                                          <options: info|warn|debug|verbose>
    -a, --aws                             Pull findings from AWS Security Hub
    -h, --help                            Show CLI help.
    -i, --input=<asff-json>               Input ASFF JSON file
    -o, --output=<hdf-output-folder>      (required) Output HDF JSON folder
    -r, --region=<region>                 Security Hub region to pull findings from
    -t, --target=<target>...              Target ID(s) to pull from Security Hub (maximum 10), leave blank for non-HDF findings
    --securityhub=<standard-json>...      Additional input files to provide context that an ASFF file needs
                                          such as the CIS AWS Foundations or AWS Foundational Security Best
                                          Practices documents (in ASFF compliant JSON form)

  EXAMPLES
    $ saf convert asff2hdf -i asff-findings.json -o output-folder-name
    $ saf convert asff2hdf -i asff-findings.json --securityhub <standard-1-json> ... --securityhub <standard-n-json> -o output-folder-name
    $ saf convert asff2hdf --aws -o out -r us-west-2 --target rhel7
```
[top](#convert-other-formats-to-hdf)
#### AWS Config to HDF

***Note:*** Pulling AWS Config results data requires configuration of the AWS CLI, see 👉 [the AWS documentation](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html) or configuration of environment variables via Docker.

```
convert aws_config2hdf        Pull Configuration findings from AWS Config and convert
                              into a Heimdall Data Format JSON file
  USAGE
    $ saf convert aws_config2hdf -r <region> -o <hdf-scan-results-json> [-h] [-a <access-key-id>] [-s <secret-access-key>] [-t <session-token>] [-i]

  FLAGS
    -a, --accessKeyId=<access-key-id>           Access key ID
    -h, --help                                  Show CLI help.
    -i, --insecure                              Disable SSL verification, this is insecure.
    -o, --output=<hdf-scan-results-json>        (required) Output HDF JSON File
    -r, --region=<region>                       (required) Region to pull findings from
    -s, --secretAccessKey=<secret-access-key>   Secret access key
    -t, --sessionToken=<session-token>          Session token

  EXAMPLES
    $ saf convert aws_config2hdf -a ABCDEFGHIJKLMNOPQRSTUV -s +4NOT39A48REAL93SECRET934 -r us-east-1 -o output-hdf-name.json
```
[top](#convert-other-formats-to-hdf)
#### Burp Suite to HDF
```
convert burpsuite2hdf         Translate a BurpSuite Pro XML file into a Heimdall
                              Data Format JSON file
  USAGE
    $ saf convert burpsuite2hdf -i <burpsuite-xml> -o <hdf-scan-results-json> [-h]

  FLAGS
    -h, --help                              Show CLI help.
    -i, --input=<burpsuite-xml>             (required) Input Burpsuite Pro XML File
    -o, --output=<hdf-scan-results-json>    (required) Output HDF JSON File

  EXAMPLES
    $ saf convert burpsuite2hdf -i burpsuite_results.xml -o output-hdf-name.json
```
[top](#convert-other-formats-to-hdf)
#### CKL to POA&M

Note: The included CCI to NIST Mappings are the extracted from NIST.gov, for mappings specific to eMASS use [this](https://github.com/mitre/ckl2POAM/blob/main/resources/cci2nist.json) file instead).

```
convert ckl2POAM              Translate DISA Checklist CKL file(s) to POA&M files

  USAGE
    $ saf convert ckl2POAM -i <disa-checklist> -o <poam-output-folder> [-h] [-O <office/org>] [-d <device-name>] [-s <num-rows>]

  FLAGS
    -O, --officeOrg=<office/org>          Default value for Office/org (prompts for each file if not set)
    -d, --deviceName=<device-name>        Name of target device (prompts for each file if not set)
    -h, --help                            Show CLI help.
    -i, --input=<disa-checklist>...       (required) Path to the DISA Checklist File(s)
    -o, --output=<poam-output-folder>     (required) Path to output PO&M File(s)
    -s, --rowsToSkip=<num-rows>           [default: 4] Rows to leave between POA&M Items for milestones

  ALIASES
    $ saf convert ckl2poam

  EXAMPLES
    $ saf convert ckl2POAM -i checklist_file.ckl -o output-folder -d abcdefg -s 2
```
[top](#convert-other-formats-to-hdf)
#### DBProtect to HDF
```
convert dbprotect2hdf         Translate a DBProtect report in "Check Results
                              Details" XML format into a Heimdall Data Format JSON file
  USAGE
    $ saf convert dbprotect2hdf -i <dbprotect-xml> -o <hdf-scan-results-json> [-h]

  FLAGS
    -h, --help                            Show CLI help.
    -i, --input=<dbprotect-xml>           (required) 'Check Results Details' XML File
    -o, --output=<hdf-scan-results-json>  (required) Output HDF JSON File

  EXAMPLES
    $ saf convert dbprotect2hdf -i check_results_details_report.xml -o output-hdf-name.json
```

[top](#convert-other-formats-to-hdf)
#### Fortify to HDF
```
convert fortify2hdf           Translate a Fortify results FVDL file into a Heimdall
                              Data Format JSON file; the FVDL file is an XML that can be
                              extracted from the Fortify FPR project file using standard
                              file compression tools
  USAGE
    $ saf convert fortify2hdf -i <fortify-fvdl> -o <hdf-scan-results-json> [-h]

  FLAGS
    -h, --help                            Show CLI help.
    -i, --input=<fortify-fvdl>            (required) Input FVDL File
    -o, --output=<hdf-scan-results-json>  (required) Output HDF JSON File

  EXAMPLES
    $ saf convert fortify2hdf -i audit.fvdl -o output-hdf-name.json
```

[top](#convert-other-formats-to-hdf)
#### GoSec to HDF
```
convert gosec2hdf             Translate a GoSec (Golang Security Checker) results file
                              into a Heimdall Data Format JSON file
  USAGE
    $ saf convert gosec2hdf -i <gosec-json> -o <hdf-scan-results-json> [-h]

  FLAGS
    -h, --help            Show CLI help.
    -i, --input=<value>   (required) Input GoSec Results JSON File
    -o, --output=<value>  (required) Output HDF JSON File

  EXAMPLES
    $ saf convert gosec2hdf -i gosec_results.json -o output-hdf-name.json
```

[top](#convert-other-formats-to-hdf)
#### Ion Channel 2 HDF
```
convert ionchannel2hdf        Pull and translate SBOM data from Ion Channel
                              into Heimdall Data Format
  USAGE
    $ saf convert ionchannel2hdf -o <hdf-output-folder> [-h] (-i <ionchannel-json> | -a <api-key> -t <team-name> [--raw ] [-p <project>] [-A ]) [-L info|warn|debug|verbose]

  FLAGS
    -A, --allProjects                   Pull all projects available within your team
    -L, --logLevel=<option>             [default: info]
                                        <options: info|warn|debug|verbose>
    -a, --apiKey=<api-key>              API Key from Ion Channel user settings
    -h, --help                          Show CLI help.
    -i, --input=<ionchannel-json>...    Input IonChannel JSON file
    -o, --output=<hdf-output-folder>    (required) Output JSON folder
    -p, --project=<project>...          The name of the project(s) you would like to pull
    -t, --teamName=<team-name>          Your team name that contains the project(s) you would like to pull data from
    --raw                               Output Ion Channel raw data
```

[top](#convert-other-formats-to-hdf)
#### JFrog Xray to HDF
```
convert jfrog_xray2hdf        Translate a JFrog Xray results JSON file into a
                              Heimdall Data Format JSON file
  USAGE
    $ saf convert jfrog_xray2hdf -i <jfrog-xray-json> -o <hdf-scan-results-json> [-h]

  FLAGS
    -h, --help                            Show CLI help.
    -i, --input=<jfrog-xray-json>         (required) Input JFrog JSON File
    -o, --output=<hdf-scan-results-json>  (required) Output HDF JSON File

  EXAMPLES
    $ saf convert jfrog_xray2hdf -i xray_results.json -o output-hdf-name.json
```

[top](#convert-other-formats-to-hdf)
#### Tenable Nessus to HDF
```
convert nessus2hdf            Translate a Nessus XML results file into a Heimdall
                              Data Format JSON file. The current iteration maps all
                              plugin families except for 'Policy Compliance'
                              A separate HDF JSON is generated for each host reported in the Nessus Report.
  USAGE
    $ saf convert nessus2hdf -i <nessus-xml> -o <hdf-scan-results-json> [-h]

  FLAGS
    -h, --help                            Show CLI help.
    -i, --input=<nessus-xml>              (required) Input Nessus XML File
    -o, --output=<hdf-scan-results-json>  (required) Output HDF JSON File

  EXAMPLES
    $ saf convert nessus2hdf -i nessus_results.xml -o output-hdf-name.json
```

[top](#convert-other-formats-to-hdf)
#### Netsparker to HDF
```
convert netsparker2hdf        Translate a Netsparker XML results file into a
                              Heimdall Data Format JSON file. The current
                              iteration only works with Netsparker Enterprise
                              Vulnerabilities Scan.
  USAGE
    $ saf convert netsparker2hdf -i <netsparker-xml> -o <hdf-scan-results-json> [-h]

  FLAGS
    -h, --help                            Show CLI help.
    -i, --input=<netsparker-xml>          (required) Input Netsparker XML File
    -o, --output=<hdf-scan-results-json>  (required) Output HDF JSON File

  EXAMPLES
    $ saf convert netsparker2hdf -i netsparker_results.xml -o output-hdf-name.json
```

[top](#convert-other-formats-to-hdf)
#### Nikto to HDF
```
convert nikto2hdf             Translate a Nikto results JSON file into a Heimdall
                              Data Format JSON file.
                              Note: Currently this mapper only supports single
                              target Nikto Scans
  USAGE
    $ saf convert nikto2hdf -i <nikto-json> -o <hdf-scan-results-json> [-h]

  FLAGS
    -h, --help                            Show CLI help.
    -i, --input=<nikto-json>              (required) Input Niktop Results JSON File
    -o, --output=<hdf-scan-results-json>  (required) Output HDF JSON File

  EXAMPLES
    $ saf convert nikto2hdf -i nikto-results.json -o output-hdf-name.json
```
[top](#convert-other-formats-to-hdf)
#### Prisma to HDF
```
convert prisma2hdf            Translate a Prisma Cloud Scan Report CSV file into
                              Heimdall Data Format JSON files
  USAGE
    $ saf convert prisma2hdf -i <prisma-cloud-csv> -o <hdf-output-folder> [-h]

  FLAGS
    -h, --help                        Show CLI help.
    -i, --input=<prisma-cloud-csv>    (required) Prisma Cloud Scan Report CSV
    -o, --output=<hdf-output-folder>  (required) Output HDF JSON file

  EXAMPLES
    $ saf convert prisma2hdf -i prismacloud-report.csv -o output-hdf-name.json
```
[top](#convert-other-formats-to-hdf)
#### Prowler to HDF
```
convert prowler2hdf           Translate a Prowler-derived AWS Security Finding
                              Format results from JSONL
                              into a Heimdall Data Format JSON file
  USAGE
    $ saf convert prowler2hdf -i <prowler-finding-json> -o <hdf-output-folder> [-h]

  FLAGS
    -h, --help                            Show CLI help.
    -i, --input=<prowler-finding-json>    (required) Input Prowler ASFF JSON File
    -o, --output=<hdf-output-folder>      (required) Output HDF JSON Folder

  EXAMPLES
    $ saf convert prowler2hdf -i prowler-asff.json -o output-folder
```
[top](#convert-other-formats-to-hdf)
#### Sarif to HDF
```
convert sarif2hdf             Translate a SARIF JSON file into a Heimdall Data
                              Format JSON file
  USAGE
    $ saf convert sarif2hdf -i <sarif-json> -o <hdf-scan-results-json> [-h]

  FLAGS
    -h, --help                            Show CLI help.
    -i, --input=<sarif-json>              (required) Input SARIF JSON File
    -o, --output=<hdf-scan-results-json>  (required) Output HDF JSON File

  DESCRIPTION
    SARIF level to HDF impact Mapping:
    SARIF level error -> HDF impact 0.7
    SARIF level warning -> HDF impact 0.5
    SARIF level note -> HDF impact 0.3
    SARIF level none -> HDF impact 0.1
    SARIF level not provided -> HDF impact 0.1 as default

  EXAMPLES
    $ saf convert sarif2hdf -i sarif-results.json -o output-hdf-name.json
```

[top](#convert-other-formats-to-hdf)
#### Scoutsuite to HDF
```
convert scoutsuite2hdf        Translate a ScoutSuite results from a Javascript
                              object into a Heimdall Data Format JSON file

                              Note: Currently this mapper only supports AWS
  USAGE
    $ saf convert scoutsuite2hdf -i <scoutsuite-results-js> -o <hdf-scan-results-json> [-h]

  FLAGS
    -h, --help                            Show CLI help.
    -i, --input=<scoutsuite-results-js>   (required) Input ScoutSuite Results JS File
    -o, --output=<hdf-scan-results-json>  (required) Output HDF JSON File

  EXAMPLES
    $ saf convert scoutsuite2hdf -i scoutsuite-results.js -o output-hdf-name.json
```
[top](#convert-other-formats-to-hdf)
#### Snyk to HDF
```
convert snyk2hdf              Translate a Snyk results JSON file into a Heimdall
                              Data Format JSON file
                              A separate HDF JSON is generated for each project
                              reported in the Snyk Report
  USAGE
    $ saf convert snyk2hdf -i <snyk-json> -o <hdf-scan-results-json> [-h]

  FLAGS
    -h, --help                            Show CLI help.
    -i, --input=<snyk-json>               (required) Input Snyk Results JSON File
    -o, --output=<hdf-scan-results-json>  (required) Output HDF JSON File

  EXAMPLES
    $ saf convert snyk2hdf -i snyk_results.json -o output-file-prefix
```
[top](#convert-other-formats-to-hdf)
#### SonarQube to HDF
```
convert sonarqube2hdf         Pull SonarQube vulnerabilities for the specified
                              project name and optional branch or pull/merge
                              request ID name from an API and convert into a
                              Heimdall Data Format JSON file
  USAGE
    $ saf convert sonarqube2hdf -n <sonar-project-key> -u <http://your.sonar.instance:9000> -a <your-sonar-api-key> [ -b <target-branch> | -p <pull-request-id> ] -o <hdf-scan-results-json>

  FLAGS
    -a, --auth=<your-sonar-api-key>               (required) SonarQube API Key
    -b, --branch=<target-branch>                  Requires Sonarqube Developer Edition or above
    -h, --help                                    Show CLI help.
    -n, --projectKey=<sonar-project-key>          (required) SonarQube Project Key
    -o, --output=<hdf-scan-results-json>          (required) Output HDF JSON File
    -p, --pullRequestID=<pull-request-id>         Requires Sonarqube Developer Edition or above
    -u, --url=<http://your.sonar.instance:9000>   (required) SonarQube Base URL (excluding '/api')

  EXAMPLES
    $ saf convert sonarqube2hdf -n sonar_project_key -u http://sonar:9000 --auth abcdefg -p 123 -o scan_results.json
```

[top](#convert-other-formats-to-hdf)
#### Splunk to HDF
```
convert splunk2hdf            Pull HDF data from your Splunk instance back into an HDF file

  USAGE
    $ saf splunk2hdf -H <host> -I <index> [-h] [-P <port>] [-s http|https] (-u <username> -p <password> | -t <token>) [-L info|warn|debug|verbose] [-i <filename/GUID> -o <hdf-output-folder>]

  FLAGS
    -H, --host=<host>                   (required) Splunk Hostname or IP
    -I, --index=<index>                 (required) Splunk index to query HDF data from
    -L, --logLevel=<option>             [default: info]
                                        <options: info|warn|debug|verbose>
    -P, --port=<port>                   [default: 8089] Splunk management port (also known as the Universal Forwarder port)
    -h, --help                          Show CLI help.
    -i, --input=<filename/GUID>...      GUID(s) or Filename(s) of files from Splunk to convert
    -o, --output=<hdf-output-folder>    Output HDF JSON Folder
    -p, --password=<password>           Your Splunk password
    -s, --scheme=<option>               [default: https] HTTP Scheme used for communication with splunk
                                        <options: http|https>
    -t, --token=<token>                 Your Splunk API Token
    -u, --username=<username>           Your Splunk username

  EXAMPLES
    $ saf convert splunk2hdf -H 127.0.0.1 -u admin -p Valid_password! -I hdf -i some-file-in-your-splunk-instance.json -i yBNxQsE1mi4f3mkjtpap5YxNTttpeG -o output-folder
```

[top](#convert-other-formats-to-hdf)
#### Trivy to HDF
```
convert trivy2hdf             Translate a Trivy-derived AWS Security Finding
                              Format results from JSONL
                              into a Heimdall Data Format JSON file
  USAGE
    $ saf convert trivy2hdf -i <trivy-finding-json> -o <hdf-output-folder>

  FLAGS
    -h, --help                        Show CLI help.
    -i, --input=<trivy-finding-json>  (required) Input Trivy ASFF JSON File
    -o, --output=<hdf-output-folder>  (required) Output HDF JSON Folder

  DESCRIPTION
    Note: Currently this mapper only supports the results of Trivy's `image`
    subcommand (featuring the CVE findings) while using the ASFF template format
    (which comes bundled with the repo).  An example call to Trivy to get this
    type of file looks as follows:
    AWS_REGION=us-east-1 AWS_ACCOUNT_ID=123456789012 trivy image --no-progress --format template --template "@/absolute_path_to/git_clone_of/trivy/contrib/asff.tpl" -o trivy_asff.json golang:1.12-alpine

  EXAMPLES
    $ saf convert trivy2hdf -i trivy-asff.json -o output-folder
```

[top](#convert-other-formats-to-hdf)
#### Twistlock to HDF
```
convert twistlock2hdf         Translate a Twistlock CLI output file into an HDF results set

  USAGE
    $ saf convert twistlock2hdf -i <twistlock-json> -o <hdf-scan-results-json>

  FLAGS
    -h, --help                            Show CLI help.
    -i, --input=<twistlock-json>          (required) Input Twistlock file
    -o, --output=<hdf-scan-results-json>  (required) Output HDF JSON File

  EXAMPLES
    $ saf convert twistlock2hdf -i twistlock.json -o output-hdf-name.json
```

[top](#convert-other-formats-to-hdf)
#### Veracode to HDF
```
convert veracode2hdf          Translate a Veracode XML file into a Heimdall Data
                              Format JSON file
  USAGE
    $ saf convert veracode2hdf -i <veracode-xml> -o <hdf-scan-results-json> [-h]

  FLAGS
    -h, --help                            Show CLI help.
    -i, --input=<veracode-xml>            (required) Input Veracode XML File
    -o, --output=<hdf-scan-results-json>  (required) Output HDF JSON File

  EXAMPLES
    $ saf convert veracode2hdf -i veracode_results.xml -o output-hdf-name.json
```

#### XCCDF Results to HDF
***Note:*** `xccdf_results2hdf` only supports native OpenSCAP and SCC output.
```

[top](#convert-other-formats-to-hdf)
convert xccdf_results2hdf     Translate a SCAP client XCCDF-Results XML report
                              to a Heimdall Data Format JSON file
  USAGE
    $ saf convert xccdf_results2hdf -i <xccdf-results-xml> -o <hdf-scan-results-json> [-h]

  FLAGS
    -h, --help            Show CLI help.
    -i, --input=<xccdf-results-xml>       (required) Input XCCDF Results XML File
    -o, --output=<hdf-scan-results-json>  (required) Output HDF JSON File

  EXAMPLES
    $ saf convert xccdf_results2hdf -i results-xccdf.xml -o output-hdf-name.json
```

[top](#convert-other-formats-to-hdf)
#### OWASP ZAP to HDF
```
convert zap2hdf               Translate a OWASP ZAP results JSON to a Heimdall Data Format JSON file

  USAGE
    $ saf convert zap2hdf -i <zap-json> -n <target-site-name> -o <hdf-scan-results-json> [-h]

  FLAGS
    -h, --help                            Show CLI help.
    -i, --input=<zap-json>                (required) Input OWASP Zap Results JSON File
    -n, --name=<target-site-name>         (required) Target Site Name
    -o, --output=<hdf-scan-results-json>  (required) Output HDF JSON File

  EXAMPLES
    $ saf convert zap2hdf -i zap_results.json -n mitre.org -o scan_results.json
```
[top](#convert-other-formats-to-hdf)

---

### eMASS API CLI

The SAF CLI implements the eMASS REST API capabilities via the emasser CLI incorporated here with the SAF CLI. Please references the [emasser Features](https://saf-cli.mitre.org/docs/emasser) 📜 for additional information

To get top level help execute the following commad:

```
$ saf emasser [-h or -help]
[eMASS]        The eMASS REST API implementation

USAGE
  $ saf emasser COMMAND

TOPICS
  emasser delete  eMass REST API DELETE endpoint commands
  emasser get     eMass REST API GET endpoint commands
  emasser post    eMass REST API POST endpoint commands
  emasser put     eMass REST API PUT endpoint commands

COMMANDS
  emasser configure  Generate a configuration file (.env) for accessing an eMASS instances.
  emasser version    Display the eMASS API specification version the CLI implements.
```

[top](#emasser-client)

___

### View

#### Heimdall

You can start a local Heimdall Lite instance to visualize your findings with the SAF CLI. To start an instance use the `saf view heimdall` command:

```shell
view heimdall                 Run an instance of Heimdall Lite to
                              visualize your data
  USAGE
    $ saf view heimdall [-h] [-p <port>] [-f <file>] [-n]

  FLAGS
    -f, --files=<file>...   File(s) to display in Heimdall
    -h, --help              Show CLI help.
    -n, --noOpenBrowser     Do not open the default browser automatically
    -p, --port=<port>       [default: 3000] Port To Expose Heimdall On (Default 3000)

  ALIASES
    $ saf heimdall

  EXAMPLES
    $ saf view heimdall -p 8080
```
[top](#view-hdf-summaries-and-data)

#### Summary

Generate a comprehensive summary of compliance data, including totals and counts, from your OHDF files.

The output can be displayed in the console, or exported as YAML, JSON, or a GitHub-flavored Markdown table.

```powershell
USAGE
  $ saf view summary -i <value> [-o <value>] [-f json|yaml|markdown] [-s]
    [-r] [-t] [-l <value>] [-h]

FLAGS
  -h, --help  Show help information

FORMATTING FLAGS
  -f, --format=<option>    [default: yaml] Specify output format
                           <options: json|yaml|markdown>
  -r, --[no-]print-pretty  Enable human-readable data output
  -t, --[no-]title-table   Add titles to the markdown table(s)

I/O FLAGS
  -i, --input=<value>...  (required) Specify input HDF file(s)
  -o, --output=<value>    Specify output file(s)
  -s, --[no-]stdout       Enable printing to console

DEBUGGING FLAGS
  -l, --logLevel=<value>  [default: info] Set log level

DESCRIPTION
  Generate a comprehensive summary of compliance data, including totals and
  counts, from your HDF files. The output can be displayed in the console, or
  exported as YAML, JSON, or a GitHub-flavored Markdown table.

ALIASES
  $ saf summary

EXAMPLES
  $ saf summary -i input.hdf                                              # Summarize 'input.hdf' single HDF file
  $ saf summary -i input.json --format=json                               # Specify Formats
  $ saf summary -i input.json --format=markdown --no-stdout -o output.md  # Output GitHub Flavored Markdown Table, skip the console, and save to 'output.md'
  $ saf summary --input input1.hdf --input input2.hdf                     # Summarize multiple HDF files
  $ saf summary --input input1.hdf input2.hdf
  $ saf summary -i input.hdf --output output.json                         # Save summary to 'output.json' and print to the console
  $ saf summary --input input.hdf --pretty-print                          # Enable human-readable output
  $ saf summary -i input.hdf --no-pretty-print                            # Useful for scripts or data-processing (RAW yaml/json/etc.)
```
[top](#view-hdf-summaries-and-data)

---

### Validate

#### Thresholds

See the wiki for more information on 👉 [template files](https://github.com/mitre/saf/wiki/Validation-with-Thresholds).

```
validate threshold            Validate the compliance and status counts of an HDF file

  USAGE
    $ saf validate threshold -i <hdf-json> [-h] [-T <flattened-threshold-json> | -F <template-file>]

  FLAGS
    -F, --templateFile=<template-file>                Expected data template, generate one with "saf generate threshold"
    -T, --templateInline=<flattened-threshold-json>   Flattened JSON containing your validation thresholds
                                                      (Intended for backwards compatibility with InSpec Tools)
    -h, --help                                        Show CLI help.
    -i, --input=<hdf-json>                            (required) Input HDF JSON File

  EXAMPLES
    $ saf validate threshold -i rhel7-results.json -F output.yaml
```

[top](#validate-hdf-thresholds)

---

### Generate

#### Delta

See the wiki for more information on 👉 [Delta](https://github.com/mitre/saf/wiki/Delta-(WIP)).

```
Update an existing InSpec profile with updated XCCDF guidance

USAGE
  $ saf generate delta -J <value> -X <value> -o <value> [-h] [-O <value>] [-r <value>] [-T rule|group|cis|version] [-L info|warn|debug|verbose]

FLAGS
  -h, --help               Show CLI help.
  -J, --inspecJsonFile=<value>  (required) Input execution/profile JSON file - can be generated using the "inspec json <profile path> | jq . > profile.json" command
  -X, --xccdfXmlFile=<value>    (required) The XCCDF XML file containing the new guidance - in the form of .xml file
  -o, --outputFolder=<value>    (required) The output folder for the updated profile - if not empty it will be overwritten
  -O, --ovalXmlFile=<value>     The OVAL XML file containing definitions used in the new guidance - in the form of .xml file
  -T, --idType=<option>         [default: rule] Control ID Types: 
                                'rule' - Vulnerability IDs (ex. 'SV-XXXXX'), 
                                'group' - Group IDs (ex. 'V-XXXXX'), 
                                'cis' - CIS Rule IDs (ex. C-1.1.1.1), 
                                'version' - Version IDs (ex. RHEL-07-010020 - also known as STIG IDs)
                                <options: rule|group|cis|version>
  -r, --report=<value>          Output markdown report file - must have an extension of .md
  -L, --logLevel=<option>       [default: info]
                                <options: info|warn|debug|verbose>

EXAMPLES
  $ saf generate delta -J ./the_profile_json_file.json -X ./the_xccdf_guidance_file.xml  -o the_output_directory -O ./the_oval_file.xml -T group -r the_update_report_file.md -L debug
```
[top](#generate-data-reports-and-more)

#### Delta Supporting Options
Use this process prior of running `generate delta` if the updated guidance's have new control numbers and/or to format the controls how `generate delta` will. Running this process minimizes the delta output content and makes for better and easier visualization of the modification provided by the Delta process.

```
USAGE
  $ saf generate update_controls4delta -X <value> -J <value> -c <value> [-P V|VS] [--[no-]useXccdfGroupId] [--[no-]backupControls] [--[no-]formatControls] [-L info|warn|debug|verbose]

FLAGS
  -h, --help                    Show CLI help.
  -X, --xccdfXmlFile=<value>    (required) The XCCDF XML file containing the new guidance - in the form of an .xml file
  -c, --controlsDir=<value>     (required) The InSpec profile controls directory containing the profiles to be updated  
  -J, --inspecJsonFile=<value>  Input execution/profile JSON file - can be generated using the "inspec json <profile path> > profile.json" command. If not provided the `inspec` CLI must be installed
  -P, --controlPrefix=<option>  [default: V] Old control number prefix V or SV, default V <options: V|SV>
  -g, --[no-]useXccdfGroupId    Use the XCCDF `Group Id` to rename the controls. Uses prefix V or SV based on controlPrefix option
                                [default: false]
  -b, --[no-]backupControls     Preserve modified controls in a backup directory (oldControls) inside the controls directory
                                [default: true]
  -f, --[no-]formatControls     Format control contents in the same way `generate delta` will write controls
                                [default: true]
  -L, --logLevel=<option>       [default: info] <options: info|warn|debug|verbose> 

EXAMPLES
  $ saf generate update_controls4delta -X ./the_xccdf_guidance_file.xml -c the_controls_directory -L debug
  $ saf generate update_controls4delta -X ./the_xccdf_guidance_file.xml -c the_controls_directory -g -L debug
  $ saf generate update_controls4delta -X ./the_xccdf_guidance_file.xml -J ./the_profile_json -c the_controls_directory -L debug
  $ saf generate update_controls4delta -X ./the_xccdf_guidance_file.xml -c the_controls_directory --no-formatControls -P SV -L debug
  $ saf generate update_controls4delta -X ./the_xccdf_guidance_file.xml -c the_controls_directory --no-backupControls --no-formatControls -P SV -L debug

```
[top](#generate-data-reports-and-more)

#### CKL Templates

Checklist template files are used to give extra information to `saf convert hdf2ckl`.

```
generate ckl_metadata         Generate a checklist metadata template for "saf convert hdf2ckl"

  USAGE
    $ saf generate ckl_metadata -o <json-file> [-h]

  FLAGS
    -h, --help                Show CLI help.
    -o, --output=<json-file>  (required) Output JSON File

  EXAMPLES
    $ saf generate ckl_metadata -o rhel_metadata.json
```
[top](#generate-data-reports-and-more)

#### InSpec Metadata

InSpec metadata files are used to give extra information to `saf convert *2inspec_stub`.

```
generate inspec_metadata      Generate an InSpec metadata template for "saf convert *2inspec_stub"

  USAGE
    $ saf generate inspec_metadata -o <json-file>

  FLAGS
    -h, --help                Show CLI help.
    -o, --output=<json-file>  (required) Output JSON File

  EXAMPLES
    $ saf generate inspec_metadata -o ms_sql_baseline_metadata.json
```
[top](#generate-data-reports-and-more)

#### Thresholds

Threshold files are used in CI to ensure minimum compliance levels and validate control severities and statuses using `saf validate threshold`

See the wiki for more information on 👉 [template files](https://github.com/mitre/saf/wiki/Validation-with-Thresholds).

```
generate threshold            Generate a compliance template for "saf validate threshold".
                              Default output states that you must have your current
                              control counts or better (More Passes and/or less
                              Fails/Skips/Not Applicable/No Impact/Errors)
  USAGE
    $ saf generate threshold -i <hdf-json> [-o <threshold-yaml>] [-h] [-e] [-c]

  FLAGS
    -c, --generateControlIds  Validate control IDs have the correct severity and status
    -e, --exact               All counts should be exactly the same when validating, not just less than or greater than
    -h, --help                Show CLI help.
    -i, --input=<value>       (required) Input HDF JSON File
    -o, --output=<value>      Output Threshold YAML File

  EXAMPLES
    $ saf generate threshold -i rhel7-results.json -e -c -o output.yaml
```
[top](#generate-data-reports-and-more)

#### Spreadsheet (csv/xlsx) to InSpec

You can use `saf generate spreadsheet2inspec_stub` to generate an InSpec profile stub from a spreadsheet file.

```
generate spreadsheet2inspec_stub              Generate an InSpec profile stub from a CSV STIGs or CIS XLSX benchmarks

USAGE
  $ saf generate spreadsheet2inspec_stub -i, --input=<XLSX or CSV> -o, --output=FOLDER

OPTIONS
  -M, --mapping=mapping                      Path to a YAML file with mappings for each field, by default, CIS Benchmark
                                             fields are used for XLSX, STIG Viewer CSV export is used by CSV
  -c, --controlNamePrefix=controlNamePrefix  Prefix for all control IDs
  -f, --format=cis|disa|general              [default: general]
  -i, --input=input                          (required)
  -e, --encodingHeader                       Add the "# encoding: UTF-8" comment at the top of each control
  -l, --lineLength=lineLength                [default: 80] Characters between lines within InSpec controls
  -m, --metadata=metadata                    Path to a JSON file with additional metadata for the inspec.yml file
  -o, --output=output                        (required) [default: profile] Output InSpec profile stub folder


EXAMPLES
  saf generate spreadsheet2inspec_stub -i spreadsheet.xlsx -o profile
```
[top](#generate-data-reports-and-more)

#### XCCDF Benchmark to InSpec Stub
```
generate xccdf_benchmark2inspec_stub              Translate a DISA STIG XCCDF Benchmark XML file into a skeleton for an InSpec profile

USAGE
  $ saf generate xccdf_benchmark2inspec_stub -i <stig-xccdf-xml> [-o <output-folder>] [-h] [-m <metadata-json>] [-T (rule|group|cis|version)] [-s] [-L (info|warn|debug|verbose)]

FLAGS
  -h, --help                     Show CLI help.
  -i, --input=<value>            (required) Path to the XCCDF benchmark file
  -o, --output=<value>           [default: profile] The output folder to write the generated InSpec content
  -T, --idType=<option>          [default: rule] Control ID Types: 
                                 'rule' - Vulnerability IDs (ex. 'SV-XXXXX'), 
                                 'group' - Group IDs (ex. 'V-XXXXX'), 
                                 'cis' - CIS Rule IDs (ex. C-1.1.1.1), 
                                 'version' - Version IDs (ex. RHEL-07-010020 - also known as STIG IDs)
                                 <options: rule|group|cis|version>
  -O, --ovalDefinitions=<value>  Path to an OVAL definitions file to populate profile elements that reference OVAL defintions
  -m, --metadata=<value>         Path to a JSON file with additional metadata for the inspec.yml file
  -s, --singleFile               Output the resulting controls as a single file
  -L, --logLevel=<option>        [default: info] <options: info|warn|debug|verbose>

EXAMPLES
  $ saf generate xccdf_benchmark2inspec_stub -i ./U_RHEL_6_STIG_V2R2_Manual-xccdf.xml -T group --logLevel debug -r rhel-6-update-report.md
  $ saf generate xccdf_benchmark2inspec_stub -i ./CIS_Ubuntu_Linux_18.04_LTS_Benchmark_v1.1.0-xccdf.xml -O ./CIS_Ubuntu_Linux_18.04_LTS_Benchmark_v1.1.0-oval.xml --logLevel debug
```
[top](#generate-data-reports-and-more)


##### DoD Stub vs CIS Stub Formatting

The converter supports both Stub and CIS styles. The `--format` flag is used to specify the required output format. Default is DoD Stub Format.

- Specifying the `--format` flag as either `cis` or `disa` will parse the input spreadsheet according to the standard formats for CIS Benchmark exports and DISA STIG exports, respectively.
- You can also use the `general` setting (the default) to parse an arbitrary spreadsheet, but if you do so, you must provide a mapping file with the `--mapping` flag so that `saf` can parse the input.
- If you provide a non-standard spreadsheet, the first row of values are assumed to be column headers.

[top](#generate-data-reports-and-more)

#### Mapping Files

Mapping files are YAML files that tell `saf` which columns in the input spreadsheet should be parsed. Mapping files are structured as following:

``` yaml
id:                           # Required
  - ID
  - "recommendation #"
title:                        # Required
  - Title                     # You can give more than one column header as a value for an
  - title                     # attribute if you are not sure how it will be spelled in the input.
desc:
  - Description
  - Discussion
  - description
impact: 0.5                  # If impact is set, its value will be used for every control
desc.rationale:
  - Rationale
  - rationale statement
desc.check:                   # Required
  - Audit
  - audit procedure
desc.fix:
  - Remediation
  - remediation procedure
desc.additional_information:  # You can define arbitrary values under desc and tag
  - Additional Information    # if you have extra fields to record
desc.default_value:
  - Default Value
ref:                          # InSpec keyword - saf will check this column for URLs (links to documentation)
  - References                # and record each address as a ref attribute
```

Where the keys (`title`) are InSpec control attributes and the values (`- Title`) are the column headers in the input spreadsheet that correspond to that attribute.

[top](#generate-data-reports-and-more)

---

### Supplement

Supplement (ex. read or modify) elements that provide contextual information in an HDF file such as `passthrough` or `target`

#### Passthrough

Supplement (ex. read or modify) the `passthrough` element, which provides contextual information in the Heimdall Data Format results JSON file

```
EXAMPLE (combined read, modfication, and overwrite of the original file)
  $ saf supplement passthrough read -i hdf_with_passthrough.json | jq -rc '.key = "new value"' | xargs -0 -I{} saf supplement passthrough write -i hdf_with_passthrough.json -d {}
```

Passthrough data can be any context/structure. See the sample below or visit 👉 [Supplement HDF files with additional information](https://github.com/mitre/saf/wiki/Supplement-HDF-files-with-additional-information-(ex.-%60passthrough%60,-%60target%60))
```json
{
  "CDM": {
    "HWAM": {
      "Asset_ID_Tattoo": "arn:aws:ec2:us-east-1:123456789012:instance/i-12345acbd5678efgh90",
      "Data_Center_ID": "1234-5678-ABCD-1BB1-CC12DD34EE56FF78",
      "FQDN": "i-12345acbd5678efgh90.ec2.internal",
      "Hostname": "i-12345acbd5678efgh90",
      "ipv4": "10.0.1.25",
      "ipv6": "none defined",
      "mac": "02:32:fd:e3:68:a1",
      "os": "Linux",
      "FISMA_ID": "ABCD2C21-7781-92AA-F126-FF987CZZZZ"
    },
    "CSM": {
      "Server_Type": "member server",
      "source_tool": "InSpec"
    }
  }
}
```
[top](#enhance-and-supplement-hdf-data)

##### Read

```
supplement passthrough read              Read the `passthrough` attribute in a given Heimdall Data Format JSON file and send it to stdout or write it to a file

USAGE
  $ saf supplement passthrough read -i <hdf-json> [-o <passthrough-json>]

FLAGS
  -h, --help            Show CLI help.
  -i, --input=<value>   (required) An input HDF file
  -o, --output=<value>  An output `passthrough` JSON file (otherwise the data is sent to stdout)

EXAMPLES
  $ saf supplement passthrough read -i hdf.json -o passthrough.json
```
[top](#enhance-and-supplement-hdf-data)

##### Write

```
supplement passthrough write              Overwrite the `passthrough` attribute in a given HDF file with the provided `passthrough` JSON data

USAGE
  $ saf supplement passthrough write -i <input-hdf-json> (-f <input-passthrough-json> | -d <passthrough-json>) [-o <output-hdf-json>]

FLAGS
  -d, --passthroughData=<value>  Input passthrough-data (can be any valid JSON); this flag or `passthroughFile` must be provided
  -f, --passthroughFile=<value>  An input passthrough-data file (can contain any valid JSON); this flag or `passthroughData` must be provided
  -h, --help                     Show CLI help.
  -i, --input=<value>            (required) An input Heimdall Data Format file
  -o, --output=<value>           An output Heimdall Data Format JSON file (otherwise the input file is overwritten)

DESCRIPTION
  Passthrough data can be any context/structure. See sample ideas at [https://github.com/mitre/saf/wiki/Supplement-HDF-files-with-additional-information-(ex.-%60passthrough%60,-%60target%60)#:~:text=Settings-,Supplement%20HDF%20files%20with%20additional%20information,-(ex.%20%60passthrough%60%2C%20%60target](https://github.com/mitre/saf/wiki/Supplement-HDF-files-with-additional-information-(ex.-%60passthrough%60,-%60target%60))
  
EXAMPLES
  $ saf supplement passthrough write -i hdf.json -d '{"a": 5}'

  $ saf supplement passthrough write -i hdf.json -f passthrough.json -o new-hdf.json
```
[top](#enhance-and-supplement-hdf-data)

#### Target

Supplement (ex. read or modify) the `target` element, which provides contextual information in the Heimdall Data Format results JSON file

```
EXAMPLE (combined read, modfication, and overwrite of the original file)
  $ saf supplement target read -i hdf_with_target.json | jq -rc '.key = "new value"' | xargs -0 -I{} saf supplement target write -i hdf_with_target.json -d {}
```

Passthrough data can be any context/structure. See the sample below or visit 👉 [Supplement HDF files with additional information](https://github.com/mitre/saf/wiki/Supplement-HDF-files-with-additional-information-(ex.-%60passthrough%60,-%60target%60))
```json
{
  "AWS":{
    "Resources":[
      {
        "Type":"AwsEc2Instance",
        "Id":"arn:aws:ec2:us-east-1:123456789012:instance/i-06036f0ccaa012345",
        "Partition":"aws",
        "Region":"us-east-1",
        "Details":{
          "AwsEc2Instance":{
            "Type":"t2.medium",
            "ImageId":"ami-0d716eddcc7b7abcd",
            "IpV4Addresses":[
              "10.0.0.27"
            ],
            "KeyName":"rhel7_1_10152021",
            "VpcId":"vpc-0b53ff8f37a06abcd",
            "SubnetId":"subnet-0ea14519a4ddaabcd"
          }
        }
      }
    ]
  }
}
```
[top](#enhance-and-supplement-hdf-data)

##### Read

```
supplement target read              Read the `target` attribute in a given Heimdall Data Format JSON file and send it to stdout or write it to a file

USAGE
  $ saf supplement target read -i <hdf-json> [-o <target-json>]

FLAGS
  -h, --help            Show CLI help.
  -i, --input=<value>   (required) An input HDF file
  -o, --output=<value>  An output `target` JSON file (otherwise the data is sent to stdout)

EXAMPLES
  $ saf supplement target read -i hdf.json -o target.json
```
[top](#enhance-and-supplement-hdf-data)

##### Write

```
supplement target write              Overwrite the `target` attribute in a given HDF file with the provided `target` JSON data

USAGE
  $ saf supplement target write -i <input-hdf-json> (-f <input-target-json> | -d <target-json>) [-o <output-hdf-json>]

FLAGS
  -d, --targetData=<value>  Input target-data (can be any valid JSON); this flag or `targetFile` must be provided
  -f, --targetFile=<value>  An input target-data file (can contain any valid JSON); this flag or `targetData` must be provided
  -h, --help                Show CLI help.
  -i, --input=<value>       (required) An input Heimdall Data Format file
  -o, --output=<value>      An output Heimdall Data Format JSON file (otherwise the input file is overwritten)

DESCRIPTION
  Target data can be any context/structure. See sample ideas at https://github.com/mitre/saf/wiki/Supplement-HDF-files-with-additional-information-(ex.-%60passthrough%60,-%60target%60)

EXAMPLES
  $ saf supplement target write -i hdf.json -d '{"a": 5}'

  $ saf supplement target write -i hdf.json -f target.json -o new-hdf.json
```
[top](#enhance-and-supplement-hdf-data)

# License and Author

### Authors

- Author:: Will Dower [wdower](https://github.com/wdower)
- Author:: Ryan Lin [Rlin232](https://github.com/rlin232)
- Author:: Amndeep Singh Mann [Amndeep7](https://github.com/amndeep7)
- Author:: Camden Moors [camdenmoors](https://github.com/camdenmoors)
- Author:: Emily Rodriguez [em-c-rod](https://github.com/em-c-rod)
- Author:: George Dias [georgedias](https://github.com/georgedias)

### NOTICE

© 2022 The MITRE Corporation.

Approved for Public Release; Distribution Unlimited. Case Number 18-3678.

### NOTICE

MITRE hereby grants express written permission to use, reproduce, distribute, modify, and otherwise leverage this software to the extent permitted by the licensed terms provided in the LICENSE.md file included with this project.

### NOTICE

This software was produced for the U. S. Government under Contract Number HHSM-500-2012-00008I, and is subject to Federal Acquisition Regulation Clause 52.227-14, Rights in Data-General.

No other use other than that granted to the U. S. Government, or to those acting on behalf of the U. S. Government under that Clause is authorized without the express written permission of The MITRE Corporation.

For further information, please contact The MITRE Corporation, Contracts Management Office, 7515 Colshire Drive, McLean, VA 22102-7539, (703) 983-6000.
