import {
  createGraphDoc
} from '../../src/graph-doc'

function clone(obj: object) {
  return Object.assign({}, obj)
}

function create(id: string, value: any) {
  const dataArg = {
    id,
    value
  }
  const data = Object.assign(value, {
    id
  })
  return {
    data,
    dataArg
  }
}

describe('GraphDoc', () => {
  describe('created', () => {
    const id = 'x-y'
    const values = {
      initial: {
        x: 42
      },
      update: {
        a: 1
      },
      replace: {
        z: 7
      }
    }

    let gdoc: any
    beforeEach(() => {
      gdoc = createGraphDoc()
    })

    describe('addNode', () => {
      it('adds a new node to doc', () => {
        const node = create(id, values.initial)
        const doc = gdoc.addNode(node)
        expect(doc.mutator.last.node.added).toEqual(node)
      })
    })

    describe('updateNode', () => {
      let doc: any
      let node: any
      beforeAll(() => {
        node = create(id, values.update)
        doc = gdoc.updateNode(node)
      })

      const $node = gdoc.mutator.findNodeById(gdoc.doc, id)
      const clonedNode = clone($node)

      it('is not equal to update value', () => {
        expect(doc.mutator.last.node.updated).not.toEqual(node)
      })

      it('is equal to update value merged with original value', () => {
        const mergedNode = Object.assign(node, clonedNode)
        expect(doc.mutator.last.node.updated).toEqual(mergedNode)
      })
    })

    describe('replaceNode', () => {
      let doc: any
      let node: any
      beforeAll(() => {
        node = create(id, values.update)
        doc = gdoc.replaceNode(node)
      })

      it('is equal to update value', () => {
        expect(doc.mutator.last.node.replaced).toEqual(node)
      })
    })

    describe('removeNode', () => {
      it('removed node from nodes', () => {
        const nodeToRemove = gdoc.mutator.findNodeById(gdoc.doc, id)
        const clonedNode = clone(nodeToRemove)

        const doc = gdoc.removeNode(id)
        expect(doc.mutator.last.node.removed).toBe(clonedNode)
      })
    })
  })
})
