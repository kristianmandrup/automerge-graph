import {
  edgeId,
  createGraphDocMutator
} from '../../src/graph-doc-mutator'

describe('edgeId', () => {
  function error(msg: string, data?: any) {
    throw new Error(msg)
  }
  it('throws on invalid edge', () => {
    const edge = {
      source: 42,
    }
    const calcEdge = () => edgeId(edge, error)
    expect(calcEdge).toThrow()
  })

  it('calculates edge Id from valid edge', () => {
    const edge = {
      source: 'x',
      target: 'y'
    }
    const id = edgeId(edge, error)
    expect(typeof id).toBe('string')
    expect(id).toEqual('x<->y')
  })

  it('calculates directed edge Id from valid directed edge', () => {
    const edge = {
      source: 'x',
      target: 'y',
      directed: true
    }
    const id = edgeId(edge, error)
    expect(typeof id).toBe('string')
    expect(id).toEqual('x->y')
  })
})

describe('DocMutator', () => {
  describe('util', () => {
    let mutator: any
    let doc: any
    beforeEach(() => {
      doc = new Object({})
      mutator = createGraphDocMutator()
    })

    describe('merge', () => {
      it('merges documents', () => {
        const merged = mutator.merge(doc, {
          x: 42
        })
        expect(merged.x).toBe(42)
      })
    })

    describe('edgeId', () => {
      function error(msg: string, data?: any) {
        throw new Error(msg)
      }
      it('throws on invalid edge', () => {
        const edge = {
          source: 42,
        }
        const calcEdge = () => mutator.edgeId(edge, error)
        expect(calcEdge).toThrow()
      })

      it('calculates edge Id from valid edge', () => {
        const edge = {
          source: 'x',
          target: 'y'
        }
        const id = mutator.edgeId(edge, error)
        expect(typeof id).toBe('string')
        expect(id).toEqual('x<->y')
      })

      it('calculates directed edge Id from valid directed edge', () => {
        const edge = {
          source: 'x',
          target: 'y',
          directed: true
        }
        const id = mutator.edgeId(edge, error)
        expect(typeof id).toBe('string')
        expect(id).toEqual('x->y')
      })
    })

    describe('findNodeById', () => {
      const id = {
        invalid: {},
        notMatching: 'unknown',
        matching: 'x'
      }
      it('throws on invalid node Id', () => {
        const find = () => mutator.findNodeById(id.invalid)
        expect(find).toThrow()
      })

      it('throws for valid node Id that has no matching node', () => {
        const find = () => mutator.findNodeById(id.notMatching)
        expect(find).toThrow()
      })

      it('finds node for matching node Id', () => {
        const find = () => mutator.findNodeById(id.matching)
        expect(find).not.toThrow()
        const node = find()
        expect(node).toBeDefined()
        expect(node.id).toEqual(id.matching)
      })
    })

    describe('findNodeIndexById', () => {
      const id = {
        invalid: {},
        notMatching: 'unknown',
        matching: 'x'
      }
      it('throws on invalid node Id', () => {
        const find = () => mutator.findNodeIndexById(id.invalid)
        expect(find).toThrow()
      })

      it('throws for valid node Id that has no matching node', () => {
        const find = () => mutator.findNodeIndexById(id.notMatching)
        expect(find).toThrow()
      })

      it('finds node index for matching node Id', () => {
        const find = () => mutator.findNodeIndexById(id.matching)
        expect(find).not.toThrow()
        const index = find()
        expect(typeof index).toBe('number')
        expect(index).toBeGreaterThanOrEqual(0)
      })
    })

    describe('findEdgeById', () => {
      const id = {
        invalid: {},
        notMatching: 'unknown',
        matching: 'x-y'
      }
      it('throws on invalid node Id', () => {
        const find = () => mutator.findEdgeById(id.invalid)
        expect(find).toThrow()
      })

      it('throws for valid node Id that has no matching edge', () => {
        const find = () => mutator.findEdgeById(id.notMatching)
        expect(find).toThrow()
      })

      it('finds node for matching edge Id', () => {
        const find = () => mutator.findEdgeById(id.matching)
        expect(find).not.toThrow()
        const edge = find()
        expect(edge).toBeDefined()
        expect(edge.id).toEqual(id.matching)
      })
    })

    describe('errIfNodeNotFound', () => {

    })

    describe('errIfEdgeNotFound', () => {

    })
  })
})
