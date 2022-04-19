# Security Automation Framework CLI

The MITRE Security Automation Framework (SAF) Command Line Interface (CLI) brings together applications, techniques, libraries, and tools developed by MITRE and the security community to streamline security automation for systems and DevOps pipelines

The SAF CLI is the successor to [Heimdall Tools](https://github.com/mitre/heimdall_tools) and [InSpec Tools](https://github.com/mitre/inspec_tools). 

## Terminology:

- "[Heimdall](https://github.com/mitre/heimdall2)" - our visualizer for all security result data
- "[Heimdall Data Format (HDF)](https://saf.mitre.org/#/normalize)" - our common data format to preserve and transform security data

## Contents:

- [SAF CLI Installation](#installation)
  - [Via NPM](#installation-via-npm)
  - [Via Docker](#installation-via-docker)
  - [Via Windows Installer](#installation-via-windows-installer)

* [SAF CLI Usage](#usage)
  * [Convert](#convert) - Convert security results from all your security tools into a common data format
      *  [HDF to AWS Security Hub](#hdf-to-asff)
      *  [AWS Security Hub to HDF](#asff-to-hdf)
      *  [HDF to Splunk](#hdf-to-splunk)
      *  [Splunk to HDF](#splunk-to-hdf)
      *  [AWS Config to HDF](#aws-config-to-hdf)
      *  [Snyk to HDF](#snyk-to-hdf)
      *  [Trivy to HDF](#trivy-to-hdf)
      *  [Tenable Nessus to HDF](#tenable-nessus-to-hdf)
      *  [DBProtect to HDF](#dbprotect-to-hdf)
      *  [HDF to CSV](#hdf-to-csv)
      *  [Netsparker to HDF](#netsparker-to-hdf)
      *  [Burp Suite to HDF](#burp-suite-to-hdf)
      *  [SonarQube to HDF](#sonarqube-to-hdf)
      *  [OWASP ZAP to HDF](#owasp-zap-to-hdf)
      *  [Prowler to HDF](#prowler-to-hdf)
      *  [Fortify to HDF](#fortify-to-hdf)
      *  [JFrog Xray to HDF](#jfrog-xray-to-hdf)
      *  [Nikto to HDF](#nikto-to-hdf)
      *  [Sarif to HDF](#sarif-to-hdf)
      *  [Scoutsuite to HDF](#scoutsuite-to-hdf)
      *  [HDF to DISA Checklist](#hdf-to-checklist)
      *  [DISA XCCDF Results to HDF](#xccdf-results-to-hdf)
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

### Convert

Translating your data to and from Heimdall Data Format (HDF) is done using the `saf convert` command.

Want to Recommend or Help Develop a Converter? See [the wiki](https://github.com/mitre/saf/wiki/How-to-recommend-development-of-a-mapper) on how to get started.


### From HDF


##### HDF to ASFF

Note: Uploading findings into AWS Security hub requires configuration of the AWS CLI, see [the AWS documentation](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html) or configuration of environment variables via Docker.

```
convert hdf2asff            Translate a Heimdall Data Format JSON file into
                            AWS Security Findings Format JSON file(s)
  OPTIONS
    -a, --accountId=accountId      (required) AWS Account ID
    -i, --input=input              (required) Input HDF JSON File
    -r, --region=region            (required) SecurityHub Region
    -t, --target=target            (required) Unique name for target to track findings across time
    -o, --output=output            Output ASFF JSONs Folder
    -C, --certificate=certificate  Trusted signing certificate file
    -I, --insecure                 Disable SSL verification (WARNING: this is insecure)
    -u, --upload                   Upload findings to AWS Security Hub
  
  EXAMPLES
    saf convert hdf2asff -i rhel7.scan.json -a 123456789 -r us-east-1 -t rhel7_example_host -o rhel7-asff
    saf convert hdf2asff -i rhel7.scan.json -a 123456789 -r us-east-1 -t rhel7_example_host -u
```
#### HDF to Splunk

**Notice**: HDF to Splunk requires configuration on the Splunk server. See [Splunk Configuration](https://github.com/mitre/saf/wiki/Splunk-Configuration).

```
convert hdf2splunk           Translate and upload a Heimdall Data Format JSON file into a Splunk server

  OPTIONS
    -H, --host=<value>       (required) Splunk Hostname or IP
    -I, --index=<value>      (required) Splunk index to import HDF data into
    -L, --logLevel=<option>  [default: info] <options: info|warn|debug|verbose>
    -P, --port=<value>       [default: 8089] Splunk management port (also known as the Universal Forwarder port)s
    -i, --input=<value>      (required) Input HDF file
    -p, --password=<value>   Your Splunk password
    -s, --scheme=<option>    [default: https] HTTP Scheme used for communication with Splunk <options: http|https>
    -t, --token=<value>      Your Splunk API Token
    -u, --username=<value>   Your Splunk username

  EXAMPLE
    saf convert hdf2splunk -i rhel7-results.json -H 127.0.0.1 -u admin -p Valid_password! -I hdf
    saf convert hdf2splunk -i rhel7-results.json -H 127.0.0.1 -t your.splunk.token -I hdf
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
convert hdf2ckl              Translate a Heimdall Data Format JSON file into a
                             DISA checklist file

  OPTIONS
    -F, --fqdn=fqdn          FQDN for CKL metadata
    -H, --hostname=hostname  Hostname for CKL metadata
    -I, --ip=ip              IP address for CKL metadata
    -M, --mac=mac            MAC address for CKL metadata
    -m, --metadata=metadata  Metadata JSON file, generate one with "saf generate ckl_metadata"
    -i, --input=input        (required) Input HDF file
    -o, --output=output      (required) Output CKL file

  EXAMPLE
    saf convert hdf2ckl -i rhel7-results.json -o rhel7.ckl --fqdn reverseproxy.example.org --hostname reverseproxy --ip 10.0.0.3 --mac 12:34:56:78:90
```

##### HDF to CSV
```
convert hdf2csv             Translate a Heimdall Data Format JSON file into a
                            Comma Separated Values (CSV) file

  OPTIONS
    -f, --fields=fields  [default: All Fields] Fields to include in output CSV, separated by commas
    -i, --input=input    (required) Input HDF file
    -o, --output=output  (required) Output CSV file
    -t, --noTruncate     Don't truncate fields longer than 32,767 characters (the cell limit in Excel)

  EXAMPLE
    saf convert hdf2csv -i rhel7-results.json -o rhel7.csv --fields "Results Set,Status,ID,Title,Severity"
```

##### HDF to Condensed JSON

```
convert hdf2condensed        Condensed format used by some community members
                             to pre-process data for elasticsearch and custom dashboards

  OPTIONS
    -i, --input=xml            Input HDF file
    -o, --output=output        Output condensed JSON file
    

  EXAMPLES
    saf convert hdf2condensed -i rhel7-results.json -o rhel7-condensed.json
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
convert asff2hdf            Translate a AWS Security Finding Format JSON into a
                            Heimdall Data Format JSON file
  OPTIONS
    -i, --input=input          Input ASFF JSON File
    --securityhub=securityhub  Input AWS Security Standards File
    -o, --output=output        Output HDF JSON File

  EXAMPLES
    saf convert asff2hdf -i asff-findings.json -o output-file-name.json
    saf convert asff2hdf -i asff-findings.json --sh <standard-1-json> ... <standard-n-json> -o output-hdf-name.json
```


##### AWS Config to HDF

Note: Pulling AWS Config results data requires configuration of the AWS CLI, see [the AWS documentation](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html) or configuration of environment variables via Docker.

```
convert aws_config2hdf      Pull Configuration findings from AWS Config and convert
                            into a Heimdall Data Format JSON file
  OPTIONS
    -a, --accessKeyId=accessKeyId
    -i, --insecure                         Bypass SSL verification, this is insecure.
    -o, --output=output                    (required)
    -r, --region=region                    (required)
    -s, --secretAccessKey=secretAccessKey
    -t, --sessionToken=sessionToken

  EXAMPLES
    saf convert aws_config2hdf -a ABCDEFGHIJKLMNOPQRSTUV -s +4NOT39A48REAL93SECRET934 -r us-east-1 -o output-hdf-name.json
```


##### Burp Suite to HDF

```
convert burpsuite2hdf       Translate a BurpSuite Pro XML file into a Heimdall
                            Data Format JSON file
  OPTIONS
    -i, --input=xml            Input BurpSuite Pro XML File
    -o, --output=output        Output HDF JSON File
    

  EXAMPLES
    saf convert burpsuite2hdf -i burpsuite_results.xml -o output-hdf-name.json
```

##### CKL to POA&M

Note: The included CCI to NIST Mappings are the extracted from NIST.gov, for mappings specific to eMASS use [this](https://github.com/mitre/ckl2POAM/blob/main/resources/cci2nist.json) file instead. If you need access to this file please contact [saf@groups.mitre.org](mailto:saf@groups.mitre.org).

```
convert ckl2POAM            Translate DISA Checklist CKL file(s) to POA&M files

  OPTIONS
    -O, --officeOrg=officeOrg    Default value for Office/org (prompts for each file if not set)
    -d, --deviceName=deviceName  Name of target device (prompts for each file if not set)
    -i, --input=input            (required) Path to the DISA Checklist File(s)
    -o, --output=output          (required) Path to output PO&M File(s)
    -s, --rowsToSkip=rowsToSkip  [default: 4] Rows to leave between POA&M Items for milestone
```



##### DBProtect to HDF

```
convert dbprotect2hdf       Translate a DBProtect report in "Check Results
                            Details" XML format into a Heimdall Data Format JSON file
  OPTIONS
    -i, --input=input          'Check Results Details' XML File
    -o, --output=output        Output HDF JSON File

  EXAMPLES
    saf convert dbprotect2hdf -i check_results_details_report.xml -o output-hdf-name.json
```


##### Fortify to HDF

```
convert fortify2hdf         Translate a Fortify results FVDL file into a Heimdall
                            Data Format JSON file
  DESCRIPTION
    The fortify converter translates a Fortify results FVDL file (e.g., audit.fvdl)
    into a HDF JSON. The FVDL file is an XML file that can be extracted from the
    Fortify FPR project file using standard file compression tools.

  OPTIONS
    -i, --input=input          Input FVDL File
    -o, --output=output        Output HDF JSON File

  EXAMPLES
    saf convert fortify2hdf -i audit.fvdl -o output-hdf-name.json
```


##### JFrog Xray to HDF

```
convert jfrog_xray2hdf      Translate a JFrog Xray results JSON file into a
                            Heimdall Data Format JSON file

  OPTIONS
    -i, --input=input          Input JFrog JSON File
    -o, --output=output        Output HDF JSON File

  EXAMPLES
    saf convert jfrog_xray2hdf -i xray_results.json -o output-hdf-name.json
```


##### Tenable Nessus to HDF

```
convert nessus2hdf          Translate a Nessus XML results file into a Heimdall
                            Data Format JSON file
  DESCRIPTION
    The Nessus converter translates a Nessus-style XML results
    file (e.g., .nessus file) into a Data Format JSON file.

    Supports compliance and vulnerability scans from Tenable.sc, Tenable.io, and ACAS.

OPTIONS
    -i, --input=input          Input Nessus XML File
    -o, --output=output        Output HDF JSON File

  EXAMPLES
    saf convert nessus2hdf -i nessus_results.nessus -o output-hdf-name.json
```


##### Netsparker to HDF

```
convert netsparker2hdf      Translate a Netsparker XML results file into a
                            Heimdall Data Format JSON file
  OPTIONS
    -i, --input=input          Input Netsparker XML File
    -o, --output=output        Output HDF JSON File

  EXAMPLES
    saf convert netsparker2hdf -i netsparker_results.xml -o output-hdf-name.json
```


##### Nikto to HDF

```
convert nikto2hdf           Translate a Nikto results JSON file into a Heimdall
                            Data Format JSON file
  OPTIONS
    -i, --input=input          Input Nikto Results JSON File
    -o, --output=output        Output HDF JSON File

  EXAMPLES
    saf convert nikto2hdf -i nikto-results.json -o output-hdf-name.json
```


##### Prowler to HDF

```
convert prowler2hdf         Translate a Prowler-derived AWS Security Finding
                            Format results from concatenated JSON blobs into a
                            Heimdall Data Format JSON file
  OPTIONS
    -i, --input=input          Input Prowler ASFF JSON File
    -o, --output=output        Output HDF JSON File

  EXAMPLES
    saf convert prowler2hdf -i prowler-asff.json -o output-hdf-name.json
```


##### Sarif to HDF

```
convert sarif2hdf          Translate a SARIF JSON file into a Heimdall Data
                            Format JSON file
  OPTIONS
    -i, --input=input          Input SARIF JSON File
    -o, --output=output        Output HDF JSON File

  DESCRIPTION
    SARIF level to HDF impact Mapping:
      SARIF level error -> HDF impact 0.7
      SARIF level warning -> HDF impact 0.5
      SARIF level note -> HDF impact 0.3
      SARIF level none -> HDF impact 0.1
      SARIF level not provided -> HDF impact 0.1 as default

  EXAMPLES
    saf convert sarif2hdf -i sarif-results.json -o output-hdf-name.json
```


##### Scoutsuite to HDF

```
convert scoutsuite2hdf       Translate a ScoutSuite results from a Javascript
                             object into a Heimdall Data Format JSON file
  OPTIONS
    -i, --input=input          Input ScoutSuite Results JS File
    -o, --output=output        Output HDF JSON File

  DESCRIPTION
    Note: Currently this mapper only supports AWS.

  EXAMPLES
    saf convert scoutsuite2hdf -i scoutsuite-results.js -o output-hdf-name.json
```


##### Snyk to HDF

```
convert snyk2hdf             Translate a Snyk results JSON file into a Heimdall
                             Data Format JSON file
  OPTIONS
    -i, --input=input          Input Snyk Results JSON File
    -o, --output=output        Output HDF JSON File

  EXAMPLES
    saf convert snyk2hdf -i snyk_results.json -o output-hdf-name.json
```


##### SonarQube to HDF

```
convert sonarqube2hdf        Pull SonarQube vulnerabilities for the specified
                             project name from an API and convert into a Heimdall
                             Data Format JSON file
  OPTIONS
    -a, --auth=auth              SonarQube API Key
    -u, --url=url                SonarQube Base URL (Excluding '/api')
    -n, --projectKey=projectKey  SonarQube Project Key
    -o, --output=output          Output HDF JSON File

  EXAMPLES
    saf convert sonarqube2hdf -n project_key -u http://sonar:9000 --auth YOUR_API_KEY -o output-hdf-name.json

```

##### Splunk to HDF
```
convert splunk2hdf           Pull HDF data from your Splunk instance back into an HDF file

USAGE
  $ saf splunk2hdf -i, --input=FILE -H, --host -P, --port -p, --protocol -t, --token -i, --index

FLAGS
  -H, --host=<value>       (required) Splunk Hostname or IP
  -I, --index=<value>      (required) Splunk index to query HDF data from
  -L, --logLevel=<option>  [default: info]
                           <options: info|warn|debug|verbose>
  -P, --port=<value>       [default: 8089] Splunk management port (also known as the Universal Forwarder port)
  -i, --input=<value>...   GUID(s) or Filename(s) of files to convert
  -o, --output=<value>     Output HDF JSON Folder
  -p, --password=<value>   Your Splunk password
  -s, --scheme=<option>    [default: https] HTTP Scheme used for communication with splunk
                           <options: http|https>
  -t, --token=<value>      Your Splunk API Token
  -u, --username=<value>   Your Splunk username

EXAMPLES
  saf convert splunk2hdf -H 127.0.0.1 -u admin -p Valid_password! -I hdf -i some-file-in-your-splunk-instance.json yBNxQsE1mi4f3mkjtpap5YxNTttpeG -o output-folder
  saf convert splunk2hdf -I hdf -H 127.0.0.1 -t your.splunk.token
```


##### Trivy to HDF

```
convert trivy2hdf         Translate a Trivy-derived AWS Security Finding
                          Format results JSON file into a Heimdall Data Format
                          JSON file
  OPTIONS
    -i, --input=input          Input Trivy ASFF JSON File
    -o, --output=output        Output HDF JSON File

  DESCRIPTION
    Note: Currently this mapper only supports the results of Trivy's `image`
    subcommand (featuring the CVE findings) while using the ASFF template format
    (which comes bundled with the repo).  An example call to Trivy to get this
    type of file looks as follows:
    AWS_REGION=us-east-1 AWS_ACCOUNT_ID=123456789012 trivy image --no-progress --format template --template "@/absolute_path_to/git_clone_of/trivy/contrib/asff.tpl" -o trivy_asff.json golang:1.12-alpine

  EXAMPLES
    saf convert trivy2hdf -i trivy_asff.json -o output-hdf-name.json
```


##### XCCDF Results to HDF

```
convert xccdf_results2hdf    Translate a SCAP client XCCDF-Results XML report to
                             HDF format Json be viewed on Heimdall
  OPTIONS
    -i, --input=input          Input XCCDF Results XML File
    -o, --output=output        Output HDF JSON File

  EXAMPLES
    saf convert xccdf_results2hdf -i results-xccdf.xml -o output-hdf-name.json

```

##### OWASP ZAP to HDF

```
convert zap2hdf              Translate a OWASP ZAP results JSON to HDF format Json
                             be viewed on Heimdall
  OPTIONS
    -i, --input=input          Input OWASP ZAP Results JSON File
    -n, --name=name            Target Site Name
    -o, --output=output        Output HDF JSON File

  EXAMPLES
    saf convert zap2hdf -i zap_results.json -n mitre.org -o output-hdf-name.json
```

---

### View

#### Heimdall

You can start a local Heimdall Lite instance to visualize your findings with the SAF CLI. To start an instance use the `saf view heimdall` command:

```
view:heimdall            Run an instance of Heimdall Lite to visualize 
                         your data

  OPTIONS
    -p, --port=PORT          Port To Expose Heimdall On (Default 3000)
    -f, --file=FILE          File(s) to display in Heimdall
    -n, --noOpenBrowser      Don't open the default browser automatically
  EXAMPLES
    saf view heimdall -p 8080
```



#### Summary

To get a quick compliance summary from an HDF file (grouped by profile name) use the `saf view summary` command:

```
view:summary            Get a quick compliance overview of HDF files

  OPTIONS
    -i, --input=FILE         (required) Input HDF file(s)
    -j, --json               Output results as JSON
    -o, --output=output
	
  EXAMPLE
    saf view summary -i rhel7-host1-results.json nginx-host1-results.json mysql-host1-results.json
```

---

### Validate

#### Thresholds

See the wiki for more information on [template files](https://github.com/mitre/saf/wiki/Validation-with-Thresholds).

```
validate threshold       Validate the compliance and status counts of an HDF file

  OPTIONS
    -F, --templateFile        Expected data template, generate one with "saf generate threshold"
    -T, --templateInline=     Flattened JSON containing your validation thresholds
                              (Intended for backwards compatibility with InSpec Tools)
    -i, --input               Input HDF JSON file

  EXAMPLES
  	saf validate threshold -i rhel7-results.json -F output.yaml
```


---

### Generate

#### CKL Templates

Checklist template files are used to give extra information to `saf convert hdf2ckl`.

```
generate ckl_metadata        Generate a checklist metadata template for "saf convert hdf2ckl"

  OPTIONS
    -o, --output=output  (required) Output JSON File
  
  EXAMPLE
    saf generate ckl_metadata -o rhel_metadata.json
```

#### InSpec Metadata

InSpec metadata files are used to give extra information to `saf convert *2inspec_stub`.

```
generate inspec_metadata        Generate an InSpec metadata file for "saf convert *2inspec_stub"

  OPTIONS
    -o, --output=output  (required) Output JSON File

  EXAMPLE
    saf generate inspec_metadata -o ms_sql_baseline_metadata.json
```

#### Thresholds

Threshold files are used in CI to ensure minimum compliance levels and validate control severities and statuses using `saf validate threshold`

```
generate threshold      Generate a compliance template for "saf validate threshold"

  OPTIONS
    -c, --generateControlIds  Validate control IDs have the correct severity
                              and status
    -e, --exact               All counts should be exactly the same when
                              validating not just less than or greater than
    -i, --input               Input HDF JSON file
    -o, --output              Output threshold YAML file

	EXAMPLE
  	saf generate threshold -i rhel7-results.json -e -c -o output.yaml
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


EXAMPLE
  saf generate spreadsheet2inspec_stub -i spreadsheet.xlsx -o profile
```

#### XCCDF to InSpec Stub
```
generate xccdf2inspec_stub              Generate an InSpec profile stub from a DISA STIG XCCDF XML file

  USAGE
    $ saf generate xccdf2inspec_stub -i, --input=XML -o, --output=FOLDER

  OPTIONS
    -S, --useStigID              Use STIG IDs (<Group/Rule/Version>) instead of Group IDs (ex. 'V-XXXXX') for InSpec Control IDs
    -i, --input=input            (required) Path to the DISA STIG XCCDF file
    -l, --lineLength=lineLength  [default: 80] Characters between lines within InSpec controls
    -e, --encodingHeader         Add the "# encoding: UTF-8" comment at the top of each control
    -m, --metadata=metadata      Path to a JSON file with additional metadata for the inspec.yml file
    -o, --output=output          (required) [default: profile]
    -r, --useVulnerabilityId     Use Vulnerability IDs (ex. 'SV-XXXXX') instead of Group IDs (ex. 'V-XXXXX') for InSpec control IDs
    -s, --singleFile             Output the resulting controls as a single file
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
