function isStr(value: any) {
  return typeof value === 'string'
}

interface ILogger {
  log: Function
}

interface IDocMutator {
  addNode(doc: any, data: any): any
  updateNode(doc: any, data: any): any
  replaceNode(doc: any, data: any): any
  removeNode(doc: any, id: string): any

  addEdge(doc: any, data: any): any
  updateEdge(doc: any, data: any): any
  removeEdge(doc: any, id: string): any
}

export function createDocMutator(options?: any) {
  return new DocMutator(options)
}

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
  edge: {
    source: string,
    target: string
  }
}

const keyLayouts = {
  graphlib: {
    nodes: 'nodes',
    edges: 'edges',
    edge: {
      source: 'source',
      target: 'target'
    }
  },
  ngraph: {
    nodes: 'nodes',
    edges: 'links',
    edge: {
      source: 'fromId',
      target: 'toId'
    }
  }
}

export class DocMutator {
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
   *
   * @param options
   */
  constructor(options: any = {}) {
    this.logger = options.logger || console
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
   *
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
   *
   * @param id
   * @param method
   */
  validateId(id: string, method: string) {
    if (!isStr(id)) this.error('${method}: invalid source id', { id })
  }

  edgeId(edge: any) {
    return edgeId(edge, this.error)
  }

  findNodeById(doc: any, id: string) {
    const nodes = this.nodesOf(doc)
    return nodes.find((node: any) => node.id === id)
  }

  findNodeIndexById(doc: any, id: string) {
    const nodes = this.nodesOf(doc)
    return nodes.findIndex((node: any) => node.id === id)
  }

  findEdgeById(doc: any, id: string) {
    const edges = this.edgesOf(doc)
    return edges.find((edge: any) => edge.id === id)
  }

  errIfNodeNotFound(doc: any, id: string, message?: string) {
    message = message || `Node not found in graph: ${id}`
    const found = this.findNodeById(doc, id)
    return found ? found : this.error(message)
  }

  errIfNodeIndexNotFound(doc: any, id: string, message?: string) {
    message = message || `Node not found in graph: ${id}`
    const index = this.findNodeIndexById(doc, id)
    return index ? index : this.error(message)
  }

  errIfEdgeNotFound(doc: any, id: string, message?: string) {
    message = message || `Edge not found in graph: ${id}`
    const found = this.findEdgeById(doc, id)
    return found ? found : this.error(message)
  }

  nodesOf(doc: any) {
    return doc[this.keys.nodes]
  }

  edgesOf(doc: any) {
    return doc[this.keys.edges]
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
    const node = Object.assign(value, {
      id
    })
    const nodes = this.nodesOf(doc)
    nodes.push(node)
    this.last.node.added = node
    this.last.node.affected = node
    return this
  }

  updateNode(doc: any, data: any) {
    const {
      id,
      value
    } = data
    delete value.id
    const nodeToUpdate = this.findNodeById(doc, id)
    Object.assign(nodeToUpdate, value)

    this.last.node.updated = nodeToUpdate
    this.last.node.affected = nodeToUpdate
    return this
  }

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

  removeNode(doc: any, id: string) {
    const index = this.errIfNodeIndexNotFound(doc, id, `Node to remove not found in graph: ${id}`)
    // clone
    const nodes = this.nodesOf(doc)
    const nodeToRemove = Object.assign({}, nodes[index])

    nodes.splice(index, 1)
    this.last.node.removed = nodeToRemove
    this.last.node.affected = nodeToRemove
    return this
  }

  // edge

  setEdge(edge: any, options: { source: string, target: string }) {
    const {
      source,
      target
    } = options
    this.setEdgeSource(edge, source)
    this.setEdgeTarget(edge, target)
  }

  setEdgeSource(edge: any, id: string) {
    this.validateId(id, 'setEdgeSource')
    edge[this.keys.edge.source] = id
  }

  setEdgeTarget(edge: any, id: string) {
    this.validateId(id, 'setEdgeTarget')
    edge[this.keys.edge.target] = id
  }

  updateEdge(doc: any, data: any) {
    let {
      id,
      from,
      source,
      target,
      to
    } = data
    target = target || to
    source = source || from

    if (!id) {
      this.error('updateEdge: missing id of edge to update', {
        data
      })
    }

    if (!source && !target) {
      this.error(`updateEdge: missing source or target of update to make to edge ${id}`, {
        data
      })
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


  removeEdge(doc: any, data: any) {
    let {
      id,
      from,
      source,
      target,
      to
    } = data
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
    const edgeToRemove = Object.assign({}, edge)

    this.last.edge.removed = edgeToRemove
    this.last.edge.affected = edgeToRemove

    removeValueFromArray(doc.edges, edge)

    return this
  }

  addEdge(doc: any, data: any) {
    let {
      id,
      from,
      source,
      target,
      to,
      directed
    } = data

    target = target || to
    source = source || from


    const edge: any = {
      directed,
      source,
      target
    }

    id = id || this.edgeId(edge)
    edge.id = id

    this.errIfNodeNotFound(doc, source, `Invalid source node: ${source}`)
    this.errIfNodeNotFound(doc, target, `Invalid target node: ${target}`)

    const edges = this.edgesOf(doc)
    const edgeToAdd = this.setEdge({}, { source, target })
    edges.push(edgeToAdd)

    this.last.edge.added = edge
    this.last.edge.affected = edge

    return this
  }
}
