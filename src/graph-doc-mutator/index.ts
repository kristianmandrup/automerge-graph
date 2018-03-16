import {
  NodeMutator
} from './node-mutator'
import {
  EdgeMutator
} from './edge-mutator'

export {
  IGraphDocMutator
} from './interfaces'

export function createGraphDocMutator(options?: any) {
  return new GraphDocMutator(options)
}

import {
  IAffect,
  IGraphKeys,
  IGraphSupport,
  IGraphDocMutator,
  INodeMutator,
  IEdgeMutator
} from './interfaces'

import {
  cleanStrategy,
} from './utils'

import {
  keyLayouts
} from './key-layouts'
import { Mutator } from './mutator';

const defaults = {
  cleanStrategy
}

/**
 * Graph document mutator
 * Generic mutator to mutate the underlying (flat) data structure of a graph
 * Assumes nodes and edges are grouped into (separate) lists
 */
export class GraphDocMutator extends Mutator implements IGraphDocMutator {
  support: IGraphSupport = {
    edgeData: false,
    directed: true
  }

  last: {
    node: IAffect,
    edge: IAffect
  }

  keys: IGraphKeys

  layouts: any = {
    ...keyLayouts,
    default: keyLayouts.ngraph
  }

  nodeMutator: INodeMutator
  edgeMutator: IEdgeMutator

  /**
   * Create the GraphDocMutator with some options
   * @param options
   */
  constructor(options: any = {}) {
    super(options)
    let {
      createNodeMutator,
      createEdgeMutator
    } = options
    createNodeMutator = createNodeMutator || this.createNodeMutator
    createEdgeMutator = createEdgeMutator || this.createEdgeMutator

    this.support = options.support || this.support

    this.nodeMutator = createNodeMutator(options)
    this.edgeMutator = createEdgeMutator(options)
    if (options.layouts) {
      this.layouts = Object.assign(this.layouts, options.layouts || {})
    }

    this.keys = options.keys || this.layouts[options.layout] || this.layouts.default
    this.last = {
      node: {},
      edge: {}
    }
    this.init(this)
  }

  /**
   * Factory to create NodeMutator
   * @param options
   */
  createNodeMutator(options: any) {
    return new NodeMutator(options)
  }

  /**
   * Factory to create NodeMutator
   * @param options
   */
  createEdgeMutator(options: any) {
    return new EdgeMutator(options)
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
   * The node ID key
   */
  get nodeIDKey() {
    return this.keys.node.id
  }

  // EdgeMutator delegation

  /**
   * Add an edge
   * @param doc
   * @param config
   */
  addEdge(doc: any, config: any) {
    return this.edgeMutator.addEdge(doc, config)
  }

  /**
   * Update edge
   * @param doc
   * @param config
   */
  updateEdge(doc: any, config: any) {
    return this.edgeMutator.updateEdge(doc, config)
  }

  /**
   * Remove edge
   * @param doc
   * @param config
   */
  removeEdge(doc: any, config: any) {
    return this.edgeMutator.removeEdge(doc, config)
  }

  // NodeMutator delegation

  /**
   * Find node by ID
   * @param doc
   * @param id
   */
  findNodeById(doc: any, id: string) {
    return this.nodeMutator.findNodeById(doc, id)
  }

  /**
   * Find node index by ID
   * @param doc
   * @param id
   */
  findNodeIndexById(doc: any, id: string) {
    return this.nodeMutator.findNodeIndexById(doc, id)
  }


  /**
   * Update a node in the document
   * @param doc
   * @param data
   */
  updateNode(doc: any, data: any) {
    this.nodeMutator.updateNode(doc, data)
  }

  /**
   * Adds a node to document
   * @param doc
   * @param data
   */
  addNode(doc: any, data: any) {
    this.nodeMutator.addNode(doc, data)
  }

  /**
   * Replace a node in the document
   * @param doc
   * @param data
   */
  replaceNode(doc: any, data: any) {
    this.nodeMutator.replaceNode(doc, data)
  }

  /**
   * Remove a node from document
   * @param doc
   * @param id
   */
  removeNode(doc: any, id: string) {
    this.nodeMutator.removeNode(doc, id)
  }
}
