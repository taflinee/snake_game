# Petal 🌸

A cozy snake game set in a pastel garden. Guide your pink snake through berries and rival snakes, grow your score, and enjoy a little encouragement along the way.

Built with HTML, CSS, and JavaScript. No package installation or build step required.

## Features

- **360° steering:** smooth, curved turns with mouse and touch controls, plus keyboard support.
- **Pastel garden:** blush pink, lavender, and mint colors with flower details.
- **Random NPC snakes:** rivals spawn with 2–8 segments and wander in curved paths.
- **Little celebrations:** an NPC hitting your snake’s body triggers cheering bubbles inside the playboard and colorful confetti.
- **Optional sound:** turn on a short musical celebration using the sound button.
- **High-score board:** shows the top 5 usernames by their highest score. Each username’s personal best is saved locally when browser storage is available, and survives respawning and page reloads.
- **Responsive layout:** play on desktop or mobile, with on-screen direction buttons on smaller screens.
- **Pause and resume:** take a break anytime; the game also pauses when the tab is hidden or the window loses focus.

## Getting started

### Open directly

Open `index.html` in a modern web browser, enter a username (up to 20 characters), then select **Let’s play**. Your name appears below your snake during play.

### Run a local server

With Python 3 installed, open a terminal in the project folder and run:

```bash
python3 -m http.server 8000
```

Visit **http://localhost:8000** in your browser. Press **Ctrl+C** in the terminal to stop the server.

On Windows, you can use `py -m http.server 8000` if `python3` is unavailable.

The game runs entirely in your browser. Google Fonts supplies the page fonts when an internet connection is available; system fonts are used otherwise.

## Run the game

From this folder, run `./run_game.sh`. It starts the local server and opens the game at `http://localhost:8000/index.html`. Keep that terminal open while playing and press `Ctrl+C` when you are finished. To use another port, run `PORT=8001 ./run_game.sh`.

For double-click launching on Linux, double-click `Petal Snake Game.desktop`. If the file manager asks, choose **Trust and Launch** or **Allow Launching** once. The launcher opens a terminal for the local server and opens the game in your browser.

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
2. Collect berries to earn **10 points** and grow when your current score-based segment threshold is reached.
3. Keep your head away from every NPC body: if your head touches another snake’s body, you die and respawn. To defeat an NPC, let its head run into your body. The NPC drops one collectible circle per body segment; the dropped value is its hidden score divided equally across those circles. Collecting a circle awards its points and contributes toward segment growth. Defeated NPCs respawn with random lengths when space is available.
4. After a collision, you automatically respawn in the center of the garden with **5 segments**, keeping your username but resetting your score and catch count to zero. Your pre-death score is distributed among the dropped circles. Every newly spawned snake gradually fades from partially translucent to opaque over **3 seconds of protection**. Protected snakes cannot cause or receive collision damage, cannot collect food, and self-collision is never lethal. If any body segments are still overlapping when protection expires, the snake stays visibly translucent and protected until the bodies fully separate. NPCs die when their heads hit your body or another NPC’s body, then drop their own circles.
5. Every **1000 points**, the whole snake enlarges slightly. The segment-growth threshold starts at **50 points** and increases by the configured multiplier at each enlargement tier.
5. Keep growing and try to beat your personal best.

Body collisions trigger death regardless of snake length; the player automatically respawns. NPC-to-NPC collisions do not award player points. Crossing a garden edge wraps you around to the opposite side.

High scores are stored in this browser, rather than synced between devices. Enter the same username (including capitalization) to continue using its record. Clearing browser storage resets the leaderboard. If storage is unavailable, records last for the current page session.

## Project files

```text
snake_game/
├── index.html   # Page layout, game board, score panel, and controls
├── style.css    # Pastel theme, responsive layout, and bubble styling
├── config.js    # Adjustable score tiers, growth, enlargement, and collision settings
├── game.js      # Movement, NPCs, collisions, scoring, sound, and rendering
└── README.md    # Setup and gameplay guide
```

The garden is drawn with the Canvas 2D API. Celebration sounds use the Web Audio API, and personal best scores use local storage.

## Customization

- **Colors and layout:** edit `style.css`; snake and berry colors are also defined in `game.js`.
- **Movement:** adjust `SPEED`, `TURN_SPEED`, and `SPACING` near the top of `game.js`.
- **Growth and collisions:** adjust `config.js` to change enlargement tiers, body scale, segment thresholds, threshold multiplier, and head collision forgiveness.
- **NPC lengths:** change the random length calculation in `makeRival()`.
- **Cheering messages:** edit the `words` array in `cheer()`.
- **Scoring:** change the berry value when new berries are created in `reset()` and `tick()`.

Refresh the browser after saving changes. If an older version still appears, use a hard refresh.
