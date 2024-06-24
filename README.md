### Graph Algorithm Visualizer
## What is this?
This project is a web app that helps visualize how different algorithms work in the context of graphs.

At a high level it supports two major capabilities:

1. Visually define and manage a graphs via an SVG.
2. Run an algorithm (from a pre-defined list) against that graph and view an animation of it's behavior.

Currently it only supports visualizing Dijkstra's algorithm.

## Tech Stack
- JavaScript (TypeScript), HTML, CSS
- Vite (package manager)
- D3 (SVG management)

## How to run.
1. Install all dependencies via `npm install`
2. Run the app (runs locally on port 3000) via `npm run dev`

## Future TODOs
- General UI layout improvements
- Improved controls (e.g. support DELETE key removing nodes / neighbors)
- Restrict graph characteristics based on selected algo (e.g. Dijkstra for only non-cyclical)
- Add support for selecting starting and ending node (current defaults to first / last)
- Add support for editing an edge
- Upon algo finishing, highlight fastest route

## Bugs
- Running the algo more than once generates new sets of tables