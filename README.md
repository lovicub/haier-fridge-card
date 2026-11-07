# Haier Fridge Premium Card

A refined refrigerator dashboard for Home Assistant. Version **5.0.1** pairs a premium SVG illustration with live entity readouts and independent door previews. Self-contained JavaScript, SVG and CSS; no external image assets or build step.

## Features

- Premium refrigerator illustration with animated upper and freezer doors.
- Live refrigerator, My Zone and freezer **target temperatures**, humidity and upper-door status.
- Sensor-driven upper-door state, missing-data indicators and last-update display.
- Responsive layout, reduced-motion support and a visual configuration editor.
- Entity details and optional Home Assistant history shortcut.

This community custom card has been deployed and tested in Home Assistant. It is not an official Haier or Home Assistant product and is not affiliated with either project. The v5.0.1 interface uses German labels; this guide is in English.

## Screenshot


<img width="469" height="578" alt="image" src="https://github.com/user-attachments/assets/f1c4b436-c7ab-46dd-9a52-e2e5c1075de3" />
<img width="462" height="567" alt="image" src="https://github.com/user-attachments/assets/b6b747b5-25fd-435c-83f2-4abd0e2140f5" />

## Installation

### HACS custom repository

1. In HACS, open **Custom repositories** from the menu.
2. Add `https://github.com/lovicub/haier-fridge-card` with type **Dashboard** (called **Lovelace** in some versions).
3. Find **Haier Fridge Premium Card**, download it and reload your browser.
4. Check **Settings → Dashboards → Resources**. HACS normally installs the JS directly in the card directory and uses `/hacsfiles/haier-fridge-card/haier-fridge-card.js` as a JavaScript module. Use the resource matching the actual HACS installation; do not register the card twice.

The package follows the [HACS dashboard plugin layout](https://www.hacs.xyz/docs/publish/plugin/). HACS custom repository installation is separate from inclusion in the default HACS catalog.

### Manual installation

1. Download the release ZIP and copy `dist/haier-fridge-card.js` into `www/community/haier-fridge-card/dist/` under your Home Assistant configuration directory, preserving `dist`.
2. Add this resource in **Settings → Dashboards → Resources** (enable Advanced Mode if needed), with type **JavaScript Module**:

   `/local/community/haier-fridge-card/dist/haier-fridge-card.js`

   For YAML-managed resources:

   ```yaml
   resources:
     - url: /local/community/haier-fridge-card/dist/haier-fridge-card.js
       type: module
   ```

3. Reload your browser and add a manual card using the configuration below. After upgrades, clear the browser cache if the previous version remains visible.

## Configuration

These are the exact configuration keys and example entity IDs used by the card’s built-in stub. Replace the entity IDs with those available in your installation; the card does not create entities or provide a refrigerator integration.

```yaml
type: custom:haier-fridge-card
title: Haier Fridge
model: HDPW5620ANPD
entity_fridge_target: number.hdpw5620anpd_zieltemperatur_kuhlschrank
entity_my_zone_target: number.hdpw5620anpd_zieltemperatur_my_zone
entity_freezer_target: number.hdpw5620anpd_zieltemperatur_gefrierschrank
entity_humidity: sensor.hdpw5620anpd_luftfeuchtigkeit
entity_door_fridge: binary_sensor.hdpw5620anpd_tur_offen_kuhlschrank
show_history_button: true
show_last_updated: true
animate: true
```

The temperature readouts show the configured target entities, rather than measured compartment temperatures. `show_history_button`, `show_last_updated` and `animate` default to `true`. The visual editor includes entity pickers. There is no separate freezer-door sensor configuration in v5.0.1.

## Door previews and motion

Click the upper door or freezer door in the illustration to preview that door opening for **5 seconds**. Each door has its own timer, so both can preview simultaneously. Clicking again restarts only that door’s timer. When the preview expires, the upper door continues to reflect its actual sensor state; an actually open upper door stays open. Previews are cleared when the card disconnects or rerenders.

**Preview clicks are UI-only and never control the physical refrigerator.** They do not call Home Assistant services or change entity state. Entity tiles open Home Assistant’s entity details; the history button opens history.

The layout adapts to the card width, with compact and narrow layouts and a stacked layout below 360 px. The card respects the system’s `prefers-reduced-motion` setting. Set `animate: false` to disable transitions and animations explicitly; door preview states still appear and expire, without animated motion.

## License

MIT — see [LICENSE](LICENSE).
