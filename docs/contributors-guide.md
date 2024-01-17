# MITRE `saf-cli` Develpment, Testing and Contribution Guide

The MITRE saf-cli is an OCLIF application developed with TypeScript.

## Prerequisites

- Node.js (version 10 or newer)
- npm (version 6 or newer)

## Installation

To install the project, clone the repository and install the dependencies:

```bash
git clone https://github.com/username/project.git
cd project
npm install
```

## Development

To start the development server, run:

```bash
npm run dev
```

This script will clean the `lib` directory, compile the TypeScript files, and start the application. You can pass arguments to the `dev` script using the `--` syntax. For example:

```bash
npm run dev -- --help
npm run dev -- view summary
```

## Testing

We use both ts-mocha/chai and ts-jest for testing.

### Command Tests

The 'command' tests are located in the `./tests/commands` directory and organized by the OCLIF commands such as attest, view, generate etc. These tests are written in ts-mocha. You can run all the tests or a single test. For example:

```bash
npm run test:mocha
npm run test:mocha:one ./tests/command/view/summary.ts
```

### Utility Tests

The 'utility' tests are located in the `./tests/utility` directory and organized by each of the utility classes of the saf-cli. These tests are a mix of chai and jest tests. The chai tests are all the files named `{utility}.test.ts` and the jest tests are located in the `__tests__` directory. You can run all the tests or a single test. For example:

```bash
npm run test:jest
npm run test:jest:one ./tests/utility/calculations.test.ts
```

## Linting

We use ESLint with the TypeScript ESLint plugin for linting. To run the linter, use:

```bash
npm run lint
npm run lint --fix
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
./bin/run command-name
```

You can get help on the available commands with:

```bash
./bin/run --help
```

## Contributing

Contributions are welcome! We use the standard GitFlow model for PRs. Please ensure that your PRs pass all tests and close all related issues. We also use a semver-based release process.

## License

See the LICENSE and NOTICE files at the root of the project.
