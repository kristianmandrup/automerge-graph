export function isStr(value: any) {
  return typeof value === 'string'
}

/**
 * Function to calculate new edge ID based on edge properties
 * @param edge
 * @param error
 */
export function edgeId(edge: any, error: Function) {
  const {
    directed,
    source,
    target
  } = edge
  if (!source) {
    return error('Missing source', {
      edge
    })
  }
  if (!target) {
    return error('Missing target', {
      edge
    })
  }

  return directed ? `${source}->${target}` : `${source}<->${target}`
}

/**
 * Default clean strategy, removes all but the last item
 * @param items
 */
export function cleanStrategy(items: any[]) {
  return items.slice(-1)
}
