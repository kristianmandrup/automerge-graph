import {
  DocMutator,
} from './doc-mutator'

export function createGraphDoc(options: any) {
  return new GraphDoc(options)
}

export class GraphDoc {
  label: string
  g: any
  mutator: DocMutator

  constructor(options: any = {}) {
    const {
      label
    } = options
    this.mutator = new DocMutator(options)
    this.label = label || 'Automerge Graph'
    this.merge(this.initialGraph)
  }

  get initialGraph() {
    return {
      label: this.label,
      nodes: [],
      edges: []
    }
  }

  merge(graph: any) {
    this.mutator.merge(this.g, graph)
    return this
  }

  addNode(data: any) {
    this.mutator.addNode(this.g, data)
    return this
  }

  updateNode(data: any) {
    this.mutator.updateNode(this.g, data)
    return this
  }

  replaceNode(data: any) {
    this.mutator.replaceNode(this.g, data)
    return this
  }

  removeNode(id: string) {
    this.mutator.removeNode(this.g, id)
    return this
  }

  addEdge(data: any) {
    this.mutator.addEdge(this.g, data)
    return this
  }

  updateEdge(data: any) {
    this.mutator.updateEdge(this.g, data)
    return this
  }

  removeEdge(id: string) {
    this.mutator.removeEdge(this.g, id)
    return this
  }
}

