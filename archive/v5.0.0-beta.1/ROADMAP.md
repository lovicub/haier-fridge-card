# Suggested release roadmap

## 1. Source review and isolated preview — complete

The original JavaScript is preserved in the first local commit. An offline fixture, a small browser suite and the audit report are in place. The source review and initial checks do not establish compatibility with the full Home Assistant frontend. The initial review preceded publication. Public beta packaging is now prepared for v5.0.0-beta.1; no license has been selected.

## 2. Portable configuration and editor stability — next

Localization to English and German using Home Assistant's active language is implemented. Next, remove the model-specific entity-name assumptions from the stub and make entity selection understandable for users with different models and entity names. Keep the legacy entity aliases. Handle either `hass`/`setConfig` arrival order in the editor and preserve field state and focus during HA updates. Keep the current visual design during this work.

Acceptance criteria: no exception when `hass` arrives before config, no field loss on HA updates, and an understandable setup for different refrigerator models. Preserve the current English/German behavior checks.

## 3. Data behavior and HA compatibility

Decide how the card communicates partial availability; validate temperature values and timestamps; and decide whether the last-updated display should refresh without a new HA state. Verify the target HA version, editor controls, icons, `hass-more-info` and history navigation in an isolated full frontend. Check longer labels, keyboard access, contrast and reduced motion. Do not control real devices.

## 4. Repository package for review

Prepare user documentation with a fictional YAML example, entity requirements, manual installation, options and compatibility scope. Add a changelog, release version, CI and preview images made from synthetic data. Review Git history and release files for private data. Confirm ownership and rights for the source, artwork and Haier branding; the project owner must choose a license. Decide whether to support HACS only after checking its current requirements.

## 5. Public beta publication — authorized

The owner authorized GitHub publication on 2026-10-24. Publish v5.0.0-beta.1 with the standalone JavaScript asset and disclose the remaining compatibility limitations. The items above remain follow-up work for a stable release.
