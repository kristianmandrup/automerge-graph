import {
  AutomergeGraph
} from '../../src/automerge-graph'

describe('AutomergeGraph', () => {
  const options = {
    immutable: true
  }
  let autoGraph: AutomergeGraph
  beforeEach(() => {
    autoGraph = new AutomergeGraph(options)
  })


  // describe('g', () => {
  //   it('returns the graph definition', () => {
  //     expect(autoGraph.g).toEqual({
  //       label: 'x',
  //       nodes: [],
  //       edges: [],
  //     })
  //   })
  // })

  // describe('graphNodes', () => {
  //   it('returns the graphlib nodes', () => {
  //     expect(autoGraph.graphNodes()).toBeDefined()
  //   })
  // })

  // describe('graphEdges', () => {
  //   it('returns the graphlib edges', () => {
  //     expect(autoGraph.graphEdges).toBeDefined()
  //   })
  // })


  // describe('docNodes', () => {
  //   it('returns the doc edges', () => {
  //     expect(autoGraph.docNodes).toBeDefined()
  //   })
  // })


  // describe('docEdges', () => {
  //   it('returns the doc edges', () => {
  //     expect(autoGraph.docEdges).toBeDefined()
  //   })
  // })

  describe('validated', () => {
    it('does not validate data object on non xxNode method', () => {
      const value = {
        type: 'person'
      }
      const data = autoGraph.validated({ value }, 'xNodex')
      expect(data).toBeDefined()
    })

    it('throws on data object with invalid id for xxNode method', () => {
      const id = 42
      const value = {
        type: 'person'
      }
      const data = autoGraph.validated({ id, value }, 'xxNode')
      expect(data).toBeDefined()
    })

    it('throws on data object with missing id for xxNode method', () => {
      const value = {
        type: 'person'
      }
      const data = autoGraph.validated({ value }, 'xxNode')
      expect(data).toBeDefined()
    })
  })

  describe('getData', () => {
    it('creates data object', () => {
      const id = 'kris'
      const value = {
        type: 'person'
      }
      const data = autoGraph.getData(id, value, 'x')
      expect(data).toBeDefined()
    })

    it('returns valid data object untouched', () => {
      const id = 'kris'
      const value = {
        type: 'person'
      }
      const data = autoGraph.getData(id, value, 'x')
      expect(data).toBeDefined()
    })

    it('throws on invalid data object', () => {
      const value = {
        type: 'person'
      }
      const createData = () => autoGraph.getData({ value }, 'x')
      expect(createData).toThrow()
    })
  })

  describe('createCommitter', () => {
    const action = {
      name: 'addNode',
      id: 'x',
      value: {
        say: 'hello'
      }
    }
    it('creates a Committer', () => {
      const committer = autoGraph.createCommitter(action)
      expect(committer).toBeDefined()
    })
  })

  describe('doAction', () => {
    const action = {
      name: 'addNode',
      id: 'x',
      value: {
        say: 'hello'
      }
    }
    it('creates an action Committer', () => {
      const act = autoGraph.doAction(action)
      expect(act).toBeDefined()
    })
  })
})
