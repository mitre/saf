# Security Automation Framework CLI

The MITRE Security Automation Framework (SAF) Command Line Interface (CLI) brings together applications, techniques, libraries, and tools developed by MITRE and the security community to streamline security automation for systems and DevOps pipelines

The SAF CLI is the successor to [Heimdall Tools](https://github.com/mitre/heimdall_tools) and [InSpec Tools](https://github.com/mitre/inspec_tools).

## Terminology:

- "[Heimdall](https://github.com/mitre/heimdall2)" - Our visualizer for all security result data
- "[Heimdall Data Format (HDF)](https://saf.mitre.org/#/normalize)" - Our common data format to preserve and transform security data

## Contents:

- [SAF CLI Installation](#installation)
  - [Via NPM](#installation-via-npm)
  - [Via Brew](#installation-via-brew)
  - [Via Docker](#installation-via-docker)
  - [Via Windows Installer](#installation-via-windows-installer)

* [SAF CLI Usage](#usage)
  * [Attest](#attest) - Create and Apply attestations in JSON, YAML, and XLSX format
  * [Convert](#convert) - Convert security results from all your security tools into a common data format
      * To HDF
        *  [AWS Security Hub to HDF](#asff-to-hdf)
        *  [Splunk to HDF](#splunk-to-hdf)
        *  [AWS Config to HDF](#aws-config-to-hdf)
        *  [Snyk to HDF](#snyk-to-hdf)
        *  [Twistlock to HDF](#twistlock-to-hdf)
        *  [Ion Channel to HDF](#ion-channel-2-hdf)
        *  [Trivy to HDF](#trivy-to-hdf)
        *  [Tenable Nessus to HDF](#tenable-nessus-to-hdf)
        *  [DBProtect to HDF](#dbprotect-to-hdf)
        *  [Netsparker to HDF](#netsparker-to-hdf)
        *  [Burp Suite to HDF](#burp-suite-to-hdf)
        *  [SonarQube to HDF](#sonarqube-to-hdf)
        *  [OWASP ZAP to HDF](#owasp-zap-to-hdf)
        *  [Prisma to HDF](#prisma-to-hdf)
        *  [Prowler to HDF](#prowler-to-hdf)
        *  [Fortify to HDF](#fortify-to-hdf)
        *  [JFrog Xray to HDF](#jfrog-xray-to-hdf)
        *  [Nikto to HDF](#nikto-to-hdf)
        *  [Sarif to HDF](#sarif-to-hdf)
        *  [Scoutsuite to HDF](#scoutsuite-to-hdf)
        *  [DISA XCCDF Results to HDF](#xccdf-results-to-hdf)
      * From HDF
        *  [HDF to AWS Security Hub](#hdf-to-asff)
        *  [HDF to Splunk](#hdf-to-splunk)
        *  [HDF to XCCDF](#hdf-to-xccdf)
        *  [HDF to CSV](#hdf-to-csv)
        *  [HDF to DISA Checklist](#hdf-to-checklist)
  * [View](#view) - Identify overall security status and deep-dive to solve specific security defects
  * [Validate](#validate) - Verify pipeline thresholds
  * [Generate](#generate) - Generate InSpec validation code, set pipeline thresholds, and generate options to support other saf commands.
  * Scan - Visit https://saf.mitre.org/#/validate to explore and run inspec profiles
  * Harden - Visit https://saf.mitre.org/#/harden to explore and run hardening scripts

## Installation

#### Installation via NPM

The SAF CLI can be installed and kept up to date using `npm`, which is included with most versions of [NodeJS](https://nodejs.org/en/).

```bash
npm install -g @mitre/saf
```


#### Update via NPM

To update the SAF CLI with `npm`:

```bash
npm update -g @mitre/saf
```

---


#### Installation via Brew

The SAF CLI can be installed and kept up to date using `brew`.

```
brew install mitre/saf/saf-cli
```


#### Update via Brew

To update the SAF CLI with `brew`:

```
brew upgrade saf-cli
```

---


#### Installation via Docker

**On Linux and Mac:**

```
docker run -it -v$(pwd):/share mitre/saf
```

**On Windows:**

```
docker run -it -v%cd%:/share mitre/saf
```



#### Update via Docker

To update the SAF CLI with `docker`:

```bash
docker pull mitre/saf:latest
```

---

#### Installation via Windows Installer

To install the latest release of the SAF CLI on Windows, download and run the most recent installer for your system architecture from the [Releases](https://github.com/mitre/saf/releases) page.

#### Update via Windows Installer

To update the SAF CLI on Windows, uninstall any existing version from your system and then download and run the most recent installer for your system architecture from the [Releases](https://github.com/mitre/saf/releases) page.

## Usage
---

### Attest

Attesting to 'Not Reviewed' controls can be done with the `saf attest` commands. `saf attest create` lets you create attestation files and `saf attest apply` lets you apply attestation files

#### Create Attestations
```
attest create              Create attestation files for use with `saf attest apply`

  FLAGS
    -h, --help             Show CLI help.
    -i, --input=<value>    (optional) An input HDF file used to search for controls
    -o, --output=<value>   (required) The output filename
    -t, --format=<option>  [default: json] (optional) The output file type
                           <options: json|xlsx|yml|yaml>
```

#### Apply Attestations
```
attest apply              Apply one or more attestation files to one or more HDF results sets

  FLAGS
    -h, --help              Show CLI help.
    -i, --input=<value>...  (required) Your input HDF and Attestation file(s)
    -o, --output=<value>    (required) Output file or folder (for multiple executions)
```

### Convert

Translating your data to and from Heimdall Data Format (HDF) is done using the `saf convert` command.

Want to Recommend or Help Develop a Converter? See [the wiki](https://github.com/mitre/saf/wiki/How-to-recommend-development-of-a-mapper) on how to get started.


### From HDF


##### HDF to ASFF

Note: Uploading findings into AWS Security hub requires configuration of the AWS CLI, see [the AWS documentation](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html) or configuration of environment variables via Docker.

```
convert hdf2asff              Translate a Heimdall Data Format JSON file into
                              AWS Security Findings Format JSON file(s) and/or
                              upload to AWS Security Hub
  USAGE
    $ saf convert hdf2asff -a <account-id> -r <region> -i <hdf-scan-results-json> -t <target> [-h] [-R] (-u [-I -C <certificate>] | [-o <asff-output-folder>])

  FLAGS
    -C, --certificate=<value>     Trusted signing certificate file
    -I, --insecure                Disable SSL verification, this is insecure.
    -R, --specifyRegionAttribute  Manually specify the top-level `Region` attribute - SecurityHub
                                  populates this attribute automatically and prohibits one from
                                  updating it using `BatchImportFindings` or `BatchUpdateFindings`
    -a, --accountId=<value>       (required) AWS Account ID
    -h, --help                    Show CLI help.
    -i, --input=<value>           (required) Input HDF JSON File
    -o, --output=<value>          Output ASFF JSON Folder
    -r, --region=<value>          (required) SecurityHub Region
    -t, --target=<value>          (required) Unique name for target to track findings across time
    -u, --upload                  Upload findings to AWS Security Hub
  EXAMPLES
    $ saf convert hdf2asff -i rhel7-scan_02032022A.json -a 123456789 -r us-east-1 -t rhel7_example_host -o rhel7.asff
    $ saf convert hdf2asff -i rds_mysql_i123456789scan_03042022A.json -a 987654321 -r us-west-1 -t Instance_i123456789 -u
    $ saf convert hdf2asff -i snyk_acme_project5_hdf_04052022A.json -a 2143658798 -r us-east-1 -t acme_project5 -o snyk_acme_project5 -u
```

#### HDF to Splunk

**Notice**: HDF to Splunk requires configuration on the Splunk server. See [Splunk Configuration](https://github.com/mitre/saf/wiki/Splunk-Configuration).

```
convert hdf2splunk            Translate and upload a Heimdall Data Format JSON file into a Splunk server

  USAGE
    $ saf convert hdf2splunk -i <hdf-scan-results-json> -H <host> -I <index> [-h] [-P <port>] [-s http|https] [-u <username> | -t <token>] [-p <password> | ] [-L info|warn|debug|verbose]

  FLAGS
    -H, --host=<value>       (required) Splunk Hostname or IP
    -I, --index=<value>      (required) Splunk index to import HDF data into
    -L, --logLevel=<option>  [default: info]
                            <options: info|warn|debug|verbose>
    -P, --port=<value>       [default: 8089] Splunk management port (also known as the Universal Forwarder port)
    -h, --help               Show CLI help.
    -i, --input=<value>      (required) Input HDF file
    -p, --password=<value>   Your Splunk password
    -s, --scheme=<option>    [default: https] HTTP Scheme used for communication with splunk
                            <options: http|https>
    -t, --token=<value>      Your Splunk API Token
    -u, --username=<value>   Your Splunk username

  EXAMPLES
    $ saf convert hdf2splunk -i rhel7-results.json -H 127.0.0.1 -u admin -p Valid_password! -I hdf
    $ saf convert hdf2splunk -i rhel7-results.json -H 127.0.0.1 -t your.splunk.token -I hdf
```

#### HDF to XCCDF
```
convert hdf2xccdf             Translate an HDF file into an XCCDF XML

  USAGE
    $ saf convert hdf2xccdf -i <hdf-scan-results-json> -o <output-xccdf-xml> [-h]

  FLAGS
    -h, --help            Show CLI help.
    -i, --input=<value>   (required) Input HDF file
    -o, --output=<value>  (required) Output XCCDF XML File

  EXAMPLES
    $ saf convert hdf2xccdf -i hdf_input.json -o xccdf-results.xml
```

HDF Splunk Schema documentation: https://github.com/mitre/heimdall2/blob/master/libs/hdf-converters/src/converters-from-hdf/splunk/Schemas.md#schemas
##### Previewing HDF Data Within Splunk:
A full raw search query:
```sql
index="<<YOUR INDEX>>" meta.subtype=control | stats  values(meta.filename) values(meta.filetype) list(meta.profile_sha256) values(meta.hdf_splunk_schema) first(meta.status)  list(meta.status)  list(meta.is_baseline) values(title) last(code) list(code) values(desc) values(descriptions.*)  values(id) values(impact) list(refs{}.*) list(results{}.*) list(source_location{}.*) values(tags.*)  by meta.guid id
| join  meta.guid
    [search index="<<YOUR INDEX>>"  meta.subtype=header | stats values(meta.filename) values(meta.filetype) values(meta.hdf_splunk_schema) list(statistics.duration)  list(platform.*) list(version)  by meta.guid]
| join meta.guid
    [search index="<<YOUR INDEX>>"  meta.subtype=profile | stats values(meta.filename) values(meta.filetype) values(meta.hdf_splunk_schema) list(meta.profile_sha256) list(meta.is_baseline)  last(summary) list(summary) list(sha256) list(supports{}.*) last(name) list(name) list(copyright) list(maintainer) list(copyright_email) last(version) list(version) list(license) list(title) list(parent_profile) list(depends{}.*) list(controls{}.*) list(attributes{}.*) list(status) by meta.guid]

```
A formatted table search query:
```sql
index="<<YOUR INDEX>>" meta.subtype=control | stats  values(meta.filename) values(meta.filetype) list(meta.profile_sha256) values(meta.hdf_splunk_schema) first(meta.status)  list(meta.status)  list(meta.is_baseline) values(title) last(code) list(code) values(desc) values(descriptions.*)  values(id) values(impact) list(refs{}.*) list(results{}.*) list(source_location{}.*) values(tags.*)  by meta.guid id
| join  meta.guid
    [search index="<<YOUR INDEX>>"  meta.subtype=header | stats values(meta.filename) values(meta.filetype) values(meta.hdf_splunk_schema) list(statistics.duration)  list(platform.*) list(version)  by meta.guid]
| join meta.guid
    [search index="<<YOUR INDEX>>"  meta.subtype=profile | stats values(meta.filename) values(meta.filetype) values(meta.hdf_splunk_schema) list(meta.profile_sha256) list(meta.is_baseline)  last(summary) list(summary) list(sha256) list(supports{}.*) last(name) list(name) list(copyright) list(maintainer) list(copyright_email) last(version) list(version) list(license) list(title) list(parent_profile) list(depends{}.*) list(controls{}.*) list(attributes{}.*) list(status) by meta.guid]
| rename values(meta.filename) AS "Results Set", values(meta.filetype) AS "Scan Type", list(statistics.duration) AS "Scan Duration", first(meta.status) AS "Control Status", list(results{}.status) AS "Test(s) Status", id AS "ID", values(title) AS "Title", values(desc) AS "Description", values(impact) AS "Impact", last(code) AS Code, values(descriptions.check) AS "Check", values(descriptions.fix) AS "Fix", values(tags.cci{}) AS "CCI IDs", list(results{}.code_desc) AS "Results Description",  list(results{}.skip_message) AS "Results Skip Message (if applicable)", values(tags.nist{}) AS "NIST SP 800-53 Controls", last(name) AS "Scan (Profile) Name", last(summary) AS "Scan (Profile) Summary", last(version) AS "Scan (Profile) Version"
| table meta.guid "Results Set" "Scan Type" "Scan (Profile) Name" ID "NIST SP 800-53 Controls" Title "Control Status" "Test(s) Status" "Results Description" "Results Skip Message (if applicable)"  Description Impact Severity  Check Fix "CCI IDs" Code "Scan Duration" "Scan (Profile) Summary" "Scan (Profile) Version"
```


##### HDF to Checklist
```
convert hdf2ckl               Translate a Heimdall Data Format JSON file into a
                              DISA checklist file

  USAGE
    $ saf convert hdf2ckl -i <hdf-scan-results-json> -o <output-ckl> [-h] [-m <metadata>] [-H <hostname>] [-F <fqdn>] [-M <mac-address>] [-I <ip-address>]

  FLAGS
    -F, --fqdn=<value>      FQDN for CKL metadata
    -H, --hostname=<value>  Hostname for CKL metadata
    -I, --ip=<value>        IP address for CKL metadata
    -M, --mac=<value>       MAC address for CKL metadata
    -h, --help              Show CLI help.
    -i, --input=<value>     (required) Input HDF file
    -m, --metadata=<value>  Metadata JSON file, generate one with "saf generate ckl_metadata"
    -o, --output=<value>    (required) Output CKL file

  EXAMPLES
    $ saf convert hdf2ckl -i rhel7-results.json -o rhel7.ckl --fqdn reverseproxy.example.org --hostname reverseproxy --ip 10.0.0.3 --mac 12:34:56:78:90
```

##### HDF to CSV
```
convert hdf2csv               Translate a Heimdall Data Format JSON file into a
                              Comma Separated Values (CSV) file

  USAGE
    $ saf convert hdf2csv -i <hdf-scan-results-json> -o <output-csv> [-h] [-f <csv-fields>] [-t]

  FLAGS
    -f, --fields=<value>  [default: All Fields] Fields to include in output CSV, separated by commas
    -h, --help            Show CLI help.
    -i, --input=<value>   (required) Input HDF file
    -o, --output=<value>  (required) Output CSV file
    -t, --noTruncate      Don't truncate fields longer than 32,767 characters (the cell limit in Excel)

  EXAMPLES
    $ saf convert hdf2csv -i rhel7-results.json -o rhel7.csv --fields "Results Set,Status,ID,Title,Severity"
```

##### HDF to Condensed JSON
```
convert hdf2condensed         Condensed format used by some community members
                              to pre-process data for elasticsearch and custom dashboards

  USAGE
    $ saf convert hdf2condensed -i <hdf-scan-results-json> -o <condensed-json> [-h]

  FLAGS
    -h, --help            Show CLI help.
    -i, --input=<value>   (required) Input HDF file
    -o, --output=<value>  (required) Output condensed JSON file

  EXAMPLES
    $ saf convert hdf2condensed -i rhel7-results.json -o rhel7-condensed.json
```




&nbsp;

---

### To HDF

##### ASFF to HDF

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
    -C, --certificate=<value>  Trusted signing certificate file
    -I, --insecure             Disable SSL verification, this is insecure.
    -L, --logLevel=<option>    [default: info]
                              <options: info|warn|debug|verbose>
    -a, --aws                  Pull findings from AWS Security Hub
    -h, --help                 Show CLI help.
    -i, --input=<value>        Input ASFF JSON file
    -o, --output=<value>       (required) Output HDF JSON folder
    -r, --region=<value>       Security Hub region to pull findings from
    -t, --target=<value>...    Target ID(s) to pull from Security Hub (maximum 10), leave blank for non-HDF findings
    --securityhub=<value>...   Additional input files to provide context that an ASFF file needs
                               such as the CIS AWS Foundations or AWS Foundational Security Best
                               Practices documents (in ASFF compliant JSON form)

  EXAMPLES
    $ saf convert asff2hdf -i asff-findings.json -o output-folder-name
    $ saf convert asff2hdf -i asff-findings.json --securityhub <standard-1-json> ... --securityhub <standard-n-json> -o output-folder-name
    $ saf convert asff2hdf --aws -o out -r us-west-2 --target rhel7
```


##### AWS Config to HDF

Note: Pulling AWS Config results data requires configuration of the AWS CLI, see [the AWS documentation](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html) or configuration of environment variables via Docker.

```
convert aws_config2hdf        Pull Configuration findings from AWS Config and convert
                              into a Heimdall Data Format JSON file
  USAGE
    $ saf convert aws_config2hdf -r <region> -o <hdf-scan-results-json> [-h] [-a <access-key-id>] [-s <secret-access-key>] [-t <session-token>] [-i]

  FLAGS
    -a, --accessKeyId=<value>      Access key ID
    -h, --help                     Show CLI help.
    -i, --insecure                 Disable SSL verification, this is insecure.
    -o, --output=<value>           (required) Output HDF JSON File
    -r, --region=<value>           (required) Region to pull findings from
    -s, --secretAccessKey=<value>  Secret access key
    -t, --sessionToken=<value>     Session token

  EXAMPLES
    $ saf convert aws_config2hdf -a ABCDEFGHIJKLMNOPQRSTUV -s +4NOT39A48REAL93SECRET934 -r us-east-1 -o output-hdf-name.json
```


##### Burp Suite to HDF
```
convert burpsuite2hdf         Translate a BurpSuite Pro XML file into a Heimdall
                              Data Format JSON file
  USAGE
    $ saf convert burpsuite2hdf -i <burpsuite-xml> -o <hdf-scan-results-json> [-h]

  FLAGS
    -h, --help            Show CLI help.
    -i, --input=<value>   (required) Input Burpsuite Pro XML File
    -o, --output=<value>  (required) Output HDF JSON File

  EXAMPLES
    $ saf convert burpsuite2hdf -i burpsuite_results.xml -o output-hdf-name.json
```

##### CKL to POA&M

Note: The included CCI to NIST Mappings are the extracted from NIST.gov, for mappings specific to eMASS use [this](https://github.com/mitre/ckl2POAM/blob/main/resources/cci2nist.json) file instead. If you need access to this file please contact [saf@groups.mitre.org](mailto:saf@groups.mitre.org).

```
convert ckl2POAM              Translate DISA Checklist CKL file(s) to POA&M files

  USAGE
    $ saf convert ckl2POAM -i <disa-checklist> -o <poam-output-folder> [-h] [-O <office/org>] [-d <device-name>] [-s <num-rows>]

  FLAGS
    -O, --officeOrg=<value>   Default value for Office/org (prompts for each file if not set)
    -d, --deviceName=<value>  Name of target device (prompts for each file if not set)
    -h, --help                Show CLI help.
    -i, --input=<value>...    (required) Path to the DISA Checklist File(s)
    -o, --output=<value>      (required) Path to output PO&M File(s)
    -s, --rowsToSkip=<value>  [default: 4] Rows to leave between POA&M Items for milestones

  ALIASES
    $ saf convert ckl2poam
```

##### DBProtect to HDF
```
convert dbprotect2hdf         Translate a DBProtect report in "Check Results
                              Details" XML format into a Heimdall Data Format JSON file
  USAGE
    $ saf convert dbprotect2hdf -i <dbprotect-xml> -o <hdf-scan-results-json> [-h]

  FLAGS
    -h, --help            Show CLI help.
    -i, --input=<value>   (required) 'Check Results Details' XML File
    -o, --output=<value>  (required) Output HDF JSON File

  EXAMPLES
    $ saf convert dbprotect2hdf -i check_results_details_report.xml -o output-hdf-name.json
```

##### Fortify to HDF
```
convert fortify2hdf           Translate a Fortify results FVDL file into a Heimdall
                              Data Format JSON file. The FVDL file is an XML that can be
                              extracted from the Fortify FPR project file using standard
                              file compression tools
  USAGE
    $ saf convert fortify2hdf -i <fortify-fvdl> -o <hdf-scan-results-json> [-h]

  FLAGS
    -h, --help            Show CLI help.
    -i, --input=<value>   (required) Input FVDL File
    -o, --output=<value>  (required) Output HDF JSON File

  EXAMPLES
    $ saf convert fortify2hdf -i audit.fvdl -o output-hdf-name.json
```

##### Ion Channel 2 HDF
```
convert ionchannel2hdf        Pull and translate SBOM data from Ion Channel
                              into Heimdall Data Format
  USAGE
    $ saf convert ionchannel2hdf -o <hdf-output-folder> [-h] (-i <ionchannel-json> | -a <api-key> -t <team-name> [--raw ] [-p <project>] [-A ]) [-L info|warn|debug|verbose]

  FLAGS
    -A, --allProjects         Pull all projects available within your team
    -L, --logLevel=<option>   [default: info]
                              <options: info|warn|debug|verbose>
    -a, --apiKey=<value>      API Key from Ion Channel user settings
    -h, --help                Show CLI help.
    -i, --input=<value>...    Input IonChannel JSON file
    -o, --output=<value>      (required) Output JSON folder
    -p, --project=<value>...  The name of the project(s) you would like to pull
    -t, --teamName=<value>    Your team name that contains the project(s) you would like to pull data from
    --raw                     Output Ion Channel raw data
```

##### JFrog Xray to HDF
```
convert jfrog_xray2hdf        Translate a JFrog Xray results JSON file into a
                              Heimdall Data Format JSON file
  USAGE
    $ saf convert jfrog_xray2hdf -i <jfrog-xray-json> -o <hdf-scan-results-json> [-h]

  FLAGS
    -h, --help            Show CLI help.
    -i, --input=<value>   (required) Input JFrog JSON File
    -o, --output=<value>  (required) Output HDF JSON File

  EXAMPLES
    $ saf convert jfrog_xray2hdf -i xray_results.json -o output-hdf-name.json
```

##### Tenable Nessus to HDF
```
convert nessus2hdf            Translate a Nessus XML results file into a Heimdall
                              Data Format JSON file. The current iteration maps all
                              plugin families except for 'Policy Compliance'
                              A separate HDF JSON is generated for each host reported in the Nessus Report.
  USAGE
    $ saf convert nessus2hdf -i <nessus-xml> -o <hdf-scan-results-json> [-h]

  FLAGS
    -h, --help            Show CLI help.
    -i, --input=<value>   (required) Input Nessus XML File
    -o, --output=<value>  (required) Output HDF JSON File

  EXAMPLES
    $ saf convert nessus2hdf -i nessus_results.xml -o output-hdf-name.json
```

##### Netsparker to HDF
```
convert netsparker2hdf        Translate a Netsparker XML results file into a
                              Heimdall Data Format JSON file. The current
                              iteration only works with Netsparker Enterprise
                              Vulnerabilities Scan.
  USAGE
    $ saf convert netsparker2hdf -i <netsparker-xml> -o <hdf-scan-results-json> [-h]

  FLAGS
    -h, --help            Show CLI help.
    -i, --input=<value>   (required) Input Netsparker XML File
    -o, --output=<value>  (required) Output HDF JSON File

  EXAMPLES
    $ saf convert netsparker2hdf -i netsparker_results.xml -o output-hdf-name.json
```

##### Nikto to HDF
```
convert nikto2hdf             Translate a Nikto results JSON file into a Heimdall
                              Data Format JSON file.
                              Note: Currently this mapper only supports single
                              target Nikto Scans
  USAGE
    $ saf convert nikto2hdf -i <nikto-json> -o <hdf-scan-results-json> [-h]

  FLAGS
    -h, --help            Show CLI help.
    -i, --input=<value>   (required) Input Niktop Results JSON File
    -o, --output=<value>  (required) Output HDF JSON File

  EXAMPLES
    $ saf convert nikto2hdf -i nikto-results.json -o output-hdf-name.json
```

##### Prisma to HDF
```
convert prisma2hdf            Translate a Prisma Cloud Scan Report CSV file into
                              Heimdall Data Format JSON files
  USAGE
    $ saf convert prisma2hdf -i <prisma-cloud-csv> -o <hdf-output-folder> [-h]

  FLAGS
    -h, --help            Show CLI help.
    -i, --input=<value>   (required) Prisma Cloud Scan Report CSV
    -o, --output=<value>  (required) Output HDF JSON file

  EXAMPLES
    $ saf convert prisma2hdf -i prismacloud-report.csv -o output-hdf-name.json
```

##### Prowler to HDF
```
convert prowler2hdf           Translate a Prowler-derived AWS Security Finding
                              Format results from concatenated JSON blobs
                              into a Heimdall Data Format JSON file
  USAGE
    $ saf convert prowler2hdf -i <prowler-finding-json> -o <hdf-output-folder> [-h]

  FLAGS
    -h, --help            Show CLI help.
    -i, --input=<value>   (required) Input Prowler ASFF JSON File
    -o, --output=<value>  (required) Output HDF JSON Folder

  EXAMPLES
    $ saf convert prowler2hdf -i prowler-asff.json -o output-folder
```

##### Sarif to HDF
```
convert sarif2hdf             Translate a SARIF JSON file into a Heimdall Data
                              Format JSON file
  USAGE
    $ saf convert sarif2hdf -i <sarif-json> -o <hdf-scan-results-json> [-h]

  FLAGS
    -h, --help            Show CLI help.
    -i, --input=<value>   (required) Input SARIF JSON File
    -o, --output=<value>  (required) Output HDF JSON File

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

##### Scoutsuite to HDF
```
convert scoutsuite2hdf        Translate a ScoutSuite results from a Javascript
                              object into a Heimdall Data Format JSON file

                              Note: Currently this mapper only supports AWS
  USAGE
    $ saf convert scoutsuite2hdf -i <scoutsuite-results-js> -o <hdf-scan-results-json> [-h]

  FLAGS
    -h, --help            Show CLI help.
    -i, --input=<value>   (required) Input ScoutSuite Results JS File
    -o, --output=<value>  (required) Output HDF JSON File

  EXAMPLES
    $ saf convert scoutsuite2hdf -i scoutsuite-results.js -o output-hdf-name.json
```

##### Snyk to HDF
```
convert snyk2hdf              Translate a Snyk results JSON file into a Heimdall
                              Data Format JSON file
                              A separate HDF JSON is generated for each project
                              reported in the Snyk Report
  USAGE
    $ saf convert snyk2hdf -i <snyk-json> -o <hdf-scan-results-json> [-h]

  FLAGS
    -h, --help            Show CLI help.
    -i, --input=<value>   (required) Input Snyk Results JSON File
    -o, --output=<value>  (required) Output HDF JSON File

  EXAMPLES
    $ saf convert snyk2hdf -i snyk_results.json -o output-file-prefix
```

##### SonarQube to HDF
```
convert sonarqube2hdf         Pull SonarQube vulnerabilities for the specified
                              project name and optional branch or pull/merge
                              request ID name from an API and convert into a
                              Heimdall Data Format JSON file
  USAGE
    $ saf convert sonarqube2hdf -n <sonar-project-key> -u <http://your.sonar.instance:9000> -a <your-sonar-api-key> [ -b <target-branch> || -p <pull-request-id> ] -o <hdf-scan-results-json>

  FLAGS
    -a, --auth=<value>           (required) SonarQube API Key
    -b, --branch=<value>         Requires Sonarqube Developer Edition or above
    -h, --help                   Show CLI help.
    -n, --projectKey=<value>     (required) SonarQube Project Key
    -o, --output=<value>         (required) Output HDF JSON File
    -p, --pullRequestID=<value>  Requires Sonarqube Developer Edition or above
    -u, --url=<value>            (required) SonarQube Base URL (excluding '/api')

  EXAMPLES
    $ saf convert sonarqube2hdf -n sonar_project_key -u http://sonar:9000 --auth YOUR_API_KEY [ -b my_branch || -p 123 ]-o scan_results.json
```

##### Splunk to HDF
```
convert splunk2hdf            Pull HDF data from your Splunk instance back into an HDF file

  USAGE
    $ saf splunk2hdf -H <host> -I <index> [-h] [-P <port>] [-s http|https] (-u <username> -p <password> | -t <token>) [-L info|warn|debug|verbose] [-i <filename/GUID> -o <hdf-output-folder>]

  FLAGS
    -H, --host=<value>       (required) Splunk Hostname or IP
    -I, --index=<value>      (required) Splunk index to query HDF data from
    -L, --logLevel=<option>  [default: info]
                            <options: info|warn|debug|verbose>
    -P, --port=<value>       [default: 8089] Splunk management port (also known as the Universal Forwarder port)
    -h, --help               Show CLI help.
    -i, --input=<value>...   GUID(s) or Filename(s) of files to convert
    -o, --output=<value>     Output HDF JSON Folder
    -p, --password=<value>   Your Splunk password
    -s, --scheme=<option>    [default: https] HTTP Scheme used for communication with splunk
                            <options: http|https>
    -t, --token=<value>      Your Splunk API Token
    -u, --username=<value>   Your Splunk username

  EXAMPLES
    $ saf convert splunk2hdf -H 127.0.0.1 -u admin -p Valid_password! -I hdf -i some-file-in-your-splunk-instance.json yBNxQsE1mi4f3mkjtpap5YxNTttpeG -o output-folder
```

##### Trivy to HDF
```
convert trivy2hdf             Translate a Trivy-derived AWS Security Finding
                              Format results from concatenated JSON blobs
                              into a Heimdall Data Format JSON file
  USAGE
    $ saf convert trivy2hdf -i <trivy-finding-json> -o <hdf-output-folder>

  FLAGS
    -h, --help            Show CLI help.
    -i, --input=<value>   (required) Input Trivy ASFF JSON File
    -o, --output=<value>  (required) Output HDF JSON Folder

  DESCRIPTION
    Note: Currently this mapper only supports the results of Trivy's `image`
    subcommand (featuring the CVE findings) while using the ASFF template format
    (which comes bundled with the repo).  An example call to Trivy to get this
    type of file looks as follows:
    AWS_REGION=us-east-1 AWS_ACCOUNT_ID=123456789012 trivy image --no-progress --format template --template "@/absolute_path_to/git_clone_of/trivy/contrib/asff.tpl" -o trivy_asff.json golang:1.12-alpine

  EXAMPLES
    $ saf convert trivy2hdf -i trivy-asff.json -o output-folder
```

##### Twistlock to HDF
```
convert twistlock2hdf         Translate a Twistlock CLI output file into an HDF results set

  USAGE
    $ saf convert twistlock2hdf -i <twistlock-json> -o <hdf-scan-results-json>

  FLAGS
    -h, --help            Show CLI help.
    -i, --input=<value>   (required) Input Twistlock file
    -o, --output=<value>  (required) Output HDF JSON File

  EXAMPLES
    $ saf convert twistlock2hdf -i twistlock.json -o output-hdf-name.json
```

##### XCCDF Results to HDF
NOTE: `xccdf_results2hdf` only supports native OpenSCAP output and SCC output.
```
convert xccdf_results2hdf     Translate a SCAP client XCCDF-Results XML report
                              to HDF format Json be viewed on Heimdall
  USAGE
    $ saf convert xccdf_results2hdf -i <xccdf-results-xml> -o <hdf-scan-results-json> [-h]

  FLAGS
    -h, --help            Show CLI help.
    -i, --input=<value>   (required) Input XCCDF Results XML File
    -o, --output=<value>  (required) Output HDF JSON File

  EXAMPLES
    $ saf convert xccdf_results2hdf -i results-xccdf.xml -o output-hdf-name.json
```

##### OWASP ZAP to HDF
```
convert zap2hdf               Translate a OWASP ZAP results JSON to HDF format Json
                              to be viewed on Heimdall
  USAGE
    $ saf convert zap2hdf -i <zap-json> -n <target-site-name> -o <hdf-scan-results-json> [-h]

  FLAGS
    -h, --help            Show CLI help.
    -i, --input=<value>   (required) Input OWASP Zap Results JSON File
    -n, --name=<value>    (required) Target Site Name
    -o, --output=<value>  (required) Output HDF JSON File

  EXAMPLES
    $ saf convert zap2hdf -i zap_results.json -n site_name -o scan_results.json
```

---

### View

#### Heimdall

You can start a local Heimdall Lite instance to visualize your findings with the SAF CLI. To start an instance use the `saf view heimdall` command:

```
view heimdall                 Run an instance of Heimdall Lite to
                              visualize your data
  USAGE
    $ saf view heimdall [-h] [-p <port>] [-f <file>] [-n]

  FLAGS
    -f, --files=<value>...  File(s) to display in Heimdall
    -h, --help              Show CLI help.
    -n, --noOpenBrowser     Don't open the default browser automatically
    -p, --port=<value>      [default: 3000] Port To Expose Heimdall On (Default 3000)

  ALIASES
    $ saf heimdall

  EXAMPLES
    $ saf view heimdall -p 8080
```

#### Summary

To get a quick compliance summary from an HDF file (grouped by profile name) use the `saf view summary` command:

```
view summary                  Get a quick compliance overview of an HDF file

  USAGE
    $ saf view summary -i <hdf-file> [-h] [-j] [-o <output>]

  FLAGS
    -h, --help              Show CLI help.
    -i, --input=<value>...  (required) Input HDF files
    -j, --json              Output results as JSON
    -o, --output=<value>

  ALIASES
    $ saf summary

  EXAMPLES
    $ saf view summary -i rhel7-results.json
    $ saf view summary -i rhel7-host1-results.json nginx-host1-results.json mysql-host1-results.json
```

---

### Validate

#### Thresholds

See the wiki for more information on [template files](https://github.com/mitre/saf/wiki/Validation-with-Thresholds).

```
validate threshold            Validate the compliance and status counts of an HDF file

  USAGE
    $ saf validate threshold -i <hdf-json> [-h] [-T <flattened-threshold-json> | -F <template-file>]

  FLAGS
    -F, --templateFile=<value>    Expected data template, generate one with "saf generate threshold"
    -T, --templateInline=<value>  Flattened JSON containing your validation thresholds
                                  (Intended for backwards compatibility with InSpec Tools)
    -h, --help                    Show CLI help.
    -i, --input=<value>           (required) Input HDF JSON File

  EXAMPLES
    $ saf validate threshold -i rhel7-results.json -F output.yaml
```


---

### Generate

#### CKL Templates

Checklist template files are used to give extra information to `saf convert hdf2ckl`.

```
generate ckl_metadata         Generate a checklist metadata template for "saf convert hdf2ckl"

  USAGE
    $ saf generate ckl_metadata -o <json-file> [-h]

  FLAGS
    -h, --help            Show CLI help.
    -o, --output=<value>  (required) Output JSON File

  EXAMPLES
    $ saf generate ckl_metadata -o rhel_metadata.json
```

#### InSpec Metadata

InSpec metadata files are used to give extra information to `saf convert *2inspec_stub`.

```
generate inspec_metadata      Generate an InSpec metadata template for "saf convert *2inspec_stub"

  USAGE
    $ saf generate inspec_metadata -o <json-file>

  FLAGS
    -h, --help            Show CLI help.
    -o, --output=<value>  (required) Output JSON File

  EXAMPLES
    $ saf generate inspec_metadata -o ms_sql_baseline_metadata.json
```

#### Thresholds

Threshold files are used in CI to ensure minimum compliance levels and validate control severities and statuses using `saf validate threshold`

See the wiki for more information on [template files](https://github.com/mitre/saf/wiki/Validation-with-Thresholds).

```
generate threshold            Generate a compliance template for "saf validate threshold".
                              Default output states that you must have your current
                              control counts or better (More Passes and/or less
                              Fails/Skips/Not Applicable/No Impact/Errors)
  USAGE
    $ saf generate threshold -i <hdf-json> -o <threshold-yaml> [-h] [-e] [-c]

  FLAGS
    -c, --generateControlIds  Validate control IDs have the correct severity
                              and status
    -e, --exact               All counts should be exactly the same when
                              validating, not just less than or greater than
    -h, --help                Show CLI help.
    -i, --input=<value>       (required) Input HDF JSON File
    -o, --output=<value>      (required) Output Threshold YAML File

  EXAMPLES
    $ saf generate threshold -i rhel7-results.json -e -c -o output.yaml
```

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

#### XCCDF to InSpec Stub
```
generate xccdf2inspec_stub              Translate a DISA STIG XCCDF XML file to a skeleton for an InSpec profile

  USAGE
    $ saf generate xccdf2inspec_stub -i <stig-xccdf-xml> -o <output-folder> [-h] [-m <metadata-json>] [-s] [-r | -S] [-l <line-length>] [-e]

  FLAGS
    -S, --useStigID           Use STIG IDs (<Group/Rule/Version>) instead of Group IDs (ex. 'V-XXXXX') for InSpec Control IDs
    -e, --encodingHeader      Add the "# encoding: UTF-8" comment at the top of each control
    -h, --help                Show CLI help.
    -i, --input=<value>       (required) Path to the DISA STIG XCCDF file
    -l, --lineLength=<value>  [default: 80] Characters between lines within InSpec controls
    -m, --metadata=<value>    Path to a JSON file with additional metadata for the inspec.yml file
    -o, --output=<value>      (required) [default: profile]
    -r, --useVulnerabilityId  Use Vulnerability IDs (ex. 'SV-XXXXX') instead of Group IDs (ex. 'V-XXXXX')
    -s, --singleFile          Output the resulting controls as a single file
```





#### Other



##### Notes

- Specifying the `--format` flag as either `cis` or `disa` will parse the input spreadsheet according to the standard formats for CIS Benchmark exports and DISA STIG exports, respectively.
- You can also use the `general` setting (the default) to parse an arbitrary spreadsheet, but if you do so, you must provide a mapping file with the `--mapping` flag so that `saf` can parse the input.
- If you provide a non-standard spreadsheet, the first row of values are assumed to be column headers.

##### Mapping Files

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

&nbsp;


# License and Author

### Authors

- Author:: Will Dower [wdower](https://github.com/wdower)
- Author:: Ryan Lin [Rlin232](https://github.com/rlin232)
- Author:: Amndeep Singh Mann [Amndeep7](https://github.com/amndeep7)
- Author:: Camden Moors [camdenmoors](https://github.com/camdenmoors)

### NOTICE

© 2022 The MITRE Corporation.

Approved for Public Release; Distribution Unlimited. Case Number 18-3678.

### NOTICE

MITRE hereby grants express written permission to use, reproduce, distribute, modify, and otherwise leverage this software to the extent permitted by the licensed terms provided in the LICENSE.md file included with this project.

### NOTICE

This software was produced for the U. S. Government under Contract Number HHSM-500-2012-00008I, and is subject to Federal Acquisition Regulation Clause 52.227-14, Rights in Data-General.

No other use other than that granted to the U. S. Government, or to those acting on behalf of the U. S. Government under that Clause is authorized without the express written permission of The MITRE Corporation.

For further information, please contact The MITRE Corporation, Contracts Management Office, 7515 Colshire Drive, McLean, VA 22102-7539, (703) 983-6000.
