# 2. Build the Android APKs with Gradle on GitHub Actions

Status: accepted (PR #20)

## Context

Both mobile apps are Expo projects, and the demo should offer real Android installs next to the browser versions. The usual route is EAS Build, Expo's hosted build service. It needs an Expo account and an access token stored in the repository, builds run on Expo's queue, and the free plan has monthly limits.

## Decision

[release-apk.yml](../../.github/workflows/release-apk.yml) builds the APKs itself. It runs `npx expo prebuild` to generate the native Android project, then `./gradlew assembleRelease` on a GitHub-hosted runner. A version tag (`v*`) builds both apps and attaches `warriors-admin.apk` and `warriors-member.apk` to a release. The file names carry no version, so `releases/latest/download/<name>.apk` always points at the newest build.

- The API address is baked into the app at build time, from the `API_URL` repository variable. A tag build fails if it is missing, so a release never ships pointing at `localhost`.
- The builds are 64-bit ARM only (`arm64-v8a`), which covers nearly every current phone and keeps the files smaller.
- They are signed with the debug key that Expo generates.

## Consequences

- No third-party account, no token, and nothing to wait for in a queue. The build is a workflow file anyone can read.
- The debug signature means Android asks the user to allow installing from an unknown source, and the apps cannot be published to Google Play as they are. The landing page says so. A real release key would be a repository secret, and the same workflow could use it.
- A 32-bit-only phone cannot install these builds.
- A Gradle build is slow on a shared runner, which is acceptable for something that only runs on a tag.
