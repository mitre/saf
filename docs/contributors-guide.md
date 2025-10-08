# MITRE SAF Development, Testing and Contribution Guide

The MITRE saf-cli is an OCLIF application developed with TypeScript.

## Prerequisites

- Node.js (check the package.json file for the current version)
- npm (version 6 or newer)

## Installation

To install the project, clone the repository and install the dependencies:

```bash
git clone https://github.com/mitre/saf.git
cd project
npm install
```

## Development

To start the development server, run:

```bash
npm run dev -- ${command you desire to run & its flags}
```

This script will clean the `lib` directory, compile the TypeScript files, and start the application. You can pass arguments to the `dev` script using the `--` syntax. For example:

```bash
npm run dev -- --help
npm run dev -- view summary
```

## Testing

We use both ts-mocha/chai and ts-jest for testing.

### Command Tests

The 'command' tests are located in the `./test/commands` directory and organized by the OCLIF commands such as attest, view, generate etc. These tests are written in ts-mocha. You can run all the tests or a single test. For example:

```bash
npm run test:mocha
npm run test:mocha:one ./test/commands/view/summary.ts
```

### Utility Tests

The 'utility' tests are located in the `./test/utils` directory and organized by each of the utility classes of the saf-cli. These tests are a mix of chai and jest tests. The chai tests are all the files named `{utility}.test.ts` and the jest tests are located in the `__tests__` directory. You can run all the tests or a single test. For example:

```bash
npm run test:jest
npm run test:jest:one ./test/utils/calculations.test.ts
```
### Run All Tests
To invoke all tests `chai` and `jest` use the following commands:
```bash
npm run test
npm run tests
```

## Linting

We use ESLint with the TypeScript ESLint plugin for linting. The command lint’s all TypeScript files found in the `scr` directory (including sub-directories). To run the linter, use:

```bash
npm run lint:ci  # Reports issues found, does not fix them
npm run lint     # Invokes the --fix flag, fixes issues found
```

## Building

To build the project, use:

```bash
npm run prepack
```

This script will clean the `lib` directory and compile the TypeScript files.

## Usage

Here's how you can use the CLI:

```bash
./bin/run command-name    # Darwin or Linux
node bin/run command-name # Windows
```

You can get help on the available commands with:

```bash
./bin/run --help    # Darwin or Linux
node bin/run --help # Windows
```
## Creating a Release
The process of creating a release is document in the SAF CLI Wiki Page [How-to Create a SAF CLI Release](https://github.com/mitre/saf/wiki/How%E2%80%90to-Create-a-SAF-CLI-Release)

>[!WARNING]
> Before executing the preparatory script ensure that you're on a directory containing the most recent commit of the SAF CLI. The first step of the scrip will do a `git checkout main` proceeding by a `git pull origin main`

Basically the process of creating a SAF CLI release consists of performing the following steps:

1. Run the appropriate preparatory release script
    ```bash
    ./release-pre.sh   # Darwin or Linux
    .\release-pre.ps1  # Windows
    ```
    The script performs the following:

    - Retrieve the latest main content
    - Bump the SAF CLI version number in the VERSION file and package.json
    - Update MITRE dependencies to latest versions
    - Remove the `node_modules` if exists
    - Install all supporting modules
    - Build and run all tests
    - Add unstaged files to the staging area (package.json - version) or any other file with the modified flag (M)
    - Commit previously staged files with `signoff` tag with the new version number
    - Tag the commit with new release version
    - Push and updated all three references to the repository with the version number

2. Add the generated packages to the staged release
3. Associate the tags with the drafted release
4. Set the release to be the latest
5. Publish the release

>[!NOTE]
>Detailed information on steps 2 through 5 are listed in the [How-to Create a SAF CLI Release](https://github.com/mitre/saf/wiki/How%E2%80%90to-Create-a-SAF-CLI-Release) Wiki page

## Contributing

Contributions are welcome! We use the standard GitFlow model for PRs. Please ensure that your PRs pass all tests and close all related issues. We also use a semver-based release process.

## License

See the LICENSE and NOTICE files at the root of the project.
