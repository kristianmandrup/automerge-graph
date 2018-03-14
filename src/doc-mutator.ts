interface ILogger {
  log: Function
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

export class DocMutator {
  logger: ILogger
  last: {
    node: IAffect,
    edge: IAffect
  }

  constructor(options: any = {}) {
    this.logger = options.logger || console
    this.error = this.error.bind(this)
    this.last = {
      node: {},
      edge: {}
    }
  }

  log(message: string, data?: any) {
    data ? this.logger.log(message, data) : this.logger.log(message)
  }

  error(message: string, data?: any) {
    this.log(message, data)
    throw new Error(message)
  }

  merge(doc: any, data: any) {
    Object.assign(doc, data)
    return this
  }

  edgeId(edge: any) {
    return edgeId(edge, this.error)
  }

  findNodeById(doc: any, id: string) {
    return doc.nodes.find((node: any) => node.id === id)
  }

  findNodeIndexById(doc: any, id: string) {
    return doc.nodes.findIndex((node: any) => node.id === id)
  }

  findEdgeById(doc: any, id: string) {
    return doc.edges.find((edge: any) => edge.id === id)
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

  addNode(doc: any, data: any) {
    const {
      id,
      value
    } = data
    const node = Object.assign(value, {
      id
    })
    doc.nodes.push(node)
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
    doc.nodes[index] = value
    const node = doc.nodes[index]
    this.last.node.replaced = node
    this.last.node.affected = node
    return this
  }

  removeNode(doc: any, id: string) {
    const index = this.errIfNodeIndexNotFound(doc, id, `Node to remove not found in graph: ${id}`)
    // clone
    const nodeToRemove = Object.assign({}, doc.nodes[index])
    doc.nodes.splice(index, 1)
    this.last.node.removed = nodeToRemove
    this.last.node.affected = nodeToRemove
    return this
  }

  // edge

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
      this.error('updateEdge: missing source or target of update to make to edge ${id}', {
        data
      })
    }

    const edgeToUpdate = this.findEdgeById(doc, id)

    if (source) {
      this.errIfNodeNotFound(doc, source, `Invalid source node: ${source}`)
      edgeToUpdate.source = source
    }
    if (target) {
      this.errIfNodeNotFound(doc, target, `Invalid target node: ${target}`)
      this.last.edge = edgeToUpdate
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
      edge = doc.edges.find((edge: any) => edge.source === source && edge.target === target)
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

    doc.edges.push(edge)

    this.last.edge.added = edge
    this.last.edge.affected = edge

    return this
  }
}
