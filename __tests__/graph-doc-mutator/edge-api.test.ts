import {
  createGraphDocMutator
} from '../../src/graph-doc-mutator'

function clone(obj: object) {
  return Object.assign({}, obj)
}

function create(id: string, data: any = {}) {
  const {
    source,
    target,
    directed
  } = data

  return {
    id,
    source,
    target,
    directed
  }
}

describe('GraphDocMutator', () => {
  describe('Edge API', () => {
    let mutator: any
    let doc: any
    beforeEach(() => {
      doc = new Object({})
      mutator = createGraphDocMutator()
    })

    const id = 'x-y'
    const source = 'x'
    const target = 'y'
    const newTarget = 'a'
    const newSource = 'b'

    const pointer = {
      source,
      target
    }
    describe('addEdge', () => {
      it('adds Edge to Edges in doc', () => {
        const data = create(id, pointer)
        mutator.addEdge(doc, data)
        const { added } = mutator.last.edge
        expect(added).toEqual(data)
      })
    })

    describe('updateEdge', () => {
      const id = 'x'
      const pointer = {
        source: newSource,
        target,
        directed: true
      }

      it('updates Edge in Edges of doc', () => {
        const data = create(id, pointer)
        mutator.updateEdge(doc, data)

        const { updated } = mutator.last.edge
        expect(updated).toEqual(data)
      })
    })

    describe('replaceEdge', () => {
      const pointer = {
        source,
        target: newTarget
      }

      it('replace Edge in Edges of doc', () => {
        const data = create(id, pointer)
        mutator.replaceEdge(doc, data)
        const { replaced } = mutator.last.edge
        expect(replaced).toEqual(data)
      })
    })

    describe('removeEdge', () => {
      const id = 'x'

      it('remove Edge in Edges of doc', () => {
        const edgeToRemove = mutator.findEdgeById(doc, id)
        const clonedEdge = clone(edgeToRemove)

        mutator.removeEdge(doc, id)

        const { removed } = mutator.last.edge
        expect(removed).toEqual(clonedEdge)
      })
    })
  })
})
