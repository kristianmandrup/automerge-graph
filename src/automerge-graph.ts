import {
  GraphDoc
} from './graph-doc'
import {
  createDoc
} from './create-doc'
import {
  createCommitter
} from './committer'
import * as isObject from 'isobject'

export function createAutomergeGraph(options: any = {}) {
  return new AutomergeGraph(options)
}

function isStr(value: any) {
  return typeof value === 'string'
}

export class AutomergeGraph {
  label: string
  graph: GraphDoc
  doc: any
  committerOpts: any
  options: any
  logger: any

  constructor(options: any = {}) {
    const {
      label
    } = options
    this.options = options
    this.label = label
    this.doc = createDoc(options)
    this.graph = new GraphDoc(options)
    this.committerOpts = Object.assign(options, {
      initiator: this
    })
    this.logger = options.logger || console
  }

  get g() {
    return this.graph.g
  }

  graphNodes() {
    return this.graph.nodes()
  }

  graphEdges() {
    return this.graph.edges()
  }

  get nodes() {
    return this.doc.nodes
  }

  get edges() {
    return this.doc.edges
  }


  log(message: string, data?: any) {
    data ? this.logger.log(message, data) : this.logger.log(message)
  }

  error(message: string, data?: any) {
    this.log(message, data)
    throw new Error(message)
  }

  getData(arg: any, value: any, method: string) {
    if (isStr(arg)) {
      return { id: arg, value }
    }
    if (isObject(arg)) {
      return arg
    }
    this.error(`${method}: Invalid arguments ${arg}, ${value}`)
  }

  createCommitter(action: any) {
    createCommitter(this.doc, action, this.committerOpts)
  }

  doAction(action: any, data?: any) {
    if (data) {
      action = Object.assign(data, action)
    }
    this.createCommitter(action)
    return this
  }

  addNode(id: any, value?: any) {
    const data = this.getData(id, value, 'addNode')
    this.graph.addNode(data)
    return this.doAction({
      name: 'addNode',
    }, data)
  }

  updateNode(id: any, value?: any) {
    const data = this.getData(id, value, 'addNode')
    this.graph.updateNode(data)
    return this.doAction({
      name: 'updateNode',
    }, data)
  }

  replaceNode(id: any, value: any) {
    const data = this.getData(id, value, 'addNode')
    this.graph.replaceNode(data)
    return this.doAction({
      name: 'replaceNode',
    }, data)
  }

  removeNode(id: string) {
    this.graph.removeNode(id)
    return this.doAction({
      name: 'removeNode',
      id
    })
  }

  // edge
  addEdge(id: any, opts?: any) {
    const data = this.getData(id, opts, 'addEdge')
    this.graph.addEdge(data)
    return this.doAction({
      name: 'addEdge',
    }, data)
  }

  updateEdge(id: any, opts?: any) {
    const data = this.getData(id, opts, 'updateEdge')
    this.graph.updateEdge(data)
    return this.doAction({
      name: 'updateEdge'
    }, data)
  }

  removeEdge(id: string) {
    this.graph.updateEdge(id)
    return this.doAction({
      name: 'removeEdge',
      id
    })
  }
}
