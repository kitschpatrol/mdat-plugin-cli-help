# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

(Node.js support requirements have sometimes increased in minor or patch releases.)

## [3.4.2] - 2026-11-01

### Maintenance

- Update declared runtime requirements to execa ^10.2.1, lognow ^0.8.7, and Zod ^4.6.7.
- Refresh development dependencies and pnpm to 12.16.1, update peer compatibility configuration, and remove obsolete release-age exceptions.
- Build before linting and fixing, migrate contributor skill linking to pnpm, and simplify internal conditionals.
- Move dependency-update automation to a monthly schedule, refresh workflow actions, and make link checks ignore loopback URLs and tolerate empty inputs.

## [3.4.1] - 2026-10-07

### Changed

- Log recursion-depth limits at debug level instead of warning level.

### Documentation

- Generate the README usage example from installed MDAT help and replace the obsolete `readme` subcommand example with `check`.

### Maintenance

- Update the lognow requirement to ^0.8.5.
- Add a scheduled workflow that proposes dependency updates.
- Refresh development dependencies and pnpm, synchronize contributor skills during preparation, and update lint and install configuration.

## [3.4.0] - 2026-10-04

### Added

- Add a `heading` option to customize or suppress the generated section title.

### Changed

- **Breaking:** Interpret `headingLevel` as the section level and render command headings one level deeper, capped at level 6; output now includes `#### Commands` by default.

### Documentation

- Document section-heading placement, custom titles, and sharing a manually written heading across multiple placeholders.

### Maintenance

- Adapt benchmarks to Vitest 5's test-context API and per-benchmark baseline files.
- Refresh development dependencies and pnpm install policies and apply lint-driven internal refactoring.

## [3.3.0] - 2026-09-26

### Added

- Add `headingLevel` to render command and subcommand headings at Markdown levels 1–6, defaulting to level 4.

### Changed

- **Breaking:** Restrict supported Node.js versions to `^24.16.0 || >=26.3.0`, excluding Node.js 25 and versions 26.0–26.2.

### Documentation

- Explain heading-level configuration and its placement within a README's CLI section.

### Maintenance

- Update runtime requirements for lognow and Zod.
- Migrate development tooling to pnpm 12 and Vitest 5, refresh build and test dependencies, and simplify parser helpers.
- Pin additional workflow actions and correct error-output capture during sitemap discovery.

## [3.2.0] - 2026-08-27

### Added

- Add `parser` selection for `auto`, `commander`, `yargs`, `meow`, or `none`; explicit mismatches fall back to raw help, while `none` skips parsing and subcommand discovery.

### Documentation

- Document parser selection, mismatch warnings, and raw-output behavior.

### Maintenance

- Update Chevrotain to ^13.2.0 and remove the unused type-fest dependency.
- Refresh development dependencies and pnpm, simplify lint configuration, and switch publishing authentication to an npm one-time password.
- Tighten release tag matching and validate tags against the repository's configured default branch.
- Improve website link checks with sitemap discovery, pinned discovery tools, and checkout of Lychee configuration.

## [3.1.0] - 2026-07-31

### Changed

- **Breaking:** Require MDAT ^3.0.0, replacing MDAT 2 support.
- **Breaking:** Raise the minimum supported Node.js version to 24.16.0.

### Documentation

- Refresh npm and MIT license links in the README.

### Maintenance

- Update runtime requirements, including Chevrotain 13, execa 10, lognow 0.8, and type-fest.
- Upgrade contributor tooling to TypeScript 6 and shared-config 8, refresh build and test dependencies, add editor lint tasks, and adapt source and tests to stricter linting.
- Add scheduled repository and website link checks and refresh CI and release workflow actions.

## [3.0.2] - 2026-06-11

### Maintenance

- Update the declared type-fest requirement to ^5.7.0.
- Refresh development dependencies, including Commander 15, update pnpm, and configure package release-age exceptions.

## [3.0.1] - 2026-05-17

### Changed

- **Breaking:** Raise the minimum supported Node.js version from 22.17.0 to 22.22.2.

### Documentation

- Update the README's MIT license link.

### Maintenance

- Update runtime requirements for lognow, which, and Zod.
- Migrate contributor tooling and CI to pnpm 11, refresh development dependencies and install configuration, and pass npm credentials directly to publishing.

## [3.0.0] - 2026-04-22

### Added

- Add a `subcommand` option accepting whitespace-separated nested command paths, with discovered subcommands appended during recursion.

### Changed

- **Breaking:** Rename the `cliCommand` rule option to `command`; existing placeholders must use the new name.
- **Breaking:** Reject unrecognized rule option keys instead of silently discarding them.

