function isStr(value: any) {
  return typeof value === 'string'
}

interface ILogger {
  log: Function
}

/**
 * The main API that any GraphDocMutator must implement
 */
export interface IGraphDocMutator {
  addNode(doc: any, data: any): any
  updateNode(doc: any, data: any): any
  replaceNode(doc: any, data: any): any
  removeNode(doc: any, id: string): any

  addEdge(doc: any, data: any): any
  updateEdge(doc: any, data: any): any
  removeEdge(doc: any, id: string): any
}

export function createGraphDocMutator(options?: any) {
  return new GraphDocMutator(options)
}

/**
 * Function to calculate new edge ID based on edge properties
 * @param edge
 * @param error
 */
export function edgeId(edge: any, error: Function) {
  const {
    directed,
    source,
    target
  } = edge
  if (!source) {
    return error('Missing source', {
      edge
    })
  }
  if (!target) {
    return error('Missing target', {
      edge
    })
  }

  return directed ? `${source}->${target}` : `${source}<->${target}`
}

/**
 * Default clean strategy, removes all but the last item
 * @param items
 */
function cleanStrategy(items: any[]) {
  return items.slice(-1)
}

const defaults = {
  cleanStrategy
}

interface IAffect {
  affected?: any
  added?: any
  updated?: any
  replaced?: any
  removed?: any
}

interface IGraphKeys {
  nodes: string
  edges: string
  node: {
    id: string,
    data?: string
  },
  edge: {
    id: string,
    directed: string,
    source: string,
    target: string,
    data?: string
  }
}

const keyLayouts = {
  graphlib: {
    nodes: 'nodes',
    edges: 'edges',
    node: {
      id: 'id'
    },
    edge: {
      id: 'id',
      source: 'source',
      target: 'target',
    }
  },
  ngraph: {
    nodes: 'nodes',
    edges: 'links',
    node: {
      id: 'id',
      data: 'data'
    },
    edge: {
      id: 'id',
      source: 'fromId',
      target: 'toId',
      data: 'data'
    }
  }
}

interface IGraphSupport {
  edgeData: boolean
  directed: boolean
}

/**
 * Graph document mutator
 * Generic mutator to mutate the underlying (flat) data structure of a graph
 * Assumes nodes and edges are grouped into (separate) lists
 */
export class GraphDocMutator {
  support: IGraphSupport = {
    edgeData: false,
    directed: true
  }
  logger: ILogger
  last: {
    node: IAffect,
    edge: IAffect
  }

  keys: IGraphKeys

  layouts: any = {
    ...keyLayouts,
    default: keyLayouts.ngraph
  }

  /**
   * Create the GraphDocMutator with some options
   * @param options
   */
  constructor(options: any = {}) {
    this.logger = options.logger || console
    this.support = options.support || this.support
    this.error = this.error.bind(this)
    if (options.layouts) {
      this.layouts = Object.assign(this.layouts, options.layouts || {})
    }

    this.keys = options.keys || this.layouts[options.layout] || this.layouts.default
    this.last = {
      node: {},
      edge: {}
    }
  }

  /**
   * Log a message with optional data
   * @param message
   * @param data
   */
  log(message: string, data?: any) {
    data ? this.logger.log(message, data) : this.logger.log(message)
  }

  /**
   *
   * @param message
   * @param data
   */
  error(message: string, data?: any) {
    this.log(message, data)
    throw new Error(message)
  }

  /**
   *
   * @param doc
   * @param data
   */
  merge(doc: any, data: any) {
    Object.assign(doc, data)
    return this
  }

  /**
   * Clean a grouped (indexed) structure of potential duplicates using a clean strategy
   * @param grouped
   * @param cleanStrategy
   */
  cleanGrouped(grouped: any, cleanStrategy: Function = defaults.cleanStrategy) {
    const ids = Object.keys(grouped)
    return ids.reduce((acc: any, id: string) => {
      const group = grouped[id] || []
      grouped[id] = group.length > 1 ? cleanStrategy(group) : group
      acc[id] = grouped[id]
      return acc
    }, {})
  }

