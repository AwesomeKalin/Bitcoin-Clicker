# Bitcoin Clicker - Game Design

## Game State
- Score (Bitcoin amount): starts at 0
- Click Value: starts at 1
- Per Second (passive income): starts at 0

## Upgrades (in order of appearance)

### Click-Based Upgrades
1. **Better Fingers**
   - Base Cost: 10
   - Effect: clickValue +1

2. **Cursor Speed**
   - Base Cost: 25
   - Effect: clickValue +5

### Passive Income Upgrades
3. **Auto Clicker**
   - Base Cost: 100
   - Effect: perSecond +1

4. **Mining Rig**
   - Base Cost: 500
   - Effect: perSecond +10

5. **Quantum Computer**
   - Base Cost: 2000
   - Effect: perSecond +50

## Rules
- Each upgrade costs 15% more after each purchase
- Passive income generates every 1 second
- Upgrades show purchase count
- Click upgrades display tooltip on hover with full details

## Layout
- **Left**: Clicker (33% width)
  - Bitcoin symbol (₿)
  - Score display
  - +X per click stat
  - +X per second stat (if > 0)
  - Large clickable button

- **Right**: Upgrades panel (67% width)
  - **Click Enhancements** (grid layout, compact cards)
    - Shows only 👆 icon by default
    - Hover to reveal name, effect, purchase count, cost button
    - Grid of 3 columns
    
  - **Passive Income** (list layout)
    - Full cards showing name, effect, cost button
    - Scrollable list

## Current Version
- v0.1.0 - Initial game implementation with 5 upgrades
- Built with React 19 + Vite + Tailwind CSS 4
