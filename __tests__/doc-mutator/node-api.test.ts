import {
  createDocMutator
} from '../../src/doc-mutator'

function clone(obj: object) {
  return Object.assign({}, obj)
}
describe('DocMutator', () => {
  describe('Node API', () => {
    let mutator: any
    let doc: any
    beforeEach(() => {
      doc = new Object({})
      mutator = createDocMutator()
    })

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

    describe('addNode', () => {
      const id = 'x'
      const value = {
        say: 'hi'
      }

      it('adds node to nodes in doc', () => {
        const {
          dataArg,
          data
        } = create(id, value)
        mutator.addNode(doc, dataArg)
        const { added } = mutator.last.node
        expect(added).toEqual(data)
      })
    })

    describe('updateNode', () => {
      const id = 'x'
      const value = {
        say: 'hello :)'
      }

      it('updates node in nodes of doc', () => {
        const {
          dataArg,
          data
        } = create(id, value)

        mutator.updateNode(doc, dataArg)
        const { updated } = mutator.last.node
        expect(updated).toEqual(data)
      })
    })

    describe('replaceNode', () => {
      const id = 'x'
      const value = {
        say: 'hello :)',
        where: 'at home'
      }

      it('replace node in nodes of doc', () => {
        const {
          dataArg,
          data
        } = create(id, value)

        mutator.replaceNode(doc, dataArg)
        const { replaced } = mutator.last.node
        expect(replaced).toEqual(data)
      })
    })

    describe('removeNode', () => {
      const id = 'x'

      it('remove node in nodes of doc', () => {
        const nodeToRemove = mutator.findNodeById(doc, id)
        const clonedNode = clone(nodeToRemove)

        mutator.removeNode(doc, id)

        const { removed } = mutator.last.node
        expect(removed).toEqual(clonedNode)
      })
    })
  })
})
