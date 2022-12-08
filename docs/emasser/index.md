# emasser CLI Features and Capabilities

## Environment Variables
To facilitate setting the required environment variables the `emasser ` SAF CLI utilized the zero-dependency module to load these variables from a `.env` file.  

### Configuring the `.env` File
An `.env-example` file is provided with the required and optional fields.

Modify the `.env-example` as necessary and save it as a `.env` file. 

Place the file on the  path where the `emasser` command is executed.

### Required Environment Variables
The following environment variables are required:
* EMASSER_API_KEY_API_KEY=`<API key>`
* EMASSER_API_KEY_USER_UID=`<unique identifier for the API Key (EMASSER_API_KEY_API_KEY)`
* EMASSER_HOST=`<FQDN of the eMASS server>`
* EMASSER_KEY_FILE_PATH=`<path to your eMASS key in PEM format>`
* EMASSER_CERT_FILE_PATH=`<path to your eMASS certificate in PEM format>`
* EMASSER_KEY_PASSWORD=`<password for the key given in EMASSER_KEY_FILE_PATH>`

### Optional Environment Variables
The following environment variables are *optional:
* EMASSER_PORT=`<The server communication port number (default is 443)`
* EMASSER_REQUEST_CERT=`<Server requests a certificate from clients - true or false (default false)>`
* EMASSER_REJECT_UNAUTHORIZED=`<Reject connection not authorized with the list of supplied CAs- true or false (default true)>`
* EMASSER_DEBUGGING=`<set debugging - true or false (default false)>`
* EMASSER_CLI_DISPLAY_NULL=`<display null value fields - true or false (default true)>`
* EMASSER_EPOCH_TO_DATETIME=`<convert epoch to data/time value - true or false (default false)>`
  
\* If not provided defaults are used

The proper format to set these variables in the `.env` files is as follows:
```bash
export [VARIABLE_NAME]='value'
```
***NOTE***

