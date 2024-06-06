// import * as d3 from 'https://unpkg.com/d3?module'
import * as d3 from 'd3';
import { MyGraph } from './graph.js';
export var MySvg;
(function (MySvg) {
    const nodeRadius = 10;
    const nodeFillColor = "#69b3a2";
    const edgeStrokeColor = 'black';
    const edgeWidth = 3;
    let container = null;
    let svg = null;
    let graph = null;
    function initializeSvg(graphToUse) {
        graph = graphToUse;
        container = d3.select("#graph-container");
        container.selectAll("*").remove();
        svg = container.append("svg")
            .attr("width", 800)
            .attr("height", 600);
        svg.on('pointerdown', handleClick);
    }
    MySvg.initializeSvg = initializeSvg;
    function renderGraph() {
        // remove all existing elements
        svg.selectAll("*").remove();
        const allNeighbors = createEdgeCoords();
        console.log();
        // add edges
        svg.selectAll(".edge")
            .data(allNeighbors)
            .enter().append("line")
            .attr("class", "edge")
            .attr('x1', (coords) => coords.nodeOneX)
            .attr('y1', (coords) => coords.nodeOneY)
            .attr('x2', (coords) => coords.nodeTwoX)
            .attr('y2', (coords) => coords.nodeTwoY)
            .attr('stroke', edgeStrokeColor)
            .attr('stroke-width', edgeWidth);
        // add nodes
        svg.selectAll(".node")
            .data(graph.nodes)
            .enter().append("circle")
            .attr("class", "node")
            .attr("r", nodeRadius)
            .attr("cx", (node) => { var _a; return (_a = node.location) === null || _a === void 0 ? void 0 : _a.x; })
            .attr("cy", (node) => { var _a; return (_a = node.location) === null || _a === void 0 ? void 0 : _a.y; })
            .style("fill", nodeFillColor);
    }
    MySvg.renderGraph = renderGraph;
    function handleClick(event) {
        const [x, y] = d3.pointer(event);
        const node = new MyGraph.GraphNode;
        graph.addNode(node, node.removeNeighbor, { x: x, y: y });
        renderGraph();
    }
    function createEdgeCoords() {
        const allNeighbors = [];
        for (let gmn of graph.nodes) {
            for (let neighbor of gmn.node.graphNeighbors) {
                allNeighbors.push({
                    nodeOneX: gmn.location.x,
                    nodeOneY: gmn.location.y,
                    nodeTwoX: graph.getNodeLocation(neighbor.node).x,
                    nodeTwoY: graph.getNodeLocation(neighbor.node).y
                });
            }
        }
        return allNeighbors;
    }
})(MySvg || (MySvg = {}));
