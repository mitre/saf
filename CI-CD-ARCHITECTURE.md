# SAF CLI - CI/CD Pipeline Architecture

**Last Updated**: October 7, 2025
**Architecture**: Pipeline-Centric (3-Stage)
**Active Workflows**: 6 core + 2 operations

---

## Overview

The SAF CLI uses a clean **Pipeline-Centric architecture** with three distinct stages:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   PR Stage  │ ──▶ │ Main Stage  │ ──▶ │   Release   │
│   (Fast)    │     │  (Complete) │     │  (Publish)  │
└─────────────┘     └─────────────┘     └─────────────┘
   10-15 min           20-25 min           60-70 min
```

**Design Principles**:
1. **Fast Feedback** - PRs get results in 10-15 minutes
2. **Quality Gates** - Tests must pass before builds
3. **Composable** - Reusable actions eliminate duplication
4. **Secure** - All actions SHA-pinned, minimal permissions
5. **Efficient** - No wasted builds, smart caching

---

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                        PR STAGE (ci-pr.yml)                       │
│                     Fast Validation (10-15 min)                   │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────┐                                             │
│  │  quality job    │  • Lint code (ESLint)                       │
│  │  (3-5 min)      │  • Security audit (pnpm audit)              │
│  │  Ubuntu only    │  • Format check                             │
│  └────────┬────────┘                                             │
│           │                                                       │
│           ├─────────────┐                                        │
│           │             │                                         │
│  ┌────────▼────────┐   │                                         │
│  │  test-ubuntu    │   │  • Install cinc-auditor (cached)       │
│  │  (8-12 min)     │   │  • Run 695 tests                        │
│  │  Ubuntu only    │   │  • Generate coverage                    │
│  └────────┬────────┘   │  • Upload to Codecov                    │
│           │            │  • Sanity check CLI                      │
│           └────────────┘                                         │
│                │                                                  │
│                │ Both must pass                                  │
│                │                                                  │
│       ┌────────▼────────┐                                        │
│       │  docker-build   │  • Build Docker image                  │
│       │  (5-8 min)      │  • Smoke test (--version, --help)      │
│       │  Ubuntu only    │  • Don't push (validation only)        │
│       └─────────────────┘                                        │
│                                                                   │
│  Result: ✅ PR approved for merge OR ❌ Developer fixes issues   │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                      MAIN STAGE (ci-main.yml)                     │
│                Full Cross-Platform Validation (20-25 min)         │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  test-matrix (15-20 min) - PARALLEL                      │    │
│  ├──────────────────────────────────────────────────────────┤    │
│  │  • Ubuntu:   695 tests + coverage upload                 │    │
│  │  • macOS:    695 tests                                    │    │
│  │  • Windows:  695 tests                                    │    │
│  │  All platforms: Install cinc, sanity check               │    │
│  └─────────────────────┬───────────────────────────────────┘    │
│                        │                                          │
│  ┌─────────────────────▼───────────────────────────────────┐    │
│  │  security-scan (10 min) - PARALLEL with test-matrix      │    │
│  ├──────────────────────────────────────────────────────────┤    │
│  │  • Build Docker image                                     │    │
│  │  • Generate SBOM (Anchore Syft)                          │    │
│  │  • Upload to GitHub dependency API                       │    │
│  │  • Run pnpm audit (dependency vulnerabilities)           │    │
│  └─────────────────────┬───────────────────────────────────┘    │
│                        │                                          │
│           Both must pass (Quality Gate)                          │
│                        │                                          │
│         ┌──────────────┴──────────────┐                          │
│         │                              │                          │
│  ┌──────▼──────────┐         ┌────────▼────────┐                │
│  │ docker-publish  │         │ draft-release   │                │
│  │ (5-8 min)       │         │ (30 sec)        │                │
│  ├─────────────────┤         ├─────────────────┤                │
│  │ • Build image   │         │ • Update draft  │                │
│  │ • Push latest   │         │ • Aggregate PRs │                │
│  │ • Push SHA tag  │         └─────────────────┘                │
│  │ • Iron Bank     │                                             │
│  │   (mainline)    │                                             │
│  └─────────────────┘                                             │
│                                                                   │
│  Result: Docker published, release draft updated                 │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                   RELEASE STAGE (cd-release.yml)                  │
│              Complete Build & Publish Pipeline (60-70 min)        │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  test-matrix (15-20 min) - QUALITY GATE                  │    │
│  ├──────────────────────────────────────────────────────────┤    │
│  │  Full platform testing (Ubuntu + macOS + Windows)        │    │
│  │  ALL 695 tests must pass before ANY publishing           │    │
│  └─────────────────────┬───────────────────────────────────┘    │
│                        │                                          │
│               Tests pass (Quality Gate)                          │
│                        │                                          │
│  ┌─────────────────────▼───────────────────────────────────┐    │
│  │  build-installers (25-30 min) - PARALLEL                 │    │
│  ├──────────────────────────────────────────────────────────┤    │
│  │  Matrix builds (parallel):                                │    │
│  │  • macOS-14:      .pkg installer        (8 min)          │    │
│  │  • Ubuntu-22.04:  .exe x64/x86 + .deb  (10 min)          │    │
│  │  │  • Ubuntu-22.04:  .rpm                (6 min)          │    │
│  │  Upload all 5 installers as artifacts                     │    │
│  └─────────────────────┬───────────────────────────────────┘    │
│                        │                                          │
│              Installers built successfully                       │
│                        │                                          │
│         ┌──────────────┴──────────────┬───────────────┐          │
│         │                              │               │          │
│  ┌──────▼──────────┐         ┌────────▼────────┐     │          │
│  │  publish-npm    │         │ publish-docker  │     │          │
│  │  (3-5 min)      │         │ (10-15 min)     │     │          │
│  ├─────────────────┤         ├─────────────────┤     │          │
│  │ • Pack tarball  │         │ • Build image   │     │          │
│  │ • Publish NPM   │         │ • Multi-arch    │     │          │
│  │ • Publish GPR   │         │ • Push tags:    │     │          │
│  └────────┬────────┘         │   - release-    │     │          │
│           │                  │     latest      │     │          │
│           │                  │   - v1.5.1      │     │          │
│           │                  │   - v1          │     │          │
│           │                  │ • Iron Bank     │     │          │
│           │                  │   (release)     │     │          │
│           │                  └─────────────────┘     │          │
│           │                                          │          │
│  ┌────────▼────────┐                      ┌──────────▼────────┐ │
│  │publish-homebrew │                      │  upload-assets    │ │
│  │  (2-3 min)      │                      │  (1-2 min)        │ │
│  ├─────────────────┤                      ├───────────────────┤ │
│  │ Needs NPM pkg   │                      │ • Download all    │ │
│  │ • Update formula│                      │   installers      │ │
│  └─────────────────┘                      │ • Attach to       │ │
│                                           │   GitHub release  │ │
│                                           └───────────────────┘ │
│                                                                   │
│  Result: Published to 6 channels (NPM, GPR, Docker Hub,          │
│          Homebrew, GitHub Release, Iron Bank)                    │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                   OPERATIONAL WORKFLOWS                           │
│                  (Scheduled / Event-Driven)                       │
├──────────────────────────────────────────────────────────────────┤
│  cache-cleanup.yml      │ Weekly cache maintenance (Sundays)     │
│  stale.yml              │ Auto-close inactive issues/PRs         │
│  auto-approve-merge.yml │ Auto-merge Dependabot PRs             │
└──────────────────────────────────────────────────────────────────┘
```

