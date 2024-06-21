
/** Describes an edge in the graph */
export interface Edge {
  directional: boolean;
  weight: number;
}

/** Coordinates of a node on a graph */
export interface GraphMemberLoc {
  x: number;
  y: number;
}

/** Describes a neighboring node, including it's edge. */
export interface GraphNeighbor {
  node: GraphNode;
  edge: Edge;
  graph: Graph;
}

/** Describes a member of a Graph and it's removeNeighbor callback */
export interface GraphMemberNode {
  node: GraphNode;
  location: GraphMemberLoc | undefined;
}

/** NodeManager singleton for tracking nodes
 * Maintains set of all created nodes
 * Keeps track of an assigned node IDs (as needed)
 */
class NodeManager {
  private static instance: NodeManager;
  private nodes : Set<GraphNode>;
  private lastNodeIdNumberAssigned: number | null;

  private constructor() {
    this.nodes = new Set<GraphNode>;
    this.lastNodeIdNumberAssigned = null;
  }

  public static getInstance() : NodeManager {
    if (!NodeManager.instance) {
      this.instance = new NodeManager();
    }
    return NodeManager.instance;
  }

  public addNode(node: GraphNode) {
    this.nodes.add(node);
  }

  public isNodeIdTaken(id: string): boolean {
    if (this.nodes.size === 0) { return false; }
    for (let node of this.nodes) {
      if (node.id === id) {
        return true;
      }
    }
    return false;
  }

  public getNewNodeId(): string {
    if (this.lastNodeIdNumberAssigned === null) {
      this.lastNodeIdNumberAssigned = 1;
      return "" + this.lastNodeIdNumberAssigned;
    } else {
      return "" + ++this.lastNodeIdNumberAssigned
    }
  }
};

/** Class representing a graph of nodes */
export class Graph {
  nodes: GraphMemberNode[];
  nodeCount: number;

  constructor() {
    this.nodes = [];
    this.nodeCount = this.nodes.length;
  }

  /** Notifies all nodes to remove a neighbor which was removed
   * from this graph.
   */
  private _removeNeighbors(node: GraphNode) {
    for (let gmn of this.nodes) {
      if (gmn.node.isExistingNeighbor(node, this)) {
        gmn.node.removeNeighbor(node, this);
      }
    }
  }

  /** Returns true if the specified GraphNode exists in the graph */
  isNodeInGraph(node: GraphNode): boolean {
    if (this.nodes.length === 0) { return false; }
    return this.nodes.some(gmn => gmn.node === node);
  }

  /** Adds a GraphNode to this graph.
   * Returns undefined if successful and throws an error otherwise.
   */
  addNode(
    node: GraphNode,
    location?: GraphMemberLoc
  ): void {
    if (this.isNodeInGraph(node)) {
      throw new Error("Node is already part of this graph.");
    }
    this.nodes.push({
      node: node,
      location: location
    });
    if (node.graph !== this) { node.addToGraph(this); }
  }

  /** Removes a GraphNode from this graph.
   * Returns undefined if successful and throws an error otherwise.
   */
  removeNode(node: GraphNode): void {
    if (!this.isNodeInGraph(node)) {
      throw new Error("Node is not part of this graph.");
    }

    const nodeIndex = this.nodes.findIndex(gmn => {
      return gmn.node === node;
    });

    this.nodes.splice(nodeIndex, 1);
    this._removeNeighbors(node);

    if (node.graph === this) { node.removeFromGraph(this); }
  }

  getNodeLocation(node: GraphNode) : GraphMemberLoc {
    if (!this.isNodeInGraph(node)) {
      throw new Error("Node is not part of this graph.");
    }

    const gmn = this.nodes.find(gmn => {
      return gmn.node === node;
    });

    return gmn.location;
  }
}

/** Class representing a node that may or may not be in a graph
 * Constructor takes an ID (optional), graph to be added to (optional) and
 * a set of neighbor nodes [GraphNeighbor[]] (optional)
 */
export class GraphNode {
  id: string;
  graph: Graph | null;
  graphNeighbors: GraphNeighbor[];

  constructor(id?: string, graph?: Graph, graphNeighbors?: GraphNeighbor[]) {
    this.id = this._validateAndReturnId(id);
    const nodeManager = NodeManager.getInstance();
    nodeManager.addNode(this);
    this.graph = null;
    if (graph !== undefined) { this.addToGraph(graph); };
    this.graphNeighbors = graphNeighbors === undefined ? [] : graphNeighbors;
  }


