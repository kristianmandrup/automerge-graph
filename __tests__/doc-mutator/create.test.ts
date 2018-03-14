import {
  DocMutator,
  createDocMutator
} from '../../src/doc-mutator'

describe('DocMutator', () => {
  describe('create', () => {
    describe('createDocMutator', () => {
      it('creates instance', () => {
        const mutator = createDocMutator()
        expect(mutator).toBeDefined()
      })
    })

    describe('construct', () => {
      it('creates instance', () => {
        const mutator = new DocMutator()
        expect(mutator).toBeDefined()
        expect(mutator.logger).toBeDefined()
      })
    })
  })
})
