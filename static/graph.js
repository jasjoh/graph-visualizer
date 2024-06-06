export var MyGraph;
(function (MyGraph) {
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
    let Global;
    (function (Global) {
        Global.nodes = new Set;
        let lastNodeIdNumberAssigned = null;
        function isNodeIdTaken(id) {
            if (Global.nodes.size === 0) {
                return false;
            }
            for (let node of Global.nodes) {
                if (node.id === id) {
                    return true;
                }
            }
            return false;
        }
        Global.isNodeIdTaken = isNodeIdTaken;
        function getNewNodeId() {
            return lastNodeIdNumberAssigned === null ? "" + 1 : "" + ++lastNodeIdNumberAssigned;
        }
        Global.getNewNodeId = getNewNodeId;
    })(Global || (Global = {}));
    ;
    /** Class representing a graph of nodes */
    class Graph {
        // relationships: GraphRelationship[] | null;
        constructor() {
            this.nodes = [];
            this.nodeCount = this.nodes.length;
        }
        /** Notifies all nodes to remove a neighbor which was removed
         * from this graph.
         */
        _removeNeighbors(node) {
            for (let gmn of this.nodes) {
                gmn.removeNeighbor(node, this);
            }
        }
        /** Returns true if the specified GraphNode exists in the graph */
        isNodeInGraph(node) {
            if (this.nodes.length === 0) {
                return false;
            }
            return this.nodes.some(gmn => gmn.node === node);
        }
        /** Adds a GraphNode to this graph.
         * Returns undefined if successful and throws an error otherwise.
         */
        addNode(node, removeNeighborFunction, location) {
            if (this.isNodeInGraph(node)) {
                throw new Error("Node is already part of this graph.");
            }
            this.nodes.push({
                node: node,
                removeNeighbor: removeNeighborFunction,
                location: location
            });
            if (node.graph !== this) {
                node.addToGraph(this);
            }
        }
        /** Removes a GraphNode from this graph.
         * Returns undefined if successful and throws an error otherwise.
         */
        removeNode(node) {
            if (!this.isNodeInGraph(node)) {
                throw new Error("Node is not part of this graph.");
            }
            const nodeIndex = this.nodes.findIndex(gmn => {
                return gmn.node === node;
            });
            this.nodes.splice(nodeIndex, 1);
            this._removeNeighbors(node);
            if (node.graph === this) {
                node.removeFromGraph(this);
            }
        }
        getNodeLocation(node) {
            if (!this.isNodeInGraph(node)) {
                throw new Error("Node is not part of this graph.");
            }
            const gmn = this.nodes.find(gmn => {
                return gmn.node === node;
            });
            return gmn.location;
        }
    }
    MyGraph.Graph = Graph;
    /** Class representing a node that may or may not be in a graph
     * Constructor takes an ID (optional), graph to be added to (optional) and
     * a set of neighbor nodes [GraphNeighbor[]] (optional)
     */
    class GraphNode {
        constructor(id, graph, graphNeighbors) {
            this.id = this._validateAndReturnId(id);
            this.graph = null;
            if (graph !== undefined) {
                this.addToGraph(graph);
            }
            ;
            this.graphNeighbors = graphNeighbors === undefined ? [] : graphNeighbors;
        }
        /** Returns true if the GraphNeighbor is valid for this graph */
        _isValidGraphNeighbor(graph) {
            return (this.graph !== null &&
                graph === this.graph);
        }
        /** Validates a GraphNode with the specified ID isn't already part of a graph
         * and returns the graph if that is the case. Throws error if already part of
         * the provided graph.
         */
        _validateAndReturnGraph(graph) {
            if (graph.isNodeInGraph(this)) {
                throw new Error("Node is already part of graph.");
            }
            return graph;
        }
        /** Validates the request ID is available and returns it if so. Throws an
         *  error otherwise.
         */
        _validateAndReturnId(id) {
            if (id !== undefined) {
                if (Global.isNodeIdTaken(id)) {
                    throw new Error("Node with specified ID already exists.");
                }
                return id;
            }
            return Global.getNewNodeId();
        }
        /** Returns true or false based on whether the provided neighbor
         * is already a neighbor of this.graphNeighbors.
         */
        _isExistingNeighbor(node, graph) {
            if (this.graphNeighbors === null) {
                return false;
            }
            for (let existingNeighbor of this.graphNeighbors) {
                if (node === existingNeighbor.node &&
                    graph === existingNeighbor.graph) {
                    return true;
                }
            }
            return false;
        }
        /** Internal function to remove all neighbors when removed from a graph
         * Throws an error if a specific neighbor is provided and doesn't exist
         */
        _removeAllNeighbors() {
            this.graphNeighbors = [];
        }
        /** Adds this GraphNode to a graph.
         * Returns the undefined if successful.
         * Returns error if already part of the graph or otherwise unable to add.
         */
        addToGraph(graph) {
            if (this.graph === graph) {
                throw new Error("Already part of that graph.");
            }
            this.graph = graph;
            if (!graph.isNodeInGraph(this)) {
                graph.addNode(this, this.removeNeighbor.bind(this));
            }
        }
        /** Removes this GraphNode from a graph.
         * Returns undefined if successful.
         * Returns error if the GraphNode is not part of the graph.
         */
        removeFromGraph(graph) {
            if (this.graph !== graph) {
                throw new Error("This GraphNode is not part of that graph.");
            }
            this.graph = null;
            if (graph.isNodeInGraph(this)) {
                graph.removeNode(this);
            }
            this._removeAllNeighbors();
        }
        /** Adds a new GraphNeighbor to this GraphNode.
         * If GraphNode is already a neighbor, throws error
         * If not, adds as a neighbor and returns undefined.
         */
        addNeighbor(neighbor) {
            if (this._isExistingNeighbor(neighbor.node, neighbor.graph)) {
                throw new Error(`GraphNode is already a neighbor. To update an existing neighbor
         relationship, using updateNeighbor().`);
            }
            else if (!this._isValidGraphNeighbor(neighbor.graph)) {
                throw new Error('This GraphNode and proposed neighbor are not part of the same graph.');
            }
            this.graphNeighbors.push(neighbor);
        }
        /** Removes a GraphNeighbor from this GraphNode.
         * Does not remove any existing GraphNeighbor relationship from the neighbor.
         * Returns undefined if successful and throws error otherwise.
         */
        removeNeighbor(node, graph) {
            if (!this._isExistingNeighbor(node, graph) || this.graphNeighbors === null) {
                throw new Error(`GraphNode is not an existing neighbor.`);
            }
            const existingNeighborIndex = this.graphNeighbors.findIndex(n => {
                return node === n.node && graph === n.graph;
            });
            this.graphNeighbors.splice(existingNeighborIndex, 1);
        }
        /** Updates a GraphNeighbor in this GraphNode with a match node ID and graph.
         * Returns undefined if successful and throws error otherwise.
         */
        updateNeighbor(neighbor) {
            if (!this._isExistingNeighbor(neighbor.node, neighbor.graph) ||
                this.graphNeighbors === null) {
                throw new Error(`GraphNode is not an existing neighbor.`);
            }
            const existingNeighborIndex = this.graphNeighbors.findIndex(n => {
                return neighbor.node === n.node && neighbor.graph === n.graph;
            });
            this.graphNeighbors[existingNeighborIndex] = neighbor;
        }
    }
    MyGraph.GraphNode = GraphNode;
})(MyGraph || (MyGraph = {}));
