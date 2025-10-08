# Changelog

## [1.6.0](https://github.com/mitre/saf/compare/1.5.1...v1.6.0) (2025-10-08)


### Features

* **ci:** Reorganize CI/CD workflows into pipeline architecture ([7c05382](https://github.com/mitre/saf/commit/7c05382cd8620ec919e6ecdc82ac2ea1b101c38b))
* **threshold:** Complete modular architecture refactoring with comprehensive testing ([a3c7829](https://github.com/mitre/saf/commit/a3c78296967c976db9f273e3b48976a246a5e137))


### Bug Fixes

* **ci:** Add Docker digest extraction for Iron Bank updates ([5d5bc3f](https://github.com/mitre/saf/commit/5d5bc3fb0eb243f754f8ec483acea03bf55f3f83))
* **ci:** Add Docker setup for macOS and fix Windows shell syntax ([022c2c6](https://github.com/mitre/saf/commit/022c2c601dec2eb76a6b1a80c9ea6d1121532f80))
* **ci:** Consolidate test execution and update Release-Please to v4.3.0 ([f674630](https://github.com/mitre/saf/commit/f674630ae2d13c147e373672f4de339dbbe699a9))
* **ci:** Extract RPM build as separate job with container support ([6298ff5](https://github.com/mitre/saf/commit/6298ff570b638ad3495bc263421d5d511644b8c8))
* **ci:** Fix composite action dependency installation and Dependabot exemption ([4102602](https://github.com/mitre/saf/commit/4102602ffaf7baf468df7a519321cdf17e81fc1f))
* **ci:** Fix vitest PATH issue and Release-Please v4 configuration ([cd1de72](https://github.com/mitre/saf/commit/cd1de72dd0604ffd932729fe8cd67a446a8de770))
* **ci:** Remove invalid shell attribute from composite action ([9b9dad6](https://github.com/mitre/saf/commit/9b9dad6badfcda6614bfa0cf38a4ba010b3f6f75))
* **ci:** Revert to QEMU multi-arch builds (macOS runners lack Docker support) ([8411df2](https://github.com/mitre/saf/commit/8411df2ec9fd27e356d1210960769cfeb5f296ce))
* **ci:** Use conditional steps instead of shell if for cross-platform compatibility ([9626a63](https://github.com/mitre/saf/commit/9626a639464d6674a8339c03fce10604e096cb8e))
* **ci:** Use correct version tag for Docker macOS setup action ([4d03304](https://github.com/mitre/saf/commit/4d03304d410d85b219df254bdd45ca57b548fe0d))
* **ci:** Use inline setup for cd-release build-installers job ([df5a2d8](https://github.com/mitre/saf/commit/df5a2d8dae2132f4ea89c04da934725395953000))
* **release:** Correct Release-Please v4 configuration file names ([bead93a](https://github.com/mitre/saf/commit/bead93abc768daa587c2f78b3286222f7fb4fd04))
