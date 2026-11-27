# MITRE SAF Development, Testing and Contribution Guide

## Installation

Use a Node.js version supported by [package.json](../package.json).

```bash
git clone https://github.com/mitre/saf.git
cd saf
npm ci
```

## Development

Rebuild the CLI and run a command with `npm run dev`.

```bash
npm run dev -- view summary --help
```

Use `npm run prepack` to build the CLI, then run it with `node bin/run --help`.

## Testing

Vitest discovers `.test.ts` files. Command tests follow the CLI groups under `test/commands/`. Utility tests live under `test/utils/`, in a utility subdirectory when applicable. Build the CLI before running command tests.

```bash
npm run prepack
npm run test:ci
npm run test:ci -- test/utils/ohdf/output_generator.test.ts  # Single file
```

Use `npm test` to run Vitest in watch mode.

## Linting

```bash
npm run lint:ci  # Check for lint findings
npm run lint     # Apply automatic fixes
```

## Creating a Release

Start from a clean checkout with Docker Buildx available. Run `./release-prep.sh` on macOS or Linux, or `.\release-prep.ps1` in PowerShell 6 or newer. The script checks out and updates `main`, bumps the version, then commits, tags, and pushes the release.

Attach the generated packages to the draft release, select the tag, mark it as the latest release, and publish. [SAF CLI release guide](https://github.com/mitre/saf/wiki/How%E2%80%90to-Create-a-SAF-CLI-Release)

## Contributing

Follow GitFlow, link related issues, and make sure lint and tests pass before opening a pull request. SAF uses semantic versioning.

## License

See [LICENSE.md](../LICENSE.md).
