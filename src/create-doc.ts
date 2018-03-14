import {
  Automerge
} from './_imports'

export function createDoc(options: any = {}) {
  const {
    immutable
  } = options
  const method = immutable ? 'initImmutable' : 'init'
  return Automerge[method]()
}
