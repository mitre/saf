# MITRE SAF Development, Testing and Contribution Guide

The MITRE saf-cli is an OCLIF application developed with TypeScript.

## Prerequisites

- Node.js (check the package.json file for the current version)
- pnpm (version 10 or newer) - Install with: `npm install -g pnpm`

## Installation

To install the project, clone the repository and install the dependencies:

```bash
git clone https://github.com/mitre/saf.git
cd project
pnpm install
```

## Development

To start the development server, run:

```bash
pnpm run dev -- ${command you desire to run & its flags}
```

This script will clean the `lib` directory, compile the TypeScript files, and start the application. You can pass arguments to the `dev` script using the `--` syntax. For example:

```bash
pnpm run dev -- --help
pnpm run dev -- view summary
```

## Testing

SAF CLI uses Vitest as the testing framework. The test suite is organized into command tests and utility tests, with comprehensive coverage requirements for all functionality.

### Command Tests

The 'command' tests are located in the `./test/commands` directory and organized by the OCLIF commands such as attest, view, generate etc. You can run all the tests or a single test. For example:

```bash
pnpm run test
pnpm run test -- test/commands/view/summary.test.ts
```

### Utility Tests

The 'utility' tests are located in the `./test/utils` directory and organized by each of the utility classes of the saf-cli. For example:

```bash
pnpm run test -- test/utils/threshold/calculations.test.ts
```

### Run All Tests
To invoke all tests use the following commands:
```bash
pnpm run test
pnpm run tests  # Alias for test
```

### Test Coverage
To run tests with coverage reporting:
```bash
pnpm test -- --coverage
```

Coverage reports are generated in the `coverage/` directory and uploaded to Codecov on CI builds.

## Linting

We use ESLint with the TypeScript ESLint plugin for linting. The command lint’s all TypeScript files found in the `scr` directory (including sub-directories). To run the linter, use:

```bash
pnpm run lint:ci  # Reports issues found, does not fix them
pnpm run lint     # Invokes the --fix flag, fixes issues found
```

## Building

To build the project, use:

```bash
pnpm run prepack
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

## CI/CD Architecture

The SAF CLI uses a streamlined three-stage CI/CD pipeline:

### Pull Request Validation (ci-pr.yml)
When you open a pull request, automated validation runs in **~10-15 minutes**:
- **Code Quality**: ESLint linting
- **Test Suite**: Full tests on Ubuntu with coverage reporting
- **Docker Build**: Validates Docker image builds and runs

All jobs run in parallel for fast feedback. See validation results in a summary table directly in your PR.

### Main Branch CI (ci-main.yml)
After merging to main, comprehensive validation runs in **~20-25 minutes**:
- **Cross-Platform Testing**: Full test suite on Ubuntu, macOS, and Windows
- **Security Scanning**: SBOM generation and vulnerability scanning
- **Docker Publishing**: Multi-architecture builds published to DockerHub and Iron Bank
- **Release Notes**: Draft release automatically updated

### Release Workflows
When a release is tagged, distribution packages are automatically built:
- Windows/Linux installers
- macOS packages
- RPM packages for RedHat/CentOS
- npm and GitHub Package Registry publishing
- Homebrew formula updates

### Reusable Components
The pipeline uses two composite actions to reduce duplication:
- **setup-saf-cli**: Standardized Node.js and pnpm environment setup
- **install-cinc-auditor**: Cross-platform cinc-auditor installation with caching

### Detailed Documentation
For complete CI/CD architecture documentation, troubleshooting, and maintenance guides, see:
**[.github/workflows/README.md](../.github/workflows/README.md)**

## Contributing

Contributions are welcome! We use the standard GitFlow model for PRs. Please ensure that your PRs pass all tests and close all related issues. We also use a semver-based release process.

### Pull Request Guidelines
- Ensure all tests pass locally before opening PR: `pnpm test`
- Run linting and fix issues: `pnpm run lint`
- PRs are automatically validated by CI (see CI/CD Architecture above)
- All validation checks must pass before merge
- Write clear commit messages following conventional commit format

## License

See the LICENSE and NOTICE files at the root of the project.
