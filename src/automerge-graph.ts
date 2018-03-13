import {
  GraphDoc
} from './graph-doc'
import {
  createDoc
} from './create-doc'
import {
  createCommitter
} from './committer'

export function createAutomergeGraph(options: any = {}) {
  return new AutomergeGraph(options)
}

export class AutomergeGraph {
  label: string
  graph: GraphDoc
  doc: any
  committerOpts: any
  options: any

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

  addNode(id: string, value: any) {
    this.graph.addNode({ id, value })
    return this.doAction({
      name: 'addNode',
      id,
      value
    })
  }

  updateNode(id: string, value: any) {
    this.graph.updateNode({ id, value })
    return this.doAction({
      name: 'updateNode',
      id,
      value
    })
  }

  replaceNode(id: string, value: any) {
    this.graph.replaceNode({ id, value })
    return this.doAction({
      name: 'replaceNode',
      id,
      value
    })
  }

  removeNode(id: string) {
    this.graph.removeNode(id)
    return this.doAction({
      name: 'removeNode',
      id
    })
  }

  // edge

  addEdge(data: any) {
    this.graph.addEdge(data)
    return this.doAction({
      name: 'addEdge',
    }, data)
  }

  updateEdge(data: any) {
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
