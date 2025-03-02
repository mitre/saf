# SA CLI eMASSer Features and Capabilities

## Environment Variables
To facilitate setting the required environment variables the `SAF CLI eMASSer` utilizes a zero-dependency module to load Required/Optional variables from a `.env` file.  See [Generating an eMASS Configuration File](#generating-an-emass-configuration-file)

### Configuring the `.env` File
An `.env-example` file is provided with the required and optional fields.

Modify the `.env-example` as necessary and save it as a `.env` file. 

Place the file on the  path where the `emasser` command is executed.

### Required Environment Variables
The following environment variables are required:
* EMASSER_API_KEY=`<API key>`
* EMASSER_HOST_URL=`<FQDN of the eMASS server>`
* EMASSER_KEY_FILE_PATH=`<<The eMASS key.pem private key file in PEM format (if provided the CERT is required)>>`
* EMASSER_CERT_FILE_PATH=`<The eMASS client.pem certificate file in PEM format (if provided the KEY is required)>`
* EMASSER_CA_FILE_PATH=`<The eMASS CA certificate (if provided no Key or Client PEM is needed)>`
* EMASSER_KEY_FILE_PASSWORD=`<The certificate passphrase>`

### Optional but required by most eMASS integrations
* EMASSER_USER_UID=`<Unique user identifier associated with the API Key (api-key)`
  
### Optional Environment Variables
The following environment variables are *optional:
* EMASSER_PORT=`<The server communication port number (default is 443)`
* EMASSER_REQUEST_CERT=`<Server requests a certificate from clients - true or false (default false)>`
* EMASSER_REJECT_UNAUTHORIZED=`<Reject connection not authorized with the list of supplied CAs- true or false (default true)>`
* EMASSER_DEBUGGING=`<set debugging - true or false (default false)>`
* EMASSER_CLI_DISPLAY_NULL=`<display null value fields - true or false (default true)>`
* EMASSER_EPOCH_TO_DATETIME=`<convert epoch to data/time value - true or false (default false)>`
* EMASSER_DOWNLOAD_DIR=`<directory where exported files are saved (default eMASSerDownloads)>`
  
\* If not provided defaults are used

The proper format to set these variables in the `.env` files is as follows:
```bash
[VARIABLE_NAME]='value'
```
***NOTE***

The `eMASSer` commands requires access to an eMASS instance. Authentication and authorization to an eMASS instance is **not** a function of `eMASSer CLI` and needs to be accomplished with the eMASS instance owner organization. Further information about eMASS credential requirements refer to [Defense Counterintelligence and Security Agency](https://www.dcsa.mil/is/emass/) about eMASS access.

Fo instruction on how to request an eMASS visit [eMASS Account Process Request and API Registration](https://github.com/mitre/emasser/wiki/eMASS-Account-Process-Request-and-API-Registration)

---
## Common eMASSer Endpoint Requests Information
  - The eMASS API provides the capability of updating multiple entries within several endpoints, however the `SAF CLI eMASSer`, in some cases only supports updating one entry at the time.

## API Endpoints Provided

### GET
* [/api](#get-test-connection)
* [/api/systems](#get-system)
* [/api/systems/{systemId}](#get-systems)
* [/api/system-roles](#get-roles)
* [/api/system-roles/{roleCategory}](#get-roles)
* [/api/systems/{systemId}/controls](#get-controls)
* [/api/systems/{systemId}/test-results](#get-test_results)
* [/api/systems/{systemId}/poams](#get-poams)
* [/api/systems/{systemId}/poams/{poamId}](#get-poams)
* [/api/systems/{systemId}/poams/{poamId}/milestones](#get-milestones)
* [/api/systems/{systemId}/poams/{poamId}/milestones/{milestoneId})](#get-milestones)
* [/api/systems/{systemId}/artifacts](#get-artifacts)
* [/api/systems/{systemId}/artifacts-export](#get-artifacts)
* [/api/systems/{systemId}/approval/cac](#get-cac)
* [/api/systems/{systemId}/approval/pac](#get-pac)
* [/api/systems/{systemId}/hw-baseline](#get-hardware)
* [/api/systems/{systemId}/sw-baseline](#get-sotware)
* [/api/cmmc-assessments](#get-cmmc)
* [/api/workflow-definitions](#get-workflow_definitions)
* [/api/systems/{systemId}/workflow-instances](#get-workflow_instances)
* [/api/dashboards/{endpoint}](#get-dashboards)
  
### POST
* [/api/api-key](#post-register-cert)
* [/api/systems/{systemId}/test-results](#post-test_results)
* [/api/systems/{systemId}/poam](#post-poams)
* [/api/systems/{systemId}/poam/{poamId}/milestones](#post-milestones)
* [/api/systems/{systemId}/artifacts](#post-artifacts)
* [/api/systems/{systemId}/approval/cac](#post-cac)
* [/api/systems/{systemId}/approval/pac](#post-pac)
* [/api/systems/{systemId}/hw-baseline](#post-hardware)
* [/api/systems/{systemId}/sw-baseline](#post-software)
* [/api/systems/{systemId}/device-scan-results](#post-device-scan-results)
* [/api/systems/{systemId}/cloud-resource-results](#post-cloud_resource)
* [/api/systems/{systemId}/container-scan-results](#post-container_scans)
* [/api/systems/{systemId}/static-code-scans](#post-static_code_scans)

### PUT
* [/api/systems/{systemId}/controls](#put-controls)
* [/api/systems/{systemId}/poams](#put-poams)
* [/api/systems/{systemId}/poams/{poamId}/milestones](#put-milestones)
* [/api/systems/{systemId}/artifacts](#put-artifacts)
* [/api/systems/{systemId}/hw-baseline](#put-hardware)
* [/api/systems/{systemId}/sw-baseline](#put-software)

### DELETE
* [/api/systems/{systemId}/poams](#delete-poams)
* [/api/systems/{systemId}/poams/{poamId}/milestones](#delete-milestones)
* [/api/systems/{systemId}/artifacts](#delete-artifacts)
* [/api/systems/{systemId}/hw-baseline](#delete-hardware)
* [/api/systems/{systemId}/sw-baseline](#delete-software)

## Generating an eMASS Configuration File
Provided with the eMASS API CLI is an interactive command line user interface for generating the configuration file `.env` required to connect to an eMASS instance(s).

```
Generate a configuration file (.env) for accessing an eMASS instances.

USAGE
  $ saf emasser configure

DESCRIPTION
  Generate a configuration file (.env) for accessing an eMASS instances.
  Authentication to an eMASS instances requires a PKI-valid/trusted client
  certificate. The eMASSer CLI accepts a Key/Client pair certificates (.pem) or
  a CA certificate (.pem or .crt). A Unique user identifier (user-uid) is used by
  most eMASS integration, however certain integrations, the user-uid is not required


  Required eMASS configuration variables:
        EMASSER_API_KEY           <The eMASS API key (api-key) - valid key is > 30 alpha numeric characters>
        EMASSER_HOST_URL          <The Full Qualified Domain Name (FQDN) for the eMASS server>
        EMASSER_KEY_FILE_PATH     <The eMASS key.pem private key file in PEM format (if provided the CERT is required)>
        EMASSER_CERT_FILE_PATH    <The eMASS client.pem certificate file in PEM format (if provided the KEY is required)>
        EMASSER_CA_FILE_PATH      <The eMASS CA certificate (if provided no Key or Client PEM is needed)>
        EMASSER_KEY_FILE_PASSWORD <The password for the private encryption key.pem file>
  Certain eMASS integrations may not require (most do) this variable:
        EMASSER_USER_UID          <The eMASS User Unique Identifier (user-uid)>

  Optional eMASS configuration variables, if not provided defaults are used:
        EMASSER_PORT                <The server communication port number (default is 443)>
        EMASSER_REQUEST_CERT        <Server requests a certificate from connecting clients - true or false (default true)>
        EMASSER_REJECT_UNAUTHORIZED <Reject clients with invalid certificates - true or false (default true)>
        EMASSER_DEBUGGING           <Set debugging on (true) or off (false) (default false)>
        EMASSER_CLI_DISPLAY_NULL    <Display null value fields - true or false (default true)>
        EMASSER_EPOCH_TO_DATETIME   <Convert epoch to data/time value - true or false (default false)>
        EMASSER_DOWNLOAD_DIR         <Directory where the CLI exports files (default eMASSerDownloads)>


EXAMPLES
  $ saf emasser configure
```

## Endpoints CLI help
To view eMASS API top help (available topics & commands) use the following command:

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
  emasser configure  Generate a configuration file (.env) for accessing an eMASS instance(s).
  emasser version    Display the eMASS API specification version the CLI implements.
```

Each CLI endpoint command have several layers of help. 
- Using `-h or -help` after a topic (command) `get, put, post, or delete` lists all available endpoint calls. The following command would list all available `GET` endpoints commands.
    ```
    $ saf emasser get [-h or -help]
    eMass REST API GET endpoint commands

    USAGE
      $ saf emasser get COMMAND

    COMMANDS
      emasser get artifacts             Retrieve artifacts for a system or system/filename combination
      emasser get cac                   View one or many Control Approval Chain (CAC) in a system specified system ID
      emasser get cmmc                  View Cybersecurity Maturity Model Certification (CMMC) Assessments
      emasser get controls              Get system Security Control information for both the Implementation Plan and Risk Assessment
      emasser get dashboards            Retrieves a pre-defined dashboard by orgId
      emasser get hardware              View all hardware baseline for a system available on the eMASS instance
      emasser get milestones            Retrieve milestones by system by systemID/poamID or systemID/poamID/milestoneID combination
      emasser get pac                   View one or many Package Approval Chain (PAC) in a system specified system ID
      emasser get poams                 Retrieve Poams for a system or system/poam Id combination
      emasser get roles                 Retrieve all available system roles, or filter by options
      emasser get software              View all software baseline for a system available on the eMASS instance
      emasser get system                Get system information for a specific system defined by ID (systemId)
      emasser get systems               Get available systems filter on provided options
      emasser get test_connection       Test if eMASSer is properly configure to a valid eMASS URL
      emasser get test_results          Get test results for a specific system defined by ID (systemId)
      emasser get workflow_definitions  View all workflow schemas available on the eMASS instance
      emasser get workflow_instances    Retrieve all workflow instances or workflow instances noted by workflowInstanceID
    ```  
- Preceding any command with `[-h or -help` provides help for the command. The following command would list all available sub-commands and options for the `get artifacts` endpoint command.
    ```
    $ emasser get -h artifacts
    Retrieve artifacts for a system or system/filename combination

    USAGE
      $ saf emasser get artifacts [ARGUMENT]

    ARGUMENTS
      forSystem  Retrieves available milestones for provided system (Id)
      export     Exports the milestone(s) for provided system (Id) and file name

    FLAGS
      -h, --help  Show eMASSer CLI help for the GET Artifacts endpoint

    DESCRIPTION
      Retrieve artifacts for a system or system/filename combination
    ```
- Using `help` after any command lists all available options (flags). The following command would list all available options for the `get artifacts export` endpoint command. 
    ```
    $ emasser get artifacts export -help
    Retrieves the file artifacts (if compress is true the file binary contents are returned, otherwise the file textual contents are returned.)

    USAGE
      $ saf emasser get artifacts [ARGUMENT]

    ARGUMENTS
      forSystem  Retrieves available milestones for provided system (Id)
      export     Exports the milestone(s) for provided system (Id) and file name

    FLAGS
      -h, --help                Show eMASSer CLI help for the GET Artifacts command
      -s, --systemId=<value>    (required) The system identification number     
      -f, --filename=<value>    (required) The artifact file name       
      -C, --[no-]compress       Boolean - Compress true or false
      -P, --[no-]printToStdOut  Boolean - Print to standard output

    DESCRIPTION
      Retrieves an artifact file for selected system
      (file is sent to EMASSER_DOWNLOAD_DIR (defaults to eMASSerDownloads) if flag [-P, --printToStdOut] not provided)

    EXAMPLES
      $ saf emasser get artifacts export [-s, --systemId] <value> [-f, --filename] <value> [options]
    ```
**The same format is applicable for POST, PUT, and DELETE requests as well, however there may be additional help content**

## Command line flags
All command line flags have a short and long option, for example: -s or --systemId can be use as:
```
-s 36 or --systemId 36
```
Boolean `true/false` flags do **NOT** take an argument, they are reversed with `--no-` value. If we have a flag name `isTemplate` it would be uses as:
```
--isTemplate (true) --no-isTemplate (false)
```

## Usage - GET

### ```get test connection``` 
---
The Test Connection endpoint provides the ability to verify connection to the web service.

    $ emasser get test_connection

A return of success from the call indicates that the CLI can reach the configure server URL.
References [Required Environment Variables](#required-environment-variables) for the necessary environment variables.

[top](#api-endpoints-provided)

### ```get system```

---
The `get system` command retrieves a single system defined by the ID (systemId).

```
Get system information for a specific system defined by ID (systemId)

USAGE
  $ saf emasser get system [options]

FLAGS
  -h, --help                 Show eMASSer CLI help for the GET System endpoint
  -s, --systemId=<value>     (required) The system identification number  
  -I, --[no-]includePackage  Boolean - include system packages
  -p, --policy=<option>      Filter on policy
                             <options: diacap|rmf|reporting>

DESCRIPTION
  Get system information for a specific system defined by ID (systemId)

EXAMPLES
  $ saf emasser get system [-s, --systemId] <value> [options]
```

- required flag (parameter):

    |parameter    | type or values                    |
    |-------------|:----------------------------------|
    |--systemId   |Integer - Unique system identifier |

- Optional flags (parameters) are:

  |parameter               | type or values                          |
  |------------------------|:----------------------------------------|
  |--includePackage        |BOOLEAN - true or false                  |
  |--policy                |Possible values: diacap, rmf, reporting  |

[top](#api-endpoints-provided)

### ```get systems```

----
The `get systems` command retrieves all available system defined by the ID (systemId) and filter by available options.

```
Get available systems filter on provided options

USAGE
  $ saf emasser get systems [options]

FLAGS
  -h, --help                        Show eMASSer CLI help for the GET Systems endpoint
  -D, --[no-]includeDecommissioned  Boolean - include decommissioned systems
  -I, --[no-]includePackage         Boolean - include system packages
  -M, --[no-]includeDitprMetrics    Boolean - include DoD Information Technology metrics
  -S, --[no-]reportsForScorecard    Boolean - include score card
  -c, --coamsId=<value>             Cyber Operational Attributes Management System (COAMS) string Id
  -p, --policy=<option>             Filter on policy <options: diacap|rmf|reporting>
  -r, --registrationType=<option>   Filter on registration type
                                    <options: assessAndAuthorize|assessOnly|guest|regular|functional|cloudServiceProvider|commonControlProvider>
  -t, --ditprId=<value>             DoD Information Technology (IT) Portfolio Repository (DITPR) string Id

DESCRIPTION
  Get available systems filter on provided options

EXAMPLES
  $ saf emasser get systems [options]
```

- Optional flags (parameters) are:

  |parameter               | type or values                                                              |
  |------------------------|:----------------------------------------------------------------------------|
  |--coamsId               |Cyber Operational Attributes Management System (COAMS) string Id             |   
  |--ditprId               |DoD Information Technology (IT) Portfolio Repository (DITPR) string id       |     
  |--includeDecommissioned |BOOLEAN - true or false                                                      |    
  |--includeDitprMetrics   |BOOLEAN - true or false                                                      |
  |--includePackage        |BOOLEAN - true or false                                                      |
  |--policy                |Possible values: diacap, rmf, reporting                                      |
  |--registrationType      |Possible values: assessAndAuthorize, assessOnly, guest, regular, functional, |
  |                        |                 cloudServiceProvider, commonControlProvider                 |
  |--reportsForScorecard   |BOOLEAN - true or false                                                      |
  
[top](#api-endpoints-provided)

### ```get roles```

----
There are two endpoints for system roles - `all` and `byCategory`
```
USAGE
  $ saf emasser get roles [ARGUMENT]

ARGUMENTS
  all         Retrieves all available system roles
  byCategory  Retrieves role(s) - filtered by [options] params

FLAGS
  -h, --help  Show eMASSer CLI help for the GET Roles endpoint

DESCRIPTION
  Retrieve all available system roles, or filter by options

EXAMPLES
  $ saf emasser get roles all

  $ saf emasser get roles byCategory [-c, --roleCategory] <value> [-r, --role] <value> [options]
```
- required flags (parameters) are:

  |parameter       | type or values                            |
  |:---------------|:------------------------------------------|
  |--roleCategory  |Possible values: PAC, CAC, Other           |
  |--role          |Possible values: AO, Auditor, Artifact Manager, C&A Team, IAO, ISSO, PM/IAM, SCA, User Rep (View Only), Validator (IV&V)|

- optional parameter are:

  |parameter               | type or values                          |
  |------------------------|:----------------------------------------|
  |--policy                |Possible values: diacap, rmf, reporting  |
  |--includeDecommissioned |BOOLEAN - true or false                  |

[top](#api-endpoints-provided)
### ```get controls```

----
Get system Security Control information for both the Implementation Plan and Risk Assessment
```
USAGE
  $ saf emasser get controls [options]

FLAGS
  -h, --help              Show eMASSer CLI help for the GET Controls endpoint
  -s, --systemId=<value>  (required) The system identification number
  -A, --[no-]acronyms     The system acronym(s) e.g "AC-1, AC-2" - if not provided all controls for systemId are returned

DESCRIPTION
  Get system Security Control information for both the Implementation Plan and Risk Assessment

EXAMPLES
  $ saf emasser get controls --systemId <value> [option]
```
- required flag (parameter):

  |parameter    | type or values                    |
  |-------------|:----------------------------------|
  |--systemId   |Integer - Unique system identifier |

- optional flag (parameter):

  |parameter    | type or values                            |
  |-------------|:------------------------------------------|
  |--acronyms   |The system acronym(s) e.g "AC-1, AC-2" - if not provided all controls for systemId are returned |

[top](#api-endpoints-provided)
### ```get test_results```

----
Get test results for a specific system defined by ID (systemId)
```
USAGE
  $ saf emasser get test_results [options]

FLAGS
  -h, --help                     Show eMASSer CLI help for the GET Test Results endpoint
  -s, --systemId=<value>         (required) The system identification number
  -L, --[no-]latestOnly          Boolean - Filter on latest only
  -a, --controlAcronyms=<value>  The system acronym(s) e.g "AC-1, AC-2"
  -c, --ccis=<value>             The system CCIS string numerical value

DESCRIPTION
  Get test results for a specific system defined by ID (systemId)

EXAMPLES
  $ saf emasser get test_results --systemId <value> [options]
```

- required flag (parameter):

  |parameter    | type or values                    |
  |-------------|:----------------------------------|
  |--systemId   |Integer - Unique system identifier |

- optional flags (parameters) are:

  |parameter          | type or values                            |
  |-------------------|:------------------------------------------|
  |--controlAcronyms  |String - The system acronym(s) e.g "AC-1, AC-2" |
  |--ccis             |String - The system CCIS string numerical value |
  |--latestOnly       |BOOLEAN - true or false|

[top](#api-endpoints-provided)
### ```get poams```

----
There are two endpoints for system poams `forSystem` and `byPoamId`

- forSystem - Retrieves all poams for specified system ID
    ```shell
    USAGE
      $ saf emasser get poams [ARGUMENT]

    ARGUMENTS
      forSystem  Retrieves Poams for specified system ID
      byPoamId   Retrieves Poams for specified system and poam ID

    FLAGS
      -h, --help                              Show eMASSer CLI help for the GET POA&Ms endpoint
      -s, --systemId=<value>                  (required) The system identification number    
      -Y, --[no-]systemOnly                   Boolean - Return only systems
      -a, --controlAcronyms=<value>           The system acronym(s) e.g "AC-1, AC-2"
      -c, --ccis=<value>                      The system CCIS string numerical value
      --scheduledCompletionDateEnd=<value>    The completion end date
      --scheduledCompletionDateStart=<value>  The completion start date

    DESCRIPTION
      Retrieves Poams for specified system ID

    EXAMPLES
      $ saf emasser get poams forSystem [-s, --systemId] <value> [options]
    ```
    - required flag (parameter):

      |parameter    | type or values                    |
      |-------------|:----------------------------------|
      |--systemId   |Integer - Unique system identifier |

    - optional flags (parameters) are:

      |parameter                      | type or values                                |
      |-------------------------------|:----------------------------------------------|
      |--scheduledCompletionDateStart |Date - Unix time format (e.g. 1499644800)      |
      |--scheduledCompletionDateEnd   |Date - Unix time format (e.g. 1499990400)      |
      |--controlAcronyms              |String - The system acronym(s) e.g "AC-1, AC-2"|
      |--ccis                         |String - The system CCIS string numerical value|
      |--systemOnly                   |BOOLEAN - true or false|


- byPoamId - Retrieves all poams for specified system and poam ID 
    ```
    USAGE
      $ saf emasser get poams [ARGUMENT]

    ARGUMENTS
      forSystem  Retrieves Poams for specified system ID
      byPoamId   Retrieves Poams for specified system and poam ID

    FLAGS
      -h, --help              Show eMASSer CLI help for the GET POA&Ms endpoint
      -p, --poamId=<value>    (required) The poam identification number
      -s, --systemId=<value>  (required) The system identification number

    DESCRIPTION
      Retrieves Poams for specified system and poam ID

    EXAMPLES
      $ saf emasser get poams byPoamId [-s, --systemId] <value> [-p, --poamId] <value>    
    ```
  - required flags (parameters) are:

    |parameter    | type or values                    |
    |-------------|:----------------------------------|
    |--systemId   |Integer - Unique system identifier |
    |--poamId     |Integer - Unique poam identifier   |

[top](#api-endpoints-provided)
### ```get milestones```

----
There are two endpoints for system milestones `byPoamId` and `byMilestoneId`

- byPoamId - Retrieves milestone(s) for specified system and poam ID
    ```shell
    USAGE
      $ saf emasser get milestones [ARGUMENT]

    ARGUMENTS
      byPoamId       Retrieves milestone(s) for specified system and poam Id
      byMilestoneId  Retrieves milestone(s) for specified system, poam, and milestone Id

    FLAGS
      -h, --help                                  Show eMASSer CLI help for the GET Milestones endpoint
      -p, --poamId=<value>                        (required) Unique poam identifier
      -s, --systemId=<value>                      (required) Unique system identifier    
      -c, --scheduledCompletionDateEnd=<value>    Unix time format (e.g. 1499990400)
      -t, --scheduledCompletionDateStart=<value>  Unix time format (e.g. 1499644800)

    DESCRIPTION
      Retrieves milestone(s) for specified system and poam ID

    EXAMPLES
      $ saf emasser get milestones byPoamId [-s, --systemId] <value> [-p, --poamId] <value> [options]
    ```
  - required flags (parameters) are:

    |parameter    | type or values                    |
    |-------------|:----------------------------------|
    |--systemId   |Integer - Unique system identifier |
    |--poamId     |Integer - Unique poam identifier   |

  - optional flags (parameters) are:

    |parameter                      | type or values                                |
    |-------------------------------|:----------------------------------------------|
    |--scheduledCompletionDateStart |Date - Unix time format (e.g. 1499644800)      |
    |--scheduledCompletionDateEnd   |Date - Unix time format (e.g. 1499990400)      |


- byMilestoneId, Retrieve milestone(s) for specified system, poam, and milestone ID"
    ```
    USAGE
      $ saf emasser get milestones [ARGUMENT]

    ARGUMENTS
      byPoamId       Retrieves milestone(s) for specified system and poam Id
      byMilestoneId  Retrieves milestone(s) for specified system, poam, and milestone Id

    FLAGS
      -h, --help                 Show eMASSer CLI help for the GET Milestones endpoint
      -m, --milestoneId=<value>  (required) Unique milestone identifier
      -p, --poamId=<value>       (required) The poam identification number
      -s, --systemId=<value>     (required) The system identification number

    DESCRIPTION
      Retrieve milestone(s) for specified system, poam, and milestone ID

    EXAMPLES
      $ saf emasser get milestones byMilestoneId [-s, --systemId] <value> [-p, --poamId] <value> [-m, --milestoneId] <value>
    ```
  - required flags (parameters) are:

    |parameter     | type or values                       |
    |--------------|:-------------------------------------|
    |--systemId    |Integer - Unique system identifier    |
    |--poamId      |Integer - Unique poam identifier      |
    |--milestoneId |Integer - Unique milestone identifier |

[top](#api-endpoints-provided)
### ```get artifacts```

----
There are two endpoints for artifacts `forSystem` and `export`

- forSystem - Retrieves one or many artifacts in a system specified system ID
    ```shell
    USAGE
      $ saf emasser get artifacts [ARGUMENT]

    ARGUMENTS
      forSystem  Retrieves available milestones for provided system (Id)
      export     Exports the milestone(s) for provided system (Id) and file name

    FLAGS
      -h, --help                     Show eMASSer CLI help for the GET Artifacts endpoint
      -s, --systemId=<value>         (required) Unique system identifier    
      -a, --controlAcronyms=<value>  The system acronym(s) e.g "AC-1, AC-2"
      -c, --ccis=<value>             The system CCIS string numerical value
      -f, --filename=<value>         The artifact file name
      -y, --[no-]systemOnly          Boolean - Return only systems

    DESCRIPTION
      Retrieves one or many artifacts for a system specified system ID

    EXAMPLES
      $ saf emasser get artifacts forSystem [-s, --systemId] <value> [options]
    ```
  - required flag (parameter):

    |parameter    | type or values                    |
    |-------------|:----------------------------------|
    |--systemId   |Integer - Unique system identifier |

  - optional flags (parameters) are:

    |parameter                      | type or values                                |
    |-------------------------------|:----------------------------------------------|
    |--filename                     |The artifact file name                         |
    |--controlAcronyms              |String - The system acronym(s) e.g "AC-1, AC-2"|
    |--ccis                         |String - The system CCIS string numerical value|
    |--systemOnly                   |BOOLEAN - true or false|


- export - Retrieves the file artifacts (if compress is true the file binary contents are returned, otherwise the file textual contents are returned.)
  ```
  USAGE
    $ saf emasser get artifacts [ARGUMENT]

  ARGUMENTS
    forSystem  Retrieves available milestones for provided system (Id)
    export     Exports the milestone(s) for provided system (Id) and file name

  FLAGS
    -h, --help              Show eMASSer CLI help for the GET Artifacts endpoint
    -s, --systemId=<value>  (required) The system identification number  
    -f, --filename=<value>  (required) The artifact file name    
    -C, --[no-]compress     Boolean - Compress true or false

  DESCRIPTION
    Retrieves the file artifacts (if compress is true the file binary contents are returned, otherwise the file textual contents are returned.)

  EXAMPLES
    $ saf emasser get artifacts export [-s, --systemId] <value> [-f, --filename] <value> [options]
  ```
  - required flags (parameters) are:

    |parameter    | type or values                    |
    |-------------|:----------------------------------|
    |--systemId   |Integer - Unique system identifier |
    |--filename   |The artifact file name             |
  
  - optional flag (parameter):
  
    |parameter    | type or values                    |
    |-------------|:----------------------------------|
    |--compress   |BOOLEAN - true or false.           |

[top](#api-endpoints-provided)
### ```get cac```

----
To view one or many Control Approval Chain (CAC) in a system specified system ID use the following command:
  ```shell
  USAGE
    $ saf emasser get cac [options]

  FLAGS
    -h, --help                     Show eMASSer CLI help for the GET CAC endpoint
    -s, --systemId=<value>         (required) The system identification number  
    -a, --controlAcronyms=<value>  The system acronym(s) e.g "AC-1, AC-2"

  DESCRIPTION
    View one or many Control Approval Chain (CAC) in a system specified system ID

  EXAMPLES
    $ saf emasser get cac --systemId <value>
  ```
  - required flag (parameter):

    |parameter    | type or values                    |
    |-------------|:----------------------------------|
    |--systemId   |Integer - Unique system identifier |

  - optional flag (parameter):

    |parameter                      | type or values                                |
    |-------------------------------|:----------------------------------------------|
    |--controlAcronyms              |String - The system acronym(s) e.g "AC-1, AC-2"|

[top](#api-endpoints-provided)
### ```get pac```

----
To view one or many Package Approval Chain (PAC) in a system specified system ID use the following command:

  ```shell
  USAGE
    $ saf emasser get pac [options]

  FLAGS
    -h, --help              Show eMASSer CLI help for the GET PAC endpoint
    -s, --systemId=<value>  (required) The system identification number

  DESCRIPTION
    View one or many Package Approval Chain (PAC) in a system specified system ID

  EXAMPLES
    $ saf emasser get pac --systemId <value>
  ```
  - required flag (parameter):

    |parameter    | type or values                    |
    |-------------|:----------------------------------|
    |--systemId   |Integer - Unique system identifier |

[top](#api-endpoints-provided)
### ```get hardware```

---
To view Hardware Baseline assets use the following command:

  ```shell
  USAGE
    $ saf emasser get hardware [ARGUMENT] [FLAGS]
    NOTE: see EXAMPLES for argument case format

  ARGUMENTS
    baseline  Retrieves all hardware baseline for a system

  FLAGS
    -h, --help               Show eMASSer CLI help for the GET Hardware Baseline command  
    -s, --systemId=<value>   (required) The system identification number
    -S, --pageSize=<value>   The number of entries per page (default 20000)
    -i, --pageIndex=<value>  The index of the starting page (default first page 0)

  DESCRIPTION
    View all hardware baseline for a system available on the eMASS instance

  EXAMPLES
    Retrieve baselines without pagination

      $ saf emasser get hardware baseline [-s, --systemId] <value> [options]

    Retrieve baselines with pagination

      $ saf emasser get hardware baseline [-s, --systemId] <value> [-S, --pageSize]=<value> [-i, --pageIndex]=<value>
  ```
  - required flag (parameter):

    |parameter    | type or values                    |
    |-------------|:----------------------------------|
    |--systemId   |Integer - Unique system identifier |

  - Optional flags (parameters) are:

    |parameter          | type or values                                                |
    |-------------------|:--------------------------------------------------------------|
    |-i, --pageIndex        |Integer - The index of the starting page (default first page 0)|
    |-s, --pageSize         |Integer - The number of entries per page (default 20000)       |

  
[top](#api-endpoints-provided)
### ```get software```

---
To view Software Baseline assets use the following command:

  ```shell
  USAGE
    $ saf emasser get software [ARGUMENT] [FLAGS]
    NOTE: see EXAMPLES for argument case format

  ARGUMENTS
    baseline  Retrieves all software baseline for a system

  FLAGS
    -h, --help               Show eMASSer CLI help for the GET Software Baseline command  
    -s, --systemId=<value>   (required) The system identification number    
    -S, --pageSize=<value>   The number of entries per page (default 20000)
    -i, --pageIndex=<value>  The index of the starting page (default first page 0)

  DESCRIPTION
    View all software baseline for a system available on the eMASS instance

  EXAMPLES
    Retrieve baselines without pagination

      $ saf emasser get software baseline [-s, --systemId] <value> [options]

    Retrieve baselines with pagination

      $ saf emasser get software baseline [-s, --systemId] <value> [-S, --pageSize]=<value> [-i, --pageIndex]=<value>
  ```
  - required flag (parameter):

    |parameter    | type or values                    |
    |-------------|:----------------------------------|
    |-s, --systemId   |Integer - Unique system identifier |
  
  - Optional flags (parameters) are:

    |parameter          | type or values                                                |
    |-------------------|:--------------------------------------------------------------|
    |-i, --pageIndex        |Integer - The index of the starting page (default first page 0)|
    |-s, --pageSize         |Integer - The number of entries per page (default 20000)       |

[top](#api-endpoints-provided)
### ```get cmmc```

----
To view Cybersecurity Maturity Model Certification (CMMC) Assessments use the following command:
  ```
  USAGE
    $ saf emasser get cmmc [options]

  FLAGS
    -h, --help               Show eMASSer CLI help for the GET CMMC endpoint  
    -d, --sinceDate=<value>  (required) The CMMC date. Unix date format

  DESCRIPTION
    View Cybersecurity Maturity Model Certification (CMMC) Assessments

  EXAMPLES
    $ saf emasser get cmmc --sinceDate <value>
  ```
  - Required flag (parameter):

    |parameter       | type or values                        |
    |----------------|:--------------------------------------|
    |--sinceDate     |Date - The CMMC date. Unix date format |

[top](#api-endpoints-provided)
### ```get workflow_definitions```

----
To view Workflow Definitions use the following command:
  ```
  USAGE
    $ saf emasser get workflow_definitions [options]

  FLAGS
    -h, --help                       Show eMASSer CLI help for the GET Workflow Definitions endpoint
    -i, --[no-]includeInactive       Boolean - Include inactive workflows
    -r, --registrationType=<option>  The registration type - must be a valid type
                                    <options: assessAndAuthorize|assessOnly|guest|regular|functional|cloudServiceProvider|commonControlProvider>

  DESCRIPTION
    View all workflow schemas available on the eMASS instance

  EXAMPLES
    $ saf emasser get workflow_definitions [options]
  ```

  - Optional flags (parameters) are:

    |parameter            | type or values                                                              |
    |---------------------|:----------------------------------------------------------------------------|
    |--includeInactive    |BOOLEAN - true or false                                                      |    
    |--registrationType   |Possible values: assessAndAuthorize, assessOnly, guest, regular, functional, |
    |                     |                 cloudServiceProvider, commonControlProvider                 |

[top](#api-endpoints-provided)
### ```get workflow_instances```

----
There are two endpoints to view workflow instances `all` and `byInstanceId`
  - all
    ```
    USAGE
      $ saf emasser get workflow_instances [ARGUMENT]

    ARGUMENTS
      all           Retrieves all workflow instances in a site
      byInstanceId  Retrieves workflow(s) instance by ID

    FLAGS
      -h, --help                            Show eMASSer CLI help for the GET Workflow Instances endpoint
      -C, --[no-]includeComments            Boolean - Include transition comments
      -D, --[no-]includeDecommissionSystems Boolean - Include decommissioned systems
      -p, --pageIndex=<value>               The page number to query     
      -d, --sinceDate=<value>               The Workflow Instance date. Unix date format
      -s, --status=<option>                 The Workflow status - must be a valid status. If not provided includes all systems
                                            <options: active|inactive|all>

    DESCRIPTION
      Retrieves all workflow instances

    EXAMPLES
      $ saf emasser get workflow_instances all [options]
    ```
    - Optional flags (parameters) are:

      |parameter                    | type or values                                     |
      |-----------------------------|:---------------------------------------------------|
      |--includeComments            |BOOLEAN - true or false                             |  
      |--includeDecommissionSystems |BOOLEAN - true or false                             |     
      |--pageIndex                  |Integer - The page number to query                  |
      |--sinceDate                  |Date - The Workflow Instance date. Unix date format |
      |--status                     |Possible values: active, inactive, all (If no value is specified, returns all active and inactive workflows)             | 

  - byWorkflowInstanceId
    ```
    USAGE
      $ saf emasser get workflow_instances [ARGUMENT]

    ARGUMENTS
      all           Retrieves all workflow instances in a site
      byInstanceId  Retrieves workflow(s) instance by ID

    FLAGS
      -h, --help                        Show eMASSer CLI help for the GET Workflow Instances endpoint
      -w, --workflowInstanceId=<value>  (required) Unique workflow instance identifier

    DESCRIPTION
      Retrieves workflow instance by workflow Instance ID

    EXAMPLES
      $ saf emasser get workflow_instances byInstanceId [-w, --workflowInstanceId] <value>
    ```
    - required flag (parameter):

      |parameter            | type or values                               |
      |---------------------|:---------------------------------------------|
      |--workflowInstanceId |Integer - Unique workflow instance identifier |

[top](#api-endpoints-provided)
### ```get dashboards```

----
The Dashboards endpoints provide the ability to view data contained in dashboard exports. In the eMASS front end, these dashboard exports are generated as Excel exports.

  ```shell
  USAGE
    $ saf emasser get dashboards [ARGUMENT] [FLAGS]
    NOTE: see EXAMPLES for argument case format

  ARGUMENTS
    status_details                       Get systems status detail dashboard information
    terms_conditions_summary             Get system terms and conditions summary dashboard information
    terms_conditions_details             Get system terms and conditions details dashboard information
    connectivity_ccsd_summary            Get system connectivity CCSD summary dashboard information
    connectivity_ccsd_details            Get system connectivity CCSD details dashboard information
    atc_iatc_details                     Get system ATC/IATC details dashboard information
    questionnaire_summary                Get system questionnaire summary dashboard information
    questionnaire_details                Get system questionnaire details dashboard information
    workflows_history_summary            Get system workflow history summary dashboard information
    workflows_history_details            Get system workflow history details dashboard information
    workflows_history_stage_details      Get system workflow history stage details dashboard information
    control_compliance_summary           Get control compliance summary dashboard information
    security_control_details             Get security control details dashboard information
    assessment_procedures_details        Get assessment procedures details dashboard information
    poam_summary                         Get systems POA&Ms summary dashboard information
    poam_details                         Get system POA&Ms details dashboard information
    artifacts_summary                    Get artifacts summary dashboard information
    artifacts_details                    Get artifacts details dashboard information
    hardware_summary                     Get hardware summary dashboard information
    hardware_details                     Get hardware details dashboard information
    sensor_hardware_summary              Get sensor hardware summary dashboard information
    sensor_hardware_details              Get sensor hardware details dashboard information
    software_summary                     Get software baseline summary dashboard information
    software_details                     Get software baseline details dashboard information
    sensor_software_summary              Get sensor software summary dashboard information
    sensor_software_details              Get sensor software details dashboard information
    sensor_software_counts               Get sensor software counts dashboard information
    critical_assets_summary              Get critical assets summary dashboard information
    vulnerability_summary                Get vulnerability summary dashboard information
    device_findings_summary              Get device findings summary dashboard information
    device_findings_details              Get device findings details dashboard information
    application_findings_summary         Get application findings summary dashboard information
    application_findings_details         Get application findings details dashboard information
    ports_protocols_summary              Get ports and protocols summary dashboard information
    ports_protocols_details              Get ports and protocols details dashboard information
    integration_status_summary           Get CONMON integration status summary dashboard information
    associations_details                 Get system associations details dashboard information
    user_assignments_details             Get user system assignments details dashboard information
    org_migration_status                 Get organization migration status dashboard information
    system_migration_status              Get system migration status dashboard information
    fisma_metrics                        Get FISMA metrics dashboard information
    coast_guard_fisma_metrics            Get Coast Guard FISMA metrics dashboard information
    privacy_summary                      Get system privacy summary dashboard information
    fisma_saop_summary                   Get VA OMB-FISMA SAOP summary dashboard information
    va_icamp_tableau_poam_details        Get VA system ICAMP Tableau POA&M details dashboard information
    va_aa_summary                        Get VA system A&A summary dashboard information
    va_a2_summary                        Get VA system A2.0 summary dashboard information
    va_pl_109_summary                    Get VA System P.L. 109 reporting summary dashboard information
    va_fisma_inventory_summary           Get VA system FISMA inventory summary dashboard information
    va_fisma_inventory_crypto_summary    Get VA system FISMA inventory summary dashboard information
    va_threat_risk_summary               Get VA threat risk summary dashboard information
    va_threat_source_details             Get VA threat source details dashboard information
    va_threat_architecture_details       Get VA threat architecture details dashboard information
    cmmc_status_summary                  Get CMMC assessment status summary dashboard information
    cmmc_compliance_summary              Get CMMC assessment requirements compliance summary dashboard information
    cmmc_security_requirements_details   Get CMMC assessment security requirements details dashboard information
    cmmc_requirement_objectives_details  Get CMMC assessment requirement objectives details dashboard information

  FLAGS
    -I, --[no-]excludeInherited  Boolean - exclude inherited data (default false)
    -h, --help                   Show eMASSer CLI help for the GET Dashboards command
    -i, --pageIndex=<value>      The index of the starting page (default first page 0)
    -o, --orgId=<value>          (required) The organization identification number
    -s, --pageSize=<value>       The number of entries per page (default 20000)

  DESCRIPTION
    Retrieves a pre-defined dashboard by orgId

  EXAMPLES
    $ saf emasser get dashboards [dashboard name] [-o, --orgId] <value> [options]
  ```
All endpoint calls utilize the same parameter values, they are:
  - Required flag (parameter):

    |parameter     | type or values                                  |
    |--------------|:------------------------------------------------|
    |--orgId       |Integer - The organization identification number |

  - Optional flags (parameters) are:

    |parameter          | type or values                                                |
    |-------------------|:--------------------------------------------------------------|
    |--excludeInherited |BOOLEAN - If no value is specified, includes inherited data    |
    |--pageIndex        |Integer - The index of the starting page (default first page 0)|
    |--pageSize         |Integer - The number of entries per page (default 20000)       |

[top](#api-endpoints-provided)

## Usage - POST

### ``post register cert``
---
The Registration endpoint provides the ability to register a certificate & obtain an API-key.

  ```shell
  USAGE
    $ saf emasser post register

  FLAGS
    -h, --help  Show eMASSer CLI help for the Register (POST) a certificate & obtain the API-key

  DESCRIPTION
    The Registration endpoint provides the ability to register a certificate & obtain an API-key

  EXAMPLES
    $ saf emasser post register
  ```

[top](#post)

### ``post test_results``
---
Test Result add (POST) endpoint API business rules.

  |Business Rule                                                        | Parameter/Field  |
  |---------------------------------------------------------------------|:-----------------|
  | Tests Results cannot be saved if the "Test Date" is in the future.  | `testDate` |
  | Test Results cannot be saved if a Security Control is "Inherited" in the system record. | `description` |
  | Test Results cannot be saved if an Assessment Procedure is "Inherited" in the system record. | `description` |
  | Test Results cannot be saved if the AP does not exist in the system. | `description` |
  | Test Results cannot be saved if the control is marked "Not Applicable" by an Overlay. | `description` |
  | Test Results cannot be saved if the control is required to be assessed as "Applicable" by an Overlay.| `description` |
  | Test Results cannot be saved if the Tests Results entered is greater than 4000 characters.|`description`|
  | Test Results cannot be saved if the following fields are missing data: | `complianceStatus`, `testDate`, `testedBy`, `description`|
  | Test results cannot be saved if there is more than one test result per CCI |`cci`|

---
Add (POST) test results CLI usage

  ```shell
  USAGE
    $ saf emasser post test_results [FLAGS]

  FLAGS
    -h, --help                         Show eMASSer CLI help for the POST Test Results command  
    -s, --systemId=<value>             (required) The system identification number
    -a, --assessmentProcedure=<value>  (required) The Security Control Assessment Procedure being assessed    
    -b, --testedBy=<value>             (required) The person that conducted the test (Last Name, First)    
    -t, --testDate=<value>             (required) The date test was conducted, Unix time format    
    -d, --description=<value>          (required) The description of test result. 4000 Characters
    -S, --complianceStatus=<option>    (required) The compliance status of the test result
                                        <options: Compliant|Non-Compliant|Not Applicable>

  DESCRIPTION
    Add test results for a system's Assessment Procedures which determine Security Control compliance
    See the FLAGS section for required fields and acceptable values

  EXAMPLES
    $ saf emasser post test_results [-s,--systemId] [-a,--assessmentProcedure] [-b,--testedBy] [-t,--testDate] [-d,--description] [-S,--complianceStatus]
  ```
Note: If no POA&Ms or AP exist for the control (system), the following message is returned:
"You have entered a Non-Compliant Test Result. You must create a POA&M Item for this Control and/or AP if one does not already exist."

[top](#post)

### ``post poams``
---
#### Plan of Action and Milestones (POA&M) add (POST) endpoint API business rules.

##### Requirements based on `status` field value

  |status          |Required Fields
  |----------------|--------------------------------------------------------
  |Risk Accepted   |`comments`, `resources`
  |Ongoing         |`scheduledCompletionDate`, `resources`, `milestones` (at least 1)
  |Completed       |`scheduledCompletionDate`, `comments`, `resources`, `completionDate`, `milestones` (at least 1)
  |Not Applicable  |POAM can not be created

##### POC fields requirements
If a POC email is supplied, the application will attempt to locate a user
already registered within the application and pre-populate any information
not explicitly supplied in the request. If no such user is found, these
fields are required within the request.
  - `pocOrganization`, `pocFirstName`, `pocLastName`, `pocEmail`, `pocPhoneNumber`

##### Business logic for adding POA&Ms
- POA&M Items cannot be saved if associated Security Control or AP is inherited.
- POA&M Items cannot be created manually if a Security Control or AP is Not Applicable.
- Completed POA&M Item cannot be saved if Completion Date is in the future.
- Completed POA&M Item cannot be saved if Completion Date (completionDate) is in the future.
- Risk Accepted POA&M Item cannot be saved with a Scheduled Completion Date or Milestones
- POA&M Items with a review status of "Not Approved" cannot be saved if Milestone Scheduled Completion Date exceeds POA&M Item  Scheduled Completion Date.
- POA&M Items with a review status of "Approved" can be saved if Milestone Scheduled Completion Date exceeds POA&M Item Scheduled Completion Date.
- POA&M Items that have a status of "Completed" and a status of "Ongoing" cannot be saved without Milestones.
- POA&M Items that have a status of "Risk Accepted" cannot have milestones.
- POA&M Items with a review status of "Approved" that have a status of "Completed" and "Ongoing" cannot update Scheduled Completion Date.
- POA&M Items that have a review status of "Approved" are required to have a Severity Value assigned.
- POA&M Items cannot be updated if they are included in an active package.
- Archived POA&M Items cannot be updated.
- POA&M Items with a status of "Not Applicable" will be updated through test result creation.
- If the Security Control or Assessment Procedure does not exist in the system we may have to just import POA&M Item at the System Level.

##### POA&M parameters/fields character limitations
- Fields that can not exceed 100 characters:
  - Office / Organization (`pocOrganization`)
  - First Name            (`pocFirstName`)
  - Last Name             (`pocLastName`)
  - Email                 (`email`)
  - Phone Number          (`pocPhoneNumber`)
  - External Unique ID    (`externalUid`)
- Fields that can not exceed 250 characters:
  - Resource              (`resource`)
- Fields that can not exceed 2000 character: 
  - Vulnerability Description        (`vulnerabilityDescription`)
  - Source Identifying Vulnerability (`sourceIdentVuln`)
  - Recommendations                  (`recommendations`)
  - Risk Accepted Comments           (`comments`) 
  - Milestone Description            (`description`)
  - Mitigation Justification         (`mitigation`)

##### Add (POST) POA&Ms CLI usages
```shell
  USAGE
    $ saf emasser post poams [FLAGS]
    NOTE: see EXAMPLES for command usages

  FLAGS
    -h, --help              Show eMASSer CLI help for the POST POA&Ms command
    -s, --systemId=<value>  (required) The system identification number
    -f, --dataFile=<value>  (required) A well formed JSON file containing the data to add. It can ba a single object or an array of objects.

  DESCRIPTION
    Add a Plan of Action and Milestones (POA&M) into a systems.
    This CLI expects an input file containing the necessary fields to add a POA&M. The content
    of the file must be in compliance with the eMASS API defined business rules for adding POA&Ms.

  EXAMPLES
    $ saf emasser post poams [-s,--systemId] [-f,--dataFile]
```

**Note:** The input file should be a well formed JSON containing the POA&M information based on defined business rules. 
 
---
##### Required JSON parameter/fields are:
```json
  {
    "status": "One of the following: [Ongoing, Risk Accepted, Completed, Not Applicable]",
    "vulnerabilityDescription": "POA&M vulnerability description",
    "sourceIdentifyingVulnerability": "Source that identifies the vulnerability",
    "pocOrganization": "Organization/Office represented",
    "resources": "List of resources used"
  }
```

##### Required for VA but Conditional for Army and USCG JSON parameters/fields are:
```json
  {
    "identifiedInCFOAuditOrOtherReview": "If not specified, this field will be set to false because it does not accept a null value (Required for VA. Optional for Army and USCG)",
    "personnelResourcesFundedBaseHours": "Hours for personnel resources that are founded (Required for VA. Optional for Army and USCG)",
    "personnelResourcesCostCode": "Values are specific per eMASS instance (Required for VA. Optional for Army and USCG)",
    "personnelResourcesUnfundedBaseHours": "Funded based hours (100.00) (Required for VA. Optional for Army and USCG)",
    "personnelResourcesNonfundingObstacle": "Values are specific per eMASS instance (Required for VA. Optional for Army and USCG)",
    "personnelResourcesNonfundingObstacleOtherReason": "Reason (text 2,000 char) (Required for VA. Optional for Army and USCG)",
    "nonPersonnelResourcesFundedAmount": "Funded based hours (100.00) (Required for VA. Optional for Army and USCG)",
    "nonPersonnelResourcesCostCode": "Values are specific per eMASS instance (Required for VA. Optional for Army and USCG)",
    "nonPersonnelResourcesUnfundedAmount": "Funded based hours (100.00) (Required for VA. Optional for Army and USCG)",
    "nonPersonnelResourcesNonfundingObstacle": "Values are specific per eMASS instance (Required for VA. Optional for Army and USCG)",
    "nonPersonnelResourcesNonfundingObstacleOtherReason": "Reason (text 2,000 char) (Required for VA. Optional for Army and USCG)"
  }
```

##### Conditional JSON parameters/fields are:
```json
  {
    "milestones": [
      {
        "description": "The milestone description",
        "scheduledCompletionDate": "Milestone scheduled completion date (Unix format)"
      }
    ],
    "pocFirstName": "First name of POC (only if Last Name, Email, or Phone Number have data)",
    "pocLastName": "Last name of POC (only if First Name, Email, or Phone Number have data)",
    "pocEmail": "Email address of POC (only if First Name, Last Name, or Phone Number have data)",
    "pocPhoneNumber": "Phone number of POC (only if First Name, Last Name, or Email have data)",
    "severity": "Risk Analysis field, maybe required by certain eMASS instances. Required for approved items",
    "scheduledCompletionDate": "Required for ongoing and completed POA&M items",
    "completionDate": "Field is required for completed POA&M items",
    "comments": "Field is required for completed and risk accepted POA&M items"
  }
```

##### Optional JSON parameters/fields
```json
  {
    "externalUid": "External ID associated with the POA&M",
    "controlAcronym": "The system acronym(s) e.g AC-1, AC-2",
    "assessmentProcedure": "The Security Control Assessment Procedures being associated with the POA&M Item",
    "securityChecks": "Security Checks that are associated with the POA&M",
    "rawSeverity": "One of the following [Very Low, Low, Moderate, High, Very High]",
    "relevanceOfThreat": "Risk Analysis field, maybe required by certain eMASS instances. One of the following [Very Low, Low, Moderate, High, Very High]",
    "likelihood": "Risk Analysis field, maybe required by certain eMASS instances. One of the following [Very Low, Low, Moderate, High, Very High]",
    "impact": "Risk Analysis field, maybe required by certain eMASS instances. Description of Security Control impact",
    "residualRiskLevel": "Risk Analysis field, maybe required by certain eMASS instances. One of the following [Very Low, Low, Moderate, High, Very High]",
    "mitigations": "Risk Analysis field, maybe required by certain eMASS instances. Mitigation explanation",
    "impactDescription": "Description of the security control impact",
    "recommendations": "Any recommendations content",
    "resultingResidualRiskLevelAfterProposedMitigations": "One of the following [Very Low, Low, Moderate, High, Very High] (Navy only)",
    "predisposingConditions": "Conditions (Navy only)",
    "threatDescription": "Threat description (Navy only)",
    "devicesAffected": "List of affected devices by hostname. If all devices are affected, use `system` or `all` (Navy only)"
  }
```

##### All accepted parameters/fields are:

```json
  {
    "status": "One of the following: [Ongoing, Risk Accepted, Completed, Not Applicable]",
    "vulnerabilityDescription": "POA&M vulnerability description",
    "sourceIdentifyingVulnerability": "Source that identifies the vulnerability",
    "pocOrganization": "Organization/Office represented",
    "resources": "List of resources used",
    "identifiedInCFOAuditOrOtherReview": "If not specified, this field will be set to false because it does not accept a null value (Required for VA. Optional for Army and USCG)",
    "personnelResourcesFundedBaseHours": "Hours for personnel resources that are founded (Required for VA. Optional for Army and USCG)",
    "personnelResourcesCostCode": "Values are specific per eMASS instance (Required for VA. Optional for Army and USCG)",
    "personnelResourcesUnfundedBaseHours": "Funded based hours (100.00) (Required for VA. Optional for Army and USCG)",
    "personnelResourcesNonfundingObstacle": "Values are specific per eMASS instance (Required for VA. Optional for Army and USCG)",
    "personnelResourcesNonfundingObstacleOtherReason": "Reason (text 2,000 char) (Required for VA. Optional for Army and USCG)",
    "nonPersonnelResourcesFundedAmount": "Funded based hours (100.00) (Required for VA. Optional for Army and USCG)",
    "nonPersonnelResourcesCostCode": "Values are specific per eMASS instance (Required for VA. Optional for Army and USCG)",
    "nonPersonnelResourcesUnfundedAmount": "Funded based hours (100.00) (Required for VA. Optional for Army and USCG)",
    "nonPersonnelResourcesNonfundingObstacle": "Values are specific per eMASS instance (Required for VA. Optional for Army and USCG)",
    "nonPersonnelResourcesNonfundingObstacleOtherReason": "Reason (text 2,000 char) (Required for VA. Optional for Army and USCG)",
    "milestones": [
      {
        "description": "The milestone description",
        "scheduledCompletionDate": "Milestone scheduled completion date (Unix format)"
      }
    ],
    "pocFirstName": "First name of POC (only if Last Name, Email, or Phone Number have data)",
    "pocLastName": "Last name of POC (only if First Name, Email, or Phone Number have data)",
    "pocEmail": "Email address of POC (only if First Name, Last Name, or Phone Number have data)",
    "pocPhoneNumber": "Phone number of POC (only if First Name, Last Name, or Email have data)",
    "severity": "Risk Analysis field, maybe required by certain eMASS instances. Required for approved items",
    "scheduledCompletionDate": "Required for ongoing and completed POA&M items",
    "completionDate": "Field is required for completed POA&M items",
    "comments": "Field is required for completed and risk accepted POA&M items",
    "externalUid": "External ID associated with the POA&M",
    "controlAcronym": "The system acronym(s) e.g AC-1, AC-2",
    "assessmentProcedure": "The Security Control Assessment Procedures being associated with the POA&M Item",
    "securityChecks": "Security Checks that are associated with the POA&M",
    "rawSeverity": "One of the following [Very Low, Low, Moderate, High, Very High]",
    "relevanceOfThreat": "Risk Analysis field, maybe required by certain eMASS instances. One of the following [Very Low, Low, Moderate, High, Very High]",
    "likelihood": "Risk Analysis field, maybe required by certain eMASS instances. One of the following [Very Low, Low, Moderate, High, Very High]",
    "impact": "Risk Analysis field, maybe required by certain eMASS instances. Description of Security Control impact",
    "residualRiskLevel": "Risk Analysis field, maybe required by certain eMASS instances. One of the following [Very Low, Low, Moderate, High, Very High]",
    "mitigations": "Risk Analysis field, maybe required by certain eMASS instances. Mitigation explanation",
    "impactDescription": "Description of the security control impact",
    "recommendations": "Any recommendations content",
    "resultingResidualRiskLevelAfterProposedMitigations": "One of the following [Very Low, Low, Moderate, High, Very High] (Navy only)",
    "predisposingConditions": "Conditions (Navy only)",
    "threatDescription": "Threat description (Navy only)",
    "devicesAffected": "List of affected devices by hostname. If all devices are affected, use `system` or `all` (Navy only)"
  }
```

[top](#post)

### ``post milestones``
---
Add (POST) milestones to one or many POA&M items in a system

```shell
USAGE
   $ saf emasser post milestones -s <value> -p <value> -d <description> -c <completion-date>

FLAGS
  -h, --help                             Post (add) milestones to one or many POA&M items in a system
  -p, --poamId=<value>                   (required) The poam identification number
  -s, --systemId=<value>                 (required) The system identification number
  -c, --scheduledCompletionDate=<value>  (required) The scheduled completion date - Unix time format
  -d, --description=<value>              (required) The milestone description

DESCRIPTION
  Add milestones to one or many POA&M items in a system
  Milestones provide specific information about the status
  of processes used to mitigate risks and weakness findings.

EXAMPLES
  $ saf emasser post milestones [-s,--systemId] [-p,--poamId] [-d,--description] [-c,--scheduledCompletionDate]
```

[top](#post)

### ``post artifacts``
---
#### Upload artifacts one or many artifacts in a system

The body of a request through the Artifacts POST endpoint accepts a single binary file.
Two Artifact POST methods are currently accepted: individual and bulk.
Filename uniqueness within an eMASS system will be enforced by the API for both methods.
For POST requests that should result in a single artifact, the request should include the file.

#### Business rules
Upon successful receipt of one or many artifacts, if a file is matched via filename to an
artifact existing within the application, the file associated with the artifact will be updated.
If no artifact is matched via filename to the application, a new artifact will be created with
the following default values. Any values not specified below will be null.
```shell
  - isTemplate: false
  - type: other
  - category: evidence
```
Any values not specified below will be null.

#### Artifacts rules and limitations
- Artifact cannot be saved if File Name (fileName) exceeds 1,000 characters
- Artifact cannot be saved if Name (name) exceeds 100 characters
- Artifact cannot be saved if Description (description) exceeds 10,000 characters
- Artifact cannot be saved if Reference Page Number (refPageNumber) exceeds 50 characters
- Artifact cannot be saved if the file does not have an allowable file extension/type.
- Artifact version cannot be saved if an Artifact with the same file name already exist in the system.
- Artifact cannot be saved if the file size exceeds 30MB.
- Artifact cannot be saved if the Last Review Date is set in the future.
- Artifact cannot be saved if the following fields are missing data:
  -  Filename
  -  Type
  -  Category
---
#### Add (POST) Artifacts CLI usages
```shell
USAGE
  $ saf emasser post artifacts [FLAGS]
  NOTE: see EXAMPLES for command options

FLAGS
  -h, --help                 Post (add) artifact file(s) to a system
  -f, --fileName=<value>...  (required) Artifact file(s) to post to the given system, can have multiple (space separated)
  -s, --systemId=<value>     (required) The system identification number
  -T, --[no-]isTemplate      Boolean - Indicates whether an artifact is a template.
  -c, --category=<option>    Artifact category [default: Evidence] Various artifact category are accepted (defined by the eMASS administrator)
  -t, --type=<option>        Artifact file type [default: Other] Various artifact file type are accepted (defined by the eMASS administrator)

DESCRIPTION
  Uploads a single or multiple artifacts to a system.
  The single file can be an individual artifact or a .zip
  file containing multiple artifacts. If multiple files are
  provided they are archived into a zip file and sent as bulk.

EXAMPLES
  Add a single artifact file
    $ saf emasser post artifacts [-s,--systemId] [-f,--fileName] <path-to-file> [FLAGS]

  Add multiple artifact files
    $ saf emasser post artifacts [-s,--systemId] [-f,--fileName] <path-to-file1> <path-to-file2> ... [FLAGS]

  Add bulk artifact file (.zip)
    $ saf emasser post artifacts [-s,--systemId] [-f,--fileName] <path-to-zip-file> [FLAGS]
```

[top](#post)

### ``post cac``
----
Add a Control Approval Chain (CAC) items in a system

#### Business Rule
- Comments are not required at the first role of the CAC but are required at the second role of the CAC. 
- Comments cannot exceed 10,000 characters.

#### Add (POST) CAC CLI usages

 ```shell
USAGE
  $ saf emasser post cac [FLAGS]

FLAGS
  -h, --help                    Post (add) control to second stage of CAC
  -s, --systemId=<value>        (required) The system identification number
  -a, --controlAcronym=<value>  (required) The system acronym "AC-1, AC-2"
  -c, --comments=<value>        The control approval chain comments

DESCRIPTION
  Add a Control Approval Chain (CAC) items in a system

EXAMPLES
  $ saf emasser post cac [-s,--systemId] [-a,--controlAcronym] [options]

 ```

[top](#post)

### ``post pac``
----
Add new Package Approval Chain (PAC) workflow(s) for a system

#### Add (POST) PAC CLI usages

```shell
USAGE
  $ saf emasser post pac [FLAGS]

FLAGS
  -h, --help               Post (add) a Package Approval Chain (PAC) item in a system
  -s, --systemId=<value>   (required) The system identification number  
  -c, --comments=<value>   (required) The control approval chain comments
  -n, --name=<value>       (required) The control package name
  -w, --workflow=<option>  (required) The appropriate workflow
                           <options: Assess and Authorize|Assess Only|Security Plan Approval>

DESCRIPTION
  Add new Package Approval Chain (PAC) workflow(s) for a system

EXAMPLES
  $ saf emasser post pac [-s,--systemId] [-w,--workflow] [-n,--name] [-c,--comments]
```

[top](#post)

### ``post hardware``
----
Add one or many hardware assets to a system.

  ```shell
  USAGE
    $ saf emasser post hardware_baseline [FLAGS]
    NOTE: see EXAMPLES for command usages

  FLAGS
    -h, --help              Show eMASSer CLI help for the POST Hardware Baseline command  
    -s, --systemId=<value>  (required) The system identification number    
    -f, --dataFile=<value>  (required) A well formed JSON file containing the data to add. It can ba a single object or an array of objects.

  DESCRIPTION
    Add one or many hardware assets to a system.
    The CLI expects an input JSON file containing the required, conditional
    and optional fields for the hardware asset(s) being added to the system.

  EXAMPLES
    $ saf emasser post hardware_baseline [-s,--systemId] [-f,--dataFile]
  ```

**Note:** The input file should be a well formed JSON containing the Hardware Assets information. 
#### Required JSON parameter/field is:
```json
  {
    "assetName": "Name of the hardware asset"
  }
```
#### Conditional JSON parameters/fields are:
```json
  {
    "publicFacingFqdn": "Public facing FQDN. Only applicable if Public Facing is set to true",
    "publicFacingIpAddress": "Public facing IP address. Only applicable if Public Facing is set to true",
    "publicFacingUrls": "Public facing URL(s). Only applicable if Public Facing is set to true"
  }
```
#### Optional JSON parameters/fields are:
```json
  {
    "componentType": "Public facing FQDN. Only applicable if Public Facing is set to true",
    "nickname": "Public facing IP address. Only applicable if Public Facing is set to true",
    "assetIpAddress": "IP address of the hardware asset",
    "publicFacing": "Public facing is defined as any asset that is accessible from a commercial connection",
    "virtualAsset": "Determine if this is a virtual hardware asset",
    "manufacturer": "Manufacturer of the hardware asset. Populated with “Virtual” by default if Virtual Asset is true",
    "modelNumber": "Model number of the hardware asset. Populated with “Virtual” by default if Virtual Asset is true",
    "serialNumber": "Serial number of the hardware asset. Populated with “Virtual” by default if Virtual Asset is true",
    "osIosFwVersion": "OS/iOS/FW version of the hardware asset",
    "memorySizeType": "Memory size / type of the hardware asset",
    "location": "Location of the hardware asset",
    "approvalStatus": "Approval status of the hardware asset",
    "criticalAsset": "Indicates whether the asset is a critical information system asset"
  }
```
#### All accepted parameters/fields are:
```json
  {
    "assetName": "Name of the hardware asset",
    "publicFacingFqdn": "Public facing FQDN. Only applicable if Public Facing is set to true",
    "publicFacingIpAddress": "Public facing IP address. Only applicable if Public Facing is set to true",
    "publicFacingUrls": "Public facing URL(s). Only applicable if Public Facing is set to true",
    "assetName": "Name of the hardware asset",
    "publicFacingFqdn": "Public facing FQDN. Only applicable if Public Facing is set to true",
    "publicFacingIpAddress": "Public facing IP address. Only applicable if Public Facing is set to true",
    "publicFacingUrls": "Public facing URL(s). Only applicable if Public Facing is set to true",
    "publicFacingIpAddress": "Public facing IP address. Only applicable if Public Facing is set to true",
    "publicFacingUrls": "Public facing URL(s). Only applicable if Public Facing is set to true",
    "componentType": "Public facing FQDN. Only applicable if Public Facing is set to true",
    "nickname": "Public facing IP address. Only applicable if Public Facing is set to true",
    "assetIpAddress": "IP address of the hardware asset",
    "publicFacing": "Public facing is defined as any asset that is accessible from a commercial connection",
    "virtualAsset": "Determine if this is a virtual hardware asset",
    "manufacturer": "Manufacturer of the hardware asset. Populated with “Virtual” by default if Virtual Asset is true",
    "modelNumber": "Model number of the hardware asset. Populated with “Virtual” by default if Virtual Asset is true",
    "serialNumber": "Serial number of the hardware asset. Populated with “Virtual” by default if Virtual Asset is true",
    "osIosFwVersion": "OS/iOS/FW version of the hardware asset",
    "memorySizeType": "Memory size / type of the hardware asset",
    "location": "Location of the hardware asset",
    "approvalStatus": "Approval status of the hardware asset",
    "criticalAsset": "Indicates whether the asset is a critical information system asset"
  }
```
[top](#post)

### ``post software``
----
Add one or many software assets to a system.

  ```shell
  USAGE
    $ saf emasser post software_baseline [FLAGS]
    NOTE: see EXAMPLES for command usages

  FLAGS
    -h, --help              Show eMASSer CLI help for the POST Software Baseline command 
    -s, --systemId=<value>  (required) The system identification number  
    -f, --dataFile=<value>  (required) A well formed JSON file containing the data to add. It can ba a single object or an array of objects.

  DESCRIPTION
    Add one or many software assets to a system.
    The CLI expects an input JSON file containing the required, conditional
    and optional fields for the software asset(s) being added to the system.

  EXAMPLES
    $ saf emasser post software_baseline [-s,--systemId] [-f,--dataFile]
  ```

**Note:** The input file should be a well formed JSON containing the Software Assets information. 
#### Required JSON parameter/field is:
```json
  {
    "softwareVendor": "Vendor of the software asset",
    "softwareName": "Name of the software asset",
    "version": "Version of the software asset"
  }
```
#### Conditional JSON parameters/fields are:
```json
  {
    "approvalDate": "Approval date of the software asset. If Approval Status is set to “Unapproved” or “In Progress”, Approval Date will be set to null"
  }
```
#### Optional JSON parameters/fields are:
```json
  {
    "softwareType": "Type of the software asset",
    "parentSystem": "Parent system of the software asset",
    "subsystem": "Subsystem of the software asset",
    "network": "Network of the software asset",
    "hostingEnvironment": "Hosting environment of the software asset",
    "softwareDependencies": "Dependencies for the software asset",
    "cryptographicHash": "Cryptographic hash for the software asset",
    "inServiceData": "Date the sotware asset was added to the network",
    "itBudgetUii": "IT budget UII for the software asset",
    "fiscalYear": "Fiscal year (FY) for the software asset",
    "popEndDate": "Period of performance (POP) end date for the software asset",
    "licenseOrContract": "License or contract for the software asset",
    "licenseTerm": "License term for the software asset",
    "costPerLicense": "Cost per license for the software asset",
    "totalLicenses": "Number of total licenses for the software asset",
    "totalLicenseCost": "Total cost of the licenses for the software asset",
    "licensesUsed": "Number of licenses used for the software asset",
    "licensePoc": "Point of contact (POC) for the software asset",
    "licenseRenewalDate": "License renewal date for the software asset",
    "licenseExpirationDate": "License expiration date for the software asset",
    "approvalStatus": "Approval status of the software asset",
    "releaseDate": "Release date of the software asset",
    "maintenanceDate": "Maintenance date of the software asset",
    "retirementDate": "Retirement date of the software asset",
    "endOfLifeSupportDate": "End of life/support date of the software asset",
    "extendedEndOfLifeSupportDate": "Extended End of Life/Support Date cannot occur prior to the End of Life/Support Date",
    "criticalAsset": "Indicates whether the asset is a critical information system asset",
    "location": "Location of the software asset",
    "purpose": "Purpose of the software asset",
    "unsupportedOperatingSystem": "Unsupported operating system (VA only)",
    "unapprovedSoftwareFromTrm": "Unapproved software from TRM (VA only)",
    "approvedWaiver": "Approved waiver (VA only)"
  }
```
#### All accepted parameters/fields are:
```json
  {
    "softwareVendor": "Vendor of the software asset",
    "softwareName": "Name of the software asset",
    "version": "Version of the software asset",
    "approvalDate": "Approval date of the software asset. If Approval Status is set to “Unapproved” or “In Progress”, Approval Date will be set to null",
    "softwareType": "Type of the software asset",
    "parentSystem": "Parent system of the software asset",
    "subsystem": "Subsystem of the software asset",
    "network": "Network of the software asset",
    "hostingEnvironment": "Hosting environment of the software asset",
    "softwareDependencies": "Dependencies for the software asset",
    "cryptographicHash": "Cryptographic hash for the software asset",
    "inServiceData": "Date the sotware asset was added to the network",
    "itBudgetUii": "IT budget UII for the software asset",
    "fiscalYear": "Fiscal year (FY) for the software asset",
    "popEndDate": "Period of performance (POP) end date for the software asset",
    "licenseOrContract": "License or contract for the software asset",
    "licenseTerm": "License term for the software asset",
    "costPerLicense": "Cost per license for the software asset",
    "totalLicenses": "Number of total licenses for the software asset",
    "totalLicenseCost": "Total cost of the licenses for the software asset",
    "licensesUsed": "Number of licenses used for the software asset",
    "licensePoc": "Point of contact (POC) for the software asset",
    "licenseRenewalDate": "License renewal date for the software asset",
    "licenseExpirationDate": "License expiration date for the software asset",
    "approvalStatus": "Approval status of the software asset",
    "releaseDate": "Release date of the software asset",
    "maintenanceDate": "Maintenance date of the software asset",
    "retirementDate": "Retirement date of the software asset",
    "endOfLifeSupportDate": "End of life/support date of the software asset",
    "extendedEndOfLifeSupportDate": "Extended End of Life/Support Date cannot occur prior to the End of Life/Support Date",
    "criticalAsset": "Indicates whether the asset is a critical information system asset",
    "location": "Location of the software asset",
    "purpose": "Purpose of the software asset",
    "unsupportedOperatingSystem": "Unsupported operating system (VA only)",
    "unapprovedSoftwareFromTrm": "Unapproved software from TRM (VA only)",
    "approvedWaiver": "Approved waiver (VA only)"
  }
```
[top](#post)

### ```post device scan results```
---
Add (upload) device scan results in the assets module for a system

#### Business Rules
The body of a request through the Device Scan Results POST endpoint accepts a single binary file.
Specific file extensions are expected depending upon the scanType parameter.
For example, .ckl or .cklb files are accepted when using scanType is set to disaStigViewerCklCklb.

When the scan type is an acasAsrArf or policyAuditor, a .zip file is expected which should contain
a single scan result (for example, a single pair of .asr and .arf files).

Single files are expected for all other scan types as this endpoint requires files to be uploaded consecutively as opposed to in bulk.

Current scan types that are supported:
 - ACAS: ASR/ARF
 - ACAS: NESSUS
 - DISA STIG Viewer: CKL/CKLB
 - DISA STIG Viewer: CMRS
 - Policy Auditor
 - SCAP Compliance Checker

The parameter (flag) isBaseline (Boolean) is used if the imported file represents a baseline scan.
Importing as a baseline scan, which assumes a common set of scan policies are used when conducting
a scan, will replace a device's findings for a specific Benchmark.

**NOTE:** Applicable to ASR/ARF scans only.


#### Add (POST) a Scan Result CLI usages
```shell
  USAGE
    $ saf emasser post device_scans [FLAGS]

  FLAGS
    -h, --help               Show eMASSer CLI help for the POST Device Scan Results command
    -s, --systemId=<value>   (required) The system identification number  
    -f, --filename=<value>   (required) The device scan result file to be uploaded.  
    -S, --scanType=<option>  (required) The type of scan being uploaded
                             <options: acasAsrArf|acasNessus|disaStigViewerCklCklb|disaStigViewerCmrs|policyAuditor|scapComplianceChecker>  
    -B, --[no-]isBaseline    Indicates if the scan is a baseline scan

  DESCRIPTION
    Add (upload) device scan results in the assets module for a system
    Supported scan types: ACAS, DISA STIG Viewer, Policy Auditor, SCAP Compliance Checker
    See the [-S, --scanType] command line flag for acceptable option names for scan type

  EXAMPLES
    Add a DISA STIG Viewer file (disaStigViewerCklCklb)
      $ saf emasser post device_scans [-s, --systemId] <value> [-f, --dataFile] <filename.ckl or filename.cklb> [-S, --scanType] <disaStigViewerCklCklb>  [-B, --[no-]isBaseline]

    Add an ACAS (acasAsrArf) or Policy Auditor (policyAuditor)
      $ saf emasser post device_scans [-s, --systemId] <value> [-f, --dataFile] <filename.zip> [-S, --scanType] <acasAsrArf or policyAuditor> [-B, --[no-]isBaseline]

    All other supported scan types, a single file is expected
      $ saf emasser post device_scans [-s, --systemId] <value> [-f, --dataFile] <path-to-file> [-S, --scanType] <acasNessus or disaStigViewerCmrs or scapComplianceChecker>  [-B, --[no-]isBaseline]
```
[top](#post)

### ```post cloud_resource```
---
Add Cloud Resource Results scans in the assets module for a system.

#### Cloud Resource parameters/fields character limitations
- Fields that can not exceed 50 characters:
  - Policy Deployment Version (`policyDeploymentVersion`)
- Fields that can not exceed 100 characters:
  - Assessment Procedure      (`assessmentProcedure`)
  - Security Control Acronym  (`control`)
  - CSP Account ID            (`cspAccountId`)
  - CSP Region                (`cspRegion`)
  - Email of POC              (`initiatedBy`)
  - Cloud Service Provider    (`provider`)
  - Type of Cloud resource    (`resourceType`)
- Fields that can not exceed 500 characters:
  - CSP/Resource’s Policy ID  (`cspPolicyDefinitionId`)
  - Policy Deployment Name    (`policyDeploymentName`)
  - Policy Compliance ID      (`resourceId`)
  - Cloud Resource Name       (`resourceName`)
- Fields that can not exceed 1000 characters:
  - Reason for Compliance (`complianceReason`)
- Fields that can not exceed 2000 characters:
  - Policy Short Title    (`policyDefinitionTitle`)

#### Add (POST) Cloud Resources CLI usages

```shell
USAGE
  $ saf emasser post cloud_resources [FLAGS]
  NOTE: see EXAMPLES for command usages

FLAGS
  -h, --help              Show eMASSer CLI help for the POST Cloud Resource Results command
  -s, --systemId=<value>  (required) The system identification number  
  -f, --dataFile=<value>  (required) A well formed JSON file containing the data to add. It can ba a single object or an array of objects.

DESCRIPTION
  Add a cloud resource and their scan results in the assets module for a system

EXAMPLES
  $ saf emasser post cloud_resources [-s,--systemId] [-f,--dataFile]
```

**Note:** The input file `[-f, --dataFile]`should be a well formed JSON containing the Cloud Resources and their scan results information.

---
####  Required JSON parameter/fields are:
```json
  {
    "provider": "Cloud service provider name",
    "resourceId": "Unique identifier/resource namespace for policy compliance result",
    "resourceName": "Friendly name of Cloud resource",
    "resourceType": "The cloud resource type",
    "complianceResults": [
      {
        "cspPolicyDefinitionId": "Unique identifier/compliance namespace for CSP/Resource's policy definition/compliance check",
        "isCompliant": "True/false flag for compliance status of the policy for the identified cloud resource",
        "policyDefinitionTitle": "Friendly policy/compliance check title. Recommend short title"
      }
    ]
  }
```

#### Optional JSON parameters/fields are:
```json
  {
    "cspAccountId": "System/owner's CSP account ID/number",
    "cspRegion": "CSP region of system",
    "initiatedBy": "Email of POC",
    "isBaseline": "True/false flag for providing results as baseline. If true, all existing compliance results for the resourceId will be replaced by results in the current call",
    "tags": {
      "test": "Informational tags associated to results for other metadata"
    },
    "complianceResults": [
      {
        "assessmentProcedure": "Comma separated correlation to Assessment Procedure (i.e. CCI number for DoD Control Set)",
        "complianceCheckTimestamp": "Unix date format",
        "complianceReason": "Reason/comments for compliance result",
        "control": "Comma separated correlation to Security Control (e.g. exact NIST Control acronym)",
        "policyDeploymentName": "Name of policy deployment",
        "policyDeploymentVersion": "Version of policy deployment",
        "severity": "One of the following [Low, Medium, High, Critical]"
      }
    ]
  }
```
#### All accepted parameters/fields are:
```json
  {
    "provider": "Cloud service provider name",
    "resourceId": "Unique identifier/resource namespace for policy compliance result",
    "resourceName": "Friendly name of Cloud resource",
    "resourceType": "The cloud resource type",
    "complianceResults": [
      {
        "cspPolicyDefinitionId": "Unique identifier/compliance namespace for CSP/Resource's policy definition/compliance check",
        "isCompliant": "True/false flag for compliance status of the policy for the identified cloud resource",
        "policyDefinitionTitle": "Friendly policy/compliance check title. Recommend short title",
        "assessmentProcedure": "Comma separated correlation to Assessment Procedure (i.e. CCI number for DoD Control Set)",
        "complianceCheckTimestamp": "Unix date format",
        "complianceReason": "Reason/comments for compliance result",
        "control": "Comma separated correlation to Security Control (e.g. exact NIST Control acronym)",
        "policyDeploymentName": "Name of policy deployment",
        "policyDeploymentVersion": "Version of policy deployment",
        "severity": "One of the following [Low, Medium, High, Critical]"
      }
    ],
    "cspAccountId": "System/owner's CSP account ID/number",
    "cspRegion": "CSP region of system",
    "initiatedBy": "Email of POC",
    "isBaseline": "True/false flag for providing results as baseline. If true, all existing compliance results for the resourceId will be replaced by results in the current call",
    "tags": {
      "test": "Informational tags associated to results for other metadata"
    }
  } 
```

[top](#post)

### ```post container_scans```
---
Add Container Scan Results in the assets module for a system.

#### Container Scan Results parameters/fields character limitations
- Fields that can not exceed 100 characters:
  - STIG Benchmark ID      (`benchmark`)
  - Container Namespace    (`namespace`)
  - Kubernetes assigned IP (`podIp`)
  - Kubernetes Pod Name)   (`podName`)
- Fields that can not exceed 500 characters:
  - Container ID              (`containerId`)
  - Friendly Container Name    (`containerName`)
- Fields that can not exceed 1000 characters:
  - Result Comments (`message`)

#### Add (POST) Container Scan Results CLI usages

```shell
USAGE
  $ saf emasser post container_scans [FLAGS]

FLAGS
  -h, --help              Show eMASSer CLI help for the POST Container Scan Results command
  -s, --systemId=<value>  (required) The system identification number
  -f, --dataFile=<value>  (required) A well formed JSON file with container scan results. It can ba a single object or an array of objects.

DESCRIPTION
  Upload containers and their scan results in the assets module for a system

EXAMPLES
  $ saf emasser post container_scans [-s,--systemId] [-f,--dataFile]
```
**Note:** The input file `[-f, --dataFile]` should be a well formed JSON containing the Container Scan results information.

---
#### Required JSON parameter/fields are:
```json
  {
    "containerId": "Unique identifier of the container",
    "containerName": "Friendly name of the container",
    "time": "Datetime of scan/result. Unix date format",
    "benchmarks": [
      {
        "benchmark": "Identifier of the benchmark/grouping of compliance results. (e.g. for STIG results, provide the benchmark id for the STIG technology)",
        "results": [
          {
            "ruleId": "Identifier for the compliance result, vulnerability, etc. the result is for. (e.g. for STIGs, use the SV-XXXrXX identifier; for CVEs, the CVE-XXXX-XXX identifier, etc.).",
            "lastSeen": "Datetime last seen. Unix date format",
            "status": "One of the following [Pass,Fail,Other,Not Reviewed,Not Checked,Not Applicable]"
          }
        ]
      }
    ]
  }
```

#### Optional JSON parameters/fields are:
```json
  {
    "namespace": "Namespace of container in container orchestration (e.g. Kubernetes namespace)",
    "podIp": "IP address of pod (e.g. Kubernetes assigned IP)",
    "podName": "Name of pod (e.g. Kubernetes pod)",
    "tags": {
      "test": "Informational tags associated to results for other metadata"
    },
    "benchmarks": [
      {
        "isBaseline": "True/false flag for providing results as baseline. If true, all existing compliance results for the provided benchmark within the container will be replaced by results in the current call",
        "verion": "The benchmark version",
        "release": "The benchmark release",
        "results": [
          {
            "message": "Comments for the result"
          }
        ]
      }
    ]
  }
```
#### All accepted parameters/fields are:
```json
  {
    "containerId": "Unique identifier of the container",
    "containerName": "Friendly name of the container",
    "time": "Datetime of scan/result. Unix date format",
    "benchmarks": [
      {
        "benchmark": "Identifier of the benchmark/grouping of compliance results. (e.g. for STIG results, provide the benchmark id for the STIG technology)",
        "results": [
          {
            "ruleId": "Identifier for the compliance result, vulnerability, etc. the result is for. (e.g. for STIGs, use the SV-XXXrXX identifier; for CVEs, the CVE-XXXX-XXX identifier, etc.).",
            "lastSeen": "Datetime last seen. Unix date format",
            "status": "One of the following [Pass,Fail,Other,Not Reviewed,Not Checked,Not Applicable]",
            "message": "Comments for the result"
          }
        ],
        "isBaseline": "True/false flag for providing results as baseline. If true, all existing compliance results for the provided benchmark within the container will be replaced by results in the current call",
        "verion": "The benchmark version",
        "release": "The benchmark release"
      }
    ],
    "namespace": "Namespace of container in container orchestration (e.g. Kubernetes namespace)",
    "podIp": "IP address of pod (e.g. Kubernetes assigned IP)",
    "podName": "Name of pod (e.g. Kubernetes pod)",
    "tags": {
      "test": "Informational tags associated to results for other metadata"
    }
  }
```
[top](#post)





### ``post static_code_scans``
----
To add (POST) static code scans use the following command:

```shell
  USAGE
    $ saf emasser post static_code_scans [FLAGS]
    NOTE: see EXAMPLES for command usages

  FLAGS
    -h, --help              Show eMASSer CLI help for the POST Static Code Scans command
    -s, --systemId=<value>  (required) The system identification number  
    -f, --dataFile=<value>  (required) A well formed JSON file containing the data to add. It can ba a single object or an array of objects.

  DESCRIPTION
    Upload application scan findings into a system's assets module

  EXAMPLES
    $ saf emasser post static_code_scans [-s,--systemId] [-f,--dataFile]
```

**Note:** The input file `[-f,--dataFile]` should be a well formed JSON containing application scan findings. 

---
#### Add Findings
##### Required `application` JSON object parameter/fields are:
```json
  {
    "application": {
      "applicationName": "Name of the software application that was assessed",
      "version": "The version of the application"
    }
  }
```
##### Required `applicationFindings` JSON array parameters/fields are:
```json
  {
    "applicationFindings": [
      {
        "codeCheckName": "Name of the software vulnerability or weakness",
        "scanDate": "The scan date, Unix date format",
        "cweId": "The Common Weakness Enumerator (CWE) identifier",
        "count": "Number of instances observed for a specified finding",
        "rawSeverity": "OPTIONAL - One of the following [Low, Medium, Moderate, High, Critical]"
      }
    ]
  }
```

\*rawSeverity: In eMASS, values of "Critical" will appear as "Very High", and values of "Medium" will appear as "Moderate". Any values not listed as options in the list above will map to "Unknown" and appear as blank values.
##### All accepted parameters/fields are:
```json
  {
    "application": {
      "applicationName": "Name of the software application that was assessed",
      "version": "The version of the application"
    },
    "applicationFindings": [
      {
        "codeCheckName": "Name of the software vulnerability or weakness",
        "scanDate": "The scan date, Unix date format",
        "cweId": "The Common Weakness Enumerator (CWE) identifier",
        "count": "Number of instances observed for a specified finding",
        "rawSeverity": "OPTIONAL - One of the following [Low, Medium, Moderate, High, Critical]"
      }
    ]
  }
```
#### Clear Findings (can only be used on a single application with a single finding)
##### Required "application" JSON object parameter/fields are:
```json
  {
    "application": {
      "applicationName": "Name of the software application that was assessed",
      "version": "The version of the application"
    }
  }
```
##### Required "applicationFindings" JSON array object field(s):
```json
  {
    "applicationFindings": [
      {
        "clearFindings": "To clear an application's findings, use only the field clearFindings and set it to true."
      }
    ]
  }
```
##### All accepted parameters/fields are:
```json
  {
    "application": {
      "applicationName": "Name of the software application that was assessed",
      "version": "The version of the application"
    },
    "applicationFindings": [
      {
        "clearFindings": "To clear an application's findings, use only the field clearFindings and set it to true."
      }
    ]
  }
```
\*The clearFindings field is an optional field, but required with a value of "True" to clear out all application findings for a single application/version pairing.

[top](#post)








































## Usage - PUT

### ```put controls```

----
#### Security Control update (PUT) endpoint API business rules.

#### Requirements based on `implementationStatus` field value

  |Value                   |Required Fields
  |------------------------|--------------------------------------------------------
  |Planned or Implemented  |`controlDesignation`, `estimatedCompletionDate`, `responsibleEntities`, `slcmCriticality`, `slcmFrequency`, `slcmMethod`, `slcmMethod`, `slcmTracking`, `slcmComments`
  |Not Applicable          |`naJustification`, `controlDesignation`, `responsibleEntities`
  |Manually Inherited      |`controlDesignation`, `estimatedCompletionDate`, `responsibleEntities`, `slcmCriticality`, `slcmFrequency`, `slcmMethod`, `slcmMethod`, `slcmTracking`, `slcmComments`

Implementation Plan cannot be updated if a Security Control is "Inherited" except for the following fields:
  - Common Control Provider (`commonControlProvider`)
  - Security Control Designation (`controlDesignation`)

#### Security Controls parameters/fields character limitations  
- Implementation Plan information cannot be saved if the fields below exceed 2,000 character limits:
  - N/A Justification        (`naJustification`)
  - Responsible Entities     (`responsibleEntities`) 
  - Implementation Narrative (`implementationNarrative`)
  - Criticality              (`slcmCriticality`)
  - Reporting                (`slcmReporting`)
  - Tracking                 (`slcmTracking`)
  - Vulnerability Summary    (`vulnerabilitySummary`)
  - Recommendations          (`recommendations`)
- Implementation Plan information cannot be saved if the fields below exceed 4,000 character limits:
  - SLCM Comments            (`slcmComments`)

Implementation Plan information cannot be updated if Security Control does not exist in the system record.

---
#### Update (PUT) System Controls CLI usages

```shell
USAGE
  $ saf emasser put controls [FLAGS]
  NOTE: see EXAMPLES for command usages

FLAGS
  -h, --help              Show eMASSer CLI help for the PUT Controls command
  -s, --systemId=<value>  (required) The system identification number
  -f, --dataFile=<value>  (required) A well formed JSON file containing the data to be updated. It can ba a single object or an array of objects.

DESCRIPTION
  Update Security Control information of a system for both the Implementation Plan and Risk Assessment.

EXAMPLES
    $ saf emasser put controls [-s,--systemId] [-f, --dataFile]
```
**Note:** The input file should be a well formed JSON containing the Security Control information based on defined business rules. 
 
---
#### Required JSON parameter/fields are:
```json
  {
    "acronym": "System acronym, required to match the NIST SP 800-53 Revision 4.",
    "responsibleEntities": "Include written description of Responsible Entities that are responsible for the Security Control.",
    "controlDesignation": "One of the following: [Common, System-Specific, Hybrid]",
    "estimatedCompletionDate": "Field is required for Implementation Plan",
    "implementationNarrative": "Includes Security Control comments"
  }
```
 #### Conditional JSON parameters/fields are:
```json
  {
    "commonControlProvider": "One of the following [DoD, Component, Enclave]",
    "naJustification": "Provide justification for Security Controls deemed Not Applicable to the system",
    "slcmCriticality": "Criticality of Security Control regarding SLCM",
    "slcmFrequency": "One of the following [Constantly,Daily,Weekly,Monthly,Quarterly,Semi-Annually,Annually,Every Two Years,Every Three Years,Undetermined]",
    "slcmMethod": "One of the following [Automated, Semi-Automated, Manual, Undetermined]",
    "slcmReporting": "Organization/Office represented",
    "slcmTracking": "The System-Level Continuous Monitoring tracking",
    "slcmComments": " Additional comments for Security Control regarding SLCM"
  }
```
- conditional flags (parameters) are:

  |parameter               | type or values                                |
  |------------------------|:----------------------------------------------|
  |--commonControlProvider |Possible values: DoD, Component, Enclave|
  |--naJustification       |String - Justification for Security Controls deemed Not Applicable to the system |
  |--slcmCriticality       |String - Criticality of Security Control regarding SLCM |
  |--slcmFrequency         |Possible values - Constantly, Daily, Weekly, Monthly, Quarterly, Semi-Annually, Annually, or Undetermined |
  |--slcmMethod            |Possible values: Automated, Semi-Automated, Manual, or Undetermined |
  |--slcmReporting         |String - The System-Level Continuous Monitoring reporting |
  |--slcmTracking          |String - The System-Level Continuous Monitoring tracking |
  |--slcmComments          |String, - Additional comments for Security Control regarding SLCM |

#### Optional JSON parameters/fields are:
```json
  {
    "implementationStatus": "One of the following [Planned,Implemented,Inherited,Not Applicable,Manually Inherited]",
    "severity": "One of the following [Very Low, Low, Moderate, High, Very High]",
    "vulnerabilitySummary": "Include vulnerability summary",
    "recommendations": "The include recommendations",
    "relevanceOfThreat": "One of the following [Very Low, Low, Moderate, High, Very High]",
    "likelihood": "One of the following [Very Low, Low, Moderate, High, Very High]",
    "impact": "One of the following [Very Low, Low, Moderate, High, Very High]",
    "impactDescription": "Include description of Security Controls impact",
    "residualRiskLevel": "One of the following [Very Low, Low, Moderate, High, Very High]",
    "testMethod": "One of the following [Test, Interview, Examine, Test,Interview, Test,Examine, Interview,Examine, Test,Interview,Examine]",
    "mitigations": "One of the following [Very Low, Low, Moderate, High, Very High]",
    "applicationLayer": "If the Financial Management (Navy) overlay is applied to the system, this field can be populated (Navy only)",
    "databaseLayer": "If the Financial Management (Navy) overlay is applied to the system, this field can be populated (Navy only)",
    "operatingSystemLayer": "If the Financial Management (Navy) overlay is applied to the system, this field can be populated (Navy only)"
  }
```
#### All accepted parameters/fields are:
```json
  {
    "acronym": "System acronym, required to match the NIST SP 800-53 Revision 4.",
    "responsibleEntities": "Include written description of Responsible Entities that are responsible for the Security Control.",
    "controlDesignation": "One of the following: [Common, System-Specific, Hybrid]",
    "estimatedCompletionDate": "Estimation completion date - Field is required for Implementation Plan",
    "implementationNarrative": "Includes Security Control comments",
    "commonControlProvider": "Indicate the type of Common Control Provider for an “Inherited” Security Control. One of the following [DoD, Component, Enclave]",
    "naJustification": "Provide justification for Security Controls deemed Not Applicable to the system",
    "slcmCriticality": "Criticality of Security Control regarding system-level continuous monitoring (SLCM) ",
    "slcmFrequency": "One of the following [Constantly,Daily,Weekly,Monthly,Quarterly,Semi-Annually,Annually,Every Two Years,Every Three Years,Undetermined]",
    "slcmMethod": "One of the following [Automated, Semi-Automated, Manual, Undetermined]",
    "slcmReporting": "Organization/Office represented",
    "slcmTracking": "The System-Level Continuous Monitoring tracking",
    "slcmComments": " Additional comments for Security Control regarding SLCM",
    "implementationStatus": "One of the following [Planned,Implemented,Inherited,Not Applicable,Manually Inherited]",
    "severity": "One of the following [Very Low, Low, Moderate, High, Very High]",
    "vulnerabilitySummary": "Include vulnerability summary",
    "recommendations": "The include recommendations",
    "relevanceOfThreat": "One of the following [Very Low, Low, Moderate, High, Very High]",
    "likelihood": "One of the following [Very Low, Low, Moderate, High, Very High]",
    "impact": "One of the following [Very Low, Low, Moderate, High, Very High]",
    "impactDescription": "Include description of Security Controls impact",
    "residualRiskLevel": "One of the following [Very Low, Low, Moderate, High, Very High]",
    "testMethod": "One of the following [Test, Interview, Examine, Test,Interview, Test,Examine, Interview,Examine, Test,Interview,Examine]",
    "mitigations": "One of the following [Very Low, Low, Moderate, High, Very High]",
    "applicationLayer": "If the Financial Management (Navy) overlay is applied to the system, this field can be populated (Navy only)",
    "databaseLayer": "If the Financial Management (Navy) overlay is applied to the system, this field can be populated (Navy only)",
    "operatingSystemLayer": "If the Financial Management (Navy) overlay is applied to the system, this field can be populated (Navy only)"
  }
```
[top](#put)

### ``put poams``
----
#### Plan of Action and Milestones (POA&M) update (PUT) endpoint API business rules.

#### Requirements based on `status` field value

  |status          |Required Fields
  |----------------|--------------------------------------------------------
  |Risk Accepted   |`comments`, `resources`
  |Ongoing         |`scheduledCompletionDate`, `resources`, `milestones` (at least 1)
  |Completed       |`scheduledCompletionDate`, `comments`, `resources`, `completionDate`, `milestones` (at least 1)
  |Not Applicable  |POAM can not be created

#### POC fields requirements
If a POC email is supplied, the application will attempt to locate a user already registered within the application and pre-populate any information not explicitly supplied in the request. If no such user is found, these fields are required within the request.
  - pocOrganization, pocFirstName, pocLastName, pocEmail, pocPhoneNumber

#### Business logic for updating POA&Ms
- POA&M Item cannot be saved if associated Security Control or AP is inherited.
- POA&M Item cannot be created manually if a Security Control or AP is Not Applicable.
- Completed POA&M Item cannot be saved if Completion Date is in the future.
- Completed POA&M Item cannot be saved if Completion Date (completionDate) is in the future.
- Risk Accepted POA&M Item cannot be saved with a Scheduled Completion Date (scheduledCompletionDate) or Milestones
- POA&M Item with a review status of "Not Approved" cannot be saved if Milestone Scheduled Completion Date exceeds POA&M Item  Scheduled Completion Date.
- POA&M Item with a review status of "Approved" can be saved if Milestone Scheduled Completion Date exceeds POA&M Item Scheduled Completion Date.
- POA&M Items that have a status of "Completed" and a status of "Ongoing" cannot be saved without Milestones.
- POA&M Items that have a status of "Risk Accepted" cannot have milestones.
- POA&M Items with a review status of "Approved" that have a status of "Completed" and "Ongoing" cannot update Scheduled Completion Date.
- POA&M Items that have a review status of "Approved" are required to have a Severity Value assigned.
- POA&M Items cannot be updated if they are included in an active package.
- Archived POA&M Items cannot be updated.
- POA&M Items with a status of "Not Applicable" will be updated through test result creation.
- If the Security Control or Assessment Procedure does not exist in the system we may have to just import POA&M Item at the System Level.


The following parameters/fields have the following character limitations:
- POA&M Item cannot be saved if the Point of Contact fields exceed 100 characters:
  - Office / Organization (pocOrganization)
  - First Name            (pocFirstName)
  - Last Name             (pocLastName)
  - Email                 (email)
  - Phone Number          (pocPhoneNumber)
- POA&M Item cannot be saved if Mitigation field (mitigation) exceeds 2,000 characters.
- POA&M Item cannot be saved if Source Identifying Vulnerability field (sourceIdentVuln) exceeds 2,000 characters.
- POA&M Item cannot be saved if Comments field (comments) exceeds 2,000 characters 
- POA&M Item cannot be saved if Resource field (resource) exceeds 250 characters.
- POA&M Items cannot be saved if Milestone Description (description) exceeds 2,000 characters.


#### POA&M parameters/fields character limitations
- Fields that can not exceed 100 characters:
  - Office / Organization (`pocOrganization`)
  - First Name            (`pocFirstName`)
  - Last Name             (`pocLastName`)
  - Email                 (`email`)
  - Phone Number          (`pocPhoneNumber`)
  - External Unique ID    (`externalUid`)
- Fields that can not exceed 250 characters:
  - Resource              (`resource`)
- Fields have can not exceed 2000 character: 
  - Vulnerability Description        (`vulnerabilityDescription`)
  - Source Identifying Vulnerability (`sourceIdentVuln`)
  - Recommendations                  (`recommendations`)
  - Risk Accepted Comments           (`comments`) 
  - Milestone Description            (`description`)
  - Mitigation Justification         (`mitigation`)


---
#### Updating (PUT) POA&Ms CLI usages
```shell
USAGE
  $ saf emasser put poams [FLAGS]
  NOTE: see EXAMPLES for command usages

FLAGS
  -h, --help               Show eMASSer CLI help for the PUT Controls command
  -s, --systemId=<value>  (required) The system identification number
  -f, --dataFile=<value>  (required) A well formed JSON file containing the data to be updated. It can ba a single object or an array of objects.

DESCRIPTION
  Update a Plan of Action and Milestones (POA&M) into a systems.

EXAMPLES
  $ saf emasser put poams [-s,--systemId] [-f,--dataFile]
```

**Note:** The input file should be a well formed JSON containing the POA&M information based on defined business rules. 
 
---
#### Required JSON parameter/fields are:
```json
  {
    "poamId": "Unique identifier representing the nth POAM item entered into the site database.",
    "displayPoamId": "Globally unique identifier for individual POA&M Items, seen on the front-end as ID",
    "status": "One of the following: [Ongoing, Risk Accepted, Completed, Not Applicable]",
    "vulnerabilityDescription": "POA&M vulnerability description",
    "sourceIdentifyingVulnerability": "Source that identifies the vulnerability",
    "pocOrganization": "Organization/Office represented",
    "resources": "List of resources used"
  }
```
#### Required for VA but Conditional for Army and USCG JSON parameters/fields are:
```json
  {
    "identifiedInCFOAuditOrOtherReview": "If not specified, this field will be set to false because it does not accept a null value (Required for VA. Optional for Army and USCG)",
    "personnelResourcesFundedBaseHours": "Hours for personnel resources that are founded (Required for VA. Optional for Army and USCG)",
    "personnelResourcesCostCode": "Values are specific per eMASS instance (Required for VA. Optional for Army and USCG)",
    "personnelResourcesUnfundedBaseHours": "Funded based hours (100.00) (Required for VA. Optional for Army and USCG)",
    "personnelResourcesNonfundingObstacle": "Values are specific per eMASS instance (Required for VA. Optional for Army and USCG)",
    "personnelResourcesNonfundingObstacleOtherReason": "Reason (text 2,000 char) (Required for VA. Optional for Army and USCG)",
    "nonPersonnelResourcesFundedAmount": "Funded based hours (100.00) (Required for VA. Optional for Army and USCG)",
    "nonPersonnelResourcesCostCode": "Values are specific per eMASS instance (Required for VA. Optional for Army and USCG)",
    "nonPersonnelResourcesUnfundedAmount": "Funded based hours (100.00) (Required for VA. Optional for Army and USCG)",
    "nonPersonnelResourcesNonfundingObstacle": "Values are specific per eMASS instance (Required for VA. Optional for Army and USCG)",
    "nonPersonnelResourcesNonfundingObstacleOtherReason": "Reason (text 2,000 char) (Required for VA. Optional for Army and USCG)"
  }
```  
#### Conditional JSON parameters/fields are:
```json
  {
    "milestones": [
      {
        "milestoneId": "Unique milestone identifier",
        "description": "The milestone description",
        "scheduledCompletionDate": "Milestone scheduled completion date (Unix format)",
        "isActive": "To prevent uploading duplicate/undesired milestones through the POA&M PUT include the isActive=false. If absent or set to true a new Milestone is created"
      }
    ],
    "pocFirstName": "First name of POC (only if Last Name, Email, or Phone Number have data)",
    "pocLastName": "Last name of POC (only if First Name, Email, or Phone Number have data)",
    "pocEmail": "Email address of POC (only if First Name, Last Name, or Phone Number have data)",
    "pocPhoneNumber": "Phone number of POC (only if First Name, Last Name, or Email have data)",
    "severity": "Risk Analysis field, maybe required by certain eMASS instances. Required for approved items",
    "scheduledCompletionDate": "POA&M Items with a review status of “Approved” and a status of “Completed” or “Ongoing” cannot update Scheduled Completion Date.",
    "completionDate": "Field is required for completed POA&M items",
    "comments": "Field is required for completed and risk accepted POA&M items"
  }
```
  - conditional flags (parameters) are:

    |parameter                 | type or values                                                         |
    |--------------------------|:-----------------------------------------------------------------------|
    |--milestones              |JSON -  see milestone format                                            |
    |--pocFirstName            |String - First name of POC                                              |
    |--pocLastName             |String - Last name of POC                                               |
    |--pocEmail                |String - Email address of POC                                           | 
    |--pocPhoneNumber          |String - Phone number of POC (area code) ***-**** format                |     
    |--severity                |Possible values - Very Low, Low, Moderate, High, Very High              |
    |--scheduledCompletionDate |Date - Required for ongoing and completed POA&M items. Unix time format |
    |--completionDate          |Date - Field is required for completed POA&M items. Unix time format    |
    |--comments                |String - Field is required for completed and risk accepted POA&M items  |
    |--isActive                |Boolean - Used to delete milestones when updating a POA&M               |

    ** If a POC email is supplied, the application will attempt to locate a user already registered within the application and pre-populate any information not explicitly supplied in the request. If no such user is found, these fields are required within the request:
      pocFirstName, pocLastName, pocPhoneNumber

#### Optional JSON parameters/fields are:
```json
  {
    "externalUid": "External ID associated with the POA&M",
    "controlAcronym": "The system acronym(s) e.g AC-1, AC-2",
    "assessmentProcedure": "The Security Control Assessment Procedures being associated with the POA&M Item",
    "securityChecks": "Security Checks that are associated with the POA&M",
    "rawSeverity": "One of the following [Very Low, Low, Moderate, High, Very High]",
    "relevanceOfThreat": "Risk Analysis field, maybe required by certain eMASS instances. One of the following [Very Low, Low, Moderate, High, Very High]",
    "likelihood": "Risk Analysis field, maybe required by certain eMASS instances. One of the following [Very Low, Low, Moderate, High, Very High]",
    "impact": "Risk Analysis field, maybe required by certain eMASS instances. Description of Security Control impact",
    "residualRiskLevel": "Risk Analysis field, maybe required by certain eMASS instances. One of the following [Very Low, Low, Moderate, High, Very High]",
    "mitigations": "Risk Analysis field, maybe required by certain eMASS instances. Mitigation explanation",
    "impactDescription": "Description of the security control impact",
    "recommendations": "Any recommendations content",
    "resultingResidualRiskLevelAfterProposedMitigations": "One of the following [Very Low, Low, Moderate, High, Very High] (Navy only)",
    "predisposingConditions": "Conditions (Navy only)",
    "threatDescription": "Threat description (Navy only)",
    "devicesAffected": "List of affected devices by hostname. If all devices are affected, use `system` or `all` (Navy only)"
  }
```

#### All accepted parameters/fields are:
```json
  {
    "poamId": "Unique identifier representing the nth POAM item entered into the site database.",
    "displayPoamId": "Globally unique identifier for individual POA&M Items, seen on the front-end as ID",
    "status": "One of the following: [Ongoing, Risk Accepted, Completed, Not Applicable]",
    "vulnerabilityDescription": "POA&M vulnerability description",
    "sourceIdentifyingVulnerability": "Source that identifies the vulnerability",
    "pocOrganization": "Organization/Office represented",
    "resources": "List of resources used",
    "identifiedInCFOAuditOrOtherReview": "If not specified, this field will be set to false because it does not accept a null value (Required for VA. Optional for Army and USCG)",
    "personnelResourcesFundedBaseHours": "Hours for personnel resources that are founded (Required for VA. Optional for Army and USCG)",
    "personnelResourcesCostCode": "Values are specific per eMASS instance (Required for VA. Optional for Army and USCG)",
    "personnelResourcesUnfundedBaseHours": "Funded based hours (100.00) (Required for VA. Optional for Army and USCG)",
    "personnelResourcesNonfundingObstacle": "Values are specific per eMASS instance (Required for VA. Optional for Army and USCG)",
    "personnelResourcesNonfundingObstacleOtherReason": "Reason (text 2,000 char) (Required for VA. Optional for Army and USCG)",
    "nonPersonnelResourcesFundedAmount": "Funded based hours (100.00) (Required for VA. Optional for Army and USCG)",
    "nonPersonnelResourcesCostCode": "Values are specific per eMASS instance (Required for VA. Optional for Army and USCG)",
    "nonPersonnelResourcesUnfundedAmount": "Funded based hours (100.00) (Required for VA. Optional for Army and USCG)",
    "nonPersonnelResourcesNonfundingObstacle": "Values are specific per eMASS instance (Required for VA. Optional for Army and USCG)",
    "nonPersonnelResourcesNonfundingObstacleOtherReason": "Reason (text 2,000 char) (Required for VA. Optional for Army and USCG)",
    "milestones": [
      {
        "milestoneId": "Unique milestone identifier",
        "description": "The milestone description",
        "scheduledCompletionDate": "Milestone scheduled completion date (Unix format)",
        "isActive": "To prevent uploading duplicate/undesired milestones through the POA&M PUT include the isActive=false. If absent or set to true a new Milestone is created"
      }
    ],
    "pocFirstName": "First name of POC (only if Last Name, Email, or Phone Number have data)",
    "pocLastName": "Last name of POC (only if First Name, Email, or Phone Number have data)",
    "pocEmail": "Email address of POC (only if First Name, Last Name, or Phone Number have data)",
    "pocPhoneNumber": "Phone number of POC (only if First Name, Last Name, or Email have data)",
    "severity": "Risk Analysis field, maybe required by certain eMASS instances. Required for approved items",
    "scheduledCompletionDate": "POA&M Items with a review status of “Approved” and a status of “Completed” or “Ongoing” cannot update Scheduled Completion Date.",
    "completionDate": "Field is required for completed POA&M items",
    "comments": "Field is required for completed and risk accepted POA&M items",
    "externalUid": "External ID associated with the POA&M",
    "controlAcronym": "The system acronym(s) e.g AC-1, AC-2",
    "assessmentProcedure": "The Security Control Assessment Procedures being associated with the POA&M Item",
    "securityChecks": "Security Checks that are associated with the POA&M",
    "rawSeverity": "One of the following [Very Low, Low, Moderate, High, Very High]",
    "relevanceOfThreat": "Risk Analysis field, maybe required by certain eMASS instances. One of the following [Very Low, Low, Moderate, High, Very High]",
    "likelihood": "Risk Analysis field, maybe required by certain eMASS instances. One of the following [Very Low, Low, Moderate, High, Very High]",
    "impact": "Risk Analysis field, maybe required by certain eMASS instances. Description of Security Control impact",
    "residualRiskLevel": "Risk Analysis field, maybe required by certain eMASS instances. One of the following [Very Low, Low, Moderate, High, Very High]",
    "mitigations": "Risk Analysis field, maybe required by certain eMASS instances. Mitigation explanation",
    "impactDescription": "Description of the security control impact",
    "recommendations": "Any recommendations content",
    "resultingResidualRiskLevelAfterProposedMitigations": "One of the following [Very Low, Low, Moderate, High, Very High] (Navy only)",
    "predisposingConditions": "Conditions (Navy only)",
    "threatDescription": "Threat description (Navy only)",
    "devicesAffected": "List of affected devices by hostname. If all devices are affected, use `system` or `all` (Navy only)"
  }
```  
[top](#put)

### ``put milestones``

----
Update (PUT) one or many milestones for a POA&M items in a system

```shell
USAGE
  $ saf emasser put milestones [options]

FLAGS
  -h, --help                             Show eMASSer CLI help for the PUT Milestones endpoint
  -s, --systemId=<value>                 (required) The system identification number
  -p, --poamId=<value>                   (required) The poam identification number
  -d, --description=<value>              (required) The milestone description
  -m, --milestoneId=<value>              (required) Unique milestone identifier
  -c, --scheduledCompletionDate=<value>  The scheduled completion date - Unix time format

DESCRIPTION
  Update milestone(s) for specified system, poam, and milestone Id

EXAMPLES
  $ saf emasser put milestones [-s,--systemId] [-p,--poamId] [-m,--milestoneId] [-d,--description] [-c,--scheduledCompletionDate]
```

[top](#put)

### ``put artifacts``
----
Update one or many artifacts in a system

#### Business Rules
- Artifact cannot be saved if File Name (fileName) exceeds 1,000 characters
- Artifact cannot be saved if Name (name) exceeds 100 characters
- Artifact cannot be saved if Description (description) exceeds 10,000 characters
- Artifact cannot be saved if Reference Page Number (refPageNumber) exceeds 50 characters
- Artifact cannot be saved if the file does not have an allowable file extension/type.
- Artifact version cannot be saved if an Artifact with the same file name already exist in the system.
- Artifact cannot be saved if the file size exceeds 30MB.
- Artifact cannot be saved if the Last Review Date is set in the future.
- Artifact cannot be saved if the following fields are missing data:
  -  Filename
  -  Type
  -  Category

---
#### Update (PUT) Artifacts CLI usages

```shell
  USAGE
    $ saf emasser put artifacts [FLAGS]
    NOTE: see EXAMPLES for command usages

  FLAGS
    -h, --help              Show eMASSer CLI help for the PUT Artifacts command
    -s, --systemId=<value>  (required) The system identification number
    -f, --dataFile=<value>  (required) A well formed JSON file containing the data to be updated. It can ba a single object or an array of objects.

  DESCRIPTION
    Updates artifacts for a system with provided entries

  EXAMPLES
    $ saf emasser put artifacts [-s,--systemId] [-f,--dataFile]

```
The input file should be a well formed JSON containing the POA&M information based on defined business rules.

#### Required JSON parameter/fields are:
```json
  {
    "filename": "Artifact file name to update for the given system",
    "isTemplate": "Indicates whether an artifact is a template",
    "type": "The type of artifact. Possible values are: Procedure, Diagram, Policy, Labor, Document, Image, Other, Scan Result, Auditor Report. May accept other values set by system administrators",
    "category": "Artifact category. Possible values are: Implementation Guidance or Evidence. May accept other values set by system administrators"
  }
```
#### Optional JSON parameters/fields are:
```json
  {
    "name": "The artifact name",
    "artifactDescription": "The artifact(s) description",
    "refPageNumber": "Artifact reference page number",
    "controls": "Control acronym associated with the artifact. NIST SP 800-53 Revision 4 defined",
    "assessmentProcedures": "The Security Control Assessment Procedure being associated with the artifact",
    "expirationDate": "Date artifact expires and requires review",
    "lastReviewDate": "Date artifact was last reviewed",
    "signedDate": "Date artifact was signed"
  }
```
#### All accepted parameters/fields are:
```json
  {
    "filename": "Artifact file name to update for the given system",
    "isTemplate": "Indicates whether an artifact is a template",
    "type": "The type of artifact. Possible values are: Procedure, Diagram, Policy, Labor, Document, Image, Other, Scan Result, Auditor Report. May accept other values set by system administrators",
    "category": "Artifact category. Possible values are: Implementation Guidance or Evidence. May accept other values set by system administrators",
    "name": "The artifact name",
    "artifactDescription": "The artifact(s) description",
    "refPageNumber": "Artifact reference page number",
    "controls": "Control acronym associated with the artifact. NIST SP 800-53 Revision 4 defined",
    "assessmentProcedures": "The Security Control Assessment Procedure being associated with the artifact",
    "expirationDate": "Date artifact expires and requires review",
    "lastReviewDate": "Date artifact was last reviewed",
    "signedDate": "Date artifact was signed"
  }
```

[top](#put)

### ```put hardware```
---
Update one or many hardware assets to a system.
  ```shell
  USAGE
    $ saf emasser put hardware_baseline [FLAGS]
    NOTE: see EXAMPLES for command usages

  FLAGS
    -h, --help              Show eMASSer CLI help for the PUT Hardware Baseline command
    -s, --systemId=<value>  (required) The system identification number  
    -f, --dataFile=<value>  (required) A well formed JSON file containing the data to be updated. It can ba a single object or an array of objects.

  DESCRIPTION
    Update one or many hardware assets to a system.
    The CLI expects an input JSON file containing the required, conditional
    and optional fields for the hardware asset(s) being added to the system.

  EXAMPLES
    $ saf emasser put hardware_baseline [-s,--systemId] [-f,--dataFile]
```
The input file [-f, --dataFile] should be a well formed JSON containing Hardware Assets.

#### Required JSON parameter/field is:
```json
  {
    "hardwareId": "GUID identifying the specific hardware asset",
    "assetName": "Name of the hardware asset"
  }
```
#### Conditional JSON parameters/fields are:
```json
  {
    "publicFacingFqdn": "Public facing FQDN. Only applicable if Public Facing is set to true",
    "publicFacingIpAddress": "Public facing IP address. Only applicable if Public Facing is set to true",
    "publicFacingUrls": "Public facing URL(s). Only applicable if Public Facing is set to true"
  }
```
#### Optional JSON parameters/fields are:
```json
  {
    "componentType": "Public facing FQDN. Only applicable if Public Facing is set to true",
    "nickname": "Public facing IP address. Only applicable if Public Facing is set to true",
    "assetIpAddress": "IP address of the hardware asset",
    "publicFacing": "Public facing is defined as any asset that is accessible from a commercial connection",
    "virtualAsset": "Determine if this is a virtual hardware asset",
    "manufacturer": "Manufacturer of the hardware asset. Populated with “Virtual” by default if Virtual Asset is true",
    "modelNumber": "Model number of the hardware asset. Populated with “Virtual” by default if Virtual Asset is true",
    "serialNumber": "Serial number of the hardware asset. Populated with “Virtual” by default if Virtual Asset is true",
    "osIosFwVersion": "OS/iOS/FW version of the hardware asset",
    "memorySizeType": "Memory size / type of the hardware asset",
    "location": "Location of the hardware asset",
    "approvalStatus": "Approval status of the hardware asset",
    "criticalAsset": "Indicates whether the asset is a critical information system asset"
  }
```
#### All accepted parameters/fields are:
```json
  {
    "hardwareId": "GUID identifying the specific hardware asset",
    "assetName": "Name of the hardware asset",
    "publicFacingFqdn": "Public facing FQDN. Only applicable if Public Facing is set to true",
    "publicFacingIpAddress": "Public facing IP address. Only applicable if Public Facing is set to true",
    "publicFacingUrls": "Public facing URL(s). Only applicable if Public Facing is set to true",
    "componentType": "Public facing FQDN. Only applicable if Public Facing is set to true",
    "nickname": "Public facing IP address. Only applicable if Public Facing is set to true",
    "assetIpAddress": "IP address of the hardware asset",
    "publicFacing": "Public facing is defined as any asset that is accessible from a commercial connection",
    "virtualAsset": "Determine if this is a virtual hardware asset",
    "manufacturer": "Manufacturer of the hardware asset. Populated with “Virtual” by default if Virtual Asset is true",
    "modelNumber": "Model number of the hardware asset. Populated with “Virtual” by default if Virtual Asset is true",
    "serialNumber": "Serial number of the hardware asset. Populated with “Virtual” by default if Virtual Asset is true",
    "osIosFwVersion": "OS/iOS/FW version of the hardware asset",
    "memorySizeType": "Memory size / type of the hardware asset",
    "location": "Location of the hardware asset",
    "approvalStatus": "Approval status of the hardware asset",
    "criticalAsset": "Indicates whether the asset is a critical information system asset"
  }
```
[top](#put)

### ```put software```
---
Update one or many software assets to a system.
```shell
  USAGE
    $ saf emasser put software_baseline [FLAGS]
    NOTE: see EXAMPLES for command usages

  FLAGS
    -h, --help              Show eMASSer CLI help for the PUT Software Baseline command
    -s, --systemId=<value>  (required) The system identification number  
    -f, --dataFile=<value>  (required) A well formed JSON file containing the data to be updated. It can ba a single object or an array of objects.

  DESCRIPTION
    Update one or many software assets to a system.
    The CLI expects an input JSON file containing the required, conditional
    and optional fields for the software asset(s) being added to the system.

  EXAMPLES
    $ saf emasser put software_baseline [-s,--systemId] [-f,--dataFile]
```
The input file [-f, --dataFile] should be a well formed JSON containing Software Assets.

#### Required JSON parameter/field is:
```json
  {
    "softwareId": "GUID identifying the specific software asset",
    "softwareVendor": "Vendor of the software asset",
    "softwareName": "Name of the software asset",
    "version": "Version of the software asset"
  }
```
#### Conditional JSON parameters/fields are:
```json
  {
    "approvalDate": "Approval date of the software asset. If Approval Status is set to “Unapproved” or “In Progress”, Approval Date will be set to null"
  }
```
#### Optional JSON parameters/fields are:
```json
  {
    "softwareType": "Type of the software asset",
    "parentSystem": "Parent system of the software asset",
    "subsystem": "Subsystem of the software asset",
    "network": "Network of the software asset",
    "hostingEnvironment": "Hosting environment of the software asset",
    "softwareDependencies": "Dependencies for the software asset",
    "cryptographicHash": "Cryptographic hash for the software asset",
    "inServiceData": "Date the sotware asset was added to the network",
    "itBudgetUii": "IT budget UII for the software asset",
    "fiscalYear": "Fiscal year (FY) for the software asset",
    "popEndDate": "Period of performance (POP) end date for the software asset",
    "licenseOrContract": "License or contract for the software asset",
    "licenseTerm": "License term for the software asset",
    "costPerLicense": "Cost per license for the software asset",
    "totalLicenses": "Number of total licenses for the software asset",
    "totalLicenseCost": "Total cost of the licenses for the software asset",
    "licensesUsed": "Number of licenses used for the software asset",
    "licensePoc": "Point of contact (POC) for the software asset",
    "licenseRenewalDate": "License renewal date for the software asset",
    "licenseExpirationDate": "License expiration date for the software asset",
    "approvalStatus": "Approval status of the software asset",
    "releaseDate": "Release date of the software asset",
    "maintenanceDate": "Maintenance date of the software asset",
    "retirementDate": "Retirement date of the software asset",
    "endOfLifeSupportDate": "End of life/support date of the software asset",
    "extendedEndOfLifeSupportDate": "Extended End of Life/Support Date cannot occur prior to the End of Life/Support Date",
    "criticalAsset": "Indicates whether the asset is a critical information system asset",
    "location": "Location of the software asset",
    "purpose": "Purpose of the software asset",
    "unsupportedOperatingSystem": "Unsupported operating system (VA only)",
    "unapprovedSoftwareFromTrm": "Unapproved software from TRM (VA only)",
    "approvedWaiver": "Approved waiver (VA only)"
  }
```
#### All accepted parameters/fields are:
```json
  {
    "softwareId": "GUID identifying the specific software asset",
    "softwareVendor": "Vendor of the software asset",
    "softwareName": "Name of the software asset",
    "version": "Version of the software asset",
    "approvalDate": "Approval date of the software asset. If Approval Status is set to “Unapproved” or “In Progress”, Approval Date will be set to null",
    "softwareType": "Type of the software asset",
    "parentSystem": "Parent system of the software asset",
    "subsystem": "Subsystem of the software asset",
    "network": "Network of the software asset",
    "hostingEnvironment": "Hosting environment of the software asset",
    "softwareDependencies": "Dependencies for the software asset",
    "cryptographicHash": "Cryptographic hash for the software asset",
    "inServiceData": "Date the sotware asset was added to the network",
    "itBudgetUii": "IT budget UII for the software asset",
    "fiscalYear": "Fiscal year (FY) for the software asset",
    "popEndDate": "Period of performance (POP) end date for the software asset",
    "licenseOrContract": "License or contract for the software asset",
    "licenseTerm": "License term for the software asset",
    "costPerLicense": "Cost per license for the software asset",
    "totalLicenses": "Number of total licenses for the software asset",
    "totalLicenseCost": "Total cost of the licenses for the software asset",
    "licensesUsed": "Number of licenses used for the software asset",
    "licensePoc": "Point of contact (POC) for the software asset",
    "licenseRenewalDate": "License renewal date for the software asset",
    "licenseExpirationDate": "License expiration date for the software asset",
    "approvalStatus": "Approval status of the software asset",
    "releaseDate": "Release date of the software asset",
    "maintenanceDate": "Maintenance date of the software asset",
    "retirementDate": "Retirement date of the software asset",
    "endOfLifeSupportDate": "End of life/support date of the software asset",
    "extendedEndOfLifeSupportDate": "Extended End of Life/Support Date cannot occur prior to the End of Life/Support Date",
    "criticalAsset": "Indicates whether the asset is a critical information system asset",
    "location": "Location of the software asset",
    "purpose": "Purpose of the software asset",
    "unsupportedOperatingSystem": "Unsupported operating system (VA only)",
    "unapprovedSoftwareFromTrm": "Unapproved software from TRM (VA only)",
    "approvedWaiver": "Approved waiver (VA only)"
  }
 ``` 
[top](#put)

## Usage - DELETE

### ```delete poams```

----
Remove (DELETE) POA&Ms CLI usages
```shell
USAGE
  $ saf emasser delete poams [options]

FLAGS
  -h, --help                Show eMASSer CLI help for the DELETE POA&M endpoint
  -s, --systemId=<value>    (required) The system identification number
  -P, --poamsId=<value>...  (required) Unique POA&M identification number, can have multiple (space separated)

DESCRIPTION
  Remove one or many POA&M items in a system identified by system and poam Id

EXAMPLES
  $ saf emasser delete poams [-s,--systemId] [-P,--poamsId]
```
[top](#delete)

### ```delete milestones```

----
Remove milestones in a system for one or many POA&M items

To delete a milestone the record must be inactive by having the field `isActive` set to false (isActive=false).

The last milestone can not be deleted, at-least on must exist.

Remove (DELETE) Milestones CLI usages
```shell
USAGE
  $ saf emasser delete milestones [options]

FLAGS
  -h, --help                     Show eMASSer CLI help for the DELETE Milestones endpoint
  -s, --systemId=<value>         (required) The system identification number
  -p, --poamId=<value>           (required) The poam identification number
  -M, --milestonesId=<value>...  (required) Unique milestone identifier, can have multiple (space separated)

DESCRIPTION
  Remove milestones in a system for one or many POA&M items identified by system, poam, and milestone Id

EXAMPLES
  $ saf emasser delete milestones [-s,--systemId] [-p,--poamId] [-M,--milestonesId]
```

**Note** Multiple milestones can be deleted by including multiple milestone Ids separated by a space.

[top](#delete)

### ```delete artifacts```

---
Remove one or many artifacts in a system

Remove (DELETE) Artifact files CLI usages
```shell
USAGE
  $ saf emasser delete artifacts [options]

FLAGS
  -h, --help                 Show eMASSer CLI help for the DELETE POA&M endpoint
  -s, --systemId=<value>     (required) The system identification number
  -F, --fileName=<value>...  (required) The artifact file name to remove, can have multiple (space separated)

DESCRIPTION
  Remove one or many artifacts in a system identified by system Id

EXAMPLES
  $ saf emasser delete artifacts [-s,--systemId] [-F,--fileName]
```
**Note** Multiple artifacts can be deleted by including multiple file names separated by a space.

[top](#delete)

### ```delete hardware```
---
Remove one or many Hardware items in a system identified by system and hardware Id
```shell
USAGE
  $ saf emasser delete hardware_baseline [FLAGS]

FLAGS
  -h, --help                         Show help for the SAF CLI eMASSer DELETE Hardware Baseline command
  -s, --systemId=<value>             (required) The system identification number
  -a, --assetsHardwareId=<value>...  (required) Unique GUID identifying a specific hardware asset, can have multiple (space separated)

DESCRIPTION
  Remove one or many Hardware items in a system identified by system and hardware Id

EXAMPLES
  $ saf emasser delete hardware_baseline [-s,--systemId] [-a,--assetsHardwareId] <hardware-id> <hardware-id> ...
```  
[top](#delete)

### ```delete software```
---
Remove one or many Software items in a system identified by system and software Id
```shell
  USAGE
    $ saf emasser delete software_baseline [FLAGS]

  FLAGS
    -h, --help                         Show help for the SAF CLI eMASSer DELETE Software Baseline command
    -s, --systemId=<value>             (required) The system identification number  
    -a, --assetsSoftwareId=<value>...  (required) Unique GUID identifying a specific software asset, can have multiple (space separated)

  DESCRIPTION
    Remove one or many Software items in a system identified by system and software Id

  EXAMPLES
    $ saf emasser delete software_baseline [-s,--systemId] [-a,--assetsSoftwareId] <software-id> <software-id> ...
```
[top](#delete)