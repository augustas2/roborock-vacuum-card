# Roborock Vacuum Card

Home Assistant Lovelace custom card for `vacuum.*` entities. It is built with **Lit + TypeScript + Vite** and includes an animated Roborock-style vacuum SVG.

## Features

- Big state text, such as `Docked`, `Cleaning`, and `Returning`.
- Battery level in the top-left corner.
- Animated vacuum SVG below the state text.
- Friendly name below the illustration.
- Start, pause, and return-to-dock buttons based on the entity `supported_features` bit mask.
- Home Assistant visual editor support through `getConfigForm()`.
- Home Assistant 2026.6+ entity suggestion support through `window.customCards.getEntitySuggestion()`.
- `prefers-reduced-motion` support.

## Project structure

```text
roborock-vacuum-card/
├─ src/
│  ├─ roborock-vacuum-card.ts
│  └─ types.ts
├─ package.json
├─ tsconfig.json
├─ vite.config.ts
├─ eslint.config.js
├─ .prettierrc.json
├─ .gitignore
├─ hacs.json
└─ README.md
```

## Development in IntelliJ IDEA

1. Open the `roborock-vacuum-card` folder in IntelliJ IDEA.
2. Use Node.js 20+.
3. Install dependencies:

```bash
npm install
```

4. Run checks:

```bash
npm run typecheck
npm run lint
npm run format:check
npm run check
```

5. Start dev server:

```bash
npm run dev
```

6. Build production file:

```bash
npm run build
```

The build output will be:

```text
dist/roborock-vacuum-card.js
```

## Install in Home Assistant

Copy this file:

```text
dist/roborock-vacuum-card.js
```

to:

```text
/config/www/roborock-vacuum-card.js
```

Then add a dashboard resource:

```yaml
url: /local/roborock-vacuum-card.js
type: module
```

## Lovelace YAML example

```yaml
type: custom:roborock-vacuum-card
entity: vacuum.roborock_qrevo_edge_series
name: Roborock Qrevo Edge Series
show_battery: true
show_last_changed: true
show_controls: true
show_name: true
```

For a Roborock vacuum, use:

```yaml
type: custom:roborock-vacuum-card
entity: vacuum.roborock_qrevo_edge_series
name: Roborock Qrevo Edge Series
```

## Optional config

| Option              | Type    | Default              | Description                                                  |
| ------------------- | ------- | -------------------- | ------------------------------------------------------------ |
| `entity`            | string  | required             | Must be a `vacuum.*` entity.                                 |
| `name`              | string  | entity friendly name | Card name under SVG.                                         |
| `show_battery`      | boolean | `true`               | Shows battery in top-left corner.                            |
| `show_last_changed` | boolean | `true`               | Shows relative last changed time.                            |
| `show_controls`     | boolean | `true`               | Shows start/pause/return-to-dock buttons.                    |
| `show_name`         | boolean | `true`               | Shows friendly name under SVG.                               |
| `color`             | string  | state-based          | CSS color or HA theme variable, e.g. `var(--primary-color)`. |

## Services used

The action buttons call standard Home Assistant services:

- `vacuum.start`
- `vacuum.pause`
- `vacuum.return_to_base`

They are shown only when the entity reports the matching `supported_features` flag.
