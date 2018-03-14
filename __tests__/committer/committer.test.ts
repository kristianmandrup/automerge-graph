import {
  createCommitter
} from '../../src/committer'
import {
  createAutomergeGraph
} from '../../src/automerge-graph'

describe('Committer', () => {
  describe('create', () => {
    const autoGraph = createAutomergeGraph()
    describe('createCommitter', () => {
      const doc = autoGraph.doc

      const data = {
        id: 'x',
        value: {
          say: 'hello'
        }
      }

      const action = Object.assign(data, {
        name: 'addNode'
      })

      it('creates it', () => {
        const committer = createCommitter(doc, action)
        expect(committer).toBeDefined()
        expect(committer.doc).toBe(doc)
        expect(committer.action).toBe(action)
        expect(committer.data).toBe(data)
        expect(committer.mutator).toBeDefined()
        expect(committer.autoMessage).toBeFalsy()
        expect(committer.commitHistory).toEqual([])
      })
    })
  })
})
