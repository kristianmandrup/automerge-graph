import {
  createCommitter
} from '../../src/committer'
import {
  createAutomergeGraph
} from '../../src/automerge-graph'

describe('Committer', () => {
  describe('Edge API', () => {
    const autoGraph = createAutomergeGraph()
    let action: any
    const doc = autoGraph.doc

    let committer: any

    const id = 'x-y'
    const source = 'x'
    const target = 'y'
    const newTarget = 'a'

    const data = {
      id,
      source,
      target
    }

    describe('addEdge', () => {

      beforeEach(() => {
        action = {
          name: 'addEdge',
          id,
          source: 'x',
          target: 'y'
        }
        committer = createCommitter(doc, action)
      })

      it('creates callback', () => {
        const cb = committer.addEdge(data)
        expect(typeof cb).toBe('function')
      })
    })

    describe('updateEdge', () => {
      beforeEach(() => {
        action = {
          name: 'updateEdge',
          id,
          source,
          target: newTarget
        }
        committer = createCommitter(doc, action)
      })

      it('creates callback', () => {
        const cb = committer.updateNode()
        expect(typeof cb).toBe('function')
      })
    })

    describe('removeEdge', () => {
      beforeEach(() => {
        action = {
          name: 'removeEdge',
          id
        }
        committer = createCommitter(doc, action)
      })

      it('creates callback', () => {
        const cb = committer.removeEdge()
        expect(typeof cb).toBe('function')
      })
    })
  })
})
