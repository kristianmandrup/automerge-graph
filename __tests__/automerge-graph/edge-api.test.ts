import {
  createAutomergeGraph
} from '../../src/automerge-graph'

describe('AutomergeGraph', () => {
  describe('Edge API', () => {
    let autoGraph: any
    beforeEach(() => {
      autoGraph = createAutomergeGraph()
    })

    const id = 'x-y'
    const source = 'x'
    const target = 'y'

    const data = {
      source,
      target
    }
    const idwData = {
      id,
      source,
      target
    }

    describe('addEdge', () => {
      describe('id, value args', () => {
        it('creates a Edge', () => {
          const act = autoGraph.addEdge(id, data)
          expect(act).toBeDefined()
        })
      })
      describe('data obj arg', () => {
        it('creates a Edge', () => {
          const act = autoGraph.addEdge(idwData)
          expect(act).toBeDefined()
        })
      })
      describe('invalid data obj arg', () => {
        it('throws', () => {
          const doAct = () => autoGraph.addEdge({ target })
          expect(doAct).toThrow()
        })
      })
    })

    // update
    describe('updateEdge', () => {
      describe('id, data args', () => {
        it('updates a Edge', () => {
          const act = autoGraph.updateEdge(id, data)
          expect(act).toBeDefined()
        })
      })
      describe('data obj arg', () => {
        it('updates a Edge', () => {
          const act = autoGraph.updateEdge(idwData)
          expect(act).toBeDefined()
        })
      })
      describe('invalid data obj arg', () => {
        it('throws', () => {
          const doAct = () => autoGraph.updateEdge({ source })
          expect(doAct).toThrow()
        })
      })
    })

    // remove
    describe('removeEdge', () => {
      describe('id', () => {
        it('removes a Edge', () => {
          const act = autoGraph.removeEdge(id)
          expect(act).toBeDefined()
        })
      })
    })
  })
})
