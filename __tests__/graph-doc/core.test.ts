import {
  GraphDoc,
  createGraphDoc
} from '../../src/graph-doc'

describe('GraphDoc', () => {
  describe('create', () => {
    describe('createGraphDoc', () => {
      let gdoc: any
      beforeEach(() => {
        gdoc = createGraphDoc()
      })

      const label = 'my graph'

      const initialDoc = {
        graph: {
          label,
          nodes: [],
          edges: []
        }
      }

      it('creates instance', () => {
        expect(gdoc).toBeDefined()
      })

      describe('initialGraph', () => {
        it('creates a graphlib compatible JSON doc', () => {

          const doc = gdoc.initialGraph()
          expect(doc).toEqual(initialDoc)
        })
      })

      describe('g', () => {
        it('gets the graph definition', () => {
          const doc = gdoc.g()
          expect(doc).toEqual(initialDoc.graph)
        })
      })

      describe('toGraph', () => {
        it('converts to a graphlib Graph', () => {
          const graph = gdoc.toGraph()
          expect(graph).toBeDefined()
          // test api
        })
      })

      describe('nodes', () => {
        it('gets the graphlib nodes', () => {
          const nodes = gdoc.nodes
          expect(nodes).toBeDefined()
        })
      })

      describe('edges', () => {
        it('gets the graphlib edges', () => {
          const edges = gdoc.edges
          expect(edges).toBeDefined()
        })
      })

      describe('merge', () => {
        it('merges doc with another doc', () => {
          const merged = gdoc.merge({
            x: 42
          })
          expect(merged.doc.x).toBe(42)
        })
      })
    })
  })
})