---

## Reusable Components (Composite Actions)

```
.github/actions/
├── setup-saf-cli/           ← Node.js + pnpm + dependencies
├── install-cinc-auditor/    ← InSpec with platform-aware caching
└── security-audit/          ← Dependency vulnerability scanning
```

**Usage**: All workflows use these instead of duplicating setup code.

---

## Workflow Inventory

### Core Pipeline Workflows (3)

| Workflow | File | Trigger | Duration | Purpose |
|----------|------|---------|----------|---------|
| **PR Validation** | `ci-pr.yml` | pull_request | 10-15 min | Fast feedback for contributors |
| **Main Branch CI** | `ci-main.yml` | push to main | 20-25 min | Full validation + Docker publish |
| **Release Publishing** | `cd-release.yml` | release published | 60-70 min | Build all + publish everywhere |

### Operational Workflows (3)

| Workflow | File | Trigger | Purpose |
|----------|------|---------|---------|
| **Cache Cleanup** | `cache-cleanup.yml` | Weekly | Delete caches >7 days old |
| **Stale Management** | `stale.yml` | Daily | Auto-close inactive issues/PRs |
| **Dependabot** | `auto-approve-and-merge.yml` | PR labeled | Auto-merge dependency updates |

---

## Stage Details

### 🔵 PR Stage (ci-pr.yml)