  /**
   *
   * @param doc
   */
  groupNodesById(doc: any) {
    this.groupById(doc, this.nodesOf(doc), 'node')
  }

  /**
   * Group edges by ID.
   * Can be used to detect if multiple instances of same edge after sync
   * @param doc
   */
  groupEdgesById(doc: any) {
    this.groupById(doc, this.edgesOf(doc), 'edge')
  }

  /**
   * Detect type of object, either edge or node
   * @param item
   */
  detectType(item: any) {
    const sameIdKey = this.keys.edge.id === this.keys.node.id

    const edgeKeys = Object.keys(this.keys.edge).filter(key => !(key === 'id' && sameIdKey))
    return edgeKeys.find(key => item[key]) ? 'edge' : 'node'
  }

  /**
   * Get ID of an edge or node
   * @param item
   * @param type
   */
  getId(item: any, type?: string) {
    type = type ? type : this.detectType(item)
    const idKey = this.keys[type].id
    return item[idKey]
  }

  /**
   * Group a collection of nodes or edges by ID in order to determine duplicates
   * @param doc
   * @param collection
   * @param type
   */
  groupById(doc: any, collection: any, type?: string) {
    return collection.reduce((acc: any, item: any) => {
      const id = this.getId(item, type)
      acc[id] = acc[id] || []
      acc[id].push(item)
      return acc
    })
  }

  /**
   *
   * @param id
   * @param method
   */
  validateId(id: string, method: string) {
    if (!isStr(id)) this.error('${method}: invalid source id', { id })
  }

  /**
   * Calulate edge ID form an edge
   * @param edge
   */
  edgeId(edge: any) {
    return edgeId(edge, this.error)
  }

  /**
   * The node ID key
   */
  get nodeIDKey() {
    return this.keys.node.id
  }

  /**
   * The edge ID key
   */
  get edgeIDKey() {
    return this.keys.edge.id
  }

  /**
   * Find node by ID
   * @param doc
   * @param id
   */
  findNodeById(doc: any, id: string) {
    const nodes = this.nodesOf(doc)
    return nodes.find((node: any) => node[this.nodeIDKey] === id)
  }

  /**
   * Find node index by ID
   * @param doc
   * @param id
   */
  findNodeIndexById(doc: any, id: string) {
    const nodes = this.nodesOf(doc)
    return nodes.findIndex((node: any) => node[this.nodeIDKey] === id)
  }

  /**
   * Find edge by ID
   * @param doc
   * @param id
   */
  findEdgeById(doc: any, id: string) {
    const edges = this.edgesOf(doc)
    return edges.find((edge: any) => edge[this.edgeIDKey] === id)
  }

  /**
   * Try to find node by ID, if not found signal error
   * @param doc
   * @param id
   * @param message
   */
  errIfNodeNotFound(doc: any, id: string, message?: string) {
    message = message || `Node not found in graph: ${id}`
    const found = this.findNodeById(doc, id)
    return found ? found : this.error(message)
  }

  /**
   * Try to find node index by ID, if not found signal error
   * @param doc
   * @param id
   * @param message
   */
  errIfNodeIndexNotFound(doc: any, id: string, message?: string) {
    message = message || `Node not found in graph: ${id}`
    const index = this.findNodeIndexById(doc, id)
    return index ? index : this.error(message)
  }

  /**
   * Try to find edge by ID, if not found signal error
   * @param doc
   * @param id
   * @param message
   */
  errIfEdgeNotFound(doc: any, id: string, message?: string) {
    message = message || `Edge not found in graph: ${id}`
    const found = this.findEdgeById(doc, id)
    return found ? found : this.error(message)
  }

