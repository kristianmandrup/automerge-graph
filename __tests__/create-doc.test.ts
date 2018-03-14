import {
  createDoc
} from '../src/create-doc'

describe('createDoc', () => {
  describe('no options', () => {
    it('creates an automerge doc', () => {
      const doc = createDoc()
      expect(doc).toBeDefined()
    })
  })

  describe('options: immutable', () => {
    const options = {
      immutable: true
    }
    it('creates an automerge doc', () => {
      const doc = createDoc(options)
      expect(doc).toBeDefined()
    })
  })
})