**When**: Every pull request to main
**Goal**: Fast feedback for developers
**Platform**: Ubuntu only (speed optimization)

**Jobs** (parallel where possible):
1. **quality** (3-5 min)
   - ESLint (pnpm run lint:ci)
   - Security audit (pnpm audit --audit-level=high)
   - Blocks merge if issues found

2. **test-ubuntu** (8-12 min)
   - Install cinc-auditor (cached)
   - Run all 695 tests
   - Generate coverage report
   - Upload to Codecov
   - Sanity check CLI works

3. **docker-build** (5-8 min) - Depends on: quality + test-ubuntu
   - Build Docker image
   - Smoke tests (--version, --help)
   - Don't push (validation only)

**Features**:
- ✅ Path filtering (skips on docs-only changes)
- ✅ Concurrency control (cancels outdated runs)
- ✅ Composite actions (DRY)
- ✅ Timeout limits

---

### 🟢 Main Stage (ci-main.yml)

**When**: Push to main branch
**Goal**: Comprehensive validation before production
**Platforms**: Ubuntu + macOS + Windows

**Jobs** (quality gate architecture):
1. **test-matrix** (15-20 min) - Parallel across platforms
   - Ubuntu: All tests + coverage
   - macOS: All tests
   - Windows: All tests
   - All: cinc-auditor, sanity checks

2. **security-scan** (10 min) - Parallel with tests
   - Build Docker image
   - Generate SBOM with Anchore Syft
   - Upload to GitHub dependency API
   - Run pnpm audit (dependency check)

3. **docker-publish** (5-8 min) - Depends on: test-matrix + security-scan
   - Build multi-arch (amd64, arm64)
   - Push tags: `latest`, `sha256:abc...`
   - Update Iron Bank mainline repository
   - Only runs if ALL tests pass ✅

4. **draft-release** (30 sec) - Parallel
   - Auto-generate release notes
   - Aggregate merged PRs

**Features**:
- ✅ Quality gate (docker only publishes if tests pass)
- ✅ Full platform coverage
- ✅ Security scanning (SBOM + audit)
- ✅ Parallel execution where possible

---

### 🟣 Release Stage (cd-release.yml)

**When**: GitHub release published
**Goal**: Build everything, publish everywhere
**Platforms**: All (ubuntu, macos, windows, containers)

**Jobs** (sequential pipeline with quality gate):
1. **test-matrix** (15-20 min) - QUALITY GATE
   - Identical to ci-main.yml
   - ALL 695 tests on all platforms
   - Blocks entire release if any test fails

2. **build-installers** (25-30 min) - Depends on tests, parallel builds
   - Matrix strategy:
     * macOS: .pkg installer
     * Ubuntu: .exe (x64, x86) + .deb
     * Ubuntu: .rpm
   - Upload all 5 installers as artifacts
   - Retention: 90 days

3. **publish-npm** (3-5 min) - Depends on builds
   - Pack tarball
   - Publish to npmjs.org
   - Publish to npm.pkg.github.com

