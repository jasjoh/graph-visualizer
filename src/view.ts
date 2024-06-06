// import * as d3 from 'https://unpkg.com/d3?module'

import * as d3 from 'd3';
import { MyGraph } from './graph.js';

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

  let container = null;
  let svg = null;

  export function initializeSvg() {
    container = d3.select("#graph-container");
    svg = container.append("svg")
    .attr("width", 800)
    .attr("height", 600);
  }

  export function renderGraph(graph: MyGraph.Graph) : void {

    // remove all existing elements
    svg.selectAll("*").remove();

    const allNeighbors = createEdgeCoords(graph);
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

  function createEdgeCoords(graph: MyGraph.Graph) : EdgeCoordinates[] {
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