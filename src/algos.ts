import * as AppGraph from "./graph";

type NodeIdType = string | null;
type WeightType = number | null;

export class DijkstraAlgo {
  private appGraph : AppGraph.Graph;
  private startNode : AppGraph.GraphMemberNode;
  private endNode : AppGraph.GraphMemberNode;
  private hashGraph : Map<NodeIdType, Map<NodeIdType, number>>;
  private costsHash : Map<NodeIdType, WeightType>;
  private cheapestParentsHash : Map<NodeIdType, NodeIdType>
  private processedNodeIds : Set<NodeIdType> = new Set();

  constructor(graph: AppGraph.Graph,
    start: AppGraph.GraphMemberNode,
    end: AppGraph.GraphMemberNode
  ) {
    this.appGraph = graph;
    this.startNode = start;
    this.endNode = end;
    this.hashGraph = new Map();
    this.costsHash = new Map();
    this.cheapestParentsHash = new Map();
    this.processedNodeIds = new Set();
    this.generateHashGraph();
    this.generateCostsHash();
    this.generateCheapestParentsHash();
  }

  /** Runs the algorithm */
  run() {
    let nodeId = this.findLowestCostNodeId();
    while(nodeId !== null) {
      console.log(`Algo is evaluating lowest cost node: ${nodeId}`);
      const cost = this.costsHash.get(nodeId);
      const neighbors = this.hashGraph.get(nodeId);
      for(let neighborId of neighbors.keys()) {
        const newCost = cost + neighbors.get(neighborId);
        if (this.costsHash.get(neighborId) === null || this.costsHash.get(neighborId) > newCost) {
          this.costsHash.set(neighborId, newCost);
          this.cheapestParentsHash.set(neighborId, nodeId)
        }
      }
      this.processedNodeIds.add(nodeId);
      nodeId = this.findLowestCostNodeId();
    }
    console.log('Algo run finished.');
    console.log(`costsHash: ${this.costsHash}`);
    console.log(`cheapestParentsHash: ${this.cheapestParentsHash}`);
  }

  /** Returns the lowest cost nodeId (TBD) */
  private findLowestCostNodeId() : NodeIdType {
    console.log('findLowestCostNodeId() called.')
    let lowestCost : WeightType = null;
    let lowestCostNodeId : NodeIdType = null;
    for (let nodeId of this.costsHash.keys()) {
       const cost = this.costsHash.get(nodeId);
       if (
        (
          lowestCost === null ||
          ( cost !== null && cost < lowestCost)
        ) && !this.processedNodeIds.has(nodeId)
      ) {
        lowestCost = cost;
        lowestCostNodeId = nodeId;
       }
    }
    console.log(`Lowest cost nodeId: ${lowestCostNodeId}`);
    return lowestCostNodeId;
  }

  // generates a hash graph using an app graph
  private generateHashGraph() : void {
    console.log('generateHashGraph() called.')
    for (let gnm of this.appGraph.nodes) {
      console.log(`Evaluating gnm: ${gnm}`);
      const neighbors : Map<string, number> = new Map();
      for (let neighbor of gnm.node.graphNeighbors) {
        neighbors.set(neighbor.node.id, neighbor.edge.weight)
      }
      console.log(`All neighbors added to map: ${neighbors}`);
      this.hashGraph.set(gnm.node.id, neighbors)
    }
    console.log(`Final hash graph created: ${this.hashGraph}`);
  }

  /**
   * generates a hash table of edge weights from starting node to each node
   * in the graph (except for the starting node itself). for all other nodes
   * not connected to the starting node, the weight is set to null
   */
  private generateCostsHash() : void {
    console.log('generateCostsHash() called.')
    for(let gnm of this.appGraph.nodes) {
      const index = this.startNode.node.graphNeighbors.findIndex((node) => gnm.node.id === node.node.id);
      console.log(`Index of the current node ${gnm.node.id} is ${index} as a neighbor of the starting node.`)
      if(gnm.node.id === this.startNode.node.id) { continue; }
      else if(index !== -1) {
        // the currently evaluated GraphNodeMember exists as a neighbor of the starting node
        this.costsHash.set(gnm.node.id, this.startNode.node.graphNeighbors[index].edge.weight);
      } else {
        this.costsHash.set(gnm.node.id, null);
      }
    }
    console.log(`Final costs hash established: ${this.costsHash}`);
  }

  /**
   * generates a hash table for maintaining the parent node which is involved
   * in the cheapest path to a given node from the starting node. if no
   * cheapest parent has been established, the value is null
   */
  private generateCheapestParentsHash() : void  {
    console.log('generateCheapestParentsHash() called.')
    for(let gnm of this.appGraph.nodes) {
      const index = this.startNode.node.graphNeighbors.findIndex((node) => gnm.node.id === node.node.id);
      console.log(`Index of the current node ${gnm.node.id} is ${index} as a neighbor of the starting node.`)
      if(gnm.node.id === this.startNode.node.id) { continue; }
      if(index !== -1) {
        // the currently evaluated GraphNodeMember exists as a neighbor of the starting node
        this.cheapestParentsHash.set(gnm.node.id, this.startNode.node.id);
      } else {
        this.cheapestParentsHash.set(gnm.node.id, null);
      }
    }
    console.log(`Final cheapest parents hash established: ${this.cheapestParentsHash}`);
  }
}