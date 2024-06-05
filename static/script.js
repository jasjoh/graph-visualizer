/** Describes a neighboring node, including it's edge. */
// interface GraphRelationship {
//   nodeOne: GraphNode;
//   nodeTwo: GraphNode;
//   oneToTwoEdge: Edge;
//   twoToOneEdge: Edge;
// }
/** Global namespace
 * Maintains set of all created nodes
 * Keeps track of an assigned node IDs (as needed)
 */
var MyGlobal;
(function (MyGlobal) {
    MyGlobal.nodes = [];
    var lastNodeIdNumberAssigned = null;
    function isNodeIdTaken(id) {
        if (MyGlobal.nodes === null) {
            return false;
        }
        for (var _i = 0, nodes_1 = MyGlobal.nodes; _i < nodes_1.length; _i++) {
            var node = nodes_1[_i];
            if (node.id === id) {
                return true;
            }
        }
        return false;
    }
    MyGlobal.isNodeIdTaken = isNodeIdTaken;
    function getNewNodeId() {
        return lastNodeIdNumberAssigned === null ? "" + 1 : "" + ++lastNodeIdNumberAssigned;
    }
    MyGlobal.getNewNodeId = getNewNodeId;
})(MyGlobal || (MyGlobal = {}));
;
/** Class representing a graph of nodes */
var Graph = /** @class */ (function () {
    // relationships: GraphRelationship[] | null;
    function Graph() {
        this.nodes = [];
        this.nodeCount = this.nodes.length;
    }
    /** Notifies all nodes to remove a neighbor which was removed
     * from this graph.
     */
    Graph.prototype._removeNeighbors = function (node) {
        for (var _i = 0, _a = this.nodes; _i < _a.length; _i++) {
            var gmn = _a[_i];
            gmn.removeNeighbor(node, this);
        }
    };
    /** Returns true if the specified GraphNode exists in the graph */
    Graph.prototype.isNodeInGraph = function (node) {
        if (this.nodes === null) {
            return false;
        }
        return this.nodes.some(function (gmn) { return gmn.node === node; });
    };
    /** Adds a GraphNode to this graph.
     * Returns undefined if successful and throws an error otherwise.
     */
    Graph.prototype.addNode = function (node, removeNeighborFunction) {
        if (this.isNodeInGraph(node)) {
            throw new Error("Node is already part of this graph.");
        }
        this.nodes.push({
            node: node,
            removeNeighbor: removeNeighborFunction
        });
        if (node.graph !== this) {
            node.addToGraph(this);
        }
    };
    /** Removes a GraphNode from this graph.
     * Returns undefined if successful and throws an error otherwise.
     */
    Graph.prototype.removeNode = function (node) {
        if (!this.isNodeInGraph(node)) {
            throw new Error("Node is not part of this graph.");
        }
        var nodeIndex = this.nodes.findIndex(function (gmn) {
            return gmn.node.id === node.id;
        });
        this.nodes.splice(nodeIndex, 1);
        this._removeNeighbors(node);
        if (node.graph === this) {
            node.removeFromGraph(this);
        }
    };
    return Graph;
}());
/** Class representing a node that may or may not be in a graph
 * Constructor takes an ID (optional), graph to be added to (optional) and
 * a set of neighbor nodes [GraphNeighbor[]] (optional)
 */
