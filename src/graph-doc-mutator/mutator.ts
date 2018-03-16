import {
  INotifier,
  Notifier
} from './notifier'
import { IGraphDocMutator } from '.';

import {
  isStr
} from './utils'

export abstract class Mutator {
  notifier: INotifier
  options: any
  keys: any
  gdm: IGraphDocMutator

  constructor(options: any) {
    this.options = options
    this.notifier = this.createNotifier(options)
    this.keys = {}
  }

  init(gdm: IGraphDocMutator) {
    this.gdm = gdm
  }

  /**
   * Factory to create notifier
   * @param options
   */
  createNotifier(options: any) {
    return new Notifier(options)
  }

  log(msg: string, data?: any) {
    this.notifier.log(msg, data)
  }

  warn(msg: string, data?: any) {
    this.notifier.warn(msg, data)
  }

  error(msg: string, data?: any) {
    this.notifier.error(msg, data)
  }

  /**
   * Group a collection of nodes or edges by ID in order to determine duplicates
   * @param doc
   * @param collection
   * @param type
   */
  groupById(doc: any, collection: any, type?: string) {
    return collection.reduce((acc: any, item: any) => {
      const id = this.getId(item, type)
      acc[id] = acc[id] || []
      acc[id].push(item)
      return acc
    })
  }

  /**
   *
   * @param id
   * @param method
   */
  validateId(id: string, method: string) {
    if (!isStr(id)) this.error('${method}: invalid source id', { id })
  }

  get nodeIDKey() {
    return this.gdm.nodeIDKey
  }

  /**
   * Get nodes collection of document
   * @param doc
   */
  nodesOf(doc: any) {
    return doc[this.keys.nodes]
  }

  /**
   * Find node by ID
   * @param doc
   * @param id
   */
  findNodeById(doc: any, id: string) {
    const nodes = this.nodesOf(doc)
    return nodes.find((node: any) => node[this.nodeIDKey] === id)
  }

  /**
   * Try to find node by ID, if not found signal error
   * @param doc
   * @param id
   * @param message
   */
  errIfNodeNotFound(doc: any, id: string, message?: string) {
    message = message || `Node not found in graph: ${id}`
    const found = this.findNodeById(doc, id)
    return found ? found : this.error(message)
  }

  /**
   * Detect type of object, either edge or node
   * @param item
   */
  detectType(item: any) {
    const sameIdKey = this.keys.edge.id === this.keys.node.id

    const edgeKeys = Object.keys(this.keys.edge).filter(key => !(key === 'id' && sameIdKey))
    return edgeKeys.find(key => item[key]) ? 'edge' : 'node'
  }

  /**
   * Get ID of an edge or node
   * @param item
   * @param type
   */
  getId(item: any, type?: string) {
    type = type ? type : this.detectType(item)
    const idKey = this.keys[type].id
    return item[idKey]
  }

  /**
   * Get IDs of collection (nodes or edges)
   * @param doc
   * @param collection
   * @param type
   */
  collectionIds(doc: any, collection: any, type?: string) {
    return collection.map((item: any) => {
      return this.getId(item, type)
    })
  }
  /**
   * Clone an object
   * @param obj
   */
  _cloneObj(obj: any) {
    return Object.assign({}, obj)
  }

  duplicateIdError(msg: string, data: any) {
    this.warn(msg, data)
  }
}
