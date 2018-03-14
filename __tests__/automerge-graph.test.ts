import {
  createAutomergeGraph,
  AutomergeGraph
} from '../src/automerge-graph'

describe('AutomergeGraph', () => {
  describe('create', () => {
    describe('createAutomergeGraph', () => {
      it('creates instance', () => {
        const autoGraph = createAutomergeGraph()
        expect(autoGraph).toBeDefined()
      })
    })

    describe('construct', () => {
      it('creates instance', () => {
        const autoGraph = new AutomergeGraph()
        expect(autoGraph).toBeDefined()
        expect(autoGraph.label).toBe('autograph')
        expect(autoGraph.doc).toBeDefined()
        expect(autoGraph.graph).toBeDefined()
        expect(autoGraph.committerOpts).toBeDefined()
        expect(autoGraph.logger).toBeDefined()
      })
    })

    describe('construct w options', () => {
      const options = {
        immutable: true
      }

      let autoGraph: AutomergeGraph
      beforeEach(() => {
        autoGraph = new AutomergeGraph(options)
      })

      it('creates immutable instance', () => {

        expect(autoGraph).toBeDefined()
        expect(autoGraph.label).toBe('autograph')
      })

      describe('g', () => {
        it('returns the graph definition', () => {
          expect(autoGraph.g).toEqual({
            label: 'x',
            nodes: [],
            edges: [],
          })
        })
      })

      describe('graphNodes', () => {
        it('returns the graphlib nodes', () => {
          expect(autoGraph.graphNodes()).toBeDefined()
        })
      })

      describe('graphEdges', () => {
        it('returns the graphlib edges', () => {
          expect(autoGraph.graphEdges).toBeDefined()
        })
      })


      describe('docNodes', () => {
        it('returns the doc edges', () => {
          expect(autoGraph.docNodes).toBeDefined()
        })
      })


      describe('docEdges', () => {
        it('returns the doc edges', () => {
          expect(autoGraph.docEdges).toBeDefined()
        })
      })

      describe('validated', () => {
        it('does not validate data object on non xxNode method', () => {
          const value = {
            type: 'person'
          }
          const data = autoGraph.validated({ value }, 'xNodex')
          expect(data).toBeDefined()
        })

        it('throws on data object with invalid id for xxNode method', () => {
          const id = 42
          const value = {
            type: 'person'
          }
          const data = autoGraph.validated({ id, value }, 'xxNode')
          expect(data).toBeDefined()
        })

        it('throws on data object with missing id for xxNode method', () => {
          const value = {
            type: 'person'
          }
          const data = autoGraph.validated({ value }, 'xxNode')
          expect(data).toBeDefined()
        })
      })

      describe('getData', () => {
        it('creates data object', () => {
          const id = 'kris'
          const value = {
            type: 'person'
          }
          const data = autoGraph.getData(id, value, 'x')
          expect(data).toBeDefined()
        })

        it('returns valid data object untouched', () => {
          const id = 'kris'
          const value = {
            type: 'person'
          }
          const data = autoGraph.getData(id, value, 'x')
          expect(data).toBeDefined()
        })

        it('throws on invalid data object', () => {
          const value = {
            type: 'person'
          }
          const createData = () => autoGraph.getData({ value }, 'x')
          expect(createData).toThrow()
        })
      })

      describe('createCommitter', () => {
        const action = {
          name: 'addNode',
          id: 'x',
          value: {
            say: 'hello'
          }
        }
        it('creates a Committer', () => {
          const committer = autoGraph.createCommitter(action)
          expect(committer).toBeDefined()
        })
      })

      describe('doAction', () => {
        const action = {
          name: 'addNode',
          id: 'x',
          value: {
            say: 'hello'
          }
        }
        it('creates an action Committer', () => {
          const act = autoGraph.doAction(action)
          expect(act).toBeDefined()
        })
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
          it('creates a node', () => {
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
          it('updates a node', () => {
            const doAct = () => autoGraph.updateNode({ value })
            expect(doAct).toThrow()
          })
        })
      })
    })
  })
})
