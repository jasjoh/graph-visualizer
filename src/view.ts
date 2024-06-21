import { select as d3select, pointer as d3pointer } from 'd3';
import * as MyGraph from './graph';

export interface EdgeCoordinates {
  nodeOneX: number;
  nodeOneY: number;
  nodeTwoX: number;
  nodeTwoY: number;
}

const nodeRadius = 10;
const nodeFillColor = "#bcbcbc";
const highlightFillColor = "#373737";

const edgeStrokeColor = '#8eb4d3';
const edgeWidth = 3;

const arrowFillColor = '#8eb4d3';

let container : d3.Selection<HTMLElement, any, any, any>;
let svg : d3.Selection<SVGSVGElement, any, any, any>;
let graph : MyGraph.Graph | null = null;
let selectedNodesMap : Map<string, MyGraph.GraphMemberNode> = new Map();
let edgeInputs : {
  directional: HTMLInputElement,
  weight: HTMLInputElement
};


// call on document load to initialize control handlers and initial graph
export function initializeOnMount(graphToUse: MyGraph.Graph) {
  _initializeControls();
  _initializeSvg(graphToUse);
}

// initialize controls
function _initializeControls() {
  const controlsDiv = document.getElementById('controls');
  controlsDiv.addEventListener('click', _handleControlsClick);

  edgeInputs = {
    directional: document.getElementById('edgeDirection') as HTMLInputElement,
    weight: document.getElementById('edgeWeight') as HTMLInputElement
  }
}

// initialize the SVG with a graph instance
function _initializeSvg(graphToUse: MyGraph.Graph) {
  graph = graphToUse;
  container = d3select("#graph-container");
  container.selectAll("*").remove();
  svg = container.append("svg")
  .attr("width", 800)
  .attr("height", 600);

  svg.on('pointerdown', _handleSvgClick);
}

// re-render the graph in the SVG
export function renderGraph() : void {

  // remove all existing elements
  svg.selectAll("*").remove();

  const edgeCoords = createEdgeCoords();

  // add edges
  svg.selectAll(".edge")
    .data(edgeCoords)
    .enter().append("line")
    .attr("class", "edge")
    .attr('x1', (coords : EdgeCoordinates) => coords.nodeOneX )
    .attr('y1', (coords : EdgeCoordinates) => coords.nodeOneY )
    .attr('x2', (coords : EdgeCoordinates) => coords.nodeTwoX )
    .attr('y2', (coords : EdgeCoordinates) => coords.nodeTwoY )
    .attr('stroke', edgeStrokeColor)
    .attr('stroke-width', edgeWidth)

  // add selected node highlights
  if (selectedNodesMap?.size > 0) {
    const highlightedNodes = graph.nodes.filter((node) => {
      return selectedNodesMap.has(node.node.id);
    })
    console.log("to be highlighted nodes on render:", highlightedNodes);
    svg.selectAll(".highlight")
    .data(highlightedNodes)
    .enter().append("circle")
    .attr("class", "highlight")
    .attr("r", nodeRadius + 2)
    .attr("cx", (node: MyGraph.GraphMemberNode) => node.location?.x)
    .attr("cy", (node: MyGraph.GraphMemberNode) => node.location?.y)
    .style("fill", highlightFillColor);
  }

  // add nodes (over top of any highlights)
  svg.selectAll(".node")
    .data(graph.nodes)
    .enter().append("circle")
    .attr("class", "node")
    .attr("r", nodeRadius)
    .attr("cx", (node: MyGraph.GraphMemberNode) => node.location?.x)
    .attr("cy", (node: MyGraph.GraphMemberNode) => node.location?.y)
    .style("fill", nodeFillColor);

}

// handle all mouse clicks within the SVG
function _handleSvgClick(event: PointerEvent) : void {
  const [x, y] = d3pointer(event);
  const existingNode = _getExistingNode(x, y);
  if (existingNode !== undefined) {
    const nodeData = d3select(existingNode).datum() as MyGraph.GraphMemberNode;
    console.log("clicked an existing node:", existingNode);
    console.log("node datum:", nodeData);
    if (selectedNodesMap?.has(nodeData.node.id)) {
      selectedNodesMap.delete(nodeData.node.id); }
    else if (selectedNodesMap?.size < 2) {
      selectedNodesMap.set(nodeData.node.id, nodeData); }
  } else {
    const node = new MyGraph.GraphNode;
    graph.addNode( node, { x: x, y: y });
  }
  renderGraph();
}

