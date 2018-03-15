import * as deepmerge from 'deepmerge'
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
    super()
    this.init(this.createOptions(options))
  }

  createOptions(opts: any) {
    return deepmerge(opts, this.options)
  }

  get options() {
    return {
      layout: 'ngraph',
      support: {
        directed: true,
        edgeData: true
      }
    }
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

