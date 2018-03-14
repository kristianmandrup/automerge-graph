import {
  BaseGraph
} from '../base'

// import * as toJson from 'ngraph.tojson'
import * as fromJson from 'ngraph.fromjson'

export function createNGraphDoc(options?: any) {
  return new NGraphDoc(options)
}

export class NGraphDoc extends BaseGraph {
  constructor(options: any = {}) {
    options.layout = 'ngraph'
    super(options)
  }

  get initialGraph() {
    return Object.assign(super.initialGraph, {
      nodes: [],
      links: []
    })
  }

  get g() {
    return this._g
  }

  toGraph() {
    return fromJson(this.g)
  }

  nodes() {
    return this.toGraph().nodes()
  }

  edges() {
    return this.toGraph().edges()
  }
}

