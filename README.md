# Streak — Habit Tracker

A single-page habit tracker built with vanilla HTML, CSS, and JavaScript.
Add daily habits, tick them off on a weekly grid, and watch your streaks grow.

## How to run

No installation needed. Just open `index.html` in any browser by
double-clicking it, or use VS Code with the Live Server extension.

## Deployed URL

https://harsh-dubey20.github.io/habit-tracker/

## Features

- Add, rename, and delete habits
- Weekly grid with habits on the left and Mon-Sun across the top
- Today's column is always highlighted so you know where you are
- Toggle checkmarks — green when done, quiet red tint when missed
- Streak counter per habit based on consecutive days checked
- Week navigation — go back to past weeks, forward, and jump to today
- Full history preserved across page reloads via localStorage
- Responsive down to 360px mobile screens
- Empty state shown when no habits exist yet

## Stack

Vanilla HTML, CSS, and JavaScript — no frameworks, no build step,
no dependencies.

## Project structure

habit-tracker/
- index.html   — page structure and all HTML elements
- style.css    — dark theme, grid layout, responsive breakpoints
- script.js    — all logic, rendering, localStorage, streak calculation
- README.md    — this file
- ANSWERS.md   — answers to the five assessment questions