  /**
   * Get nodes collection of document
   * @param doc
   */
  nodesOf(doc: any) {
    return doc[this.keys.nodes]
  }

  /**
   * Get edges collection of document
   * @param doc
   */
  edgesOf(doc: any) {
    return doc[this.keys.edges]
  }

  /**
   * Create a new node
   * @param id
   * @param value
   */
  createNode(id: string, value: any) {
    return Object.assign(value, {
      id
    })
  }

  /**
   * Adds a node to document
   * @param doc
   * @param data
   */
  addNode(doc: any, data: any) {
    const {
      id,
      value
    } = data
    const node = this.createNode(id, value)
    const nodes = this.nodesOf(doc)
    nodes.push(node)
    this.last.node.added = node
    this.last.node.affected = node
    return this
  }

  /**
   * Assign data to node
   * @param node
   * @param data
   */
  setNodeData(node: any, data: any) {
    return Object.assign(node, data)
  }

  /**
   * Update a node in the document
   * @param doc
   * @param data
   */
  updateNode(doc: any, data: any) {
    const {
      id,
      value
    } = data
    delete value.id
    const nodeToUpdate = this.findNodeById(doc, id)
    this.setNodeData(nodeToUpdate, value)

    this.last.node.updated = nodeToUpdate
    this.last.node.affected = nodeToUpdate
    return this
  }

  /**
   * Replace a node in the document
   * @param doc
   * @param data
   */
  replaceNode(doc: any, data: any) {
    const {
      id,
      value
    } = data
    delete value.id
    const index = this.findNodeIndexById(doc, id)
    const nodes = this.nodesOf(doc)
    nodes[index] = value
    const node = nodes[index]
    this.last.node.replaced = node
    this.last.node.affected = node
    return this
  }

  /**
   * Clone an object
   * @param obj
   */
  _cloneObj(obj: any) {
    return Object.assign({}, obj)
  }

  /**
   * Clone a node
   * @param node
   */
  cloneNode(node: any) {
    return this._cloneObj(node)
  }

  /**
   * Clone an edge
   * @param edge
   */
  cloneEdge(edge: any) {
    this._cloneObj(edge)
  }

  /**
   * Remove a node from document
   * @param doc
   * @param id
   */
  removeNode(doc: any, id: string) {
    const index = this.errIfNodeIndexNotFound(doc, id, `Node to remove not found in graph: ${id}`)
    const nodes = this.nodesOf(doc)
    // clone
    const nodeToRemove = this.cloneNode(nodes[index])

    nodes.splice(index, 1)
    this.last.node.removed = nodeToRemove
    this.last.node.affected = nodeToRemove
    return this
  }

  // edge

  /**
   * Set edge data if available and supported by graph library
   * @param edge
   * @param data
   */
  setEdgeData(edge: any, data?: any) {
    if (!this.support.edgeData) return
    if (!data) return
    const dataKey = this.keys.edge.data
    if (dataKey) {
      edge[dataKey] = data
    } else {
      Object.assign(edge, data)
    }
    return edge
  }

  /**
   * Set directed property of edge to indicate direction
   * @param edge
   * @param directed
   */
  setEdgeDirected(edge: any, directed: boolean) {
    edge[this.keys.edge.directed] = !!directed
    return edge
  }

  /**
   * Set properties of edge
   * @param edge
   * @param options
   */
  setEdge(edge: any, options: { source: string, target: string, data?: any, directed?: boolean }) {
    const {
      source,
      target,
      data,
      directed = false
    } = options
    this.setEdgeSource(edge, source)
    this.setEdgeTarget(edge, target)
    this.setEdgeData(edge, data)

    if (this.supportsDirected) {
      this.setEdgeDirected(edge, directed)
    }

    if (!edge.id) {
      edge.id = this.edgeId(edge)
    }
    return edge
  }

