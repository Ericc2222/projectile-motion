# Clown Launcher Game

An interactive physics-based game where you launch a clown from a cannon to land on a mattress.

## Game Features

- Realistic physics simulation with configurable parameters
- Adjustable cannon angle, power, and wind conditions
- Multiple gravity settings (Earth, Moon, Mars)
- Sound effects for different game events
- Progressive difficulty levels
- Scoring system based on landing precision and difficulty
- Trajectory visualization
- Local high score tracking

## How to Play

1. Adjust the cannon angle and power using the sliders
2. Set wind conditions and gravity as desired
3. Click the "Fire!" button to launch the clown
4. Try to land the clown on the mattress for points
5. Beat your high score and advance through increasingly difficult levels

## Controls

- **Angle**: Change the cannon's firing angle (0-90 degrees)
- **Power**: Adjust the cannon's firing power (0-100)
- **Wind**: Set the wind speed and direction (-10 to +10 m/s)
- **Mass**: Change the clown's mass to affect flight dynamics
- **Gravity**: Choose between Earth, Moon, or Mars gravity
- **Sound**: Toggle game sound effects on/off

## Scoring

Points are awarded based on:
- Landing precision (how close to the center of the mattress)
- Difficulty factors (wind, gravity, distance)
- Perfect landings earn bonus points
- Consecutive successful landings multiply your score

## Game Difficulty

The game features 5 progressive difficulty levels:
1. **Level 1**: Standard settings, normal-sized mattress
2. **Level 2**: Smaller mattress
3. **Level 3**: More variable wind conditions
4. **Level 4**: Even smaller mattress, positioned further away
5. **Level 5**: Maximum challenge with high wind variability and air resistance

## Testing the Game

To verify that all power settings work correctly (especially low power settings), you can use the built-in testing function:

1. Open the browser's developer console (F12 or right-click -> Inspect -> Console)
2. Type `testMultiplePowerSettings()` and press Enter
3. The test will automatically try different power settings from 5 to 100 and verify that:
   - The clown properly launches
   - The animation correctly stops after landing
   - The feedback updates to "Ready for next shot!" after landing
   - The game resets properly for the next shot

This testing function is particularly useful for verifying the clown animation stops correctly at low power settings.

## Bug Fixes and Troubleshooting

The game includes fixes for several common issues:

### Recent Fixes

1. **Clown Spinning Bug**: Fixed the issue where the clown would continue spinning after landing
   - Added proper animation stopping with 1.5 second delay before showing "Ready for next shot!"
   - Implemented DOM element replacement technique to guarantee animation stops

2. **Low-power Detection**: Added special handling for very low power settings
   - The game now detects when the clown is barely moving and forces a landing
   - This prevents the clown from getting stuck in the air at very low power

3. **Animation State Management**:
   - Added proper isAnimating flag management to prevent multiple launches
   - Added 10-second safety timeout to prevent infinite animations
   - Added safety checks at the start of the animation function

### Emergency Reset

If the game ever gets stuck (for example, if the clown keeps spinning), you can:

1. **Double-click** the Fire button to perform an emergency reset
2. Type `resetGame()` in your browser's console (press F12 to open developer tools)

### Testing Function

To verify the game works at different power settings:

1. Open your browser's console (press F12)
2. Type `testMultiplePowerSettings()` and press Enter
3. The test will automatically try power settings from 5 to 100
4. Watch the console for results

## Sound Effects

The game uses the following sound effects:
- `cannon_fire.mp3`: Plays when the cannon fires
- `bounce.mp3`: Plays when the clown bounces on the mattress
- `crash.mp3`: Plays when the clown misses the mattress
- `success.mp3`: Plays after a successful landing
- `level_up.mp3`: Plays when advancing to a new level
- `whoosh.mp3`: Wind sound during clown flight

To add your own sound effects, place MP3 files with these names in the `/sounds` directory.

## Implementation Details

The game is built using HTML5, CSS3, and JavaScript with:
- SVG-based trajectory visualization
- CSS animations for visual effects
- Local storage for saving high scores and preferences
- Physics calculations including gravity, wind, and air resistance
- Responsive UI design

## Browser Compatibility

Tested and working in:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Credits

- Developed by: [Your Name]
- Art assets: Custom CSS
- Sound effects: Placeholder sounds (replace with your own)