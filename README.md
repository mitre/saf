# Security Automation Framework CLI

The MITRE Security Automation Framework (SAF) Command Line Interface (CLI) brings together applications, techniques, libraries, and tools developed by MITRE and the security community to streamline security automation for systems and DevOps pipelines



## Contents:

- [SAF CLI Installation](https://github.com/mitre/saf#installation)
  - [Via NPM](https://github.com/mitre/saf#installation-via-npm)
  - [Via Docker](https://github.com/mitre/saf#installation-via-docker)

* [SAF CLI Usage](https://github.com/mitre/saf#usage)
  * [Generate](https://github.com/mitre/saf#usage)
  * [Validate](https://github.com/mitre/saf#validate)
  * [View](https://github.com/mitre/saf#view)
  * [Convert](https://github.com/mitre/saf#convert)



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



## Usage


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

You can start a local Heimdall Lite instance to visualize your findings with the SAF CLI. To start an instance use the `saf view` command:

```
view                     Run an instance of Heimdall Lite to visualize 
                         your data

  OPTIONS
    -p, --port=PORT          Port To Expose Heimdall On (Default 3000)

  EXAMPLES
    saf view -p 8080
```

---

### Convert

Translating your data to and from Heimdall Data Format (HDF) is done using the `saf convert` command.

#### ASFF

```bash
convert:asff             Translate a AWS Security Finding Format JSON into a
                         Heimdall Data Format JSON file
  OPTIONS
    -i, --input=input          Input ASFF JSON File
    --securityhub=securityhub  Input AWS Security Standards File
    -o, --output=output        Output HDF JSON File

  EXAMPLES
    saf convert:asff -i asff-findings.json -o output-file-name.json
    saf convert:asff -i asff-findings.json --sh <standard-1-json> ... <standard-n-json> -o output-hdf-name.json
```



#### AWS Config

```

convert:aws_config       Pull Configuration findings from AWS Config and convert
                         into a Heimdall Data Format JSON file
  OPTIONS
    -a, --accessKeyId=accessKeyId
    -h, --help                             show CLI help
    -i, --insecure                         Bypass SSL verification, this is insecure.
    -o, --output=output                    (required)
    -r, --region=region                    (required)
    -s, --secretAccessKey=secretAccessKey
    -t, --sessionToken=sessionToken

  EXAMPLES
    saf convert:aws_config -a ABCDEFGHIJKLMNOPQRSTUV -s +4NOT39A48REAL93SECRET934 -r us-east-1 -o output-hdf-name.json
```


#### Burp Suite

```
convert:burpsuite        Translate a BurpSuite Pro XML file into a Heimdall
                         Data Format JSON file
  OPTIONS
    -i, --input=xml            Input BurpSuite Pro XML File
    -o, --output=output        Output HDF JSON File
    

  EXAMPLES
    saf convert:burpsuite -i burpsuite_results.xml -o output-hdf-name.json
```


#### DBProtect

```

convert:dbprotect        Translate a DBProtect report in "Check Results
                         Details" XML format into a Heimdall Data Format JSON file
  OPTIONS
    -i, --input=input          'Check Results Details' XML File
    -o, --output=output        Output HDF JSON File

  EXAMPLES
    saf convert:dbprotect -i check_results_details_report.xml -o output-hdf-name.json
```


#### Fortify

```
convert:fortify          Translate a Fortify results FVDL file into a Heimdall
                         Data Format JSON file
  DESCRIPTION
    The fortify converter translates a Fortify results FVDL file (e.g., audit.fvdl)
    into a HDF JSON. The FVDL file is an XML file that can be extracted from the
    Fortify FPR project file using standard file compression tools.
  
  OPTIONS
    -i, --input=input          Input FVDL File
    -o, --output=output        Output HDF JSON File

  EXAMPLES
    saf convert:fortify -i audit.fvdl -o output-hdf-name.json
```


#### JFrog Xray

```
convert:jfrog_xray       Translate a JFrog Xray results JSON file into a
                         Heimdall Data Format JSON file

  OPTIONS
    -i, --input=input          Input JFrog JSON File
    -o, --output=output        Output HDF JSON File

  EXAMPLES
    saf convert:jfrog_xray -i xray_results.json -o output-hdf-name.json
```


#### Tennable Nessus

```
convert:nessus           Translate a Nessus XML results file into a Heimdall
                         Data Format JSON file
  DESCRIPTION
    The Nessus converter translates a Nessus-style XML results
    file (e.g., .nessus file) into a Data Format JSON file.
    
    Supports compliance and vulnerability scans from Tenable.sc, Tenable.io, and ACAS.

OPTIONS
    -i, --input=input          Input Nessus XML File
    -o, --output=output        Output HDF JSON File

  EXAMPLES
    saf convert:nessus -i nessus_results.nessus -o output-hdf-name.json
```


#### Netsparker

```
convert:netsparker       Translate a Netsparker XML results file into a
                         Heimdall Data Format JSON file
  OPTIONS
    -i, --input=input          Input Netsparker XML File
    -o, --output=output        Output HDF JSON File

  EXAMPLES
    saf convert:netsparker -i netsparker_results.xml -o output-hdf-name.json
```


#### Nikto

```
convert:nikto            Translate a Nikto results JSON file into a Heimdall
                         Data Format JSON file
  OPTIONS
    -i, --input=input          Input Nikto Results JSON File
    -o, --output=output        Output HDF JSON File

  EXAMPLES
    saf convert:nikto -i nikto-results.json -o output-hdf-name.json
```


#### Prowler

```
convert:prowler          Translate a Prowler-derived AWS Security Finding
                         Format results from concatenated JSON blobs into a
                         Heimdall Data Format JSON file
  OPTIONS
    -i, --input=input          Input Prowler ASFF JSON File
    -o, --output=output        Output HDF JSON File

  EXAMPLES
    saf convert:prowler -i prowler-asff.json -o output-hdf-name.json
```


#### Sarif

```
convert:sarif            Translate a SARIF JSON file into a Heimdall Data
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
    saf convert:sarif -i sarif-results.json -o output-hdf-name.json
```


#### Scoutsuite

```
convert:scoutsuite       Translate a ScoutSuite results from a Javascript
                         object into a Heimdall Data Format JSON file
  OPTIONS
    -i, --input=input          Input ScoutSuite Results JS File
    -o, --output=output        Output HDF JSON File

	DESCRIPTION
  	Note: Currently this mapper only supports AWS.

  EXAMPLES
    saf convert:scoutsuite -i scoutsuite-results.js -o output-hdf-name.json
```


#### Snyk

```
convert:snyk             Translate a Snyk results JSON file into a Heimdall
                         Data Format JSON file
  OPTIONS
    -i, --input=input          Input Snyk Results JSON File
    -o, --output=output        Output HDF JSON File

  EXAMPLES
    saf convert:snyk -i snyk_results.json -o output-hdf-name.json
```


#### SonarQube

```
convert:sonarqube        Pull SonarQube vulnerabilities for the specified
                         project name from an API and convert into a Heimdall
                         Data Format JSON file
  OPTIONS
    -a, --auth=auth              SonarQube API Key
    -u, --url=url                SonarQube Base URL (Excluding '/api')
    -n, --projectKey=projectKey  SonarQube Project Key
    -o, --output=output          Output HDF JSON File

  EXAMPLES
    saf convert:sonarqube -n project_key -u http://sonar:9000 --auth YOUR_API_KEY -o output-hdf-name.json

```
#### XCCDF Results

```
convert:xccdf_results    Translate a SCAP client XCCDF-Results XML report to
                         HDF format Json be viewed on Heimdall
  OPTIONS
    -i, --input=input          Input XCCDF Results XML File
    -o, --output=output        Output HDF JSON File

  EXAMPLES
    saf convert:xccdf_results -i results-xccdf.xml -o output-hdf-name.json

```
#### OWASP ZAP

```
convert:zap              Translate a OWASP ZAP results JSON to HDF format Json
                         be viewed on Heimdall
  OPTIONS
    -i, --input=input          Input OWASP ZAP Results JSON File
    -n, --name=name            Target Site Name
    -o, --output=output        Output HDF JSON File

  EXAMPLES
    saf convert:zap -i zap_results.json -n mitre.org -o output-hdf-name.json
```

---



# License and Author

### Authors

-   Author:: Ryan Lin [Rlin232](https://github.com/rlin232)
-   Author:: Camden Moors [camdenmoors](https://github.com/camdenmoors)

### NOTICE

© 2021 The MITRE Corporation.

Approved for Public Release; Distribution Unlimited. Case Number 18-3678.

### NOTICE

MITRE hereby grants express written permission to use, reproduce, distribute, modify, and otherwise leverage this software to the extent permitted by the licensed terms provided in the LICENSE.md file included with this project.

### NOTICE

This software was produced for the U. S. Government under Contract Number HHSM-500-2012-00008I, and is subject to Federal Acquisition Regulation Clause 52.227-14, Rights in Data-General.

No other use other than that granted to the U. S. Government, or to those acting on behalf of the U. S. Government under that Clause is authorized without the express written permission of The MITRE Corporation.

For further information, please contact The MITRE Corporation, Contracts Management Office, 7515 Colshire Drive, McLean, VA 22102-7539, (703) 983-6000.