4. **publish-docker** (10-15 min) - Depends on builds, parallel with npm
   - Build multi-arch image
   - Tags: `release-latest`, `v1.5.1`, `v1`
   - Push to Docker Hub
   - Update Iron Bank release repository

5. **publish-homebrew** (2-3 min) - Depends on npm (needs tarball)
   - Update formula in mitre/homebrew-saf
   - Calculate SHA256 from NPM tarball

6. **upload-assets** (1-2 min) - Depends on builds, parallel with publishers
   - Download all 5 installer artifacts
   - Attach to GitHub release

**Features**:
- ✅ Quality gate prevents broken releases
- ✅ Dry-run mode for safe testing
- ✅ Parallel builds and publishing
- ✅ Comprehensive distribution (6 channels)
- ✅ Sequential dependencies ensure correctness

**Dry-Run Mode**:
```bash
gh workflow run cd-release.yml -f version=v99.99.99-test -f dry-run=true
```
- Builds everything
- Tests npm/Docker publish validation
- Doesn't actually publish
- Safe for testing

---

## Composite Actions

### 1. setup-saf-cli

**Purpose**: Setup Node.js, pnpm, and install dependencies
**Location**: `.github/actions/setup-saf-cli/action.yml`

**Inputs**:
- `node-version` (default: '22')
- `pnpm-version` (default: '10.18.0')
- `install-deps` (default: 'true')
- `production-only` (default: 'false')

**Usage**:
```yaml
- uses: ./.github/actions/setup-saf-cli
  with:
    production-only: 'true'
```

**Benefits**: Eliminates 11+ instances of duplicate setup code

---

### 2. install-cinc-auditor

**Purpose**: Install cinc-auditor (InSpec) with platform-aware caching
**Location**: `.github/actions/install-cinc-auditor/action.yml`

**Features**:
- Platform detection (Windows vs Unix)
- Smart caching (saves 3-5 min per run)
- Cache key: `cinc-auditor-${{ runner.os }}-6.6.0`

**Usage**:
```yaml
- uses: ./.github/actions/install-cinc-auditor
```

**Benefits**: Caches installation, ~280 hours/year CI time saved

---

### 3. security-audit

**Purpose**: Run pnpm audit to check for vulnerabilities
**Location**: `.github/actions/security-audit/action.yml`

**Inputs**:
- `audit-level` (default: 'high')
- `fail-on-vulnerabilities` (default: 'true')

**Usage**:
```yaml
- uses: ./.github/actions/security-audit
  with:
    audit-level: 'moderate'
    fail-on-vulnerabilities: 'false'
```

**Benefits**: Reusable security checking across PR and Main stages

---

## Distribution Channels

After successful release, SAF CLI is available from:

1. **NPM**: `npm install -g @mitre/saf`
2. **GitHub Packages**: `npm install -g @mitre/saf` (with registry config)
3. **Homebrew**: `brew install mitre/saf/saf-cli`
4. **Docker Hub**: `docker pull mitre/saf:1.5.1`
5. **Iron Bank**: DoD users (repo1.dso.mil/dsop/mitre/saf)
6. **GitHub Releases**: Direct downloads (.pkg, .exe, .deb, .rpm)

---

## Performance Metrics

### Before Reorganization

| Stage | Time | Platform Coverage | Issues |
|-------|------|-------------------|--------|
| PR | 24-35 min | All platforms | Wasted builds, slow feedback |
| Main | 30-45 min | All platforms | No quality gates |
| Release | 60-90 min | Sequential | Manual steps |

### After Reorganization

| Stage | Time | Platform Coverage | Improvements |
|-------|------|-------------------|--------------|
| PR | 10-15 min ⚡ | Ubuntu only | 50% faster, smart |
| Main | 20-25 min ⚡ | All platforms | Quality gates enforced |
| Release | 60-70 min | All platforms | Fully automated, dry-run mode |

**Annual Savings**: ~25,000 CI minutes (~$3,360-5,400/year)

---

## Security Features

