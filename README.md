# Petal 🌸

A cozy snake game set in a pastel garden. Guide your pink snake through berries and smaller rival snakes, grow your score, and enjoy a little encouragement along the way.

Built with HTML, CSS, and JavaScript. No package installation or build step required.

## Features

- **360° steering:** smooth, curved turns with mouse and touch controls, plus keyboard support.
- **Pastel garden:** blush pink, lavender, and mint colors with flower details.
- **Random NPC snakes:** rivals spawn with 2–8 segments and wander in curved paths.
- **Little celebrations:** catching a smaller snake triggers cheering bubbles inside the playboard and colorful confetti.
- **Optional sound:** turn on a short musical celebration using the sound button.
- **Personal best:** your highest score is saved locally in your browser when storage is available.
- **Responsive layout:** play on desktop or mobile, with on-screen direction buttons on smaller screens.
- **Pause and resume:** take a break anytime; the game also pauses when the tab is hidden or the window loses focus.

## Getting started

### Open directly

Open `index.html` in a modern web browser, then select **Let’s play**.

### Run a local server

With Python 3 installed, open a terminal in the project folder and run:

```bash
python3 -m http.server 8000
```

Visit **http://localhost:8000** in your browser. Press **Ctrl+C** in the terminal to stop the server.

On Windows, you can use `py -m http.server 8000` if `python3` is unavailable.

The game runs entirely in your browser. Google Fonts supplies the page fonts when an internet connection is available; system fonts are used otherwise.

## Controls

| Input | Action |
| --- | --- |
| Mouse | Move the pointer over the garden to steer toward it at any angle. |
| Touch | Drag your finger across the garden to steer. |
| Arrow keys / WASD | Steer in a direction; hold two directions for diagonals. |
| On-screen arrows | Tap to steer on smaller screens. |
| Space | Start a run, pause/resume, or restart after game over. |
| Pause / Resume button | Pause or continue the current run. |
| Sound button | Toggle celebration sounds; sound starts off. |

Your snake moves automatically and curves toward the chosen direction. Mouse and touch offer full-angle steering; keyboard directions also turn smoothly.

## How to play

1. Start with the pink snake in the garden.
2. Collect berries to earn **10 points** and grow by one segment.
3. Touch a smaller NPC snake with your head to earn **50 points**, grow by one segment, and trigger a cheering bubble. A new randomly sized rival spawns after a catch when space is available.
4. Keep clear of your own body: running into it ends the game.
5. Select **Play again** to start a fresh run and try to beat your personal best.

Only NPC snakes **shorter than yours** can be eaten. Equal-sized and longer NPC snakes do not award points or end your run. Crossing a garden edge wraps you around to the opposite side.

Scores are stored in this browser, rather than synced between devices. Clearing browser storage can reset your personal best.

## Project files

```text
snake_game/
├── index.html   # Page layout, game board, score panel, and controls
├── style.css    # Pastel theme, responsive layout, and bubble styling
├── game.js      # Movement, NPCs, collisions, scoring, sound, and rendering
└── README.md    # Setup and gameplay guide
```

The garden is drawn with the Canvas 2D API. Celebration sounds use the Web Audio API, and personal best scores use local storage.

## Customization

- **Colors and layout:** edit `style.css`; snake and berry colors are also defined in `game.js`.
- **Movement:** adjust `SPEED`, `TURN_SPEED`, and `SPACING` near the top of `game.js`.
- **NPC lengths:** change the random length calculation in `makeRival()`.
- **Cheering messages:** edit the `words` array in `cheer()`.
- **Scoring:** change the berry and NPC point values in `tick()`.

Refresh the browser after saving changes. If an older version still appears, use a hard refresh.
