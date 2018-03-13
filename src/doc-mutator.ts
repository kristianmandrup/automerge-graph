interface ILogger {
  log: Function
}

export function createDocMutator(options: any) {
  return new DocMutator(options)
}

export function edgeId(edge: any) {
  const {
    directed,
    source,
    target
  } = edge
  return directed ? `${source}->${target}` : `${source}<->${target}`
}


export class DocMutator {
  logger: ILogger

  constructor(options: any = {}) {
    this.logger = options.logger || console
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

  addNode(doc: any, data: any) {
    const {
      id,
      value
    } = data
    const node = Object.assign(value, {
      id
    })
    doc.nodes.push(node)
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
    return this
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
      edgeToUpdate.target = target
    }
    return this
  }

  edgeId(edge: any) {
    return edgeId(edge)
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

  errIfEdgeNotFound(doc: any, id: string, message?: string) {
    message = message || `Edge not found in graph: ${id}`
    const found = this.findEdgeById(doc, id)
    return found ? found : this.error(message)
  }

  removeNode(doc: any, id: string) {
    if (!doc.nodes.find((node: any) => node.id === id)) {
      this.error(`Node not found in graph: ${id}`)
    }
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
    return this
  }
}
