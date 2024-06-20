import { select as d3select, pointer as d3pointer } from 'd3';
import { MyGraph } from './graph';

export interface EdgeCoordinates {
  nodeOneX: number;
  nodeOneY: number;
  nodeTwoX: number;
  nodeTwoY: number;
}

const nodeRadius = 10;
const nodeFillColor = "#69b3a2";

const edgeStrokeColor = 'black';
const edgeWidth = 3;

let container : d3.Selection<HTMLElement, any, any, any>;
let svg : d3.Selection<SVGSVGElement, any, any, any>;
let graph : MyGraph.Graph | null = null;
let selectedElements : MyGraph.GraphNode[] = [];

export function initializeOnMount(graphToUse: MyGraph.Graph) {
  _initializeControls();
  _initializeSvg(graphToUse);
}

function _initializeControls() {
  const controlsDiv = document.getElementById('controls');
  controlsDiv.addEventListener('click', _handleControlsClick);
}

function _initializeSvg(graphToUse: MyGraph.Graph) {
  graph = graphToUse;
  container = d3select("#graph-container");
  container.selectAll("*").remove();
  svg = container.append("svg")
  .attr("width", 800)
  .attr("height", 600);

  svg.on('pointerdown', _handleSvgClick);
}

export function renderGraph() : void {

  // remove all existing elements
  svg.selectAll("*").remove();

  const allNeighbors = createEdgeCoords();
  console.log()

  // add edges
  svg.selectAll(".edge")
    .data(allNeighbors)
    .enter().append("line")
    .attr("class", "edge")
    .attr('x1', (coords : EdgeCoordinates) => coords.nodeOneX )
    .attr('y1', (coords : EdgeCoordinates) => coords.nodeOneY )
    .attr('x2', (coords : EdgeCoordinates) => coords.nodeTwoX )
    .attr('y2', (coords : EdgeCoordinates) => coords.nodeTwoY )
    .attr('stroke', edgeStrokeColor)
    .attr('stroke-width', edgeWidth)

  // add nodes
  svg.selectAll(".node")
    .data(graph.nodes)
    .enter().append("circle")
    .attr("class", "node")
    .attr("r", nodeRadius)
    .attr("cx", (node: MyGraph.GraphMemberNode) => node.location?.x)
    .attr("cy", (node: MyGraph.GraphMemberNode) => node.location?.y)
    .style("fill", nodeFillColor);

}

function _handleSvgClick(event: PointerEvent) : void {
  const [x, y] = d3pointer(event);
  const node = new MyGraph.GraphNode;
  graph.addNode( node, node.removeNeighbor, { x: x, y: y });
  renderGraph();
}

function _handleControlsClick(event: Event) {
  const target = event.target as HTMLElement;
  const clickedButtonId = target.id;
  switch(clickedButtonId) {
    case 'newGraphButton':
      __newGraph();
    case 'removeNodeButton':
      if (selectedElements.length !== 1 && selectedElements[1])
      __removeNode();
  }

  // creates a new graph and renders it in the SVG
  function __newGraph() : void {
    const graph = new MyGraph.Graph();
    _initializeSvg(graph);
    renderGraph();
  }

  // removes a node from the graph
  function __removeNode(graph: MyGraph.Graph, node: MyGraph.GraphNode) : void {
    graph.removeNode(node);
  }

  // adds an edge from one node to another in a given graph
  function __addNeighbor(
    graph: MyGraph.Graph,
    startNode: MyGraph.GraphNode,
    endNode: MyGraph.GraphNode,
    edge: MyGraph.Edge) : void {
      startNode.addNeighbor({
        node: endNode,
        edge: edge,
        graph: graph
      })
  }

  // removes an edge from one node to another in a given graph
  function __removeNeighbor(
    graph: MyGraph.Graph,
    startNode: MyGraph.GraphNode,
    endNode: MyGraph.GraphNode) : void {
      startNode.removeNeighbor(endNode, graph)
  }
}

function createEdgeCoords() : EdgeCoordinates[] {
  const allNeighbors : EdgeCoordinates[] = [];
  for (let gmn of graph.nodes) {
    for (let neighbor of gmn.node.graphNeighbors) {
      allNeighbors.push({
        nodeOneX: gmn.location.x,
        nodeOneY: gmn.location.y,
        nodeTwoX: graph.getNodeLocation(neighbor.node).x,
        nodeTwoY: graph.getNodeLocation(neighbor.node).y
      })
    }
  }
  return allNeighbors;
}