  /** Returns true if the GraphNeighbor is valid for this graph */
  private _isValidGraphNeighbor(graph: Graph) : boolean {
    return (
      this.graph !== null &&
      graph === this.graph
    );
  }

  /** Validates a GraphNode with the specified ID isn't already part of a graph
   * and returns the graph if that is the case. Throws error if already part of
   * the provided graph.
   */
  private _validateAndReturnGraph(graph: Graph): Graph {
    if (graph.isNodeInGraph(this)) {
      throw new Error("Node is already part of graph.");
    }
    return graph;
  }

  /** Validates the request ID is available and returns it if so. Throws an
   *  error otherwise.
   */
  private _validateAndReturnId(id: string | undefined): string {
    const nodeManager = NodeManager.getInstance();
    if (id !== undefined) {
      if (nodeManager.isNodeIdTaken(id)) {
        throw new Error("Node with specified ID already exists.");
      }
      return id;
    }
    return nodeManager.getNewNodeId();
  }

  /** Internal function to remove all neighbors when removed from a graph
   * Throws an error if a specific neighbor is provided and doesn't exist
   */
  private _removeAllNeighbors() : void {
    this.graphNeighbors = [];
  }

  /** Adds this GraphNode to a graph.
   * Returns the undefined if successful.
   * Returns error if already part of the graph or otherwise unable to add.
   */
  addToGraph(graph: Graph) : void {
    if (this.graph === graph) { throw new Error("Already part of that graph."); }
    this.graph = graph;
    if (!graph.isNodeInGraph(this)) {
      graph.addNode(
        this,
      );
    }
  }

  /** Removes this GraphNode from a graph.
   * Returns undefined if successful.
   * Returns error if the GraphNode is not part of the graph.
   */
  removeFromGraph(graph: Graph) : void {
    if (this.graph !== graph) { throw new Error("This GraphNode is not part of that graph."); }
    this.graph = null;
    if (graph.isNodeInGraph(this)) { graph.removeNode(this); }
    this._removeAllNeighbors();
  }

  /** Returns true or false based on whether the provided neighbor
   * is already a neighbor of this.graphNeighbors.
   */
  isExistingNeighbor(node: GraphNode, graph: Graph): boolean {
    if (this.graphNeighbors === null) { return false; }
    for (let existingNeighbor of this.graphNeighbors) {
      if (
        node === existingNeighbor.node &&
        graph === existingNeighbor.graph
      ) {
        return true;
      }
    }
    return false;
  }

  /** Adds a new GraphNeighbor to this GraphNode.
   * If GraphNode is already a neighbor, throws error
   * If not, adds as a neighbor and returns undefined.
   */
  addNeighbor(neighbor: GraphNeighbor): void {
    if (this.isExistingNeighbor(neighbor.node, neighbor.graph)) {
      throw new Error(
        `GraphNode is already a neighbor. To update an existing neighbor
        relationship, using updateNeighbor().`
      );
    } else if (!this._isValidGraphNeighbor(neighbor.graph)) {
      throw new Error(
        'This GraphNode and proposed neighbor are not part of the same graph.'
      );
    }
    this.graphNeighbors.push(neighbor);
  }

  /** Removes a GraphNeighbor from this GraphNode.
   * Does not remove any existing GraphNeighbor relationship from the neighbor.
   * Returns undefined if successful and throws error otherwise.
   */
  removeNeighbor(node: GraphNode, graph: Graph): void {
    if (!this.isExistingNeighbor(node, graph) || this.graphNeighbors === null) {
      throw new Error(
        `GraphNode is not an existing neighbor.`
      );
    }
    const existingNeighborIndex = this.graphNeighbors.findIndex(n => {
      return node === n.node && graph === n.graph;
    });
    this.graphNeighbors.splice(existingNeighborIndex, 1);
  }

  /** Updates a GraphNeighbor in this GraphNode with a matching node ID and graph.
   * Returns undefined if successful and throws error otherwise.
   */
  updateNeighbor(neighbor: GraphNeighbor): void {
    if (
      !this.isExistingNeighbor(neighbor.node, neighbor.graph) ||
      this.graphNeighbors === null
    ) {
      throw new Error(
        `GraphNode is not an existing neighbor.`
      );
    }
    const existingNeighborIndex = this.graphNeighbors.findIndex(n => {
      return neighbor.node === n.node && neighbor.graph === n.graph;
    });
    this.graphNeighbors[existingNeighborIndex] = neighbor;
  }
}
