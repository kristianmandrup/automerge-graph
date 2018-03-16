import {
  INotifier,
  Notifier
} from './notifier'
import {
  createDoc
} from './create-doc'
import {
  createCommitter, Committer
} from './committer'
import * as isObject from 'isobject'
import { createNGraphDoc, IGraph } from './adapters';
import * as uuid from 'uuid-v4'

export function createAutoGraph(options: any = {}) {
  return new AutomergeGraph(options)
}

function isStr(value: any) {
  value = value.trim()
  return typeof value === 'string' && value.length > 0
}

export class AutomergeGraph {
  label: string
  doc: any
  notifier: INotifier
  committerOpts: any
  options: any
  logger: any
  graph: IGraph
  enable: {
    autoId: boolean
  }
  actionHistory: any[]
  committer: Committer
  mustCommit: boolean
  autoCommit: boolean

  /**
   * Create the AutomergeGraph instance
   * @param options
   */
  constructor(options: any = {}) {
    const {
      label,
      createGraph // pass your own graph factory
    } = options
    this.options = options
    const createNotifier = options.createNotifier || this.createNotifier
    this.notifier = createNotifier(options)
    this.enable = options.enable || {}
    this.label = label || 'autograph'
    this.doc = createDoc(options)
    const customGraph = createGraph ? createGraph(options) : options.graph
    this.graph = customGraph || this.createDefaultGraph(options)
    this.committerOpts = Object.assign(options, {
      initiator: this
    })
    this.logger = options.logger || console
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

  createDefaultGraph(options: any = {}) {
    return createNGraphDoc(options)
  }

  /**
   *
   * @param id
   */
  isValidId(id: string) {
    return !isStr(id)
  }

  /**
   * Clean string by trimming whitespace at both ends :)
   * @param str
   */
  cleanStr(str: string): string {
    return str.trim()
  }

  /**
   * Validate an id
   * @param id
   * @param method
   */
  validateAndFormatId(id: string, method: string): string {
    return this.cleanStr(this.validateStr(id, method, 'id') || '')
  }

  /**
   * Auto generate ID via uuid-v4 generator
   */
  autoGenerateId() {
    return uuid()
  }

  /**
   * return autogenerated ID if autoId is enabled and id is not set
   * @param id
   */
  idOrGenerate(id: any) {
    return !id && this.enable.autoId ? this.autoGenerateId() : this.cleanStr(id)
  }

  /**
   * Populate data, such as assigning auto-generated ID if not set
   * @param data
   */
  populateData(data: any) {
    data.id = this.idOrGenerate(data.id)
    return data
  }

  /**
   * Validates data used for action
   * @param data
   * @param method
   */
  validated(data: any, method: string): any {
    const isInvalid = (data: any, method: string): boolean => {
      return /Node$/.test(method) && this.isValidId(data.id)
    }

    const errMsg = (id: any, method: string): string => {
      return id ? `${method}: Invalid node id` : `${method}: Missing node id`
    }

    // populate with autogenerated Id for any add method
    if (/^add/.test(method)) {
      data = this.populateData(data)
    }

    return isInvalid(data, method) ? this.error(errMsg(data.id, method), data) : data
  }

  /**
   * Validate a string - signals error if invalid
   * @param id
   * @param method
   * @param varName
   */
  validateStr(id: string, method: string, varName: string) {
    return !isStr(id) ? this.error(`${method}: ${id} must be a string`) : id
  }

  /**
   * Parse and create data arg object from one or more arguments
   * @param arg
   * @param value
   * @param method
   */
  getData(arg: any, value: any, method?: string) {
    method = String(method || value)
    let data: any
    if (isStr(arg)) {
      data = { id: arg, value }
    }
    if (isObject(arg)) {
      data = this.validated(arg, method)
    }
    if (!data || !isStr(data.id)) {
      const msg = value ? `${method}: Invalid argument ${arg}` : `${method}: Invalid arguments ${arg}, ${value}`
      this.error(msg)
    }
    data.id = this.cleanStr(data.id)
    return data
  }

  /**
   * Create a dedicated committer to perform the action via automerge
   * @param action
   */
  createCommitter(action: any) {
    return createCommitter(this.doc, action, this.committerOpts)
  }

  /**
   * create an action object with data
   * @param data
   * @param action
   */
  createAction(data: any, action: any) {
    return Object.assign(data, action)
  }

  /**
   * Perform the action using the (automerge) Committer
   * @param action
   * @param data
   */
  doAction(action: any, data: any = {}) {
    action = this.createAction(data, action)
    this.actionHistory.push(action)
    this.committer = this.createCommitter(action)
    this.mustCommit = true
    if (this.autoCommit) {
      this.commit()
    }
    return this
  }

  get lastAction() {
    return this.actionHistory[this.actionHistory.length - 1]
  }

  /**
   * Commit action with message via Committer
   * @param message
   */
  commit(message?: string) {
    this.committer.commit(message)
    this.mustCommit = false
    return this
  }

  /**
   * Validate if action can be executed or if previous action must first be committed
   * @param method
   */
  validateAction(method: string) {
    if (this.mustCommit) {
      this.error(`Invalid action ${method}. Must commit previous action ${this.lastAction.name} first`)
    }
  }

  /**
   * Add a node to the graph and commit action
   * @param id
   * @param value
   */
  addNode(id: any, value?: any) {
    const name = 'addNode'
    this.validateAction(name)
    const data = this.getData(id, value, name)
    this.graph.addNode(data)
    return this.doAction({
      name,
    }, data)
  }

  /**
   * Update a node in the graph and commit action
   * @param id
   * @param value
   */
  updateNode(id: any, value?: any) {
    const name = 'updateNode'
    this.validateAction(name)
    const data = this.getData(id, value, name)
    this.graph.updateNode(data)
    return this.doAction({
      name,
    }, data)
  }

  /**
   * Replace a node in the graph and commit action
   * @param id
   * @param value
   */
  replaceNode(id: any, value?: any) {
    const name = 'replaceNode'
    this.validateAction(name)
    const data = this.getData(id, value, name)
    this.graph.replaceNode(data)
    return this.doAction({
      name,
    }, data)
  }

  /**
   * Remove a node from the graph and commit action
   * @param id
   */
  removeNode(idArg: any) {
    const name = 'removeNode'
    this.validateAction(name)
    let id = isStr(idArg) ? String(idArg) : String(idArg.id)
    id = this.validateAndFormatId(id, name)
    this.graph.removeNode(id)
    return this.doAction({
      name,
      id
    })
  }

  // edge
  /**
   * Add an edge in the graph and commit action
   * @param id
   * @param opts
   */
  addEdge(id: any, opts?: any) {
    const name = 'addEdge'
    this.validateAction(name)
    const data = this.getData(id, opts, name)
    this.graph.addEdge(data)
    return this.doAction({
      name,
    }, data)
  }

  /**
   * Update an edge in the graph and commit action
   * @param id
   * @param opts
   */
  updateEdge(id: any, opts?: any) {
    const name = 'updateEdge'
    this.validateAction(name)
    const data = this.getData(id, opts, name)
    this.graph.updateEdge(data)
    return this.doAction({
      name
    }, data)
  }

  /**
   * Remove an edge from the graph and commit action
   * @param id
   */
  removeEdge(idArg: any) {
    const name = 'removeEdge'
    this.validateAction(name)
    let id = isStr(idArg) ? String(idArg) : String(idArg.id)
    id = this.validateAndFormatId(id, name)
    this.graph.updateEdge(id)
    return this.doAction({
      name,
      id
    })
  }
}
