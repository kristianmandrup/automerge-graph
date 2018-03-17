import {
  // GraphDocMutator,
  createGraphDocMutator
} from '../../graph-doc-mutator'

export interface IGraph {
  addNode(data: any): IGraph
  updateNode(data: any): IGraph
  replaceNode(data: any): IGraph
  removeNode(id: string): IGraph

  // edge API

  addEdge(data: any): IGraph
  updateEdge(data: any): IGraph
  removeEdge(id: string): IGraph
}

export abstract class BaseGraph {
  label: string
  _g: any = {}
  mutator: any
  options: any

  constructor(options: any = {}) {
    this.init(options)
  }

  init(options: any = {}) {
    if (options === this.options) return
    this.options = options
    const {
      label
    } = options
    this.mutator = options.mutator || this.createMutator(options)
    this.label = label || 'Automerge Graph'
    this.merge(this.initialGraph, this._g)
  }

  createMutator(options: any) {
    return createGraphDocMutator(options)
  }

  get initialGraph() {
    return this.history
  }

  get history() {
    return {
      actions: {
        done: [],
        undo: []
      }
    }
  }


  get g() {
    return this._g.graph
  }

  toGraph() {
    throw new Error('toGraph: Not yet implemented')
  }

  nodes() {
    throw new Error('nodes: Not yet implemented')
    // return []
  }

  edges() {
    throw new Error('edges: Not yet implemented')
    // return []
  }

  merge(graph: any, into?: any) {
    this.mutator.merge(this.g || into, graph)
    return this
  }

  addNode(data: any) {
    this.mutator.addNode(this.g, data)
    return this
  }

  updateNode(data: any) {
    this.mutator.updateNode(this.g, data)
    return this
  }

  replaceNode(data: any) {
    this.mutator.replaceNode(this.g, data)
    return this
  }

  removeNode(id: string) {
    this.mutator.removeNode(this.g, id)
    return this
  }

  // edge API

  addEdge(data: any) {
    this.mutator.addEdge(this.g, data)
    return this
  }

  updateEdge(data: any) {
    this.mutator.updateEdge(this.g, data)
    return this
  }

  removeEdge(id: string) {
    this.mutator.removeEdge(this.g, id)
    return this
  }
}