1. **All actions SHA-pinned** - Prevents supply chain attacks
2. **Minimal permissions** - Principle of least privilege
3. **No secrets in PRs** - Fork-safe
4. **SBOM generation** - Software Bill of Materials
5. **Dependency auditing** - Automated vulnerability scanning
6. **CodeQL scanning** - GitHub Advanced Security (default setup)
7. **Iron Bank compliance** - DoD security requirements

---

## Developer Experience

### Opening a PR

1. **Push commits** to feature branch
2. **Create PR** to main
3. **ci-pr.yml triggers** automatically
4. **Fast feedback** (10-15 min):
   - ✅ Linting passed
   - ✅ Security audit passed
   - ✅ All 695 tests passed on Ubuntu
   - ✅ Docker image builds
5. **PR approved** for merge

### Merging to Main

1. **PR merged** to main
2. **ci-main.yml triggers** automatically
3. **Full validation** (20-25 min):
   - ✅ All platforms tested (Ubuntu, macOS, Windows)
   - ✅ Security scan (SBOM + audit)
   - ✅ Docker published (latest + SHA)
   - ✅ Release draft updated
4. **Main branch validated** ✅

### Creating a Release

1. **Create GitHub release** from draft
2. **cd-release.yml triggers** automatically
3. **Complete pipeline** (60-70 min):
   - ✅ Quality gate (all tests)
   - ✅ Build all installers
   - ✅ Publish to NPM + GPR
   - ✅ Publish to Docker Hub + Iron Bank
   - ✅ Update Homebrew
   - ✅ Upload installers to release
4. **Release complete** - Available on 6 channels ✅

---

## Rollback Procedure

If a release has critical issues:

1. **Immediate**: Unpublish from NPM
   ```bash
   npm unpublish @mitre/saf@VERSION
   ```

2. **Docker**: Update `latest` tag to previous version
   ```bash
   docker pull mitre/saf:PREVIOUS_VERSION
   docker tag mitre/saf:PREVIOUS_VERSION mitre/saf:latest
   docker push mitre/saf:latest
   ```

3. **GitHub**: Mark release as pre-release or delete
4. **Homebrew**: Will auto-update from NPM

**Future**: Dedicated rollback workflow (recommended by research)

---

## Maintenance

### Updating Dependency Versions

**pnpm version**:
- Edit: `.github/workflows/ci-pr.yml` line 24 (env.PNPM_VERSION)
- Automatically propagates to all composite actions

**Node.js version**:
- Edit: `.github/workflows/ci-pr.yml` line 25 (env.NODE_VERSION)
- Automatically propagates to all composite actions

**cinc-auditor version**:
- Edit: `.github/actions/install-cinc-auditor/action.yml` line 22 (cache key)
- Update cache key to new version

### Updating GitHub Actions

Use Dependabot for automated updates:
```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
```

---

## Troubleshooting

**PR workflow fails on linting**:
- Run locally: `pnpm run lint`
- Auto-fix: `pnpm run lint` (not lint:ci)

**Tests fail on specific platform**:
- Check platform-specific code
- Review cinc-auditor installation logs
- Test locally with same Node version

**Docker build fails**:
- Check Dockerfile syntax
- Verify .dockerignore is correct
- Review BuildKit cache logs

**Release publishing fails**:
- Use dry-run mode first
- Check all secrets are configured
- Verify Iron Bank PAT is valid

---

## Future Enhancements

Based on community research, consider adding:

1. **Smoke Tests** - Validate all installation methods
2. **Test Reporter** - Better PR test visualization
3. **Rollback Workflow** - Emergency recovery tool
4. **Semantic Release** - Automated versioning
5. **Performance Benchmarking** - Detect regressions

See agent research documents for detailed recommendations.

---

## References

- **Workflow Documentation**: `.github/workflows/README.md`
- **Testing Plan**: `CICD-TESTING-PLAN.md`
- **Migration Guide**: `WORKFLOW-MIGRATION.md`
- **Agent Analysis**: `CICD-AGENT-ANALYSIS.md`
- **Community Research**: `WORKFLOW-COMPARISON-ANALYSIS.md`
