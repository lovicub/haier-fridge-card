# Changelog

## 5.0.1 — 2026-11-07

- Publish the deployed premium SVG design with responsive layouts and live entity readouts.
- Reflect the upper refrigerator door sensor in the illustration.
- Add independent, restartable five-second UI-only previews for the upper and freezer doors.
- Provide the HACS manifest, installation guide and MIT license.
- This deployed version uses German UI labels; the English/German beta materials are archived under `archive/v5.0.0-beta.1/`.

## 5.0.0-beta.1 — 2026-10-24

First public prerelease of Haier Fridge Premium Card.

- Self-contained SVG/CSS refrigerator dashboard card.
- Fridge, My Zone and freezer target temperatures, humidity and door status.
- English and German labels following the Home Assistant interface language.
- Entity details and history actions, optional animations and last-updated display.
- Isolated preview and 16 passing desktop/mobile browser checks.
- Manual installation instructions and fictional YAML configuration.

Known limitations: the full Home Assistant frontend and editor lifecycle have not been verified. Automatic entity suggestions assume HDPW5620ANPD and German names. See AUDIT.md for the complete review.
