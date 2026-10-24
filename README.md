# Haier Fridge Premium Card

A custom Home Assistant card for refrigerator target temperatures, humidity and door status. The card version declared in the source is **5.0.0**. Its built-in labels follow the Home Assistant language: German when the interface language is German, English otherwise. The original source is preserved in the first local Git commit.

See [AUDIT.md](AUDIT.md) for the source review and test results, and [ROADMAP.md](ROADMAP.md) for suggested release steps.

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
