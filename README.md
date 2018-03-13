# Automerge graph

[automerge](https://github.com/automerge/automerge) for graphs, using [graphlib](https://github.com/dagrejs/graphlib) via [graphlib-json-graph](https://github.com/jsongraph/graphlib-json-graph)

## Disclaimer

Entiely untested. Please try it out and report bugs or help write the test suite in [jest]()

## Graphlib specification

See the [graphlib specification](https://github.com/jsongraph/json-graph-specification#graphs-object) and [JSON graph format](http://jsongraphformat.info/) specs.

## API

```js
import {
  createAutomergeGraph
} from 'automerge-graph'

const autoGraph = createAutomergeGraph({
  immutable: true
})
  .addNode('person:kristian', {
    name: 'kristian',
    age: 42
  })
  .commit('add node: kristian')

  .addNode('person:javier', {
    name: 'javier',
    age: 35
  })
  .commit('add node: javier')

  .addEdge({
    // override auto-generated id
    // id: 'kristian->javier',
    from: 'person:kristian',
    to: 'person:javier',
    directed: true
  })
  .commit('add edge: kristian -> javier')

    // use auto-generated id convention
  const friendsId = edgeId({
      from: 'person:kristian',
      to: 'person:javier'
    })


  autoGraph.updateEdge({
    id: friendsId,
    to: 'person:cindy' // throws error, since no such node exists
  })

  .removeEdge(friendsId)
  .commit('remove edge: kristian -> javier')

  .removeNode('person:javier')
  .commit('remove node: javier')

  .removeNode('person:kristian')
  .commit('remove node: kristian')
```

Each of these actions will result in an `automerge` commit

```js
const autoGraph = createAutomergeGraph({
    immutable: true,
    autoMessage: true
  })
  .addNode('person:kristian', {
    name: 'kristian',
    age: 42
  })
  .commit()

  .addNode({
    // alternative signature, passing id as key
    id: 'person:javier',
    name: 'javier',
    age: 35
  })
  .commit()

// Will commit using the following auto-generated messages

// => `added node: person:kristian`
// => `added node: person:javier`

// The other peers should see these commit messages as their underlying graph is updated
```

A user on anoter peer node (such as via [MPL](https://github.com/automerge/mpl)) can then receive automerge graph updates as JSON updates, that can be re-assembled back into a graphlib via [graphlib-json-graph]((https://github.com/jsongraph/graphlib-json-graph))

The foreign peer user should be able to further make updates to the unerlying automerge document via the same AutoGraph API:

```js
// remote peer graph updates (on automerge doc)
autoGraph
  .updateNode('person:javier', {
    job: 'web developer'
  })
  .commit()

  .replaceNode('person:javier', {
    name: 'javier',
    age: 36
    // will implicitly delete the job key since not part of the new node
  })
  .commit()

// Will commit using the following auto-generated messages

// => `updated node: person:javier`
// => `replaced node: person:javier`

// The other peers should see these commit messages as their underlying graph is updated
```

In the future we might make it possible to queue up multiple actions that can be commited as a batch of actions on a document.

## Graphlib API gateway

The graphlib API is available via `autoGraph.graph.toGraph`

```js
autoGraph.graph.toGraph.nodes()
```

A few delegation shorthands are currently available to get all `nodes` and `edges`.
Currently these methods are performed lazily, ie. only when called.

```js
autoGraph.graph.nodes()
// ...
autoGraph.graph.edges()
```

We will likely set up a more convenient mode/setting to re-generate the graph on each action (JSON update).

## Customized messages

In order to customize the messages you currently need to extend the `Committer` with your own custom action commit logic, such as:

```js
  updateEdge(options: any) {
    options = this.normalizeOpts(options)
    const label = this.edgeLabel(options)
    this.autoGeneratedMessage = `updated edge: ${label}`
    return (doc: any) => {
      this.mutator.updateEdge(doc, options)
    }
  }
```

Alternatively you can override the `autoGenerateMessage` method to translate or re-format the message to suit your preference.

```js
  autoGenerateMessage() {
    return this.translate(this.autoGeneratedMessage)
  }
```

You should then subclass and override the `createCommitter(action)` method of `AutoMergeGraph` class to create an instance of your own `Committer` subclass.

```js
  createCommitter(action: any) {
    createMyOwnCommitter(this.doc, action, this.committerOpts)
  }
```

We will likely redesign this to make it easier to customize in a future release. Let us know if this is a high priority.

## Graphlib

See [Graphlib specs](https://github.com/dagrejs/graphlib/wiki)

## Author

Kristian Mandrup

## License

MIT
