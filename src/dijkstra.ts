import * as AppGraph from "./graph";
import * as AppUtils from "./utils";

type NodeIdType = string | null;
type WeightType = number | null;

const nodeLoopDelayInMs = 1000;
const algoStepDelayInMs = 500;
const changeCellDelayInMs = 500;

const hashGraphName = 'Hash Graph';
const costsHashName = 'Costs Hash';
const cheapestName = 'Cheapest Parent';

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
    this._generateHashGraph();
    this._generateCostsHash();
    this._generateCheapestParentsHash();
    this._initializeDomElements();
  }

  /** Runs the algorithm */
  async run() {
    let nodeId = this._findLowestCostNodeId();
    while(nodeId !== null) {
      await AppUtils.delay(nodeLoopDelayInMs);
      this._highlightNodeCells(nodeId);
      console.log(`Algo is evaluating node: ${nodeId}. This node is the lowest remaining node cost to the start.`);
      await AppUtils.delay(algoStepDelayInMs);
      const cost = this.costsHash.get(nodeId);
      const neighbors = this.hashGraph.get(nodeId);
      for(let neighborId of neighbors.keys()) {
        console.log(`Algo is evaluating costs associated with neighboring node: ${neighborId}.`)
        await AppUtils.delay(algoStepDelayInMs);
        const newCost = cost + neighbors.get(neighborId);
        console.log(`Total cost from that neighbor to the start is ${newCost}`)
        await AppUtils.delay(algoStepDelayInMs);
        if (this.costsHash.get(neighborId) === null || this.costsHash.get(neighborId) > newCost) {
          console.log(`This route is a cheaper route from that neighbor to the start.`)
          console.log('Updating the cheapest cost from that neighbor to the start.')
          await AppUtils.delay(algoStepDelayInMs);
          this.costsHash.set(neighborId, newCost);
          this._updateCellText(costsHashName, neighborId, newCost.toString());
          console.log(`Updating this node: ${nodeId} to be the parent associated with this cheaper route.`)
          await AppUtils.delay(algoStepDelayInMs);
          this.cheapestParentsHash.set(neighborId, nodeId)
          this._updateCellText(cheapestName, neighborId, nodeId);
        }
      }
      console.log(`Finished evaluating ${nodeId}. Marking it as done.`)
      await AppUtils.delay(algoStepDelayInMs);
      this.processedNodeIds.add(nodeId);
      this._highlightNodeCells(nodeId, true);
      nodeId = this._findLowestCostNodeId();
    }
    console.log('Algo run finished.');
  }

  /** Returns the lowest cost nodeId (TBD) */
  private _findLowestCostNodeId() : NodeIdType {
    console.log('_findLowestCostNodeId() called.')
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
  private _generateHashGraph() : void {
    console.log('_generateHashGraph() called.')
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
  private _generateCostsHash() : void {
    console.log('_generateCostsHash() called.')
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
  private _generateCheapestParentsHash() : void  {
    console.log('_generateCheapestParentsHash() called.')
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

  // initializes the DOM elements for the Dijkstra tables
  private _initializeDomElements() {
    const mapTablesDiv = document.getElementById('dijkstraTables');

    mapTablesDiv.appendChild(this._createTable(this.hashGraph, true, hashGraphName));
    mapTablesDiv.appendChild(this._createTable(this.costsHash, false, costsHashName));
    mapTablesDiv.appendChild(this._createTable(this.cheapestParentsHash, false, cheapestName));
  }

  // creates a table from a map
  private _createTable(map : Map<string, unknown>, isNested = false, name: string = undefined) {
    const table = document.createElement('table');
    table.className = 'tables-table';

    const row = table.insertRow();
    row.className = 'tables-table-header';
    const cellNode = row.insertCell(0);
    const cellCost = row.insertCell(1);
    cellNode.innerText = 'Node ID';
    cellCost.innerText = name === cheapestName ? 'Parent' : 'Cost';

    for (const [key, value] of map) {
        const row = table.insertRow();
        const cell1 = row.insertCell(0);
        const cell2 = row.insertCell(1);
        cell1.innerText = key;
        cell1.id = `${name ? name.toLowerCase().replace(' ','-') : 'children'}-node-${key}`;
        cell2.id = `${name ? name.toLowerCase().replace(' ','-') : 'children'}-cost-${key}`;

        if (isNested && value instanceof Map) {
            cell2.appendChild(this._createTable(value));
        } else {
            cell2.innerText = value === null ? 'null' : value.toString();
        }
    }

    let tableContainer = document.createElement('div');
    if (name) {
      let tableText = document.createElement('div');
      tableText.innerText = name;
      tableContainer.appendChild(tableText);
    }
    tableContainer.appendChild(table);

    return tableContainer;
  }

  private _highlightNodeCells(nodeId: string, reset : boolean = false) : void {
    const cellsToHighlight : HTMLElement[] = [];
    cellsToHighlight.push(document.getElementById(`${hashGraphName.toLowerCase().replace(' ','-')}-node-${nodeId}`));
    cellsToHighlight.push(document.getElementById(`${costsHashName.toLowerCase().replace(' ','-')}-node-${nodeId}`));
    cellsToHighlight.push(document.getElementById(`${cheapestName.toLowerCase().replace(' ','-')}-node-${nodeId}`));
    for(let cell of cellsToHighlight) {
      cell.style.backgroundColor = reset ? '' : '#ffcfc1';
    }
  }

  private async _updateCellText(tableName: string, nodeId: string, text: string) {
    const cell = document.getElementById(`${tableName.toLowerCase().replace(' ','-')}-cost-${nodeId}`);
    cell.innerText = text;
    cell.style.backgroundColor = '#beffd4';
    await AppUtils.delay(changeCellDelayInMs);
    cell.style.backgroundColor = '';
  }
}