  /**
   * Set source of edge
   * @param edge
   * @param id
   */
  setEdgeSource(edge: any, id: string) {
    this.validateId(id, 'setEdgeSource')
    edge[this.keys.edge.source] = id
  }

  /**
   * Set target of edge
   * @param edge
   * @param id
   */
  setEdgeTarget(edge: any, id: string) {
    this.validateId(id, 'setEdgeTarget')
    edge[this.keys.edge.target] = id
  }

  /**
   * Update edge
   * @param doc
   * @param config
   */
  updateEdge(doc: any, config: any) {
    let {
      id,
      from,
      source,
      target,
      to
    } = config
    target = target || to
    source = source || from

    if (!id) {
      this.error('updateEdge: missing id of edge to update', config)
    }

    if (!source && !target) {
      this.error(`updateEdge: missing source or target of update to make to edge ${id}`, config)
    }

    const edgeToUpdate = this.findEdgeById(doc, id)

    if (source) {
      this.errIfNodeNotFound(doc, source, `Invalid source node: ${source}`)
      this.setEdgeSource(edgeToUpdate, source)
    }
    if (target) {
      this.errIfNodeNotFound(doc, target, `Invalid target node: ${target}`)
      this.setEdgeSource(edgeToUpdate, target)
    }
    this.last.edge.updated = edgeToUpdate
    this.last.edge.affected = edgeToUpdate
    return this
  }


  /**
   * Remove edge
   * @param doc
   * @param config
   */
  removeEdge(doc: any, config: any) {
    let {
      id,
      from,
      source,
      target,
      to
    } = config
    target = target || to
    source = source || from

    source && this.errIfNodeNotFound(doc, source, `Invalid source node: ${source}`)
    target && this.errIfNodeNotFound(doc, target, `Invalid target node: ${target}`)

    if (!(id || source && target)) {
      this.error('removeEdge: Invalid arguments', {
        id,
        source,
        target
      })
    }

    function removeValueFromArray(array: any[], value: any) {
      var index = null;

      while ((index = array.indexOf(value)) !== -1)
        array.splice(index, 1);

      return array
    }

    let edge
    if (id) {
      edge = doc.edges.find((edge: any) => edge.id === id)
    } else {
      const keys = {
        source: this.keys.edge.source,
        target: this.keys.edge.target
      }
      edge = doc.edges.find((edge: any) => edge[keys.source] === source && edge[keys.target] === target)
    }
    const edgeToRemove = this.cloneEdge(edge)

    this.last.edge.removed = edgeToRemove
    this.last.edge.affected = edgeToRemove

    removeValueFromArray(doc.edges, edge)

    return this
  }


  /**
   * Create a new edge to add
   * @param config
   */
  createEdgeToAdd(config: any) {
    const { source, target, data } = config
    const $edge = {}
    return this.setEdge($edge, { source, target, data })
  }

  /**
   * Determine if graph supports adding edge data
   */
  get supportsEdgedata() {
    return !!this.support.edgeData
  }

  /**
   * Determine if graph supports directed edges
   */
  get supportsDirected() {
    return !!this.support.directed
  }

  /**
   * Add an edge
   * @param doc
   * @param config
   */
  addEdge(doc: any, config: any) {
    let {
      id,
      from,
      source,
      target,
      to,
      directed,
      data
    } = config

    target = target || to
    source = source || from


    const edge: any = {
      directed,
      source,
      target
    }

    if (this.supportsEdgedata) {
      edge.data = data
    }

    id = id || this.edgeId(edge)
    edge.id = id

    this.errIfNodeNotFound(doc, source, `Invalid source node: ${source}`)
    this.errIfNodeNotFound(doc, target, `Invalid target node: ${target}`)

    const edges = this.edgesOf(doc)
    const $edge = {}
    const edgeToAdd = this.setEdge($edge, edge)
    edges.push(edgeToAdd)

    this.last.edge.added = edge
    this.last.edge.affected = edge

    return this
  }
}
