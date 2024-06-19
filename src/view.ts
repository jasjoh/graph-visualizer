import { select as d3select, pointer as d3pointer } from 'd3';

import { MyGraph } from './graph';

export namespace MySvg {

  interface EdgeCoordinates {
    nodeOneX: number;
    nodeOneY: number;
    nodeTwoX: number;
    nodeTwoY: number;
  }

  const nodeRadius = 10;
  const nodeFillColor = "#69b3a2";

  const edgeStrokeColor = 'black';
  const edgeWidth = 3;

  let d3 = undefined;
  let container = null;
  let svg = null;
  let graph : MyGraph.Graph | null = null;

  export function initializeSvg(graphToUse: MyGraph.Graph) {
    graph = graphToUse;
    container = d3select("#graph-container");
    container.selectAll("*").remove();
    svg = container.append("svg")
    .attr("width", 800)
    .attr("height", 600);

    svg.on('pointerdown', handleClick);
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

  function handleClick(event: PointerEvent) {
    const [x, y] = d3pointer(event);
    const node = new MyGraph.GraphNode;
    graph.addNode( node, node.removeNeighbor, { x: x, y: y });
    renderGraph();
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
}