### Documentation

- Document explicit subcommand selection and update usage examples for the renamed `command` option.
- Expand contribution guidance with issue-first pull request instructions and an explanation of repository linting and documentation tools.

### Maintenance

- Update the declared type-fest requirement to ^5.6.0.
- Refresh development dependencies and pnpm, make cleanup use cross-platform file removal, and apply lint-driven source cleanup.
- Allow GitHub release automation to recognize numeric tags with or without a `v` prefix.

## [2.1.2] - 2026-04-08

### Changed

- Move unmatched-format and raw-help fallback messages from warning to debug logging.

### Maintenance

- Update development requirements for MDAT and Vitest.

## [2.1.1] - 2026-04-06

### Fixed

- Accept line-wrapped Commander and Yargs help by joining continuation lines before parsing.
- Exclude Commander's built-in `help` command from command lists and recursion to prevent duplicate help output.
- Handle Commander subcommand help containing `Arguments:` sections as positional-argument tables.

### Documentation

- Document framework support, wrapping limitations, reliable Yargs wrapping configuration, and parser design tradeoffs.

### Maintenance

- Add wrapped-output regression fixtures and tests, update fixture lint configuration and snapshots, and refresh benchmark baselines.

## [2.1.0] - 2026-04-06

### Added

- Parse Commander.js help, including option aliases, parenthesized defaults with environment annotations, commands, and recursive subcommand help.

### Documentation

- List Commander.js among the supported CLI help formats.

### Maintenance

- Add equivalent CLI fixtures, cross-framework normalization and recursive-help tests, and Commander and Meow benchmarks with refreshed baselines.
- Update the lognow requirement to ^0.6.1.
- Refresh development requirements for shared-config and MDAT.

## [2.0.2] - 2026-04-02

### Fixed

- Handle executable paths containing spaces and Windows command shims correctly, using local executable resolution when invoking help.
- Preserve accumulated subcommand arguments during recursive help invocation.

### Maintenance

- Run benchmark commands without watch mode and increase integration-test timeouts.

## [2.0.1] - 2026-04-02

### Changed

- Log unsuccessful parser probes at debug level instead of error level, and report complete parser failure as a warning.

### Maintenance

- Update the lognow requirement to ^0.6.0.
- Add parsing, Markdown rendering, and full-pipeline benchmarks with real and synthetic fixtures and stored baselines; upgrade shared-config to 7.

## [2.0.0] - 2026-04-01

### Added

- Export `setLogger()` so consumers can inject a LogLayer logger or a console- or stream-like logging target.

### Changed

- **Breaking:** Migrate plugin integration to MDAT 2, require `mdat` ^2.0.0, and remove the remark-mdat peer requirement.
- **Breaking:** Raise the minimum supported Node.js version to 22.17.0.

### Documentation

- Update registration examples to use `defineConfig()` and placeholders to use MDAT 2 function-call syntax.

### Maintenance

- Upgrade Chevrotain to 12 and Zod to 4, introduce lognow, and replace read-pkg with MDAT context metadata.
- Expand CI to Linux, macOS, and Windows, enforce LF line endings, and make Git help tests tolerate different Git versions.
- Refresh development dependencies and contributor configuration for MDAT 2.

## [1.0.8] - 2026-04-01

### Maintenance

- Update runtime requirements for Chevrotain and type-fest.
- Add build, lint, and test CI for pushes and pull requests, and refresh release and metadata workflows with pinned actions and explicit permissions.
- Refresh development dependencies and pnpm and run tests without watch mode.
- Declare the package side-effect-free for bundlers.

## [1.0.7] - 2026-02-23

### Maintenance

- Update runtime requirements for read-pkg, type-fest, and which.
- Refresh development dependencies and pnpm, declaring Node.js >=22.21.0 for contributor tooling.

## [1.0.6] - 2026-01-29

### Maintenance

- Declare Chevrotain and Zod as runtime dependencies and update type-fest.
- Refresh development dependencies and pnpm, migrating CSpell and Prettier configuration to TypeScript.

## [1.0.5] - 2026-01-19

### Maintenance

- Update the declared type-fest requirement to ^5.4.1.
- Refresh development dependencies, pnpm, editor save actions, and copyright metadata.

## [1.0.4] - 2025-12-06

### Fixed

- Stop rejecting Windows executable files solely because their extensions are absent from `PATHEXT`.

## [1.0.3] - 2025-12-06

### Fixed

- Resolve inferred executable paths relative to their package directory and normalize package-bin matching, fixing Windows command resolution.

