# Install cinc-auditor Action

A composite GitHub Action that installs cinc-auditor (InSpec community build) with platform-aware caching for faster CI/CD workflows.

## Features

- **Cross-platform support**: Works on Ubuntu, macOS, and Windows runners
- **Smart caching**: Caches cinc-auditor installations to speed up subsequent runs
- **Version pinning**: Installs cinc-auditor version 6.6.0 consistently
- **PATH management**: Automatically adds cinc-auditor to the PATH
- **Verification**: Validates installation after completion

## Caching Strategy

This action uses `actions/cache@v4.3.0` to cache the cinc-auditor installation directory:

### Cache Paths (Platform-Specific)
- **Windows**: `C:\cinc-project\cinc-auditor`
- **Linux/macOS**: `/opt/cinc-auditor`

### Cache Key
- Format: `cinc-auditor-${{ runner.os }}-6.6.0`
- Examples:
  - `cinc-auditor-Linux-6.6.0`
  - `cinc-auditor-macOS-6.6.0`
  - `cinc-auditor-Windows-6.6.0`

### Cache Behavior
1. **Cache Hit**: Restores installation from cache, skips download (saves ~2-3 minutes)
2. **Cache Miss**: Downloads and installs cinc-auditor, then caches for future runs

## Usage

### Basic Usage
```yaml
steps:
  - uses: actions/checkout@v4

  - name: Install cinc-auditor
    uses: ./.github/actions/install-cinc-auditor

  - name: Run InSpec tests
    run: cinc-auditor exec ./my-profile
```

### In a Matrix Strategy
```yaml
jobs:
  test:
    strategy:
      matrix:
        platform: [ubuntu, macos, windows]
    runs-on: ${{ matrix.platform }}-latest

    steps:
      - uses: actions/checkout@v4

      - name: Install cinc-auditor
        uses: ./.github/actions/install-cinc-auditor

      - name: Run tests
        run: cinc-auditor exec ./profile
```

### Full E2E Testing Example
```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ${{ matrix.platform }}-latest
    strategy:
      matrix:
        platform: [ubuntu, macos, windows]

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'pnpm'

      - name: Install cinc-auditor
        uses: ./.github/actions/install-cinc-auditor

      - name: Install dependencies and test
        run: |
          pnpm install --frozen-lockfile
          pnpm run test
```

## Inputs

This action currently has no configurable inputs. It installs cinc-auditor 6.6.0 by default.

## Outputs

This action does not provide explicit outputs, but it:
1. Adds `cinc-auditor` to the `PATH`
2. Verifies the installation succeeded
3. Exits with code 1 if installation fails

## Implementation Details

### Installation Methods

**Windows (PowerShell)**:
```powershell
. { iwr -useb https://omnitruck.cinc.sh/install.ps1 } | iex; install -project cinc-auditor -version 6.6.0
```

**Linux/macOS (Bash)**:
```bash
curl -L https://omnitruck.cinc.sh/install.sh | sudo bash -s -- -P cinc-auditor -v 6.6.0
```

### PATH Configuration

**Windows**: Adds both binary and embedded binary directories:
- `C:\cinc-project\cinc-auditor\bin`
- `C:\cinc-project\cinc-auditor\embedded\bin`

**Linux/macOS**: Installation script automatically configures PATH

### Verification

After installation, the action verifies cinc-auditor is accessible:
- **Windows**: `cinc-auditor.bat version`
- **Linux/macOS**: `cinc-auditor version`

## Benefits Over Inline Installation

Using this composite action instead of inline installation steps provides:

1. **Reusability**: Single source of truth for cinc-auditor installation
2. **Consistency**: Same installation logic across all workflows
3. **Maintainability**: Update version in one place
4. **Caching**: Built-in cache management reduces CI time
5. **Reliability**: Consistent error handling and verification

## Cache Performance

Expected time savings with cache:

| Operation | No Cache | With Cache | Savings |
|-----------|----------|------------|---------|
| Linux/macOS | ~90s | ~5s | ~85s |
| Windows | ~120s | ~10s | ~110s |

## Version Information

- **cinc-auditor Version**: 6.6.0
- **Cache Action**: actions/cache@v4.3.0 (SHA: 0057852bfaa89a56745cba8c7296529d2fc39830)
- **Supported Platforms**: ubuntu-latest, macos-latest, windows-latest

## Troubleshooting

### Cache Not Working
- Ensure the cache key matches: `cinc-auditor-${{ runner.os }}-6.6.0`
- Check GitHub Actions cache size limits (10GB per repository)
- Verify cache path is correct for the platform

### Installation Fails
- Check network connectivity to omnitruck.cinc.sh
- Verify sudo permissions on Linux/macOS
- Check PowerShell execution policy on Windows

### PATH Issues on Windows
- Ensure both bin directories are added to PATH
- Use `cinc-auditor.bat` instead of `cinc-auditor` in some Windows contexts

## Related Actions

- [setup-saf-cli](../setup-saf-cli/README.md) - Install SAF CLI with caching

## License

This action is part of the MITRE SAF CLI project and follows the same license.