`emasser` requires authentication to an eMASS instance as well as authorization to use the eMASS API. This authentication and authorization is **not** a function of `emasser` and needs to be accomplished with the eMASS instances owner organization. Further information about eMASS credential requirements refer to [Defense Counterintelligence and Security Agency](https://www.dcsa.mil/is/emass/) about eMASS access.

Fo instruction on how to request an eMASS visit [eMASS Account Process Request and API Registration](https://github.com/mitre/emasser/wiki/eMASS-Account-Process-Request-and-API-Registration)

---
## Common emasser Endpoint Requests Information
  - The eMASS API provides the capability of updating multiple entries within several endpoints, however the `SAF CLI emasser`, in some cases only supports updating one entry at the time.

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
* [/api/cmmc-assessments](#get-cmmc)
* [/api/workflow-definitions](#get-workflow_definitions)
* [/api/systems/{systemId}/workflow-instances](#get-workflow_instances)
* [/api/dashboards/system-status-details](#get-dashboards)
* [/api/dashboards/system-control-compliance-summary](#get-dashboards)
* [/api/dashboards/system-security-controls-details](#get-dashboards)
* [/api/dashboards/system-assessment-procedures-details](#get-dashboards)
* [/api/dashboards/system-poam-summary](#get-dashboards)
* [/api/dashboards/system-poam-details](#get-dashboards)
* [/api/dashboards/system-hardware-summary](#get-dashboards)
* [/api/dashboards/system-hardware-details](#get-dashboards)
* [/api/dashboards/system-associations-details](#get-dashboards)
* [/api/dashboards/user-system-assignments-details](#get-dashboards)
* [/api/dashboards/system-privacy-summary](#get-dashboards)
* [/api/dashboards/va-omb-fisma-saop-summary](#get-dashboards)
* [/api/dashboards/va-system-aa-summary](#get-dashboards)
* [/api/dashboards/va-system-a2-summary](#get-dashboards)
* [/api/dashboards/va-system-pl-109-reporting-summary](#get-dashboards)
* [/api/dashboards/va-system-fisma-inventory-summary](#get-dashboards)
  
### POST
* [/api/systems/{systemId}/test-results](#post-test_results)
* [/api/systems/{systemId}/poam](#post-poams)
* [/api/systems/{systemId}/poam/{poamId}/milestones](#post-milestones)
* [/api/systems/{systemId}/artifacts](#post-artifacts)
* [/api/systems/{systemId}/approval/cac](#post-cac)
* [/api/systems/{systemId}/approval/pac](#post-pac)
* [/api/systems/{systemId}/static-code-scans](#post-static_code_scans)
* [/api/systems/{systemId}/cloud-resource-results](#post-cloud_resource)
* [/api/systems/{systemId}/container-scan-results](#post-container_scans)

### PUT
* [/api/systems/{systemId}/controls](#put-controls)
* [/api/systems/{systemId}/poams](#put-poams)
* [/api/systems/{systemId}/poams/{poamId}/milestones](#put-milestones)
* [/api/systems/{systemId}/artifacts](#put-artifacts)

### DELETE
* [/api/systems/{systemId}/poams](#delete-poams)
* [/api/systems/{systemId}/poams/{poamId}/milestones](#delete-milestones)
* [/api/systems/{systemId}/artifacts](#delete-artifacts)

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
  emasser version
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
      emasser get milestones            Retrieve milestones by system by systemID/poamID or systemID/poamID/milestoneID combination
      emasser get pac                   View one or many Package Approval Chain (PAC) in a system specified system ID
      emasser get poams                 Retrieve Poams for a system or system/poam Id combination
      emasser get roles                 Retrieve all available system roles, or filter by options
      emasser get system                Get system information for a specific system defined by ID (systemId)
      emasser get systems               Get available systems filter on provided options
      emasser get test_connection       Test if eMASS url is set to a correct host
      emasser get test_results          Get test results for a specific system defined by ID (systemId)
      emasser get workflow_definitions  View all workflow schemas available on the eMASS instance
      emasser get workflow_instances    Retrieve all workflow instances or workflow instances noted by workflowInstanceID
    ```  
- Preceding any command with `[-h or -help` provides help for the command. The following command would list all available sub-commands and options for the `get artifacts` endpoint command.
    ```
    $ emasser get -h artifacts
    Retrieve artifacts for a system or system/filename combination

    USAGE
      $ saf emasser get artifacts [ARGUMENTS]

    ARGUMENTS
      FORSYSTEM  Retrieves available milestones for provided system (Id)
      EXPORT     Exports the milestone(s) for provided system (Id) and file name

    FLAGS
      -h, --help  Show emasser CLI help for the GET Artifacts endpoint

    DESCRIPTION
      Retrieve artifacts for a system or system/filename combination
    ```
- Using `help` after any command lists all available options (flags). The following command would list all available options for the `get artifacts export` endpoint command. 
    ```
    $ emasser get artifacts export -help
    Retrieves the file artifacts (if compress is true the file binary contents are returned, otherwise the file textual contents are returned.)

    USAGE
      $ saf emasser get artifacts [ARGUMENTS]

    ARGUMENTS
      FORSYSTEM  Retrieves available milestones for provided system (Id)
      EXPORT     Exports the milestone(s) for provided system (Id) and file name

    FLAGS
      -h, --help              Show emasser CLI help for the GET Artifacts endpoint
      -f, --filename=<value>  (required) The artifact file name
      -s, --systemId=<value>  (required) The system identification number      
      -C, --[no-]compress     Boolean - Compress true or false

    DESCRIPTION
      Retrieves the file artifacts (if compress is true the file binary contents are returned, otherwise the file textual contents are returned.)

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
  $ saf emasser get system [ARGUMENTS]

FLAGS
  -h, --help                 Show emasser CLI help for the GET System endpoint
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
  $ saf emasser get systems [ARGUMENTS]

FLAGS
  -h, --help                        Show emasser CLI help for the GET Systems endpoint
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
  $ saf emasser get roles [ARGUMENTS]

ARGUMENTS
  ALL         Retrieves all available system roles
  BYCATEGORY  Retrieves role(s) - filtered by [options] params

FLAGS
  -h, --help  Show emasser CLI help for the GET Roles endpoint

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
  -h, --help              Show emasser CLI help for the GET Controls endpoint
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
  $ saf emasser get test_results [ARGUMENTS]

FLAGS
  -h, --help                     Show emasser CLI help for the GET Test Results endpoint
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
There are two endpoints for system poams - `forSystem` and `byPoamId`
```
USAGE
  $ saf emasser get poams [ARGUMENTS]

ARGUMENTS
  FORSYSTEM  Retrieves Poams for specified system ID
  BYPOAMID   Retrieves Poams for specified system and poam ID

FLAGS
  -h, --help  Show emasser CLI help for the GET POA&Ms endpoint

DESCRIPTION
  Retrieve Poams for a system or system/poam Id combination

EXAMPLES
  $ saf emasser get poams forSystem [-s, --systemId] <value> [options]

  $ saf emasser get poams byPoamId [-s, --systemId] <value> [-p, --poamId] <value>
```
- forSystem - Retrieves all poams for specified system ID
    ```
    USAGE
      $ saf emasser get poams [ARGUMENTS]

    ARGUMENTS
      FORSYSTEM  Retrieves Poams for specified system ID
      BYPOAMID   Retrieves Poams for specified system and poam ID

    FLAGS
      -h, --help                              Show emasser CLI help for the GET POA&Ms endpoint
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
      $ saf emasser get poams [ARGUMENTS]

    ARGUMENTS
      FORSYSTEM  Retrieves Poams for specified system ID
      BYPOAMID   Retrieves Poams for specified system and poam ID

    FLAGS
      -h, --help              Show emasser CLI help for the GET POA&Ms endpoint
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
There are two endpoints for system milestones - `byPoamId` and `byMilestoneId`
```
USAGE
  $ saf emasser get milestones [ARGUMENTS]

ARGUMENTS
  BYPOAMID       Retrieves milestone(s) for specified system and poam Id
  BYMILESTONEID  Retrieves milestone(s) for specified system, poam, and milestone Id

FLAGS
  -h, --help  Show emasser CLI help for the GET Milestones endpoint

DESCRIPTION
  Retrieve milestones by system by systemID/poamID or systemID/poamID/milestoneID combination

EXAMPLES
  $ saf emasser get milestones byPoamId [-s, --systemId] <value> [-p, --poamId] <value> [options]

  $ saf emasser get milestones byMilestoneId [-s, --systemId] <value> [-p, --poamId] <value> [-m, --milestoneId] <value>
```
- byPoamId - Retrieves milestone(s) for specified system and poam ID
    ```shell
    USAGE
      $ saf emasser get milestones [ARGUMENTS]

    ARGUMENTS
      BYPOAMID       Retrieves milestone(s) for specified system and poam Id
      BYMILESTONEID  Retrieves milestone(s) for specified system, poam, and milestone Id

    FLAGS
      -h, --help                                  Show emasser CLI help for the GET Milestones endpoint
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
      $ saf emasser get milestones [ARGUMENTS]

    ARGUMENTS
      BYPOAMID       Retrieves milestone(s) for specified system and poam Id
      BYMILESTONEID  Retrieves milestone(s) for specified system, poam, and milestone Id

    FLAGS
      -h, --help                 Show emasser CLI help for the GET Milestones endpoint
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
There are two endpoints for artifacts - `forSystem` and `export`
```
USAGE
  $ saf emasser get artifacts [ARGUMENTS]

ARGUMENTS
  FORSYSTEM  Retrieves available milestones for provided system (Id)
  EXPORT     Exports the milestone(s) for provided system (Id) and file name

FLAGS
  -h, --help  Show emasser CLI help for the GET Artifacts endpoint

DESCRIPTION
  Retrieve artifacts for a system or system/filename combination

EXAMPLES
  $ saf emasser get artifacts forSystem [-s, --systemId] <value> [options]

  $ saf emasser get artifacts export [-s, --systemId] <value> [-f, --filename] <value> [options]
```

- forSystem - Retrieves one or many artifacts in a system specified system ID
    ```
    USAGE
      $ saf emasser get artifacts [ARGUMENTS]

    ARGUMENTS
      FORSYSTEM  Retrieves available milestones for provided system (Id)
      EXPORT     Exports the milestone(s) for provided system (Id) and file name

    FLAGS
      -h, --help                     Show emasser CLI help for the GET Artifacts endpoint
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
    $ saf emasser get artifacts [ARGUMENTS]

  ARGUMENTS
    FORSYSTEM  Retrieves available milestones for provided system (Id)
    EXPORT     Exports the milestone(s) for provided system (Id) and file name

  FLAGS
    -h, --help              Show emasser CLI help for the GET Artifacts endpoint
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
  ```
  USAGE
    $ saf emasser get cac [ARGUMENTS]

  FLAGS
    -h, --help                     Show emasser CLI help for the GET CAC endpoint
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

  ```
  USAGE
    $ saf emasser get pac [options]

  FLAGS
    -h, --help              Show emasser CLI help for the GET PAC endpoint
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
### ```get cmmc```

----
To view Cybersecurity Maturity Model Certification (CMMC) Assessments use the following command:
  ```
  USAGE
    $ saf emasser get cmmc [ARGUMENTS]

  FLAGS
    -h, --help               Show emasser CLI help for the GET CMMC endpoint  
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
    -h, --help                       Show emasser CLI help for the GET Workflow Definitions endpoint
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
There are two endpoints to view workflow instances - `all` and `byInstanceId`
```
USAGE
  $ saf emasser get workflow_instances [ARGUMENT]

ARGUMENTS
  ALL           Retrieves all workflow instances in a site
  BYINSTANCEID  Retrieves workflow(s) instance by ID

FLAGS
  -h, --help  Show emasser CLI help for the GET Workflow Instances endpoint

DESCRIPTION
  Retrieve all workflow instances or workflow instances noted by workflowInstanceID

EXAMPLES
  $ saf emasser get workflow_instances all [options]

  $ saf emasser get workflow_instances byInstanceId [-w, --workflowInstanceId] <value>
```
  - all
    ```
    USAGE
      $ saf emasser get workflow_instances [ARGUMENT]

    ARGUMENTS
      ALL           Retrieves all workflow instances in a site
      BYINSTANCEID  Retrieves workflow(s) instance by ID

    FLAGS
      -h, --help                  Show emasser CLI help for the GET Workflow Instances endpoint    
      -d, --sinceDate=<value>     The Workflow Instance date. Unix date format
      -i, --[no-]includeComments  Boolean - Include transition comments
      -p, --pageIndex=<value>     The page number to query
      -s, --status=<option>       The Workflow status - must be a valid status
                                  <options: active|inactive|all>

    DESCRIPTION
      Retrieves all workflow instances

    EXAMPLES
      $ saf emasser get workflow_instances all [options]
    ```
    - Optional flags (parameters) are:

      |parameter          | type or values                                     |
      |-------------------|:---------------------------------------------------|
      |--includeComments  |BOOLEAN - true or false                             |    
      |--pageIndex        |Integer - The page number to query                  |
      |--sinceDate        |Date - The Workflow Instance date. Unix date format |
      |--status           |Possible values: active, inactive, all              | 

  - byWorkflowInstanceId
    ```
    USAGE
      $ saf emasser get workflow_instances [ARGUMENT]

    ARGUMENTS
      ALL           Retrieves all workflow instances in a site
      BYINSTANCEID  Retrieves workflow(s) instance by ID

    FLAGS
      -h, --help                        Show emasser CLI help for the GET Workflow Instances endpoint
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

```
USAGE
  $ saf emasser get dashboards [ARGUMENTS]

ARGUMENTS
  STATUS_DETAILS                 Get systems status detail dashboard information
  CONTROL_COMPLIANCE_SUMMARY     Get systems control compliance summary dashboard information
  SECURITY_CONTROL_DETAILS       Get systems security control details dashboard information
  ASSESSMENT_PROCEDURES_DETAILS  Get systems assessment procedures details dashboard information
  POAM_SUMMARY                   Get systems POA&Ms summary dashboard information
  POAM_DETAILS                   Get system POA&Ms details dashboard information
  HARDWARE_SUMMARY               Get system hardware summary dashboard information
  HARDWARE_DETAILS               Get system hardware details dashboard information
  ASSOCIATIONS_DETAILS           Get system associations details dashboard information
  ASSIGNMENTS_DETAILS            Get user system assignments details dashboard information
  PRIVACY_SUMMARY                Get user system privacy summary dashboard information
  FISMA_SAOP_SUMMARY             Get VA OMB-FISMA SAOP summary dashboard information
  VA_AA_SUMMARY                  Get VA system A&A summary dashboard information
  VA_A2_SUMMARY                  Get VA system A2.0 summary dashboard information
  VA_PL_109_SUMMARY              Get VA System P.L. 109 reporting summary dashboard information
  FISMA_INVENTORY_SUMMARY        Get VA system FISMA inventory summary dashboard information

FLAGS
  -h, --help               Show emasser CLI help for the GET Dashboards endpoint
  -i, --pageIndex=<value>  The index of the starting page (default first page 0)
  -o, --orgId=<value>      (required) The organization identification number
  -s, --pageSize=<value>   The number of entries per page (default 20000)

DESCRIPTION
  Retrieves a pre-defined dashboard by orgId

EXAMPLES
  $ saf emasser get dashboards [dashboard name] [flag] [options]
```
All endpoint calls utilize the same parameter values, they are:
  - Required flag (parameter):

    |parameter     | type or values                                  |
    |--------------|:------------------------------------------------|
    |--orgId       |Integer - The organization identification number |

  - Optional flags (parameters) are:

    |parameter    | type or values                                                |
    |-------------|:--------------------------------------------------------------|
    |--pageIndex  |Integer - The index of the starting page (default first page 0)|
    |--pageSize   |Integer - The number of entries per page (default 20000)       |

Available commands are:
  - Get systems status detail dashboard information
    ```
    $ saf emasser get dashboards status_details [-o, --orgId] <value> [options]
    ```
  - Get systems control compliance summary dashboard information    
    ```
    $ saf emasser get dashboards control_compliance_summary [-o, --orgId] <value> [options]
    ```
  - Get systems security control details dashboard information
    ```
    $ saf emasser get dashboards security_control_details [-o, --orgId] <value> [options]
    ```
  - Get systems assessment procedures details dashboard information
    ```
    $ saf emasser get dashboards assessment_procedures_details [-o, --orgId] <value> [options]
    ```
  - Get systems POA&Ms summary dashboard information
    ```
    $ saf emasser get dashboards poam_summary [-o, --orgId] <value> [options]
    ```
  - Get system POA&Ms details dashboard information
    ```
    $ saf emasser get dashboards poam_details [-o, --orgId] <value> [options]
    ```
  - Get system hardware summary dashboard information
    ```
    $ saf emasser get dashboards hardware_summary [-o, --orgId] <value> [options]
    ```
  - Get system hardware details dashboard information
    ```
    $ saf emasser get dashboards hardware_details [-o, --orgId] <value> [options]
    ```
  - Get system associations details dashboard information
    ```
    $ saf emasser get dashboards associations_details [-o, --orgId] <value> [options]
    ```
  - Get user system assignments details dashboard information
    ```
    $$ saf emasser get dashboards assignments_details [-o, --orgId] <value> [options]
    ```
  - Get user system privacy summary dashboard information
    ```
    $ saf emasser get dashboards privacy_summary [-o, --orgId] <value> [options]
    ```
  - Get VA OMB-FISMA SAOP summary dashboard information
    ```
    $ saf emasser get dashboards fisma_saop_summary [-o, --orgId] <value> [options]
    ```
  - Get VA system A&A summary dashboard information
    ```
    $ saf emasser get dashboards va_aa_summary [-o, --orgId] <value> [options]
    ```
  - Get VA system A2.0 summary dashboard information
    ```
    $ saf emasser get dashboards va_a2_summary [-o, --orgId] <value> [options]
    ```
  - Get VA System P.L. 109 reporting summary dashboard information
    ```
    $ saf emasser get dashboards va_pl_109_summary [-o, --orgId] <value> [options]
    ```
  - Get VA system FISMA inventory summary dashboard information
    ```
    $ saf emasser get dashboards fisma_inventory_summary [-o, --orgId] <value> [options]
    ```

[top](#api-endpoints-provided)

## Usage - POST

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

  ```
  USAGE
    $ saf emasser post test_results [ARGUMENTS]

  FLAGS
    -h, --help                       Post (add) test results to a system's Assessment Procedures (CCIs)
    -s, --systemId=<value>           (required) The system identification number
    -t, --testDate=<value>           (required) The date test was conducted, Unix time format  
    -b, --testedBy=<value>           (required) The person that conducted the test (Last Name, First)
    -c, --cci=<value>                (required) The system CCI string numerical value
    -d, --description=<value>        (required) The description of test result. 4000 Characters    
    -S, --complianceStatus=<option>  (required) The system CCI string numerical value
                                    <options: Compliant|Non-Compliant|Not Applicable>

  DESCRIPTION
    Add test results for a system's Assessment Procedures (CCIs) which determine Security Control compliance

  EXAMPLES
    $ saf emasser post test_results [-s,--systemId] [-c,--cci] [-b,--testedBy] [-t,--testDate] [-d,--description] [-S,--complianceStatus]
  ```
Note: If no POA&Ms or AP exist for the control (system), the following message is returned:
"You have entered a Non-Compliant Test Result. You must create a POA&M Item for this Control and/or AP if one does not already exist."

  - required parameter are:

    |parameter          | type or values                                              |
    |-------------------|:------------------------------------------------------------|
    |--systemId         |Integer - Unique system identifier                           |
    |--cci              |String - CCI associated with the test result. e.g "00221"    |
    |--testedBy         |String - Last Name, First Name. 100 Characters.              |
    |--testDate         |Date - Unix time format (e.g. 1499990400)                    |
    |--description      |String - Include description of test result. 4000 Characters |
    |--complianceStatus |Possible values: Compliant, Non-Compliant, Not Applicable    |


[top](#post)

### ``post poams``
---
## Plan of Action and Milestones (POA&M) add (POST) endpoint API business rules.

### Requirements based on `status` field value

  |status          |Required Fields
  |----------------|--------------------------------------------------------
  |Risk Accepted   |`comments`, `resources`
  |Ongoing         |`scheduledCompletionDate`, `resources`, `milestones` (at least 1)
  |Completed       |`scheduledCompletionDate`, `comments`, `resources`, `completionDate`, `milestones` (at least 1)
  |Not Applicable  |POAM can not be created

### POC fields requirements
If a POC email is supplied, the application will attempt to locate a user
already registered within the application and pre-populate any information
not explicitly supplied in the request. If no such user is found, these
fields are required within the request.
  - `pocOrganization`, `pocFirstName`, `pocLastName`, `pocEmail`, `pocPhoneNumber`

### Business logic for adding POA&Ms
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

### POA&M parameters/fields character limitations
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

### Add (POST) POA&Ms CLI usages
```
USAGE
  $ saf emasser post poams [ARGUMENTS]

FLAGS
  -h, --help              Post (add) a Plan of Action and Milestones (POA&M) item(s) in a system. See emasser Features (emasserFeatures.md) for additional information.
  -s, --systemId=<value>  (required) The system identification number
  -f, --poamFile=<value>  (required) A well formed JSON file with the POA&M(s) to be added to the specified system. It can ba a single object or an array of objects.

DESCRIPTION
  Add a Plan of Action and Milestones (POA&M) into a systems.

EXAMPLES
  $ saf emasser post poams [-s,--systemId] [-f,--poamFile]
```

**Note:** The input file should be a well formed JSON containing the POA&M information based on defined business rules. 
 
---
### Required JSON parameter/fields are:
```json
  {
    "status": "One of the following: [Ongoing, Risk Accepted, Completed, Not Applicable]",
    "vulnerabilityDescription": "POA&M vulnerability description",
    "sourceIdentVuln": "Source that identifies the vulnerability",
    "pocOrganization": "Organization/Office represented",
    "resources": "List of resources used"
  }
```
- required parameter are:

  |parameter                  | type or values                                                 |
  |---------------------------|:---------------------------------------------------------------|
  |--systemId                 |Integer - Unique system identifier                              |
  |--status                   |Possible Values: Ongoing,Risk Accepted,Completed,Not Applicable |
  |--vulnerabilityDescription |String - Vulnerability description for the POA&M Item           |
  |--sourceIdentVuln          |String - Include Source Identifying Vulnerability text          |
  |--pocOrganization          |String - Organization/Office represented       |
  |--resources                |String - List of resources used. Character Limit = 250          |

  ** If any poc information is provided all POC fields are required. See additional details for POC fields below.

### Conditional JSON parameters/fields are:
```json
  {
    "milestones": [
      {
        "description": "The milestone description",
        "scheduledCompletionDate": "Milestone scheduled completion date (Unix format)"
      }
    ],
    "pocFirstName": "The system acronym(s) e.g AC-1, AC-2",
    "pocLastName": "The system CCIS string numerical value",
    "pocEmail": "Security Checks that are associated with the POA&M",
    "pocPhoneNumber": "One of the following [I, II, III]",
    "severity": "One of the following [Very Low, Low, Moderate, High, Very High]",
    "scheduledCompletionDate": "One of the following [Very Low, Low, Moderate, High, Very High]",
    "completionDate": "Description of Security Control impact",
    "comments": "Description of the security control impact"
  }
```
- conditional flags (parameters) are:

  |parameter                 | type or values                                                          |
  |--------------------------|:------------------------------------------------------------------------|
  |--pocFirstName            |String - First name of POC                                               |
  |--pocLastName             |String - Last name of POC                                                |
  |--pocEmail                |String - Email address of POC                                            | 
  |--pocPhoneNumber          |String - Phone number of POC (area code) ***-**** format                 |     
  |--severity                |Possible values - Very Low, Low, Moderate, High, Very High               |
  |--scheduledCompletionDate |Date - Required for ongoing and completed POA&M items. Unix time format  |
  |--completionDate          |Date - Field is required for completed POA&M items. Unix time format     |
  |--comments                |String - Field is required for completed and risk accepted POA&M items.  |  
  |--milestones              |JSON -  Object                                                           |
  |--description             |String - The milestone description                                       |  
  |--scheduledCompletionDate |Date - Required for ongoing and completed POA&M items. Unix time format  |  


### Optional JSON parameters/fields
```json
  {
    "externalUid": "External ID associated with the POA&M",
    "controlAcronym": "The system acronym(s) e.g AC-1, AC-2",
    "cci": "The system CCIS string numerical value",
    "securityChecks": "Security Checks that are associated with the POA&M",
    "rawSeverity": "One of the following [I, II, III]",
    "relevanceOfThreat": "One of the following [Very Low, Low, Moderate, High, Very High]",
    "likelihood": "One of the following [Very Low, Low, Moderate, High, Very High]",
    "impact": "Description of Security Control impact",
    "impactDescription": "Description of the security control impact",
    "residualRiskLevel": "One of the following [Very Low, Low, Moderate, High, Very High]",
    "recommendations": "Any recommendations content",
    "mitigation": "Mitigation explanation"
  }
```
- optional flags (parameters) are:

  |parameter           | type or values                                                                           |
  |--------------------|:-----------------------------------------------------------------------------------------|
  |--externalUid       |String - External unique identifier for use with associating POA&M Items                  |
  |--controlAcronym    |String - Control acronym associated with the POA&M Item. NIST SP 800-53 Revision 4 defined|
  |--cci               |String - CCI associated with the test result                                              |
  |--securityChecks    |String - Security Checks that are associated with the POA&M                               |
  |--rawSeverity       |Possible values: I, II, III                                                               |
  |--relevanceOfThreat |Possible values: Very Low, Low, Moderate, High, Very High                                 |
  |--likelihood        |Possible values: Very Low, Low, Moderate, High, Very High                                 |
  |--impact            |Possible values: Very Low, Low, Moderate, High, Very High                                 |
  |--impactDescription |String - Include description of Security Control’s impact                                 |
  |--residualRiskLevel |Possible values: Very Low, Low, Moderate, High, Very High                                 |
  |--recommendations   |String - Include recommendations                                                          |
  |--mitigation        |String - Include mitigation explanation                                                   |


[top](#post)

### ``post milestones``
---
Add (POST) milestones to one or many POA&M items in a system

```
USAGE
  $ saf emasser post milestones [ARGUMENTS]

FLAGS
  -h, --help                             Post (add) milestones to one or many POA&M items in a system
  -p, --poamId=<value>                   (required) The poam identification number
  -s, --systemId=<value>                 (required) The system identification number
  -c, --scheduledCompletionDate=<value>  (required) The scheduled completion date - Unix time format
  -d, --description=<value>              (required) The milestone description

DESCRIPTION
  Add milestones to one or many POA&M items in a system

EXAMPLES
  $ saf emasser post milestones [-s,--systemId] [-p,--poamId] [-d,--description] [-c,--scheduledCompletionDate]
```
  - required parameter are:

    |parameter                  | type or values                                      |
    |---------------------------|:----------------------------------------------------|
    |--systemId                 |Integer - Unique system identifier                   |
    |--poamId                   |Integer - Unique item identifier                     |
    |--description              |String - Milestone item description. 2000 Characters |
    |--scheduledCompletionDate  |Date - Schedule completion date. Unix date format    |


[top](#post)

### ``post artifacts``
---
### Upload artifacts one or many artifacts in a system

The body of a request through the Artifacts POST endpoint accepts a single binary file with extension ".zip" only. This .zip file should contain one or more files corresponding to existing artifacts or new artifacts that will be created upon successful receipt. Filename uniqueness within an eMASS system will be enforced by the API.

### Business rules
Upon successful receipt of a file, if a file within the .zip is matched via filename to an artifact existing within the application, the file associated with the artifact will be updated. If no artifact is matched via filename to the application, a new artifact will be created with the following default values. 
```
  - isTemplate: false
  - type: other
  - category: evidence
```
Any values not specified below will be null.

### Accepted artifact files are:
  - .docx,.doc,.txt,.rtf,.xfdl,.xml,.mht,.mhtml,.html,.htm,.pdf
  - .mdb,.accdb,.ppt,.pptx,.xls,.xlsx,.csv,.log
  - .jpeg,.jpg,.tiff,.bmp,.tif,.png,.gif
  - .zip,.rar,.msg,.vsd,.vsw,.vdx, .z{#}, .ckl,.avi,.vsdx
  
### Artifacts rules and limitations
- Artifact cannot be saved if File Name (fileName) exceeds 1,000 characters
- Artifact cannot be saved if Description (description) exceeds 2,000 characters
- Artifact cannot be saved if Reference Page Number (refPageNumber) exceeds 50 characters
- Artifact version cannot be saved if an Artifact with the same file name already exist in the system.
- Artifact cannot be saved if the file size exceeds 30MB.
- Artifact cannot be saved if the Last Review Date is set in the future.
---
### Add (POST) Artifacts CLI usages
```
USAGE
  $ saf emasser post artifacts [ARGUMENTS]

FLAGS
  -h, --help               Post (add) artifact file(s) to a system
  -i, --input=<value>...   (required) Artifact file(s) to post to the given system, can have multiple (space separated)
  -s, --systemId=<value>   (required) The system identification number
  -T, --[no-]isTemplate    Boolean - Indicates whether an artifact is a template.
  -c, --category=<option>  Artifact category <options: Implementation Guidance|Evidence>
  -t, --type=<option>      Artifact file type <options: Procedure|Diagram|Policy|Labor|Document|Image|Other|Scan Result|Auditor Report>

DESCRIPTION
  Uploads [FILES] to the given [SYSTEM_ID] as artifacts

EXAMPLES
  $ saf emasser post artifacts [-s,--systemId] [-i,--input] [options]
```

- required parameter are:

  |parameter       | type or values                                      |
  |----------------|:----------------------------------------------------|
  |--systemId      |Integer - Unique system identifier                   |
  |--input         |String - File names (to include path) to be uploaded into eMASS as artifacts |

- optional parameter are:

  |parameter       | type or values                                        |
  |----------------|:------------------------------------------------------| 
  |--isTemplate    |Boolean - Indicates whether an artifact is a template|
  |--type          |Possible Values: Procedure, Diagram, Policy, Labor, Document, Image, Other, Scan Result, Auditor Report|
  |--category      |Possible Values: Implementation Guidance, Evidence    |


[top](#post)

### ``post cac``
----
Add a Control Approval Chain (CAC) items in a system

### Business Rule
- Comments are not required at the first role of the CAC but are required at the second role of the CAC. 
- Comments cannot exceed 10,000 characters.

### Add (POST) CAC CLI usages

 ```
USAGE
  $ saf emasser post cac [ARGUMENTS]

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
  - required parameter are:

    |parameter          | type or values                                              |
    |-------------------|:------------------------------------------------------------|
    |--systemId         |Integer - Unique system identifier                           |
    |--controlAcronym   |String - Control acronym associated with the POA&M Item. NIST SP 800-53 Revision 4 defined |

  - conditional flag (parameter):

    |parameter          | type or values                             |
    |-------------------|:-------------------------------------------|
    |--comments         |String -The control approval chain comments |


[top](#post)

### ``post pac``
----
Add new Package Approval Chain (PAC) workflow(s) for a system

### Add (POST) PAC CLI usages

```
USAGE
  $ saf emasser post pac [ARGUMENTS]

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
  - required parameter are:

    |parameter     | type or values                                                            |
    |--------------|:--------------------------------------------------------------------------|
    |--systemId    |Integer - Unique system identifier                                         |
    |--workflow    |Possible Values: Assess and Authorize, Assess Only, Security Plan Approval |
    |--name        |String - Package name. 100 Characters                                      |
    |--comments    |String - Comments submitted upon initiation of the indicated workflow, 4,000 character|


[top](#post)

### ``post static_code_scans``
----
To add (POST) static code scans use the following command:

```
USAGE
  $ saf emasser post static_code_scans [ARGUMENTS]

FLAGS
  -h, --help                       Post (upload) static code scans, can also clear application's findings
  -s, --systemId=<value>           (required) The system identification number
  -f, --statiCodeScanFile=<value>  (required) A well formed JSON file with application scan findings. It can ba a single object or an array of objects.

DESCRIPTION
  upload application scan findings into a system's assets module

EXAMPLES
  $ saf emasser post static_code_scans [-s,--systemId] [-f,--cloudResourceFile]
```

**Note:** The input file `[-f,--statiCodeScanFile]` should be a well formed JSON containing application scan findings. 

---
### Required `application` JSON object parameter/fields are:
```json
  {
    "applicationName": "Name of the software application that was assessed",
    "version": "The version of the application"
  }
```
### Required `applicationFindings` JSON array parameters/fields are:
```json
  {
    "applicationFindings": [
      {
        "codeCheckName": "Name of the software vulnerability or weakness",
        "scanDate": "The scan date, Unix date format",
        "resourceName": "Friendly name of Cloud resource",
        "cweId": "The Common Weakness Enumerator (CWE) identifier",
        "count": "Number of instances observed for a specified finding",
        "rawSeverity": "OPTIONAL - One of the following [Low, Medium, Moderate, High, Critical]"
      }
    ]
  }
```
  - required parameter are:

    |parameter          | type or values                                             |
    |-------------------|:-----------------------------------------------------------|
    |--systemId         |Integer - Unique system identifier                          |
    |--applicationName  |String - Name of the software application that was assessed |
    |--version          |String - The version of the application                     |
    |--codeCheckName    |Strings - Name of the software vulnerability or weakness    |
    |--scanDate         |Date - The findings scan date - Unix time format            |
    |--cweId            |String - The Common Weakness Enumerator (CWE) identifier    |

  - optional flags (parameters) are:

    |parameter          | type or values                                        |
    |-------------------|:------------------------------------------------------|
    |--rawSeverity*     |Possible Values: Low, Medium, Moderate, High, Critical |  
    |--count            |Integer - Number of instances observed for a specified |

\*rawSeverity: In eMASS, values of "Critical" will appear as "Very High", and values of "Medium" will appear as "Moderate". Any values not listed as options in the list above will map to "Unknown" and appear as blank values.

### To clear (POST) static code scans use the following command:
  ```
  $ saf emasser post static_code_scans [-s,--systemId] [-f,--cloudResourceFile]
  ```
With the following JSON content:  
  ```json
  {
    "application": {
      "applicationName": "Name of the software application that was assessed",
      "version": "The version of the application"
    },
    "applicationFindings": [
      {
        "clearFindings": true
      }
    ]
  }
  ```
  - required parameter are:

    |parameter          | type or values                                             |
    |-------------------|:-----------------------------------------------------------|
    |--systemId         |Integer - Unique system identifier                          |
    |--applicationName  |String - Name of the software application that was assessed |
    |--clearFindings*   |Boolean - To clear an application's findings set it to true |

\*The clearFindings field is an optional field, but required with a value of "True" to clear out all application findings for a single application/version pairing.

[top](#post)

### ```post cloud_resource```
---
## Add Cloud Resource Results scans in the assets module for a system.

### Cloud Resource parameters/fields character limitations
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

### Add (POST) Cloud Resources CLI usages

```
USAGE
  $ saf emasser post cloud_resources [ARGUMENTS]

FLAGS
  -h, --help                       Post (add) cloud resources and their scan results in the assets module for a system
  -s, --systemId=<value>           (required) The system identification number
  -f, --cloudResourceFile=<value>  (required) A well formed JSON file with the cloud resources and their scan results. It can ba a single object or an array of objects.

DESCRIPTION
  Add a cloud resource and their scan results in the assets module for a system

EXAMPLES
  $ saf emasser post cloud_resources [-s,--systemId] [-f,--cloudResourceFile]
```

**Note:** The input file `[-f, --cloudResourceFile]`should be a well formed JSON containing the cloud resources and their scan results information.

---
###  Required JSON parameter/fields are:
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
  - required parameter are:

    |parameter               | type or values                                                            |
    |------------------------|:--------------------------------------------------------------------------|
    |--systemId              |Integer - Unique system identifier                                         |
    |--provider              |string - Cloud service provider name                                       |
    |--resourceId            |String - Unique identifier/resource namespace for policy compliance result |
    |--resourceName          |String - Friendly name of Cloud resource                                   |
    |--resourceType          |String - Type of Cloud resource                                            |
    |--cspPolicyDefinitionId |String - Unique identifier/compliance namespace for CSP/Resource\'s policy definition/compliance check|
    |--isCompliant | Boolean - Compliance status of the policy for the identified cloud resource         |
    |--policyDefinitionTitle | String - Friendly policy/compliance check title. Recommend short title    |

### Optional JSON parameters/fields are:
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
  - optional flags (parameters) are:

    |parameter          | type or values                                        |
    |-------------------|:------------------------------------------------------|
    |--initiatedBy      |String - Person initiating the process email address |  
    |--cspAccountId     |String - System/owner\'s CSP account ID/number |
    |--cspRegion        |String - CSP region of system |
    |--isBaseline       |Boolean - Flag that indicates in results is a baseline |    
    |Tags Object (tags)|
    |--text | String - Text that specifies the tag type |
    |Compliance Results Array Objects (complianceResults)|
    |--assessmentProcedure      |String - Comma separated correlation to Assessment Procedure (i.e. CCI number for DoD Control Set) |
    |--complianceCheckTimestamp |Date - The compliance check date - Unix time format |
    |--complianceReason         |String - Reason/comments for compliance result |
    |--control                  |String - Comma separated correlation to Security Control (e.g. exact NIST Control acronym) |
    |--policyDeploymentName     |String - Name of policy deployment |
    |--policyDeploymentVersion  |String - Version of policy deployment |
    |--severity                 |Possible Values: Low, Medium, High, Critical |
    


[top](#post)


### ```post container_scans```
---
## Add Container Scan Results in the assets module for a system.

### Container Scan Results parameters/fields character limitations
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

### Add (POST) Container Scan Results CLI usages

```
USAGE
  $ saf emasser post container_scans [ARGUMENTS]

FLAGS
  -h, --help                           Post (upload) one or many containers and their scan results for a system
  -s, --systemId=<value>               (required) The system identification number
  -f, --containerCodeScanFile=<value>  (required) A well formed JSON file with container scan results. It can ba a single object or an array of objects.

DESCRIPTION
  Upload containers and their scan results in the assets module for a system

EXAMPLES
  $ saf emasser post container_scans [-s,--systemId] [-f,--containerCodeScanFile]
 
```
**Note:** The input file `[-f, --containerCodeScanFile]` should be a well formed JSON containing the container scan results information.

---
### Required JSON parameter/fields are:
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
  - required parameter are:

    |parameter               | type or values                                                            |
    |------------------------|:--------------------------------------------------------------------------|
    |--systemId              |Integer - Unique system identifier                                         |
    |--containerId           |String - Unique identifier of the container  |
    |--containerName         |String - Friendly name of the container      |
    |--time                  |Date   - Datetime of scan/result. Unix date format |
    |Bench Marks Object (benchmarks)|
    |--benchmark         |String - Identifier of the benchmark/grouping of compliance results  |
    |Results Object (results)|
    |--ruleId            |String - Identifier for the compliance result, vulnerability, etc.
    |--status            |String - Benchmark result status
    |--lastSeen          |Date - Date last seen, Unix date format

### Optional JSON parameters/fields are:
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
        "results": [
          {
            "message": "Comments for the result"
          }
        ]
      }
    ]
  }
```
  - optional flags (parameters) are:

    |parameter                   | type or values                                        |
    |----------------------------|:------------------------------------------------------|
    |--podName          |String - Name of pod (e.g. Kubernetes pod) |
    |--podIp            |String - IP address of pod  |
    |--namespace        |String - Namespace of container in container orchestration (e.g. Kubernetes namespace)|
    |Tags Object (tags)|
    |--text | String - Text that specifies the tag type |
    |Bench Marks Object (benchmarks)
    |--isBaseline       |Boolean - True/false flag for providing results as baseline. If true, all existing compliance results for the provided benchmark within the container will be replaced by results in the current call|
    |Results Object (results)|
    |--message           |String - Comments for the result


[top](#post)

## Usage - PUT

### ``put controls``

----
## Security Control update (PUT) endpoint API business rules.

### Requirements based on `implementationStatus` field value

  |Value                   |Required Fields
  |------------------------|--------------------------------------------------------
  |Planned or Implemented  |`controlDesignation`, `estimatedCompletionDate`, `responsibleEntities`, `slcmCriticality`, `slcmFrequency`, `slcmMethod`, `slcmMethod`, `slcmTracking`, `slcmComments`
  |Not Applicable          |`naJustification`, `controlDesignation`, `responsibleEntities`
  |Manually Inherited      |`controlDesignation`, `estimatedCompletionDate`, `responsibleEntities`, `slcmCriticality`, `slcmFrequency`, `slcmMethod`, `slcmMethod`, `slcmTracking`, `slcmComments`

Implementation Plan cannot be updated if a Security Control is "Inherited" except for the following fields:
  - Common Control Provider (`commonControlProvider`)
  - Security Control Designation (`controlDesignation`)

### Security Controls parameters/fields character limitations  
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
### Update (PUT) System Controls CLI usages

```
USAGE
  $ saf emasser put controls [ARGUMENTS]

FLAGS
  -h, --help                 Put (update) control information in a system for one or many controls. See emasser Features (emasserFeatures.md) for additional information.
  -s, --systemId=<value>     (required) The system identification number
  -f, --controlFile=<value>  (required) A well formed JSON file with the Security Control information to be updated to the specified system. It can ba a single object or an array of objects.

DESCRIPTION
  Update Security Control information of a system for both the Implementation Plan and Risk Assessment.

EXAMPLES
  $ saf emasser put controls [-s,--systemId] [-f,--controlsFile]
```
**Note:** The input file should be a well formed JSON containing the Security Control information based on defined business rules. 
 
---
### Required JSON parameter/fields are:
```json
  {
    "acronym": "System acronym, required to match the NIST SP 800-53 Revision 4.",
    "responsibleEntities": "Include written description of Responsible Entities that are responsible for the Security Control.",
    "controlDesignation": "One of the following: [Common, System-Specific, Hybrid]",
    "estimatedCompletionDate": "Field is required for Implementation Plan",
    "implementationNarrative": "Includes Security Control comments"
  }
```
- required parameter are:

  |parameter                 | type or values                                                           |
  |--------------------------|:-------------------------------------------------------------------------|
  |--systemId                |Integer - Unique system identifier                                        |
  |--acronym                 |String - The system acronym(s) e.g "AC-1, AC-2"                           |
  |--responsibleEntities     |String - Description of the responsible entities for the Security Control |
  |--controlDesignation      |Possible values: Common, System-Specific, or Hybrid                       |
  |--estimatedCompletionDate |Date - Unix time format (e.g. 1499990400)                                 |
  |--implementationNarrative |String - Security control comments                                        |            

### Conditional JSON parameters/fields are:
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

### Optional JSON parameters/fields are:
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
    "testMethod": "One of the following [Test, Interview, Examine, Test,Interview, Test,Examine, Interview,Examine, Test,Interview,Examine]"
  }
```
- optional flags (parameters) are:

  |parameter              | type or values                                |
  |-----------------------|:----------------------------------------------|
  |--implementationStatus |Possible values: Planned, Implemented, Inherited, Not Applicable, or Manually Inherited|
  |--severity             |Possible values: Very Low, Low, Moderate, High, Very High |
  |--vulnerabilitySummary |String - The security control vulnerability summary |
  |--recommendations      |String - The security control vulnerability recommendation |
  |--relevanceOfThreat    |Possible values: Very Low, Low, Moderate, High, Very High |
  |--likelihood           |Possible values: Very Low, Low, Moderate, High, Very High |
  |--impact               |Possible values: Very Low, Low, Moderate, High, Very High |
  |--impactDescription    |String, - Description of the security control impact |
  |--residualRiskLevel    |Possible values: Very Low, Low, Moderate, High, Very High |
  |--testMethod           |Possible values: Test, Interview, Examine, Test,Interview, Test,Examine, Interview,Examine, Test,Interview,Examine|

[top](#put)

### ``put poams``
----
## Plan of Action and Milestones (POA&M) update (PUT) endpoint API business rules.

### Requirements based on `status` field value

  |status          |Required Fields
  |----------------|--------------------------------------------------------
  |Risk Accepted   |`comments`, `resources`
  |Ongoing         |`scheduledCompletionDate`, `resources`, `milestones` (at least 1)
  |Completed       |`scheduledCompletionDate`, `comments`, `resources`, `completionDate`, `milestones` (at least 1)
  |Not Applicable  |POAM can not be created

### POC fields requirements
If a POC email is supplied, the application will attempt to locate a user already registered within the application and pre-populate any information not explicitly supplied in the request. If no such user is found, these fields are required within the request.
  - pocOrganization, pocFirstName, pocLastName, pocEmail, pocPhoneNumber

### Business logic for updating POA&Ms
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


### POA&M parameters/fields character limitations
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
### Updating (PUT) POA&Ms CLI usages
```
USAGE
  $ saf emasser put poams [ARGUMENTS]

FLAGS
  -h, --help              Put (update) a Plan of Action and Milestones (POA&M) item(s) in a system. See emasser Features (emasserFeatures.md) for additional information.
  -s, --systemId=<value>  (required) The system identification number
  -f, --poamFile=<value>  (required) A well formed JSON file with the POA&M(s) to be updated to the specified system. It can ba a single object or an array of objects.

DESCRIPTION
  Update a Plan of Action and Milestones (POA&M) into a systems.

EXAMPLES
  $ saf emasser put poams [-s,--systemId] [-f,--poamFile]
```

**Note:** The input file should be a well formed JSON containing the POA&M information based on defined business rules. 
 
---
### Required JSON parameter/fields are:
```json
  {
    "poamId": "Unique identifier representing the nth POAM item entered into the site database.",
    "displayPoamId": "Globally unique identifier for individual POA&M Items, seen on the front-end as ID",
    "status": "One of the following: [Ongoing, Risk Accepted, Completed, Not Applicable]",
    "vulnerabilityDescription": "POA&M vulnerability description",
    "sourceIdentVuln": "Source that identifies the vulnerability",
    "pocOrganization": "Organization/Office represented",
    "resources": "List of resources used"
  }
```
- required parameter are:

  |parameter                  | type or values                                                 |
  |---------------------------|:---------------------------------------------------------------|
  |--systemId                 |Integer - Unique system identifier                              |
  |--displayPoamId            |Integer - Globally unique identifier for individual POA&M Items |
  |--status                   |Possible Values: Ongoing,Risk Accepted,Completed,Not Applicable |
  |--vulnerabilityDescription |String - Vulnerability description for the POA&M Item           |
  |--sourceIdentVuln          |String - Include Source Identifying Vulnerability text          |
  |--pocOrganization          |String - Organization/Office represented                        |
  |--resources                |String - List of resources used. Character Limit = 250          |

### Conditional JSON parameters/fields are:
```json
  {
    "milestones": [
      {
        "milestoneId": "Unique milestone identifier",
        "description": "The milestone description",
        "scheduledCompletionDate": "Milestone scheduled completion date (Unix format)",
        "isActive": "To prevent uploading duplicate/undesired milestones through the POA&M PUT you must include an isActive field for the milestone and set it to equal to false"
      }
    ],
    "pocFirstName": "The system acronym(s) e.g AC-1, AC-2",
    "pocLastName": "The system CCIS string numerical value",
    "pocEmail": "Security Checks that are associated with the POA&M",
    "pocPhoneNumber": "One of the following [I, II, III]",
    "severity": "One of the following [Very Low, Low, Moderate, High, Very High]",
    "scheduledCompletionDate": "One of the following [Very Low, Low, Moderate, High, Very High]",
    "completionDate": "Description of Security Control impact",
    "comments": "Description of the security control impact"
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

### Optional JSON parameters/fields are:
```json
{
    "externalUid": "External ID associated with the POA&M",
    "controlAcronym": "The system acronym(s) e.g AC-1, AC-2",
    "cci": "The system CCIS string numerical value",
    "securityChecks": "Security Checks that are associated with the POA&M",
    "rawSeverity": "One of the following [I, II, III]",
    "relevanceOfThreat": "One of the following [Very Low, Low, Moderate, High, Very High]",
    "likelihood": "One of the following [Very Low, Low, Moderate, High, Very High]",
    "impact": "Description of Security Control impact",
    "impactDescription": "Description of the security control impact",
    "residualRiskLevel": "One of the following [Very Low, Low, Moderate, High, Very High]",
    "recommendations": "Any recommendations content",
    "mitigation": "Mitigation explanation"
  }
```
  - optional flags (parameters) are:

    |parameter           | type or values                                                                           |
    |--------------------|:-----------------------------------------------------------------------------------------|
    |--externalUid       |String - External unique identifier for use with associating POA&M Items                  |
    |--controlAcronym    |String - Control acronym associated with the POA&M Item. NIST SP 800-53 Revision 4 defined|
    |--cci               |String - CCI associated with the test result                                              |
    |--securityChecks    |String - Security Checks that are associated with the POA&M                               |
    |--rawSeverity       |Possible values: I, II, III                                                               |
    |--relevanceOfThreat |Possible values: Very Low, Low, Moderate, High, Very High                                 |
    |--likelihood        |Possible values: Very Low, Low, Moderate, High, Very High                                 |
    |--impact            |Possible values: Very Low, Low, Moderate, High, Very High                                 |
    |--impactDescription |String - Include description of Security Control’s impact                                 |
    |--residualRiskLevel |Possible values: Very Low, Low, Moderate, High, Very High                                 |
    |--recommendations   |String - Include recommendations                                                          |
    |--mitigation        |String - Include mitigation explanation. 2000 Characters                                  |


[top](#put)

### ``put milestones``

----
Update (PUT) one or many milestones for a POA&M items in a system

```
USAGE
  $ saf emasser put milestones [ARGUMENTS]

FLAGS
  -h, --help                             Show emasser CLI help for the PUT Milestones endpoint
  -s, --systemId=<value>                 (required) The system identification number
  -p, --poamId=<value>                   (required) The poam identification number
  -m, --milestoneId=<value>              (required) Unique milestone identifier
  -c, --scheduledCompletionDate=<value>  The scheduled completion date - Unix time format
  -d, --description=<value>              The milestone description

DESCRIPTION
  Update milestone(s) for specified system, poam, and milestone Id

EXAMPLES
  $ saf emasser put milestones [-s,--systemId] [-p,--poamId] [-m,--milestoneId] [-d,--description] [-c,--scheduledCompletionDate]
```

  - required parameter are:

    |parameter                  | type or values                                      |
    |---------------------------|:----------------------------------------------------|
    |--systemId                 |Integer - Unique system identifier                   |
    |--poamId                   |Integer - Unique poam identifier                     |
    |--milestoneId              |Integer - Unique milestone identifier                |
    |--description              |String - Milestone item description. 2000 Characters |
    |--scheduledCompletionDate  |Date - Schedule completion date. Unix date format    |


[top](#put)

### ``put artifacts``
----
### Update one or many artifacts in a system

### Accepted artifact files are:
- .docx,.doc,.txt,.rtf,.xfdl,.xml,.mht,.mhtml,.html,.htm,.pdf
- .mdb,.accdb,.ppt,.pptx,.xls,.xlsx,.csv,.log
- .jpeg,.jpg,.tiff,.bmp,.tif,.png,.gif
- .zip,.rar,.msg,.vsd,.vsw,.vdx, .z{#}, .ckl,.avi,.vsdx
### Business Rules
- Artifact cannot be saved if File Name (fileName) exceeds 1,000 characters
- Artifact cannot be saved if Description (description) exceeds 2,000 characters
- Artifact cannot be saved if Reference Page Number (refPageNumber) exceeds 50 characters
- Artifact cannot be saved if the file does not have an allowable file extension/type.
- Artifact version cannot be saved if an Artifact with the same file name already exist in the system.
- Artifact cannot be saved if the file size exceeds 30MB.
- Artifact cannot be saved if the Last Review Date is set in the future.

---
### Update (PUT) Artifacts CLI usages

```
USAGE
  $ saf emasser put artifacts [ARGUMENTS]

FLAGS
  -h, --help                            Put (update) one or many artifacts in a system
  -s, --systemId=<value>                (required) The system identification number
  -f, --filename=<value>                (required) Artifact file name to update for the given system
  -T, --[no-]isTemplate                 (required) Boolean - Indicates whether an artifact is a template.
  -g, --category=<option>               (required) Artifact category <options: Implementation Guidance|Evidence>
  -t, --type=<option>                   (required) Artifact file type
                                        <options: Procedure|Diagram|Policy|Labor|Document|Image|Other|Scan Result|Auditor Report>
  -d, --description=<value>             The artifact(s) description
  -p, --refPageNumber=<value>           Artifact reference page number
  -c, --ccis=<value>                    CCIs associated with artifact
  -C, --controls=<value>                Control acronym associated with the artifact. NIST SP 800-53 Revision 4 defined.
  -D, --artifactExpirationDate=<value>  Date artifact expires and requires review
  -R, --lastReviewDate=<value>          Date artifact was last reviewed

DESCRIPTION
  Updates artifacts for a system with provided entries

EXAMPLES
  $ saf emasser put artifacts [-s,--systemId] [-f,--filename] [--isTemplate,--no-isTemplate] [-t,--type] [-g--category] [options]
```
  - required parameter are:

    |parameter     | type or values                                      |
    |--------------|:----------------------------------------------------|
    |--systemId    |Integer - Unique system identifier                   |
    |--filename    |String - File name should match exactly one file within the provided zip file|
    |              |Binary  - Application/zip file. Max 30MB per artifact |
    |--isTemplate  |Boolean - Indicates whether an artifact is a template|
    |--category    |Possible Values: Implementation Guidance, Evidence    |    
    |--type        |Possible Values: Procedure, Diagram, Policy, Labor, Document, Image, Other, Scan Result, Auditor Report|

  - optional parameter are:

    |parameter                | type or values                                        |
    |-------------------------|:------------------------------------------------------| 
    |--description            |String - Artifact description. 2000 Characters         |
    |--refPageNumber          |String - Artifact reference page number. 50 Characters |
    |--ccis                   |String -  CCIs associated with artifact                |
    |--controls               |String - Control acronym associated with the artifact. NIST SP 800-53 Revision 4 defined|
    |--artifactExpirationDate |Date - Date Artifact expires and requires review. In Unix Date Format|
    |--lastReviewDate         |Date - Date Artifact was last reviewed. In Unix Date Format          |


[top](#put)

## Usage - DELETE

### ``delete poams``

----
Remove (DELETE) POA&Ms CLI usages
```
USAGE
  $ saf emasser delete poams [ARGUMENTS]

FLAGS
  -h, --help                Show emasser CLI help for the DELETE POA&M endpoint
  -s, --systemId=<value>    (required) The system identification number
  -P, --poamsId=<value>...  (required) Unique POA&M identification number, can have multiple (space separated)

DESCRIPTION
  Remove one or many POA&M items in a system identified by system and poam Id

EXAMPLES
  $ saf emasser delete poams [-s,--systemId] [-P,--poamsId]
```
[top](#delete)

### ``delete milestones``

----
Remove milestones in a system for one or many POA&M items

To delete a milestone the record must be inactive by having the field `isActive` set to false (isActive=false).

The last milestone can not be deleted, at-least on must exist.

Remove (DELETE) Milestones CLI usages
```
USAGE
  $ saf emasser delete milestones [ARGUMENTS]

FLAGS
  -h, --help                     Show emasser CLI help for the DELETE Milestones endpoint
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

### ``delete artifacts``

---
Remove one or many artifacts in a system

Remove (DELETE) Artifact files CLI usages
```
USAGE
  $ saf emasser delete artifacts [ARGUMENTS]

FLAGS
  -h, --help                 Show emasser CLI help for the DELETE POA&M endpoint
  -s, --systemId=<value>     (required) The system identification number
  -F, --fileName=<value>...  (required) The artifact file name to remove, can have multiple (space separated)

DESCRIPTION
  Remove one or many artifacts in a system identified by system Id

EXAMPLES
  $ saf emasser delete artifacts [-s,--systemId] [-F,--fileName]
```
**Note** Multiple artifacts can be deleted by including multiple file names separated by a space.

[top](#delete)