### Maintenance

- Update runtime requirements for execa, read-pkg, type-fest, and which.
- Correct pnpm hoisting configuration, add a normalize-package-data override, and refresh development dependencies and pnpm.

## [1.0.2] - 2025-11-05

### Documentation

- Clarify that the plugin generates tabular help documentation for CLI tools in Markdown.

### Maintenance

- Refresh build, lint, and test dependencies, preserving existing build-output extensions when upgrading to tsdown 0.16.

## [1.0.1] - 2025-11-03

### Maintenance

- Add GitHub Actions for tagged releases and synchronization of repository metadata from package information.

## [1.0.0] - 2025-11-03

### Added

- Export `cli-help` and `cli` MDAT rules that transform Yargs and Meow help into Markdown usage sections and tables, including supported arguments, aliases, types, choices, and defaults.
- Support explicit `cliCommand` selection, executable inference from package `bin` metadata, custom `helpFlag`, and recursive subcommand documentation controlled by `depth`.
- Capture help from stdout or stderr and fall back to a fenced text block when no parser supports the output.
- Provide an ESM npm package with TypeScript declarations for Node.js >=20.19.0, with MDAT and remark-mdat ^1.1.0 peer requirements.

### Documentation

- Document development-dependency installation, plugin registration, placeholder usage, command inference, and example Markdown output.

### Maintenance

- Set up TypeScript builds, fixture and snapshot tests, shared linting, editor integration, and npm release scripts.

[1.0.0]: https://github.com/kitschpatrol/mdat-plugin-cli-help/releases/tag/v1.0.0
[1.0.1]: https://github.com/kitschpatrol/mdat-plugin-cli-help/compare/v1.0.0...v1.0.1
[1.0.2]: https://github.com/kitschpatrol/mdat-plugin-cli-help/compare/v1.0.1...v1.0.2
[1.0.3]: https://github.com/kitschpatrol/mdat-plugin-cli-help/compare/v1.0.2...v1.0.3
[1.0.4]: https://github.com/kitschpatrol/mdat-plugin-cli-help/compare/v1.0.3...v1.0.4
[1.0.5]: https://github.com/kitschpatrol/mdat-plugin-cli-help/compare/v1.0.4...v1.0.5
[1.0.6]: https://github.com/kitschpatrol/mdat-plugin-cli-help/compare/v1.0.5...v1.0.6
[1.0.7]: https://github.com/kitschpatrol/mdat-plugin-cli-help/compare/v1.0.6...v1.0.7
[1.0.8]: https://github.com/kitschpatrol/mdat-plugin-cli-help/compare/v1.0.7...v1.0.8
[2.0.0]: https://github.com/kitschpatrol/mdat-plugin-cli-help/compare/v1.0.8...v2.0.0
[2.0.1]: https://github.com/kitschpatrol/mdat-plugin-cli-help/compare/v2.0.0...v2.0.1
[2.0.2]: https://github.com/kitschpatrol/mdat-plugin-cli-help/compare/v2.0.1...v2.0.2
[2.1.0]: https://github.com/kitschpatrol/mdat-plugin-cli-help/compare/v2.0.2...v2.1.0
[2.1.1]: https://github.com/kitschpatrol/mdat-plugin-cli-help/compare/v2.1.0...v2.1.1
[2.1.2]: https://github.com/kitschpatrol/mdat-plugin-cli-help/compare/v2.1.1...v2.1.2
[3.0.0]: https://github.com/kitschpatrol/mdat-plugin-cli-help/compare/v2.1.2...v3.0.0
[3.0.1]: https://github.com/kitschpatrol/mdat-plugin-cli-help/compare/v3.0.0...v3.0.1
[3.0.2]: https://github.com/kitschpatrol/mdat-plugin-cli-help/compare/v3.0.1...v3.0.2
[3.1.0]: https://github.com/kitschpatrol/mdat-plugin-cli-help/compare/v3.0.2...v3.1.0
[3.2.0]: https://github.com/kitschpatrol/mdat-plugin-cli-help/compare/v3.1.0...v3.2.0
[3.3.0]: https://github.com/kitschpatrol/mdat-plugin-cli-help/compare/v3.2.0...v3.3.0
[3.4.0]: https://github.com/kitschpatrol/mdat-plugin-cli-help/compare/v3.3.0...v3.4.0
[3.4.1]: https://github.com/kitschpatrol/mdat-plugin-cli-help/compare/v3.4.0...v3.4.1
[3.4.2]: https://github.com/kitschpatrol/mdat-plugin-cli-help/compare/v3.4.1...v3.4.2
