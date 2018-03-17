import { Mutator } from './mutator';
import { IEdgeMutator } from './interfaces';
import {
  isStr,
  edgeId
} from './utils'

export class EdgeMutator extends Mutator implements IEdgeMutator {
  itemType: string = 'edge'

  constructor(options: any = {}) {
    super(options)
  }

  get support() {
    return this.gdm.support
  }

  /**
   * last actions
   */
  get last() {
    return this.gdm.last
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
   * Determine if edge id is a duplicate
   * @param doc
   * @param id
   */
  hasDuplicateEdgeId(doc: any, id: string) {
    return this.collectionIds(doc, this.edgesOf(doc), 'edge').includes(id)
  }

  /**
   * Signal error on duplicate edge id
   * @param doc
   * @param id
   */
  errIfDuplicateEdgeId(doc: any, id: string) {
    if (this.hasDuplicateEdgeId(doc, id)) {
      this.duplicateIdError('Edge id is duplicate', { id, type: 'edge' })
    }
  }



  /**
   * Get edges collection of document
   * @param doc
   */
  edgesOf(doc: any) {
    return doc[this.keys.edges]
  }

  /**
   * Clone an edge
   * @param edge
   */
  cloneEdge(edge: any) {
    this._cloneObj(edge)
  }

  /**
   * The edge ID key
   */
  get edgeIDKey() {
    return this.keys.edge.id
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
   * Calulate edge ID form an edge
   * @param edge
   */
  edgeId(edge: any) {
    return edgeId(edge, this.error)
  }


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
   * Group edges by ID.
   * Can be used to detect if multiple instances of same edge after sync
   * @param doc
   */
  groupEdgesById(doc: any) {
    this.groupById(doc, this.edgesOf(doc), 'edge')
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
   * Set edge ID to new re-calculated edge id if ID was always auto-calculated
   * @param edge
   */
  setEdgeId(edge: any, options: any) {
    const { idWasAutoGen, id } = options
    edge.id = idWasAutoGen && !isStr(id) ? this.edgeId(edge) : edge.id
  }

  /**
   * Detect if current edge ID matches ID calculated from edge properties
   * @param edge
   */
  detectIfEdgeIdWasGenerated(edge: any) {
    return edge.id === this.edgeId(edge)
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

    this.errIfDuplicateEdgeId(doc, id)

    edge.id = id

    this.errIfNodeNotFound(doc, source, `Invalid source node: ${source}`)
    this.errIfNodeNotFound(doc, target, `Invalid target node: ${target}`)

    const edges = this.edgesOf(doc)
    const $edge = {}
    const edgeToAdd = this.setEdge($edge, edge)
    edges.push(edgeToAdd)

    const action = 'added'
    this.addToHistory(doc, edgeToAdd, { action })
    return this
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
    const idWasAutoGen = this.detectIfEdgeIdWasGenerated(edgeToUpdate)

    if (source) {
      this.errIfNodeNotFound(doc, source, `Invalid source node: ${source}`)
      this.setEdgeSource(edgeToUpdate, source)
    }
    if (target) {
      this.errIfNodeNotFound(doc, target, `Invalid target node: ${target}`)
      this.setEdgeSource(edgeToUpdate, target)
    }

    // TODO: update id if was auto-generated
    this.setEdgeId(edgeToUpdate, { idWasAutoGen, id: config.id })
    const edgeUpdated = this.findEdgeById(doc, id)

    const action = 'updated'
    this.addToHistory(doc, {
      updated: edgeToUpdate,
      with: edgeUpdated
    }, { action })
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

    const action = 'removed'
    this.addToHistory(doc, edgeToRemove, { action })

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
}
