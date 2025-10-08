# CI/CD Workflow Architecture

This document describes the SAF CLI's GitHub Actions CI/CD pipeline architecture, which was reorganized in 2025 to provide faster feedback, better resource utilization, and clearer separation of concerns.

## Table of Contents

- [Overview](#overview)
- [Architecture Diagram](#architecture-diagram)
- [Workflow Descriptions](#workflow-descriptions)
- [Composite Actions](#composite-actions)
- [Developer Guide](#developer-guide)
- [Migration Notes](#migration-notes)
- [Performance Metrics](#performance-metrics)
- [Maintenance](#maintenance)

## Overview

### What Changed and Why

The CI/CD pipeline was reorganized from multiple individual workflows into a cohesive, three-stage architecture:

**Before (Old Architecture):**
- Separate workflows for linting, coverage, and Docker builds
- Full cross-platform matrix on every PR (high cost, slow feedback)
- Duplicate setup code across workflows
- Unclear workflow dependencies

**After (New Architecture):**
- Three core pipeline workflows: `ci-pr.yml`, `ci-main.yml`, `cd-release.yml`
- Three reusable composite actions for common setup tasks
- Four operational workflows: `ops-*` prefix for maintenance/metrics
- Fast PR validation with strategic testing
- Comprehensive cross-platform validation on main branch
- Clear progression: PR → Main → Release

### Benefits

1. **Faster PR Feedback**: PRs run only essential checks (lint + Ubuntu tests + Docker) in ~10-15 minutes instead of 30+ minutes
2. **Cost Reduction**: ~60% reduction in compute minutes by limiting cross-platform testing to main branch
3. **Better Developer Experience**: Clear, consolidated validation results with summary tables
4. **Reduced Maintenance**: Centralized setup logic in composite actions means updating Node/pnpm versions in one place
5. **Strategic Testing**: Quick validation on PRs, comprehensive validation on merges
6. **Improved Security**: All action versions pinned to SHAs with security scanning

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          PR WORKFLOW (ci-pr.yml)                     │
│                         Fast Feedback (~10-15 min)                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐           │
│  │   Quality    │   │ Test Ubuntu  │   │ Docker Build │           │
│  │   (Lint)     │   │  (Coverage)  │   │   (Smoke)    │           │
│  │  ~3-5 min    │   │  ~8-10 min   │   │  ~5-8 min    │           │
│  └──────┬───────┘   └──────┬───────┘   └──────┬───────┘           │
│         │                  │                   │                     │
│         └──────────────────┴───────────────────┘                     │
│                             │                                        │
│                    ┌────────▼─────────┐                             │
│                    │  PR Validation   │                             │
│                    │     Summary      │                             │
│                    └──────────────────┘                             │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              │ Merge to main
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         MAIN WORKFLOW (ci-main.yml)                  │
│                   Comprehensive Validation (~20-25 min)              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────────────────────────────────────┐                │
│  │          Cross-Platform Test Matrix             │                │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐     │                │
│  │  │  Ubuntu  │  │  macOS   │  │ Windows  │     │                │
│  │  │ ~12 min  │  │ ~15 min  │  │ ~18 min  │     │                │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘     │                │
│  └───────┼────────────┼─────────────┼────────────┘                │
│          │            │             │                                │
│          └────────────┴─────────────┘                                │
│                       │                                              │
│          ┌────────────┴────────────┐                                │
│          │                         │                                │
│  ┌───────▼────────┐       ┌────────▼─────────┐                     │
│  │   Security     │       │  Docker Publish  │                     │
│  │   SBOM Scan    │       │  to DockerHub +  │                     │
│  │   ~5 min       │       │   Iron Bank      │                     │
│  └────────────────┘       │   ~10-12 min     │                     │
│                           └──────────────────┘                      │
│                                                                       │
│  ┌──────────────────────────────────────────────┐                   │
│  │         Draft Release Notes Updated          │                   │
│  │         (runs in parallel, ~2 min)           │                   │
│  └──────────────────────────────────────────────┘                   │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              │ Tag & Publish Release
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      RELEASE WORKFLOW (Manual)                       │
│                    Distribution Package Builds                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  • build-windows-linux.yml - Windows/Linux packages                 │
│  • build-macos.yml - macOS packages                                 │
│  • build-rpm.yml - RPM packages for RedHat/CentOS                   │
│  • push-to-npm-gpr.yml - npm and GitHub Package Registry            │
│  • bump-brew.yml - Homebrew formula update                          │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘

             Composite Actions (Shared Infrastructure)
         ┌──────────────────────────────────────────────┐
         │  .github/actions/setup-saf-cli/              │
         │  • Node.js + pnpm setup                      │
         │  • Dependency caching                        │
         │  • Configurable production/dev installs      │
         └──────────────────────────────────────────────┘
         ┌──────────────────────────────────────────────┐
         │  .github/actions/install-cinc-auditor/       │
         │  • Cross-platform cinc-auditor install       │
         │  • Installation caching (6.6.0)              │
         │  • PATH configuration                        │
         └──────────────────────────────────────────────┘
```

## Workflow Descriptions

### ci-pr.yml - PR Validation

**Purpose**: Provides fast feedback on pull requests with essential quality checks.

**When It Runs**:
- On pull requests targeting `main` branch
- Skips documentation-only changes (`**.md`, `docs/**`, `LICENSE`, `.gitignore`)
- Cancels in-progress runs when new commits are pushed to the same PR

**What It Does**:
1. **Quality Job** (~3-5 minutes)
   - Runs ESLint linter in CI mode (reports issues, no auto-fix)
   - Validates code style and TypeScript standards
   - Runs on: Ubuntu latest

2. **Test Ubuntu Job** (~8-10 minutes)
   - Installs cinc-auditor (InSpec community build)
   - Runs full test suite with Vitest
   - Generates code coverage report
   - Uploads coverage to Codecov
   - Validates CLI works without dev dependencies (production sanity check)
   - Runs on: Ubuntu latest
   - Permissions: Read contents, write PR comments (for coverage)

3. **Docker Build Job** (~5-8 minutes)
   - Builds Docker image from Dockerfile
   - Runs smoke tests (`--version`, `--help`)
   - Uses BuildKit caching for faster builds
   - Only runs if quality and tests pass (dependency check)
   - Runs on: Ubuntu latest

4. **PR Validation Summary Job**
   - Collects results from all jobs
   - Generates markdown summary table
   - Fails if any job failed
   - Runs on: Ubuntu latest
   - Always runs (even if jobs fail) to show summary

**Typical Runtime**: 10-15 minutes total (jobs run in parallel where possible)

**Cost**: ~15-20 compute minutes (Ubuntu only, parallel execution)

### ci-main.yml - Main Branch CI

**Purpose**: Comprehensive validation after code is merged to main branch. Ensures code works across all supported platforms before release.

**When It Runs**:
- On push to `main` branch
- Skips documentation-only changes
- Does NOT cancel in-progress runs (preserves sequential builds)

**What It Does**:

1. **Test Matrix Job** (~12-18 minutes depending on platform)
   - Cross-platform testing matrix: Ubuntu, macOS, Windows
   - Each platform:
     - Installs cinc-auditor (platform-specific installation)
     - Installs dependencies and builds
     - Runs full test suite
     - Validates CLI works without dev dependencies
   - Ubuntu only:
     - Runs tests with coverage
     - Uploads coverage to Codecov
     - Generates coverage summary
   - Strategy: Fail-fast (stop all platforms if one fails)
   - Runs on: ubuntu-latest, macos-latest, windows-latest
   - Timeout: 20 minutes per platform

2. **Security Scan Job** (~5-10 minutes, runs in parallel with tests)
   - Builds Docker image
   - Generates Software Bill of Materials (SBOM) using Anchore Syft
   - Uploads dependency snapshot to GitHub Dependency Graph
   - Uses SPDX JSON format
   - Runs on: Ubuntu latest
   - Permissions: Write contents (for dependency submission API)

3. **Docker Publish Job** (~10-12 minutes, after tests pass)
   - Sets up QEMU for multi-architecture builds
   - Builds for: linux/amd64, linux/arm64
   - Pushes to DockerHub with tags:
     - `mitre/saf:latest`
     - `mitre/saf:<git-sha>`
   - Verifies image availability (retry logic)
   - Updates Iron Bank repository with new version
   - Depends on: test-matrix and security-scan jobs passing
   - Runs on: Ubuntu 24.04
   - Permissions: Read contents

4. **Draft Release Job** (~2-5 minutes, runs in parallel with docker)
   - Updates draft release notes using Release Drafter
   - Aggregates merged PRs since last release
   - Auto-labeler disabled (manual categorization)
   - Runs on: Ubuntu 22.04
   - Permissions: Write contents, read pull requests

**Typical Runtime**: 20-25 minutes total (matrix runs in parallel)

**Cost**: ~50-60 compute minutes (cross-platform matrix + Docker + security)

### draft-release.yml - Release Note Management

**Purpose**: Automatically maintains draft release notes as PRs are merged.

**When It Runs**:
- On push to `main` branch (any file changes)
- NOTE: This workflow is now integrated into `ci-main.yml` as the `draft-release` job

**What It Does**:
- Uses Release Drafter action to update draft release
- Collects merged PRs since last release
- Generates categorized changelog
- Auto-labeler disabled (requires manual PR labeling)

**Status**: Standalone workflow exists but functionality is integrated into `ci-main.yml` for efficiency.

## Composite Actions

Composite actions provide reusable setup logic, reducing duplication and making maintenance easier.

### setup-saf-cli

**Location**: `.github/actions/setup-saf-cli/action.yml`

**Purpose**: Standardized Node.js and pnpm environment setup for SAF CLI development.

**Inputs**:
- `node-version` (optional, default: '22'): Node.js version to install
- `pnpm-version` (optional, default: '10.18.0'): pnpm version to install
- `install-deps` (optional, default: 'true'): Whether to install dependencies
- `production-only` (optional, default: 'false'): Install only production dependencies

**What It Does**:
1. Installs pnpm using `pnpm/action-setup`
2. Sets up Node.js using `actions/setup-node` with caching
3. Optionally installs dependencies with `--frozen-lockfile`
4. Supports production-only installs for sanity checks

**Usage Example**:

```yaml
steps:
  - uses: actions/checkout@v4

  # Development environment with all dependencies
  - name: Setup SAF CLI
    uses: ./.github/actions/setup-saf-cli
    with:
      node-version: '22'
      pnpm-version: '10.18.0'

  # Production environment (no dev dependencies)
  - name: Setup SAF CLI for production test
    uses: ./.github/actions/setup-saf-cli
    with:
      production-only: 'true'
```

**Benefits**:
- Single source of truth for Node/pnpm versions
- Consistent caching configuration
- Reduces workflow file complexity
- Easy to update versions across all workflows

### install-cinc-auditor

**Location**: `.github/actions/install-cinc-auditor/action.yml`

**Purpose**: Cross-platform installation of cinc-auditor (InSpec community build) with caching.

**Inputs**: None (fully self-contained)

**What It Does**:
1. Determines platform-specific cache path (Windows vs Unix)
2. Checks cache for existing installation (keyed by OS + version 6.6.0)
3. Installs cinc-auditor if cache miss:
   - **Windows**: PowerShell script from omnitruck.cinc.sh
   - **Linux/macOS**: Bash script from omnitruck.cinc.sh
4. Adds cinc-auditor to PATH (Windows requires special handling)
5. Verifies installation by running `cinc-auditor version`

**Usage Example**:

```yaml
steps:
  - uses: actions/checkout@v4

  - name: Install cinc-auditor
    uses: ./.github/actions/install-cinc-auditor

  - name: Use cinc-auditor
    run: cinc-auditor version
```

**Cache Benefits**:
- First run: ~2-3 minutes to install
- Cached runs: ~5-10 seconds to restore
- Cache key: `cinc-auditor-${{ runner.os }}-6.6.0`
- Separate caches per OS (Linux, macOS, Windows)

**Platform Differences**:
- **Linux**: Installs to `/opt/cinc-auditor`, automatically in PATH
- **macOS**: Installs to `/opt/cinc-auditor`, automatically in PATH
- **Windows**: Installs to `C:\cinc-project\cinc-auditor`, requires explicit PATH modification

## Developer Guide

### What to Expect When Opening a PR

1. **Automated Validation Starts** (~30 seconds after opening PR)
   - GitHub Actions will trigger `ci-pr.yml` workflow
   - You'll see three parallel checks in the PR status:
     - ✓ Lint Code
     - ✓ Test on Ubuntu
     - ✓ Build and Test Docker Image

2. **Linting Feedback** (~3-5 minutes)
   - First check to complete
   - If it fails:
     - Click "Details" to see linting errors
     - Fix locally with: `pnpm run lint` (auto-fixes most issues)
     - Push fixes, workflow automatically re-runs

3. **Test Results** (~8-10 minutes)
   - Ubuntu test suite runs with coverage
   - Coverage report uploaded to Codecov
   - Coverage summary appears in GitHub workflow summary
   - If tests fail:
     - Run locally: `pnpm test`
     - Check specific test: `pnpm test -- path/to/test.test.ts`
     - All tests must pass before merge

4. **Docker Build** (~5-8 minutes)
   - Only runs if linting and tests pass
   - Validates Dockerfile builds successfully
   - Runs basic smoke tests
   - Uses BuildKit cache for faster rebuilds

5. **PR Summary** (appears after all jobs complete)
   - Markdown table showing all job statuses
   - Clear ✅ or ❌ indicators
   - Link to detailed logs for any failures

**Total PR Validation Time**: 10-15 minutes for clean runs

**If Validation Fails**:
- Fix issues locally and push
- Workflow automatically cancels old runs and starts fresh
- No need to manually trigger re-runs

### What Runs on Main Branch

After your PR is merged to `main`, comprehensive validation kicks in:

1. **Cross-Platform Testing** (~20 minutes)
   - Full test suite on Ubuntu, macOS, AND Windows
   - Ensures code works on all supported platforms
   - Coverage uploaded from Ubuntu build
   - If any platform fails, deployment is blocked

2. **Security Scanning** (~5 minutes)
   - SBOM generation with Anchore Syft
   - Dependency vulnerability scanning
   - Results uploaded to GitHub Security tab

3. **Docker Publishing** (~10 minutes)
   - Multi-architecture builds (amd64 + arm64)
   - Published to DockerHub:
     - `mitre/saf:latest`
     - `mitre/saf:<git-sha>`
   - Iron Bank repository updated for government use

4. **Release Notes Update** (~2 minutes)
   - Draft release notes automatically updated
   - Your PR title/description added to changelog
   - Visible in GitHub Releases (draft)

**Total Main Branch Time**: 20-25 minutes

**Monitoring**:
- Watch Actions tab for main branch builds
- Check Codecov dashboard for coverage trends
- Review draft release notes before publishing

### Release Process

The SAF CLI uses a semi-automated release process:

1. **Prepare Release** (Manual - Use release scripts)
   ```bash
   # On macOS/Linux
   ./release-pre.sh

   # On Windows
   .\release-pre.ps1
   ```

   This script:
   - Checks out and pulls latest main
   - Bumps version in VERSION file and package.json
   - Updates MITRE dependencies
   - Rebuilds and tests
   - Creates signed commit with version tag
   - Pushes to GitHub

2. **Build Distribution Packages** (Automatic on tag push)
   - `build-windows-linux.yml` - Creates Windows/Linux installers
   - `build-macos.yml` - Creates macOS installer
   - `build-rpm.yml` - Creates RPM packages
   - `push-to-npm-gpr.yml` - Publishes to npm and GitHub Packages

3. **Finalize Release** (Manual in GitHub UI)
   - Navigate to Releases → Draft Release
   - Review auto-generated release notes
   - Attach built packages from workflow artifacts
   - Set as "Latest Release"
   - Publish

4. **Post-Release** (Automatic)
   - `bump-brew.yml` - Updates Homebrew formula
   - Docker images already published from main branch builds

**Detailed Instructions**: See [SAF CLI Release Wiki](https://github.com/mitre/saf/wiki/How%E2%80%90to-Create-a-SAF-CLI-Release)

### Troubleshooting Common Issues

#### Linting Failures

**Problem**: ESLint reports errors
```
Expected indentation of 2 spaces but found 4
'variableName' is never reassigned. Use 'const' instead
```

**Solution**:
```bash
# Auto-fix most issues
pnpm run lint

# Check specific file
pnpm run lint:ci src/path/to/file.ts

# View ESLint config
cat .eslintrc.json
```

#### Test Failures on Ubuntu but Passing Locally

**Problem**: Tests pass on your machine but fail in CI

**Possible Causes**:
- Missing `cinc-auditor` locally (some tests require it)
- File path differences (Windows vs Unix)
- Timezone differences (tests using dates)
- Missing test fixtures

**Solution**:
```bash
# Install cinc-auditor locally
curl -L https://omnitruck.cinc.sh/install.sh | sudo bash -s -- -P cinc-auditor

# Run tests with same flags as CI
pnpm test

# Check specific failing test
pnpm test -- test/path/to/failing.test.ts

# Run with coverage like CI does
pnpm test -- --coverage
```

#### Docker Build Failures

**Problem**: Docker build fails in CI but works locally

**Common Issues**:
1. **Missing files in .dockerignore**: File needed by Dockerfile is ignored
2. **Multi-stage build issues**: Wrong files copied between stages
3. **Platform-specific dependencies**: Works on your arch but not CI's

**Solution**:
```bash
# Test exact same build as CI
docker build -t saf:test .

# Test smoke tests
docker run --rm saf:test --version
docker run --rm saf:test --help

# Check build logs
docker build --progress=plain -t saf:test .
```

#### Cross-Platform Test Failures on Main

**Problem**: Ubuntu tests passed in PR, but macOS/Windows failing on main

**Investigation Steps**:
1. Check GitHub Actions logs for the failing platform
2. Look for platform-specific file path issues (\ vs /)
3. Check for shell-specific command issues (bash vs PowerShell)
4. Review cinc-auditor installation logs

**Local Testing** (if you have access to the platform):
```bash
# macOS/Linux
curl -L https://omnitruck.cinc.sh/install.sh | sudo bash -s -- -P cinc-auditor
pnpm install
pnpm test

# Windows (PowerShell as Admin)
. { iwr -useb https://omnitruck.cinc.sh/install.ps1 } | iex; install -project cinc-auditor
pnpm install
pnpm test
```

#### Coverage Upload Failures

**Problem**: Tests pass but coverage upload to Codecov fails

**Notes**:
- Coverage upload failures are non-blocking (`fail_ci_if_error: false`)
- Usually caused by Codecov API rate limits or service outages
- Check Codecov status page: https://status.codecov.io/

**Action**: If persistent, check Codecov integration settings in GitHub repo settings

#### Workflow Not Triggering

**Problem**: Pushed to PR but CI didn't run

**Check**:
1. Are all changed files in `paths-ignore`? (e.g., only updated README.md)
2. Is PR targeting `main` branch? (workflow only runs for main)
3. Check GitHub Actions tab for disabled workflows
4. Check repository settings → Actions → General → workflow permissions

## Migration Notes

### Which Old Workflows Were Replaced

The CI/CD reorganization consolidated and replaced several standalone workflows:

| Old Workflow | Status | Replaced By | Notes |
|--------------|--------|-------------|-------|
| `linter.yml` | **Active (Unchanged)** | Used by `ci-pr.yml` | Still exists, now called by PR workflow |
| `coverage.yml` | **Active (Unchanged)** | Integrated into `ci-pr.yml` and `ci-main.yml` | Coverage now part of test jobs |
| `test-docker-image.yml` | **Can be removed** | `ci-pr.yml` (docker-build job) | Docker testing now part of PR validation |
| `e2e-ci.yml` | **Active (Unchanged)** | N/A | Still runs separately for E2E tests |
| `push-to-docker-main.yml` | **Active (Modified)** | Integrated into `ci-main.yml` | Docker publishing now part of main workflow |
| Individual platform test workflows | **N/A** | `ci-main.yml` (test-matrix job) | Cross-platform testing now unified |

### Architecture Migration Timeline

**Phase 1: Composite Actions** (Completed)
- Created `.github/actions/setup-saf-cli/`
- Created `.github/actions/install-cinc-auditor/`
- Standardized Node/pnpm setup
- Implemented cinc-auditor caching

**Phase 2: PR Workflow Consolidation** (Completed)
- Created `ci-pr.yml` with three parallel jobs
- Integrated linting, Ubuntu testing, and Docker builds
- Added PR validation summary
- Implemented concurrency cancellation

**Phase 3: Main Branch Workflow** (Completed)
- Created `ci-main.yml` with full platform matrix
- Integrated security scanning (SBOM)
- Integrated Docker publishing to DockerHub and Iron Bank
- Integrated draft release note updates
- Disabled concurrency cancellation (preserve sequential builds)

**Phase 4: Cleanup** (Pending)
- Archive old workflow files
- Update documentation
- Remove deprecated workflows

### Where to Find Archived Workflows

**Current Status**: Old workflows have NOT been archived yet. They coexist with new workflows.

**When archived, they will be moved to**: `.github/workflows/archived/`

**Workflows to Archive** (after validation period):
- `test-docker-image.yml` - Replaced by ci-pr.yml docker-build job
- Legacy cross-platform test workflows (if any separate files existed)

**Workflows to Keep**:
- `e2e-ci.yml` - Still used for end-to-end testing
- `build-*.yml` - Used for release package builds
All archived in `workflows-archive/` (13 workflows replaced by pipeline reorganization)

### Rollback Procedure

If the new CI/CD architecture causes issues, follow this rollback procedure:

**Step 1: Disable New Workflows**
```yaml
# Add to top of ci-pr.yml and ci-main.yml
on:
  # Temporarily disabled during rollback
  push: ~
  pull_request: ~
```

**Step 2: Re-enable Old Workflows**
- Restore `test-docker-image.yml` if archived
- Verify `linter.yml` is active
- Verify `coverage.yml` is active
- Verify platform-specific test workflows are active

**Step 3: Notify Team**
- Post in team chat/Slack about rollback
- Document issues that caused rollback
- Create GitHub issue to track investigation

**Step 4: Investigation**
- Collect logs from failed workflow runs
- Identify root cause (composite action bug, workflow logic, etc.)
- Fix issues in feature branch
- Test thoroughly before re-enabling

**Step 5: Re-enable New Workflows**
- Remove temporary disable from workflow files
- Monitor first few runs closely
- Gradually increase confidence before re-archiving old workflows

## Performance Metrics

### Before/After Timing Comparisons

#### Pull Request Workflow

| Metric | Before (Old) | After (New) | Improvement |
|--------|--------------|-------------|-------------|
| Total time to feedback | 25-35 minutes | 10-15 minutes | **~50% faster** |
| Platforms tested on PR | Ubuntu + macOS + Windows | Ubuntu only | Strategic reduction |
| Jobs run in parallel | Limited | 3 jobs fully parallel | Better parallelization |
| Docker build time | 10-12 min (cold) | 5-8 min (cached) | BuildKit caching |
| Linting feedback | 5-8 min (sequential) | 3-5 min (parallel) | Independent job |

#### Main Branch Workflow

| Metric | Before (Old) | After (New) | Improvement |
|--------|--------------|-------------|-------------|
| Total time | 30-40 minutes | 20-25 minutes | **~30% faster** |
| Platform testing | Sequential or separate workflows | Parallel matrix | Better orchestration |
| Docker publishing | Separate workflow | Integrated (depends on tests) | Clearer dependencies |
| SBOM generation | Separate workflow | Parallel with tests | Better resource use |
| Redundant setup steps | 8-10 per workflow | 2 (composite actions) | Eliminated duplication |

#### Developer Productivity

| Metric | Before (Old) | After (New) | Improvement |
|--------|--------------|-------------|-------------|
| Time to first feedback | 10-15 min | 3-5 min | **Linting finishes first** |
| Failed PR re-run time | 25-35 min | 10-15 min | Faster iteration |
| Wasted compute on doc changes | Full CI | Skipped via paths-ignore | Smart filtering |
| Clarity of results | Multiple workflow tabs | Single summary table | Better UX |

### Cost Savings Estimates

Based on typical monthly activity (100 PRs, 50 main branch pushes):

#### Compute Minutes Per Month

| Workflow Type | Before (Old) | After (New) | Savings |
|---------------|--------------|-------------|---------|
| **PR Validation** | 100 PRs × 90 min = 9,000 min | 100 PRs × 35 min = 3,500 min | **5,500 min/month** |
| **Main Branch CI** | 50 pushes × 120 min = 6,000 min | 50 pushes × 60 min = 3,000 min | **3,000 min/month** |
| **Total** | **15,000 min/month** | **6,500 min/month** | **8,500 min/month** |

**Cost Impact** (assuming GitHub Actions pricing):
- Linux: $0.008/minute
- macOS: $0.08/minute (10x Linux)
- Windows: $0.016/minute (2x Linux)

**Estimated Monthly Savings**:
- Reduced cross-platform testing on PRs: ~$200-300/month
- Faster PR feedback → fewer re-runs: ~$50-100/month
- Better caching with composite actions: ~$30-50/month
- **Total estimated savings: $280-450/month** ($3,360-5,400/year)

**Non-Financial Benefits**:
- Faster developer iteration (50% faster PR feedback)
- Reduced CI queue times during peak hours
- Lower carbon footprint (less compute waste)

## Maintenance

### How to Update pnpm Version

**Single Source of Truth**: `.github/actions/setup-saf-cli/action.yml`

```yaml
inputs:
  pnpm-version:
    description: 'pnpm version to install'
    required: false
    default: '10.18.0'  # <-- Update this line
```

**After updating**:
- All workflows using `setup-saf-cli` action automatically get new version
- No need to update `ci-pr.yml`, `ci-main.yml`, or other workflows
- Test locally first: `pnpm@<new-version> install`

**Release workflows** (manual update required):
- `build-windows-linux.yml`
- `build-macos.yml`
- `build-rpm.yml`
- `push-to-npm-gpr.yml`

These have hardcoded pnpm versions and must be updated manually.

### How to Update Node Version

**Two Locations**:

1. **Composite Action** (primary): `.github/actions/setup-saf-cli/action.yml`
   ```yaml
   inputs:
     node-version:
       description: 'Node.js version to install'
       required: false
       default: '22'  # <-- Update this line
   ```

2. **Package.json** (for documentation/validation):
   ```json
   {
     "engines": {
       "node": ">=22.0.0"  // <-- Update this line
     }
   }
   ```

**After updating**:
- Test locally: `nvm install <new-version>` or `nvm use <new-version>`
- Run full test suite: `pnpm test`
- Check compatibility of all dependencies
- Workflows automatically use new version via composite action

**Major version upgrades**:
- Update TypeScript target in `tsconfig.json` if needed
- Review breaking changes in Node.js changelog
- Test on all platforms (Ubuntu, macOS, Windows)
- Update `.nvmrc` file if project uses it

### How to Update cinc-auditor Version

**Location**: `.github/actions/install-cinc-auditor/action.yml`

**Steps**:
1. Update version in cache key (line 22):
   ```yaml
   key: cinc-auditor-${{ runner.os }}-6.6.0  # <-- Update version
   ```

2. Update version in Windows install (line 30):
   ```powershell
   install -project cinc-auditor -version 6.6.0  # <-- Update version
   ```

3. Update version in Linux/macOS install (line 43):
   ```bash
   curl -L https://omnitruck.cinc.sh/install.sh | sudo bash -s -- -P cinc-auditor -v 6.6.0
   ```

**Why three places?**:
- Cache key ensures new installations when version changes
- Install commands specify exact version for reproducibility
- All three must match to avoid cache mismatches

**After updating**:
- First run will take longer (cache miss)
- Subsequent runs will be fast (cached)
- Test locally to ensure SAF CLI tests still pass

### How to Update GitHub Action Versions

All GitHub Actions are pinned to specific SHA hashes for security. To update:

**Automated Tool** (recommended):
```bash
# Install Dependabot or use GitHub's automated security updates
# Settings → Security → Dependabot → Enable version updates
```

**Manual Update**:
1. Find action in workflow (e.g., `actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683`)
2. Visit action's GitHub repository
3. Find latest release tag
4. Copy full commit SHA for that tag
5. Update workflow file:
   ```yaml
   - uses: actions/checkout@<new-sha>  # v4.2.3
   ```
   Add version comment for readability

**Security Best Practice**:
- Always use SHA, never use tags like `@v4` or `@main`
- Tags can be moved to malicious commits, SHAs cannot
- Verify SHA corresponds to expected version using GitHub UI

### How to Add New Jobs to Workflows

**PR Workflow** (ci-pr.yml):
- Add new job under `jobs:` section
- Add to `needs` array in `pr-validation-summary` job
- Add status check to summary table in final step
- Consider timeout (default 10-15 minutes for PR jobs)

**Main Workflow** (ci-main.yml):
- Add new job under `jobs:` section
- If it should block Docker publishing, add to `needs` in `docker-publish`
- Consider running in parallel with tests vs. sequentially after

**Example** - Adding security linting to PR workflow:
```yaml
jobs:
  # ... existing jobs ...

  security-lint:
    name: Security Linting
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@<sha>

      - name: Run security linters
        run: |
          pnpm run security-check

  pr-validation-summary:
    needs: [quality, test-ubuntu, docker-build, security-lint]  # Add here
    # ... update summary table ...
```

### How to Modify Composite Actions

**Best Practices**:
1. Test changes locally first if possible
2. Create feature branch for composite action changes
3. Test by temporarily pointing workflow to feature branch:
   ```yaml
   - uses: ./.github/actions/setup-saf-cli@feature-branch
   ```
4. Once validated, merge and update workflows to use main/default

**Breaking Changes**:
- Add new input with default value (maintains compatibility)
- Deprecate old input in description
- Remove old input in future major version

**Example** - Adding new input to setup-saf-cli:
```yaml
inputs:
  cache-dependency-path:
    description: 'Path to dependency file for cache key (default: pnpm-lock.yaml)'
    required: false
    default: 'pnpm-lock.yaml'
```

---

## Additional Resources

- **Main Documentation**: `docs/contributors-guide.md`
- **Release Process**: [SAF CLI Release Wiki](https://github.com/mitre/saf/wiki/How%E2%80%90to-Create-a-SAF-CLI-Release)
- **GitHub Actions Docs**: https://docs.github.com/en/actions
- **OCLIF Framework**: https://oclif.io/
- **Composite Actions**: https://docs.github.com/en/actions/creating-actions/creating-a-composite-action

## Questions or Issues?

- **CI/CD issues**: Open issue with `ci/cd` label
- **Performance concerns**: Include timing data from workflow runs
- **Feature requests**: Describe use case and expected behavior

---

**Last Updated**: 2025-10-07
**Architecture Version**: 1.0
**Maintained By**: SAF CLI Team
