export const keyLayouts = {
  graphlib: {
    nodes: 'nodes',
    edges: 'edges',
    node: {
      id: 'id'
    },
    edge: {
      id: 'id',
      source: 'source',
      target: 'target',
    }
  },
  ngraph: {
    nodes: 'nodes',
    edges: 'links',
    node: {
      id: 'id',
      data: 'data'
    },
    edge: {
      id: 'id',
      source: 'fromId',
      target: 'toId',
      data: 'data'
    }
  }
}
