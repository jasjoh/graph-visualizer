import * as d3 from 'https://unpkg.com/d3?module';
export var MySvg;
(function (MySvg) {
    const nodeRadius = 10;
    const nodeFillColor = "#69b3a2";
    let container = null;
    let svg = null;
    function initializeSvg() {
        container = d3.select("#graph-container");
        svg = container.append("svg")
            .attr("width", 800)
            .attr("height", 600);
    }
    MySvg.initializeSvg = initializeSvg;
    function renderGraph(graph) {
        // remove all existing elements
        svg.selectAll("*").remove();
        // add nodes
        const node = svg.selectAll(".node")
            .data(graph.nodes)
            .enter().append("circle")
            .attr("class", "node")
            .attr("r", nodeRadius)
            .attr("cx", (node) => { var _a; return (_a = node.location) === null || _a === void 0 ? void 0 : _a.x; })
            .attr("cy", (node) => { var _a; return (_a = node.location) === null || _a === void 0 ? void 0 : _a.y; })
            .style("fill", nodeFillColor);
    }
    MySvg.renderGraph = renderGraph;
})(MySvg || (MySvg = {}));
