import {
  GraphDocMutator,
  createGraphDocMutator
} from '../../src/graph-doc-mutator'

describe('DocMutator', () => {
  describe('create', () => {
    describe('createrGraphDocMutator', () => {
      it('creates instance', () => {
        const mutator = createGraphDocMutator()
        expect(mutator).toBeDefined()
      })
    })

    describe('construct', () => {
      it('creates instance', () => {
        const mutator = new GraphDocMutator()
        expect(mutator).toBeDefined()
        expect(mutator.logger).toBeDefined()
      })
    })
  })
})