// handle all control button clicks
function _handleControlsClick(event: Event) {
  const target = event.target as HTMLElement;
  const clickedButtonId = target.id;
  switch(clickedButtonId) {
    case 'newGraphButton':
      __newGraph();
      break;
    case 'removeNodeButton':
      if (selectedNodesMap?.size === 1) {
        const mapEntries = selectedNodesMap.entries();
        const selectedNode = mapEntries.next().value[1];
        __removeNode(selectedNode);
      }
      break;
    case 'addNeighborButton':
      if (selectedNodesMap?.size === 2) {
        const mapEntries = selectedNodesMap.entries();
        const startNode = mapEntries.next().value[1];
        const neighborNode = mapEntries.next().value[1];
        __addNeighbor(startNode, neighborNode);
      }
      break;
    case 'removeNeighborButton':
      if (selectedNodesMap?.size === 2) {
        const mapEntries = selectedNodesMap.entries();
        const startNode = mapEntries.next().value[1];
        const neighborNode = mapEntries.next().value[1];
        __removeNeighbor(startNode, neighborNode);
      }
      break;
    default:
      break;
  }

  // creates a new graph and renders it in the SVG
  function __newGraph() : void {
    const graph = new MyGraph.Graph();
    _initializeSvg(graph);
    renderGraph();
  }

  // removes a node from the graph
  function __removeNode(graphMemberNode: MyGraph.GraphMemberNode) : void {
    graph.removeNode(graphMemberNode.node);
    selectedNodesMap.delete(graphMemberNode.node.id);
    renderGraph();
  }

  /**
   * adds a neighbor to a node in the graph
   * @param nodes - The array of selected nodes in the order they were selected.
   */
  function __addNeighbor(
    startNode: MyGraph.GraphMemberNode,
    neighborNode: MyGraph.GraphMemberNode
  ) : void {
    startNode.node.addNeighbor({
      node:neighborNode.node,
      edge: _getEdgeData(),
      graph: graph
    })
    renderGraph();
  }

  /**
   * removes a neighbor from a node in the graph
   * @param nodes - The array of selected nodes in the order they were selected.
   */
  function __removeNeighbor(
    startNode: MyGraph.GraphMemberNode,
    neighborNode: MyGraph.GraphMemberNode
  ) : void {
    startNode.node.removeNeighbor(neighborNode.node, graph)
    renderGraph();
  }
}

// retrieves edge data from the DOM; throws error if required edge data doesn't exist
function _getEdgeData() : MyGraph.Edge {
  const directional = edgeInputs.directional?.value ?
    Boolean(edgeInputs.directional.value) :
    false

  const weight = edgeInputs.weight?.value ?
    Number(edgeInputs.weight.value) :
    0

  const edge = {
    directional: directional,
    weight: weight
  }

  return edge;
}

function _getExistingNode(x: number, y: number) : SVGCircleElement  {
  const nodes = svg.selectAll<SVGCircleElement, unknown>(".node");
  let matchingNode : SVGCircleElement;
  nodes.each(function() {
    const circle = d3select(this);
    if (__isClickInCircle(
      [x, y],
      [Number(circle.attr('cx')), Number(circle.attr('cy'))],
      Number(circle.attr('r'))
    )) {
      matchingNode = this;
    }
  })

  return matchingNode;

  function __isClickInCircle(
    click: [number, number],
    center: [number, number],
    radius: number) : boolean {

      /** Raw Math Logic */
      const distanceSquared = Math.pow(click[0] - center[0], 2) + Math.pow(click[1] - center[1], 2);
      const radiusSquared = radius * radius;
      return distanceSquared <= radiusSquared;
  }
}

function createEdgeCoords() : EdgeCoordinates[] {
  const edgeCoords : EdgeCoordinates[] = [];
  for (let graphMemberNode of graph.nodes) {
    for (let neighbor of graphMemberNode.node.graphNeighbors) {
      /**
       * If n1 or n2 has a lesser y && greater x, go up and left, down and right
       * Else n1 or n2 has lesser y && lesser x, go up and right, down and left
       */
      if (
        (graphMemberNode.location.y > graph.getNodeLocation(neighbor.node).y &&
        graphMemberNode.location.x < graph.getNodeLocation(neighbor.node).x) ||
        (graphMemberNode.location.y < graph.getNodeLocation(neighbor.node).y &&
        graphMemberNode.location.x > graph.getNodeLocation(neighbor.node).x)
      ) {
        // go up and left, down and right for both
        if (
          graphMemberNode.location.y > graph.getNodeLocation(neighbor.node).y
        ) {
          edgeCoords.push({
            nodeOneX: graphMemberNode.location.x - nodeRadius / 2,
            nodeOneY: graphMemberNode.location.y - nodeRadius / 2,
            nodeTwoX: graph.getNodeLocation(neighbor.node).x - nodeRadius / 2,
            nodeTwoY: graph.getNodeLocation(neighbor.node).y - nodeRadius / 2
          })
        } else {
          edgeCoords.push({
            nodeTwoX: graphMemberNode.location.x + nodeRadius / 2,
            nodeTwoY: graphMemberNode.location.y + nodeRadius / 2,
            nodeOneX: graph.getNodeLocation(neighbor.node).x + nodeRadius / 2,
            nodeOneY: graph.getNodeLocation(neighbor.node).y + nodeRadius / 2
          })
        }
      } else {
        // go up and right, down and left for both
        if (
          graphMemberNode.location.y > graph.getNodeLocation(neighbor.node).y
        ) {
          edgeCoords.push({
            nodeOneX: graphMemberNode.location.x + nodeRadius / 2,
            nodeOneY: graphMemberNode.location.y - nodeRadius / 2,
            nodeTwoX: graph.getNodeLocation(neighbor.node).x + nodeRadius / 2,
            nodeTwoY: graph.getNodeLocation(neighbor.node).y - nodeRadius / 2
          })
        } else {
          edgeCoords.push({
            nodeTwoX: graphMemberNode.location.x - nodeRadius / 2,
            nodeTwoY: graphMemberNode.location.y + nodeRadius / 2,
            nodeOneX: graph.getNodeLocation(neighbor.node).x - nodeRadius / 2,
            nodeOneY: graph.getNodeLocation(neighbor.node).y + nodeRadius / 2
          })
        }
      }

    }
  }
  return edgeCoords;
}

