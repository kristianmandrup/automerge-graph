import {
  DocMutator,
} from './doc-mutator'

import * as toGraph from 'graphlib-json-graph'

export function createGraphDoc(options?: any) {
  return new GraphDoc(options)
}

export class GraphDoc {
  label: string
  _g: any = {}
  mutator: DocMutator

  constructor(options: any = {}) {
    const {
      label
    } = options
    this.mutator = new DocMutator(options)
    this.label = label || 'Automerge Graph'
    this.merge(this.initialGraph, this._g)
  }

  get initialGraph() {
    return {
      graph: {
        label: this.label,
        nodes: [],
        edges: []
      }
    }
  }

  get g() {
    return this._g.graph
  }

  toGraph() {
    return toGraph(this.g)
  }

  nodes() {
    return this.toGraph().nodes()
  }

  edges() {
    return this.toGraph().edges()
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

