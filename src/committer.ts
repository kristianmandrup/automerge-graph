import {
  Automerge
} from './_imports'

import {
  IGraphDocMutator,
  GraphDocMutator
} from './graph-doc-mutator'

export function createCommitter(doc: any, action: any, initiator?: any) {
  return new Committer(doc, action, initiator)
}

export class Committer {
  doc: any
  action: any
  name: string
  data: any
  mutator: IGraphDocMutator
  initiator: any
  autoGeneratedMessage: string
  autoMessage: boolean = false
  wasCommitted: boolean

  constructor(doc: any, action: any, options: any = {}) {
    const {
      initiator,
      autoMessage,
      autoCommit
    } = options

    this.onCommit = options.onCommit ? options.onCommit : this.onCommit
    this.doc = doc
    this.action = action
    this.name = action.name
    this.data = action.data
    this.mutator = new GraphDocMutator()
    this.initiator = initiator
    this.autoCommit = autoCommit
    this.autoMessage = autoMessage || autoCommit
  }

  error(msg: string, data?: any) {
    if (!this.initiator.error) return
    this.initiator.error(msg, data)
  }

  onCommit(commitData: any) {
  }

  commit(message?: string) {
    if (this.wasCommitted) return
    message = message || this.autoGenerateMessage()
    if (!message) {
      this.error('Missing or invalid commit message')
    }
    const commitData = { name: this.name, data: this.data, message }
    this.onCommit(commitData)
    Automerge.change(this.doc, message, this.createCb())
    this.wasCommitted = true
    return this.initiator || this
  }

  createCb() {
    return this[this.name]()
  }

  addNode(data?: any) {
    data = data || this.data
    this.autoGeneratedMessage = `added node: ${data.id}`
    return (doc: any) => {
      this.mutator.addNode(doc, data)
    }
  }

  updateNode(data?: any) {
    data = data || this.data
    this.autoGeneratedMessage = `updated node: ${data.id}`
    return (doc: any) => {
      this.mutator.updateNode(doc, data)
    }
  }

  replaceNode(data?: any) {
    data = data || this.data
    this.autoGeneratedMessage = `replaced node: ${data.id}`
    return (doc: any) => {
      this.mutator.replaceNode(doc, data)
    }
  }

  autoGenerateMessage() {
    return this.autoGeneratedMessage
  }

  removeNode(data?: any) {
    data = data || this.data
    this.autoGeneratedMessage = `removed node: ${data.id}`
    return (doc: any) => {
      this.mutator.removeNode(doc, data.id)
    }
  }

  edgeLabel(data: any) {
    let {
      id,
      source,
      target,
      directed
    } = data
    const arrow = directed ? '=>' : '<=>'
    return `${id} points ${source} ${arrow} ${target}`
  }

  // such as: from: 'x' to: 'y' or source: 'x' target: 'y'
  addEdge(data?: any) {
    data = data || this.data
    data = this.normalizeOpts(data)
    const label = this.edgeLabel(data)
    this.autoGeneratedMessage = `added edge: ${label}`
    return (doc: any) => {
      this.mutator.addEdge(doc, data)
    }
  }

  normalizeOpts(options: any) {
    let {
      id,
      source,
      target,
      from,
      to,
      directed
    } = options
    target = target || to
    source = source || from
    return {
      id,
      source,
      target,
      directed
    }
  }

  updateEdge(data?: any) {
    data = data || this.data
    data = this.normalizeOpts(data)
    const label = this.edgeLabel(data)
    this.autoGeneratedMessage = `updated edge: ${label}`
    return (doc: any) => {
      this.mutator.updateEdge(doc, data)
    }
  }

  // such as:
  //   from: 'x' to: 'y'
  //   source: 'x' target: 'y'
  //   id: 'my-edge'
  removeEdge(data?: any) {
    data = data || this.data
    data = this.normalizeOpts(data)
    const label = this.edgeLabel(data)
    this.autoGeneratedMessage = `removed edge: ${label}`

    return (doc: any) => {
      this.mutator.removeEdge(doc, data)
    }
  }
}
