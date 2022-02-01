# Security Automation Framework CLI

The MITRE Security Automation Framework (SAF) Command Line Interface (CLI) brings together applications, techniques, libraries, and tools developed by MITRE and the security community to streamline security automation for systems and DevOps pipelines



## Contents:

- [SAF CLI Installation](#installation)
  - [Via NPM](#installation-via-npm)
  - [Via Docker](#installation-via-docker)
  - [Via Windows Installer](#installation-via-windows-installer)

* [SAF CLI Usage](#usage)
  * Scan - Visit https://saf.mitre.org/#/validate to explore and run inspec profiles
  * [Generate](#generate) - Set pipeline thresholds
  * [Validate](#validate) - Verify pipeline thresholds
  * [View](#view) - Identify overall security status and deep-dive to solve specifc security defects
  * [Convert](#convert) - Convert security results from all your security tools into a common data format
  * Harden - Visit https://saf.mitre.org/#/harden to explore and run hardening scripts

## Terminology:

- "[Heimdall](https://github.com/mitre/heimdall2)" - our visualizer for all security result data
- "[Heimdall Data Format (HDF)](https://saf.mitre.org/#/normalize)" - our common data format to preserve and transform security data

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

### Generate

#### Thresholds

Threshold files are used in CI to ensure minimum compliance levels and validate control severites and statuses using `saf validate:threshold`

```
generate:threshold      Generate a compliance template for "saf validate threshold"

  OPTIONS
    -c, --generateControlIds  Validate control IDs have the correct severity
                              and status
    -e, --exact               All counts should be exactly the same when
                              validating not just less than or greater than
    -i, --input               Input HDF JSON file
    -o, --output              Output threshold YAML file

	EXAMPLES
  	saf generate:threshold -i rhel7-results.json -e -c -o output.yaml
```

---

### Validate

#### Thresholds

See the wiki for more infromation on [template files](https://github.com/mitre/saf/wiki/Validation-with-Thresholds).

```
validate:threshold       Validate the compliance and status counts of an HDF file

  OPTIONS
    -F, --templateFile        Expected data template, generate one with
    												  "saf generate:threshold"
    -T, --templateInline=     Flattened JSON containing your validation thresholds
                              (Intended for backwards compatibility with InSpec Tools)
    -i, --input               Input HDF JSON file

  EXAMPLES
  	saf validate:threshold -i rhel7-results.json -F output.yaml
```

---

### View

#### Heimdall

You can start a local Heimdall Lite instance to visualize your findings with the SAF CLI. To start an instance use the `saf view:heimdall` command:

```
view:heimdall            Run an instance of Heimdall Lite to visualize 
                         your data

  OPTIONS
    -p, --port=PORT          Port To Expose Heimdall On (Default 3000)
    -f, --file=FILE          File(s) to display in Heimdall
    -n, --noOpenBrowser      Don't open the default browser automatically
  EXAMPLES
    saf view:heimdall -p 8080
```



#### Summary

To get a quick compliance summary from an HDF file (grouped by profile name) use the `saf view:summary` command:

```
view:summary            Get a quick compliance overview of HDF files

  OPTIONS
    -i, --input=FILE         (required) Input HDF file(s)
    -j, --json               Output results as JSON
    -o, --output=output
	
  EXAMPLE
    saf view:summary -i rhel7-host1-results.json nginx-host1-results.json mysql-host1-results.json
```

 

---

### Convert

Translating your data to and from Heimdall Data Format (HDF) is done using the `saf convert` command.

Want to Recommend or Help Develop a Converter? See [the wiki](https://github.com/mitre/saf/wiki/How-to-recommend-development-of-a-mapper) on how to get started.

---

### From HDF


##### HDF to ASFF

```
convert:hdf2asff            Translate a Heimdall Data Format JSON file into
                            AWS Security Findings Format JSON file(s)
  OPTIONS
    -a, --accountId=accountId  (required) AWS Account ID
    -i, --input=input          (required) Input HDF JSON File
    -o, --output=output        (required) Output ASFF JSONs Folder
    -r, --region=region        (required) SecurityHub Region
    -t, --target=target        (required) Unique name for target to track findings across time
  
  EXAMPLES
    saf convert:hdf2asff -i rhel7.scan.json -a 123456789 -r us-east-1 -t rhel7_example_host -o rhel7-asff
```

##### HDF to Condensed JSON

```
convert:hdf2condensed        Condensed format used by some community members
                             to pre-process data for elasticsearch and custom dashboards

  OPTIONS
    -i, --input=xml            Input HDF file
    -o, --output=output        Output condensed JSON file
    

  EXAMPLES
    saf convert:hdf2condensed -i rhel7-results.json -o rhel7-condensed.json
```


##### HDF to Checklist
```
convert:hdf2checklist        Translate a Heimdall Data Format JSON file into a
                             DISA checklist file

  OPTIONS
    -F, --fqdn=fqdn          FQDN for CKL metadata
    -H, --hostname=hostname  Hostname for CKL metadata
    -I, --ip=ip              IP address for CKL metadata
    -M, --mac=mac            MAC address for CKL metadata
    -h, --help               show CLI help
    -i, --input=input        (required) Input HDF file
    -o, --output=output      (required) Output CKL file

  EXAMPLE
    saf convert:hdf2ckl -i rhel7-results.json -o rhel7.ckl --fqdn reverseproxy.example.org --hostname reverseproxy --ip 10.0.0.3 --mac 12:34:56:78:90
```

##### HDF to CSV
```
convert:hdf2csv             Translate a Heimdall Data Format JSON file into a
                            Comma Separated Values (CSV) file

  OPTIONS
    -f, --fields=fields  [default: All Fields] Fields to include in output CSV, separated by commas
    -h, --help           show CLI help
    -i, --input=input    (required) Input HDF file
    -o, --output=output  (required) Output CSV file
    -t, --noTruncate     Don't truncate fields longer than 32,767 characters (the cell limit in Excel)

  EXAMPLE
    saf convert:hdf2csv -i rhel7-results.json -o rhel7.csv --fields "Results Set,Status,ID,Title,Severity"
```

&nbsp;

---

### To HDF

##### ASFF to HDF

```
convert:asff2hdf            Translate a AWS Security Finding Format JSON into a
                            Heimdall Data Format JSON file
  OPTIONS
    -i, --input=input          Input ASFF JSON File
    --securityhub=securityhub  Input AWS Security Standards File
    -o, --output=output        Output HDF JSON File

  EXAMPLES
    saf convert:asff2hdf -i asff-findings.json -o output-file-name.json
    saf convert:asff2hdf -i asff-findings.json --sh <standard-1-json> ... <standard-n-json> -o output-hdf-name.json
```


##### AWS Config to HDF

```
convert:aws_config2hdf      Pull Configuration findings from AWS Config and convert
                            into a Heimdall Data Format JSON file
  OPTIONS
    -a, --accessKeyId=accessKeyId
    -i, --insecure                         Bypass SSL verification, this is insecure.
    -o, --output=output                    (required)
    -r, --region=region                    (required)
    -s, --secretAccessKey=secretAccessKey
    -t, --sessionToken=sessionToken

  EXAMPLES
    saf convert:aws_config2hdf -a ABCDEFGHIJKLMNOPQRSTUV -s +4NOT39A48REAL93SECRET934 -r us-east-1 -o output-hdf-name.json
```


##### Burp Suite to HDF

```
convert:burpsuite2hdf       Translate a BurpSuite Pro XML file into a Heimdall
                            Data Format JSON file
  OPTIONS
    -i, --input=xml            Input BurpSuite Pro XML File
    -o, --output=output        Output HDF JSON File
    

  EXAMPLES
    saf convert:burpsuite2hdf -i burpsuite_results.xml -o output-hdf-name.json
```

##### CKL to POA&M

Note: The included CCI to NIST Mappings are the extracted from NIST.gov, for mappings specific to eMASS use [this](https://github.com/mitre/ckl2POAM/blob/main/resources/cci2nist.json) file instead. If you need access to this file please contact [saf@groups.mitre.org](mailto:saf@groups.mitre.org).

```
convert:ckl2POAM            Translate DISA Checklist CKL file(s) to POA&M files

  OPTIONS
    -O, --officeOrg=officeOrg    Default value for Office/org (prompts for each file if not set)
    -d, --deviceName=deviceName  Name of target device (prompts for each file if not set)
    -i, --input=input            (required) Path to the DISA Checklist File(s)
    -o, --output=output          (required) Path to output PO&M File(s)
    -s, --rowsToSkip=rowsToSkip  [default: 4] Rows to leave between POA&M Items for milestone
```



##### DBProtect to HDF

```
convert:dbprotect2hdf       Translate a DBProtect report in "Check Results
                            Details" XML format into a Heimdall Data Format JSON file
  OPTIONS
    -i, --input=input          'Check Results Details' XML File
    -o, --output=output        Output HDF JSON File

  EXAMPLES
    saf convert:dbprotect2hdf -i check_results_details_report.xml -o output-hdf-name.json
```


##### Fortify to HDF

```
convert:fortify2hdf         Translate a Fortify results FVDL file into a Heimdall
                            Data Format JSON file
  DESCRIPTION
    The fortify converter translates a Fortify results FVDL file (e.g., audit.fvdl)
    into a HDF JSON. The FVDL file is an XML file that can be extracted from the
    Fortify FPR project file using standard file compression tools.
  
  OPTIONS
    -i, --input=input          Input FVDL File
    -o, --output=output        Output HDF JSON File

  EXAMPLES
    saf convert:fortify2hdf -i audit.fvdl -o output-hdf-name.json
```


##### JFrog Xray to HDF

```
convert:jfrog_xray2hdf      Translate a JFrog Xray results JSON file into a
                            Heimdall Data Format JSON file

  OPTIONS
    -i, --input=input          Input JFrog JSON File
    -o, --output=output        Output HDF JSON File

  EXAMPLES
    saf convert:jfrog_xray2hdf -i xray_results.json -o output-hdf-name.json
```


##### Tennable Nessus to HDF

```
convert:nessus2hdf          Translate a Nessus XML results file into a Heimdall
                            Data Format JSON file
  DESCRIPTION
    The Nessus converter translates a Nessus-style XML results
    file (e.g., .nessus file) into a Data Format JSON file.
    
    Supports compliance and vulnerability scans from Tenable.sc, Tenable.io, and ACAS.

OPTIONS
    -i, --input=input          Input Nessus XML File
    -o, --output=output        Output HDF JSON File

  EXAMPLES
    saf convert:nessus2hdf -i nessus_results.nessus -o output-hdf-name.json
```


##### Netsparker to HDF

```
convert:netsparker2hdf      Translate a Netsparker XML results file into a
                            Heimdall Data Format JSON file
  OPTIONS
    -i, --input=input          Input Netsparker XML File
    -o, --output=output        Output HDF JSON File

  EXAMPLES
    saf convert:netsparker2hdf -i netsparker_results.xml -o output-hdf-name.json
```


##### Nikto to HDF

```
convert:nikto2hdf           Translate a Nikto results JSON file into a Heimdall
                            Data Format JSON file
  OPTIONS
    -i, --input=input          Input Nikto Results JSON File
    -o, --output=output        Output HDF JSON File

  EXAMPLES
    saf convert:nikto2hdf -i nikto-results.json -o output-hdf-name.json
```


##### Prowler to HDF

```
convert:prowler2hdf         Translate a Prowler-derived AWS Security Finding
                            Format results from concatenated JSON blobs into a
                            Heimdall Data Format JSON file
  OPTIONS
    -i, --input=input          Input Prowler ASFF JSON File
    -o, --output=output        Output HDF JSON File

  EXAMPLES
    saf convert:prowler2hdf -i prowler-asff.json -o output-hdf-name.json
```


##### Sarif to HDF

```
convert:sarif2hdf          Translate a SARIF JSON file into a Heimdall Data
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
    saf convert:sarif2hdf -i sarif-results.json -o output-hdf-name.json
```


##### Scoutsuite to HDF

```
convert:scoutsuite2hdf       Translate a ScoutSuite results from a Javascript
                             object into a Heimdall Data Format JSON file
  OPTIONS
    -i, --input=input          Input ScoutSuite Results JS File
    -o, --output=output        Output HDF JSON File

	DESCRIPTION
  	Note: Currently this mapper only supports AWS.

  EXAMPLES
    saf convert:scoutsuite2hdf -i scoutsuite-results.js -o output-hdf-name.json
```


##### Snyk to HDF

```
convert:snyk2hdf             Translate a Snyk results JSON file into a Heimdall
                             Data Format JSON file
  OPTIONS
    -i, --input=input          Input Snyk Results JSON File
    -o, --output=output        Output HDF JSON File

  EXAMPLES
    saf convert:snyk2hdf -i snyk_results.json -o output-hdf-name.json
```


##### SonarQube to HDF

```
convert:sonarqube2hdf        Pull SonarQube vulnerabilities for the specified
                             project name from an API and convert into a Heimdall
                             Data Format JSON file
  OPTIONS
    -a, --auth=auth              SonarQube API Key
    -u, --url=url                SonarQube Base URL (Excluding '/api')
    -n, --projectKey=projectKey  SonarQube Project Key
    -o, --output=output          Output HDF JSON File

  EXAMPLES
    saf convert:sonarqube2hdf -n project_key -u http://sonar:9000 --auth YOUR_API_KEY -o output-hdf-name.json

```

##### XCCDF Results to HDF

```
convert:xccdf_results2hdf    Translate a SCAP client XCCDF-Results XML report to
                             HDF format Json be viewed on Heimdall
  OPTIONS
    -i, --input=input          Input XCCDF Results XML File
    -o, --output=output        Output HDF JSON File

  EXAMPLES
    saf convert:xccdf_results2hdf -i results-xccdf.xml -o output-hdf-name.json

```

##### OWASP ZAP to HDF

```
convert:zap2hdf              Translate a OWASP ZAP results JSON to HDF format Json
                             be viewed on Heimdall
  OPTIONS
    -i, --input=input          Input OWASP ZAP Results JSON File
    -n, --name=name            Target Site Name
    -o, --output=output        Output HDF JSON File

  EXAMPLES
    saf convert:zap2hdf -i zap_results.json -n mitre.org -o output-hdf-name.json
```

#### Other 

##### Spreadsheet (csv/xlsx) to InSpec

You can use `saf convert:spreadsheet2inspec` to generate an InSpec profile structure from a spreadsheet file. 

```
convert:spreadsheet2inspec              Convert CSV STIGs or CIS XLSX benchmarks into a skeleton InSpec profile

USAGE
  $ saf convert:spreadsheet2inspec -i, --input=<XLSX or CSV> -o, --output=FOLDER

OPTIONS
  -M, --mapping=mapping                      Path to a YAML file with mappings for each
                                             field, by default, CIS Benchmark fields are
                                             used for XLSX, STIG Viewer CSV export is used
                                             by CSV

  -c, --controlNamePrefix=controlNamePrefix  Prefix for all control IDs

  -f, --format=cis|disa|general              [default: general]

  -h, --help                                 show CLI help

  -i, --input=input                          (required)

  -m, --metadata=metadata                    Path to a JSON file with additional metadata
                                             for the inspec.yml file

  -o, --output=output                        (required) Output InSpec profile folder

EXAMPLE
  saf convert:spreadsheet2inspec -i spreadsheet.xlsx -o profile
```

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

Where the keys (`title`) are InSpec control attributess and the values (`- Title`) are the column headers in the input spreadsheet that correspond to that attribute.


---



# License and Author

### Authors

-   Author:: Ryan Lin [Rlin232](https://github.com/rlin232)
-   Author:: Camden Moors [camdenmoors](https://github.com/camdenmoors)
-   Author:: Will Dower [wdower](https://github.com/wdower)

### NOTICE

© 2022 The MITRE Corporation.

Approved for Public Release; Distribution Unlimited. Case Number 18-3678.

### NOTICE

MITRE hereby grants express written permission to use, reproduce, distribute, modify, and otherwise leverage this software to the extent permitted by the licensed terms provided in the LICENSE.md file included with this project.

### NOTICE

This software was produced for the U. S. Government under Contract Number HHSM-500-2012-00008I, and is subject to Federal Acquisition Regulation Clause 52.227-14, Rights in Data-General.

No other use other than that granted to the U. S. Government, or to those acting on behalf of the U. S. Government under that Clause is authorized without the express written permission of The MITRE Corporation.

For further information, please contact The MITRE Corporation, Contracts Management Office, 7515 Colshire Drive, McLean, VA 22102-7539, (703) 983-6000.
