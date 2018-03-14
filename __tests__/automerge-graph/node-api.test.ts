import {
  AutomergeGraph
} from '../../src/automerge-graph'

describe('AutomergeGraph', () => {
  const options = {
    immutable: true
  }

  let autoGraph: AutomergeGraph
  beforeEach(() => {
    autoGraph = new AutomergeGraph(options)
  })


  describe('addNode', () => {
    const id = 'x'
    const value = {
      say: 'hello'
    }

    describe('id, value args', () => {
      it('creates a node', () => {
        const act = autoGraph.addNode(id, value)
        expect(act).toBeDefined()
      })
    })
    describe('data obj arg', () => {
      it('creates a node', () => {
        const act = autoGraph.addNode({ id, value })
        expect(act).toBeDefined()
      })
    })
    describe('invalid data obj arg', () => {
      it('throws', () => {
        const doAct = () => autoGraph.addNode({ value })
        expect(doAct).toThrow()
      })
    })
  })

  // update
  describe('updateNode', () => {
    const id = 'x'
    const value = {
      say: 'hello'
    }

    describe('id, value args', () => {
      it('updates a node', () => {
        const act = autoGraph.updateNode(id, value)
        expect(act).toBeDefined()
      })
    })
    describe('data obj arg', () => {
      it('updates a node', () => {
        const act = autoGraph.updateNode({ id, value })
        expect(act).toBeDefined()
      })
    })
    describe('invalid data obj arg', () => {
      it('throws', () => {
        const doAct = () => autoGraph.updateNode({ value })
        expect(doAct).toThrow()
      })
    })
  })



  // replace
  describe('replaceNode', () => {
    const id = 'x'
    const value = {
      say: 'hi'
    }
    describe('id, value args', () => {
      it('replaces a node', () => {
        const act = autoGraph.replaceNode(id, value)
        expect(act).toBeDefined()
      })
    })
    describe('data obj arg', () => {
      it('replaces a node', () => {
        const act = autoGraph.replaceNode({ id, value })
        expect(act).toBeDefined()
      })
    })

    describe('invalid data obj arg', () => {
      it('throws', () => {
        const doAct = () => autoGraph.replaceNode({ value })
        expect(doAct).toThrow()
      })
    })
  })

  // remove
  describe('removeNode', () => {
    const id = 'x'
    describe('id', () => {
      it('removes a node', () => {
        const act = autoGraph.removeNode(id)
        expect(act).toBeDefined()
      })
    })
  })
})

