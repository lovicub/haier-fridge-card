# Haier Fridge Premium Card

A custom Home Assistant card for refrigerator target temperatures, humidity and door status. The card version declared in the source is **5.0.0-beta.1**. Its built-in labels follow the Home Assistant language: German when the interface language is German, English otherwise. The original source is preserved in the first local Git commit.

See [AUDIT.md](AUDIT.md) for the source review and test results, and [ROADMAP.md](ROADMAP.md) for suggested release steps.

## Install manually

1. Download `haier-fridge-card.js` from the [GitHub release](https://github.com/lovicub/haier-fridge-card/releases/tag/v5.0.0-beta.1).
2. Copy it to `/config/www/haier-fridge-card.js` in Home Assistant. Create `www` if needed.
3. Add a dashboard resource with URL `/local/haier-fridge-card.js?v=5.0.0-beta.1` and type **JavaScript Module**. Reload the browser after adding or updating it.
4. Add a manual dashboard card using your own entity IDs:

```yaml
type: custom:haier-fridge-card
title: Kitchen fridge
model: My refrigerator
entity_fridge_target: number.demo_fridge
entity_my_zone_target: number.demo_my_zone
entity_freezer_target: number.demo_freezer
entity_humidity: sensor.demo_humidity
entity_door_fridge: binary_sensor.demo_door
show_history_button: true
show_last_updated: true
animate: true
```

The example entities are fictional. Select three temperature setpoint `number` entities, a humidity `sensor` and a door `binary_sensor` (`on` means open). Temperatures shown are setpoints. Clicking a tile opens Home Assistant entity details; the history button opens history for the fridge target entity.

`title` and `model` customize the heading. All three switches in the example default to `true`. Built-in labels use German for a German HA interface and English otherwise. Configure entity IDs explicitly: automatic suggestions currently assume model HDPW5620ANPD and German entity names.

This beta has passed isolated Chromium checks at desktop and mobile viewport sizes. Full Home Assistant frontend compatibility and the visual editor lifecycle remain unverified; YAML configuration is recommended for this beta. HACS installation has not been validated. See [AUDIT.md](AUDIT.md) for details. No license has been selected.

## Screenshot
<img width="389" height="427" alt="image" src="https://github.com/user-attachments/assets/3565e32b-c2e6-4624-b448-e2de343bc072" />


## Isolated preview

From the project directory, run:

```sh
python3 preview/serve.py
```

Open `http://127.0.0.1:8123` in a browser. Stop the server with Ctrl+C; use `--port 8124` to choose another port. The page offers English and German language selection and synthetic entity scenarios.

The preview server binds to loopback and serves only an explicit allowlist of local files. It does not proxy requests. A restrictive Content Security Policy blocks network connections, frames, workers, forms, and remote assets. Browser-side guards also block network APIs. All entities are fictional. A mock `callService` records calls; other HA APIs reject calls. Card details and history actions go to the on-page log rather than Home Assistant. Icons are placeholders, and the HA editor components are not loaded.

Keep Home Assistant addresses, tokens and real entity data out of the fixture. Open the preview through its local server so the isolation headers are applied.

## Run the browser checks

Requirements: Python, Playwright, its Chromium browser, and system fonts. Installing dependencies or the browser needs Internet access; the test run itself is offline.

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r tests/requirements.txt
.venv/bin/python -m playwright install chromium --only-shell
.venv/bin/python tests/run.py
```

On Linux, Chromium system libraries and fonts such as DejaVu may also be required. Use `--executable /path/to/chromium` or set `CHROMIUM_EXECUTABLE` when Chromium is installed elsewhere. The runner serves inspected local file bytes under a virtual fixture origin, aborts every other request and disables service workers. It checks a small set of card behaviors at desktop and mobile viewport sizes; it does not test a physical phone or the full HA editor. Results and screenshots are written to the ignored `test-results/` directory. A nonzero exit code indicates a failed check.
