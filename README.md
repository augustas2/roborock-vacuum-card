# Roborock Vacuum Card

[![Release](https://github.com/augustas2/roborock-vacuum-card/actions/workflows/release.yml/badge.svg)](https://github.com/augustas2/roborock-vacuum-card/actions/workflows/release.yml)

A Home Assistant dashboard card for `vacuum.*` entities, designed for Roborock robot vacuums. It shows the current vacuum state, battery level, update time, Roborock-specific cleaning details and attention alerts, product image, and state-aware controls.

![Roborock Vacuum Card](https://raw.githubusercontent.com/augustas2/roborock-vacuum-card/master/src/assets/card.png)

## Features

- Localized English and Lithuanian interface
- Static Roborock product image with subtle state-specific visual feedback
- Battery level, relative last-changed time, cleaning details, and attention alerts
- Optional vacuum name, battery, update time, and controls
- Start, pause, return-to-base, and find-me controls based on the entity `supported_features` bit mask
- Duplicate-command protection while Home Assistant processes a vacuum action
- Visual editor and vacuum entity suggestion support
- `prefers-reduced-motion` support

## Installation

### HACS

1. In HACS, open **Dashboard** and choose **Download repositories**.
2. Search for **Roborock Vacuum Card**. Until it is included in the default HACS repository, add `augustas2/roborock-vacuum-card` as a custom repository with the **Dashboard** category.
3. Download the card.
4. Add the dashboard resource if HACS does not add it automatically:

    ```yaml
    url: /hacsfiles/roborock-vacuum-card/roborock-vacuum-card.js
    type: module
    ```

### Manual installation

1. Download `roborock-vacuum-card.js` from the latest release.
2. Copy it to `/config/www/roborock-vacuum-card.js`.
3. Add the dashboard resource:

    ```yaml
    url: /local/roborock-vacuum-card.js
    type: module
    ```

Refresh the browser after installing or updating the resource.

## Configuration

```yaml
type: custom:roborock-vacuum-card
entity: vacuum.roborock_qrevo_edge_series
name: Roborock Qrevo Edge Series
show_battery: true
show_last_changed: true
show_controls: true
show_name: true
```

| Option              | Required | Description                                                              |
| ------------------- | -------- | ------------------------------------------------------------------------ |
| `entity`            | Yes      | A `vacuum.*` entity.                                                     |
| `name`              | No       | Name shown below the vacuum image. Defaults to the entity friendly name. |
| `show_battery`      | No       | Shows the battery level. Defaults to `true`.                             |
| `show_last_changed` | No       | Shows the relative last-changed time. Defaults to `true`.                |
| `show_controls`     | No       | Shows vacuum control buttons. Defaults to `true`.                        |
| `show_name`         | No       | Shows the vacuum name. Defaults to `true`.                               |

## Controls and states

The card uses the standard Home Assistant vacuum services:

| Action         | Service                 | Availability                                                            |
| -------------- | ----------------------- | ----------------------------------------------------------------------- |
| Start          | `vacuum.start`          | When the entity supports `Start` and is not cleaning or returning.      |
| Pause          | `vacuum.pause`          | When the entity supports `Pause` and is cleaning or returning.          |
| Return to base | `vacuum.return_to_base` | When the entity supports `ReturnToBase` and is not docked or returning. |
| Find me        | `vacuum.locate`         | When the entity supports `Locate`; available in every vacuum state.     |

Controls are disabled while a command is pending, then re-enabled after Home Assistant reports an entity state change. A failed service call re-enables them immediately.

Visual feedback is deliberately understated: cleaning and returning have gentle motion, paused and error states show a centered state indicator, and docked is static. All animation is disabled when the user enables reduced motion.
