import {
  INodeMutator
} from './interfaces'

import {
  Mutator
} from './mutator'

export class NodeMutator extends Mutator implements INodeMutator {
  constructor(options: any = {}) {
    super(options)
  }

  get last() {
    return this.gdm.last
  }

  /**
   * Find node index by ID
   * @param doc
   * @param id
   */
  findNodeIndexById(doc: any, id: string): number {
    const nodes = this.nodesOf(doc)
    return nodes.findIndex((node: any) => node[this.nodeIDKey] === id)
  }

  /**
   * Signal error on duplicate node id
   * @param doc
   * @param id
   */
  errIfDuplicateNodeId(doc: any, id: string) {
    if (this.hasDuplicateNodeId(doc, id)) {
      this.duplicateIdError('Node id is duplicate', { id, type: 'node' })
    }
  }

  /**
   * Determine if node id is a duplicate
   * @param doc
   * @param id
   */
  hasDuplicateNodeId(doc: any, id: string) {
    return this.collectionIds(doc, this.nodesOf(doc), 'node').includes(id)
  }

  /**
   * Try to find node index by ID, if not found signal error
   * @param doc
   * @param id
   * @param message
   */
  errIfNodeIndexNotFound(doc: any, id: string, message?: string) {
    message = message || `Node not found in graph: ${id}`
    const index = this.findNodeIndexById(doc, id)
    return index ? index : this.error(message)
  }

  /**
   * Create a new node
   * @param id
   * @param value
   */
  createNode(id: string, value: any) {
    return Object.assign(value, {
      id
    })
  }

  /**
   * Clone a node
   * @param node
   */
  cloneNode(node: any) {
    return this._cloneObj(node)
  }

  /**
   * Assign data to node
   * @param node
   * @param data
   */
  setNodeData(node: any, data: any) {
    return Object.assign(node, data)
  }

  /**
   * Adds a node to document
   * @param doc
   * @param data
   */
  addNode(doc: any, data: any) {
    const {
      id,
      value
    } = data
    const node = this.createNode(id, value)
    this.errIfDuplicateNodeId(doc, id)
    const nodes = this.nodesOf(doc)
    nodes.push(node)
    this.last.node.added = node
    this.last.node.affected = node
    return this
  }

  /**
   * Update a node in the document
   * @param doc
   * @param data
   */
  updateNode(doc: any, data: any) {
    const {
      id,
      value
    } = data
    delete value.id
    const nodeToUpdate = this.findNodeById(doc, id)
    this.setNodeData(nodeToUpdate, value)

    this.last.node.updated = nodeToUpdate
    this.last.node.affected = nodeToUpdate
    return this
  }

  /**
   * Replace a node in the document
   * @param doc
   * @param data
   */
  replaceNode(doc: any, data: any) {
    const {
      id,
      value
    } = data
    delete value.id
    const index = this.findNodeIndexById(doc, id)
    const nodes = this.nodesOf(doc)
    nodes[index] = value
    const node = nodes[index]
    this.last.node.replaced = node
    this.last.node.affected = node
    return this
  }

  /**
   * Remove a node from document
   * @param doc
   * @param id
   */
  removeNode(doc: any, id: string) {
    const index = this.errIfNodeIndexNotFound(doc, id, `Node to remove not found in graph: ${id}`) || -1
    if (index < 0) return

    const nodes = this.nodesOf(doc)
    // clone
    const nodeToRemove = this.cloneNode(nodes[index])

    nodes.splice(index, 1)
    this.last.node.removed = nodeToRemove
    this.last.node.affected = nodeToRemove
    return this
  }
}
