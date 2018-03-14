import {
  createAutomergeGraph,
  AutomergeGraph
} from '../../src/automerge-graph'

describe('AutomergeGraph', () => {
  describe('create', () => {
    describe('createAutomergeGraph', () => {
      it('creates instance', () => {
        const autoGraph = createAutomergeGraph()
        expect(autoGraph).toBeDefined()
      })
    })

    describe('construct', () => {
      it('creates instance', () => {
        const autoGraph = new AutomergeGraph()
        expect(autoGraph).toBeDefined()
        expect(autoGraph.label).toBe('autograph')
        expect(autoGraph.doc).toBeDefined()
        expect(autoGraph.graph).toBeDefined()
        expect(autoGraph.committerOpts).toBeDefined()
        expect(autoGraph.logger).toBeDefined()
      })
    })

    describe('construct w options', () => {
      const options = {
        immutable: true
      }

      let autoGraph: AutomergeGraph
      beforeEach(() => {
        autoGraph = new AutomergeGraph(options)
      })

      it('creates immutable instance', () => {

        expect(autoGraph).toBeDefined()
        expect(autoGraph.label).toBe('autograph')
      })
    })
  })
})
