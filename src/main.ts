import * as AppGraph from "./graph";
import * as AppView from "./view";

document.addEventListener('DOMContentLoaded', main);

function main() {
  const graph = new AppGraph.Graph();
  testFillGraph(graph);
  AppView.initializeOnMount(graph);
  AppView.renderGraph();
}

function testFillGraph(graph: AppGraph.Graph) {
  const nodeOne = new AppGraph.GraphNode();
  const nodeTwo = new AppGraph.GraphNode();
  const nodeThree = new AppGraph.GraphNode();
  const nodeFour = new AppGraph.GraphNode();
  graph.addNode(nodeOne, { x: 200, y: 400 });
  graph.addNode(nodeTwo, { x: 300, y: 500 });
  graph.addNode(nodeThree, { x: 300, y: 300 });
  graph.addNode(nodeFour, { x: 400, y: 400 });
  nodeOne.addNeighbor({ node: nodeTwo, graph: graph, edge: { directional: false, weight: 5 }});
  nodeOne.addNeighbor({ node: nodeThree, graph: graph, edge: { directional: false, weight: 10 }});
  nodeTwo.addNeighbor({ node: nodeFour, graph: graph, edge: { directional: false, weight: 12 }});
  nodeThree.addNeighbor({ node: nodeFour, graph: graph, edge: { directional: false, weight: 6 }});
}