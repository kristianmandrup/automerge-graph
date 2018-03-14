import {
  createNGraphDoc
} from '../../../src/adapters/ngraph'

function clone(obj: object) {
  return Object.assign({}, obj)
}
describe('GraphDoc', () => {
  describe('created', () => {
    const id = 'x-y'
    const source = 'x'
    const target = 'y'
    const newTarget = 'a'
    // const newSource = 'b'

    const pointer = {
      source,
      target
    }

    let gdoc: any
    beforeEach(() => {
      gdoc = createNGraphDoc()
    })

    describe('addEdge', () => {
      it('adds a new edge to doc', () => {
        const edge = {
          id,
          source,
          target
        }

        const doc = gdoc.addEdge(edge)
        expect(doc.mutator.last.edge.added).toBe(edge)
      })
    })

    describe('updateEdge', () => {
      it('updates edge to new target', () => {
        const edge = {
          id,
          source,
          target: newTarget
        }

        const doc = gdoc.addEdge(edge)
        expect(doc.mutator.last.edge.updated).toBe(edge)
      })
    })

    describe('removeEdge', () => {
      it('removed edge from edges', () => {
        const edgeToRemove = gdoc.mutator.findEdgeById(gdoc.doc, id)
        const clonedEdge = clone(edgeToRemove)

        const doc = gdoc.removeEdge(id)
        expect(doc.mutator.last.edge.removed).toBe(clonedEdge)
      })
    })
  })
})
