import {
  createCommitter
} from '../../src/committer'
import {
  createAutomergeGraph
} from '../../src/automerge-graph'

describe('Committer', () => {
  describe('Node API', () => {
    const autoGraph = createAutomergeGraph()
    let action: any
    const doc = autoGraph.doc

    let committer: any

    describe('addNode', () => {
      beforeEach(() => {
        action = {
          name: 'addNode',
          id: 'x',
          value: {
            say: 'hello'
          }
        }
        committer = createCommitter(doc, action)
      })

      it('creates callback', () => {
        const cb = committer.addNode()
        expect(typeof cb).toBe('function')
      })
    })

    describe('updateNode', () => {
      beforeEach(() => {
        action = {
          name: 'updateNode',
          id: 'x',
          value: {
            say: 'hi'
          }
        }
        committer = createCommitter(doc, action)
      })

      it('creates callback', () => {
        const cb = committer.updateNode()
        expect(typeof cb).toBe('function')
      })
    })

    describe('replaceNode', () => {
      beforeEach(() => {
        action = {
          name: 'replaceNode',
          id: 'x',
          value: {
            say: 'bye'
          }
        }
        committer = createCommitter(doc, action)
      })

      it('creates callback', () => {
        const cb = committer.replaceNode()
        expect(typeof cb).toBe('function')
      })
    })

    describe('removeNode', () => {
      beforeEach(() => {
        action = {
          name: 'removeNode',
          id: 'x',
        }
        committer = createCommitter(doc, action)
      })

      it('creates callback', () => {
        const cb = committer.removeNode()
        expect(typeof cb).toBe('function')
      })
    })
  })
})
