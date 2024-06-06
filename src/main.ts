import { MyGraph } from "./graph.js";
import { MySvg } from "./view.js";

document.addEventListener('DOMContentLoaded', main);
document.getElementById('newGraphBtn').addEventListener('click', newGraph);

function main() {
  MySvg.initializeSvg();
  const graph = new MyGraph.Graph();
  testFillGraph(graph);
  MySvg.renderGraph(graph);
}

function newGraph() {
  const graph = new MyGraph.Graph();
  MySvg.renderGraph(graph);
}

function testFillGraph(graph: MyGraph.Graph) {
  const nodeOne = new MyGraph.GraphNode();
  const nodeTwo = new MyGraph.GraphNode();
  graph.addNode(nodeOne, nodeOne.removeNeighbor, { x: 100, y: 100 });
  graph.addNode(nodeTwo, nodeOne.removeNeighbor, { x: 200, y: 200 });
  nodeOne.addNeighbor({ node: nodeTwo, graph: graph, edge: { directional: false, weight: 0 }});
  nodeTwo.addNeighbor({ node: nodeOne, graph: graph, edge: { directional: false, weight: 0 }});
}