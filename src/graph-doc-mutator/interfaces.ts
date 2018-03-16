/**
 * The main API that any GraphDocMutator must implement
 */
export interface IGraphDocMutator {
  addNode(doc: any, data: any): any
  updateNode(doc: any, data: any): any
  replaceNode(doc: any, data: any): any
  removeNode(doc: any, id: string): any

  addEdge(doc: any, data: any): any
  updateEdge(doc: any, data: any): any
  removeEdge(doc: any, id: string): any

  nodesOf(doc: any): any[]

  nodeIDKey: string
  last: any
  support: any
}

export interface INodeMutator {
  addNode(doc: any, data: any): any
  updateNode(doc: any, data: any): any
  replaceNode(doc: any, data: any): any
  removeNode(doc: any, id: string): any

  findNodeById(doc: any, id: string): any
  findNodeIndexById(doc: any, id: string): number
}

export interface IEdgeMutator {
  addEdge(doc: any, data: any): any
  updateEdge(doc: any, data: any): any
  removeEdge(doc: any, id: string): any
}


export interface IAffect {
  affected?: any
  added?: any
  updated?: any
  replaced?: any
  removed?: any
}

export interface IGraphKeys {
  nodes: string
  edges: string
  node: {
    id: string,
    data?: string
  },
  edge: {
    id: string,
    directed: string,
    source: string,
    target: string,
    data?: string
  }
}

export interface IGraphSupport {
  edgeData: boolean
  directed: boolean
}

