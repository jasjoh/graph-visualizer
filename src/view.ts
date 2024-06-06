// import * as d3 from 'https://unpkg.com/d3?module'

import * as d3 from 'd3';
import { MyGraph } from './graph.js';

export namespace MySvg {
  const nodeRadius = 10;
  const nodeFillColor = "#69b3a2";

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

    // add nodes
    const node = svg.selectAll(".node")
        .data(graph.nodes)
        .enter().append("circle")
        .attr("class", "node")
        .attr("r", nodeRadius)
        .attr("cx", (node: MyGraph.GraphMemberNode) => node.location?.x)
        .attr("cy", (node: MyGraph.GraphMemberNode) => node.location?.y)
        .style("fill", nodeFillColor);

  }
}