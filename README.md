### Dijkstra Algorithm Visualizer
## What is this?
This project is a web app that helps visualize how Dijkstra's graph pathing algorithm works. At a high level it:

1. Allows you to define a graph by creating, adding, removing and creating relationships between nodes.
2. Renders the graph using HTML native scalable vector graphics (<SVG>)
3. Visualizes how Dijkstra's algorithm paths through the graph to finding shortest distance between two nodes.

## IMPORTANT NOTE:
Due to the issue highlighted in https://stackoverflow.com/questions/48471651/es6-module-import-of-d3-4-x-fails, you need to manually update the import line for d3 to `import * as d3 from 'https://unpkg.com/d3?module'` in order for the app to properly import d3.