var GraphNode = /** @class */ (function () {
    function GraphNode(id, graph, graphNeighbors) {
        this.id = this._validateAndReturnId(id);
        this.graph = null;
        if (graph !== undefined) {
            this.addToGraph(graph);
        }
        ;
        this.graphNeighbors = graphNeighbors === undefined ? [] : graphNeighbors;
    }
    /** Returns true if the GraphNeighbor is valid for this graph */
    GraphNode.prototype._isValidGraphNeighbor = function (graph) {
        return (this.graph !== null &&
            graph === this.graph);
    };
    /** Validates a GraphNode with the specified ID isn't already part of a graph
     * and returns the graph if that is the case. Throws error if already part of
     * the provided graph.
     */
    GraphNode.prototype._validateAndReturnGraph = function (graph) {
        if (graph.isNodeInGraph(this)) {
            throw new Error("Node is already part of graph.");
        }
        return graph;
    };
    /** Validates the request ID is available and returns it if so. Throws an
     *  error otherwise.
     */
    GraphNode.prototype._validateAndReturnId = function (id) {
        if (id !== undefined) {
            if (MyGlobal.isNodeIdTaken(id)) {
                throw new Error("Node with specified ID already exists.");
            }
            return id;
        }
        return MyGlobal.getNewNodeId();
    };
    /** Returns true or false based on whether the provided neighbor
     * is already a neighbor of this.graphNeighbors.
     */
    GraphNode.prototype._isExistingNeighbor = function (node, graph) {
        if (this.graphNeighbors === null) {
            return false;
        }
        for (var _i = 0, _a = this.graphNeighbors; _i < _a.length; _i++) {
            var existingNeighbor = _a[_i];
            if (node === existingNeighbor.node &&
                graph === existingNeighbor.graph) {
                return true;
            }
        }
        return false;
    };
    /** Internal function to remove all neighbors when removed from a graph
     * Throws an error if a specific neighbor is provided and doesn't exist
     */
    GraphNode.prototype._removeAllNeighbors = function () {
        this.graphNeighbors === null;
    };
    /** Adds this GraphNode to a graph.
     * Returns the undefined if successful.
     * Returns error if already part of the graph or otherwise unable to add.
     */
    GraphNode.prototype.addToGraph = function (graph) {
        if (this.graph === graph) {
            throw new Error("Already part of that graph.");
        }
        this.graph = graph;
        if (!graph.isNodeInGraph(this)) {
            graph.addNode(this, this.removeNeighbor.bind(this));
        }
    };
    /** Removes this GraphNode from a graph.
     * Returns undefined if successful.
     * Returns error if the GraphNode is not part of the graph.
     */
    GraphNode.prototype.removeFromGraph = function (graph) {
        if (this.graph !== graph) {
            throw new Error("This GraphNode is not part of that graph.");
        }
        this.graph = null;
        if (graph.isNodeInGraph(this)) {
            graph.removeNode(this);
        }
        this._removeAllNeighbors();
    };
    /** Adds a new GraphNeighbor to this GraphNode.
     * If GraphNode is already a neighbor, throws error
     * If not, adds as a neighbor and returns undefined.
     */
    GraphNode.prototype.addNeighbor = function (neighbor) {
        if (this._isExistingNeighbor(neighbor.node, neighbor.graph)) {
            throw new Error("GraphNode is already a neighbor. To update an existing neighbor\n         relationship, using updateNeighbor().");
        }
        else if (!this._isValidGraphNeighbor(neighbor.graph)) {
            throw new Error('This GraphNode and proposed neighbor are not part of the same graph.');
        }
        this.graphNeighbors.push(neighbor);
    };
    /** Removes a GraphNeighbor from this GraphNode.
     * Does not remove any existing GraphNeighbor relationship from the neighbor.
     * Returns undefined if successful and throws error otherwise.
     */
    GraphNode.prototype.removeNeighbor = function (node, graph) {
        if (!this._isExistingNeighbor(node, graph) || this.graphNeighbors === null) {
            throw new Error("GraphNode is not an existing neighbor.");
        }
        var existingNeighborIndex = this.graphNeighbors.findIndex(function (n) {
            return node === n.node && graph === n.graph;
        });
        this.graphNeighbors.splice(existingNeighborIndex, 1);
    };
    /** Updates a GraphNeighbor in this GraphNode with a match node ID and graph.
     * Returns undefined if successful and throws error otherwise.
     */
    GraphNode.prototype.updateNeighbor = function (neighbor) {
        if (!this._isExistingNeighbor(neighbor.node, neighbor.graph) ||
            this.graphNeighbors === null) {
            throw new Error("GraphNode is not an existing neighbor.");
        }
        var existingNeighborIndex = this.graphNeighbors.findIndex(function (n) {
            return neighbor.node === n.node && neighbor.graph === n.graph;
        });
        this.graphNeighbors[existingNeighborIndex] = neighbor;
    };
    return GraphNode;
}());
