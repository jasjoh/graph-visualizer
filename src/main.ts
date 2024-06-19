import { MyGraph } from "./graph";
import { MySvg } from "./view";

document.addEventListener('DOMContentLoaded', main);

function main() {
  const graph = new MyGraph.Graph();
  testFillGraph(graph);
  MySvg.initializeSvg(graph);
  MySvg.renderGraph();
}

function newGraph() {
  const graph = new MyGraph.Graph();
  MySvg.renderGraph();
}

function testFillGraph(graph: MyGraph.Graph) {
  const nodeOne = new MyGraph.GraphNode();
  const nodeTwo = new MyGraph.GraphNode();
  graph.addNode(nodeOne, nodeOne.removeNeighbor, { x: 100, y: 100 });
  graph.addNode(nodeTwo, nodeOne.removeNeighbor, { x: 200, y: 200 });
  nodeOne.addNeighbor({ node: nodeTwo, graph: graph, edge: { directional: false, weight: 0 }});
  nodeTwo.addNeighbor({ node: nodeOne, graph: graph, edge: { directional: false, weight: 0 }});
}