import {
  BaseGraph
} from '../base'

import * as toGraph from 'graphlib-json-graph'

export function createGraphlibDoc(options?: any) {
  return new GraphlibDoc(options)
}

export class GraphlibDoc extends BaseGraph {
  constructor(options: any = {}) {
    options.layout = 'graphlib'
    super(options)
  }

  get initialGraph() {
    return Object.assign(super.initialGraph, {
      graph: {
        label: this.label,
        nodes: [],
        edges: []
      }
    })
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
}

