# Automerge graph

[automerge](https://github.com/automerge/automerge) for graphs.

Basic support for generic graph libs, including:

- [graphlib](https://github.com/dagrejs/graphlib) via [graphlib-json-graph](https://github.com/jsongraph/graphlib-json-graph)
- [ngraph](https://github.com/anvaka/ngraph.graph)

You should be able to support most graph libs, simply by adding a key layout specific to that graph engine. By default, `AutomergeGraph` will use `NGraph`.

## Disclaimer

Please try it out and report bugs or help improve the test suite, written for use with [jest](https://facebook.github.io/jest/)

## API

### Node API

- `addNode`
- `updateNode`
- `replaceNode`
- `removeNode`

### Edge API

- `addEdge`
- `updateEdge`
- `removeEdge`

## API usage example

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

  // alternatively pass all args in single object arg
  .addNode({
    id: 'person:javier',
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

  // alternatively remove via object arg
  .removeNode({id: 'person:javier'})
  .commit('remove node: javier')

  // convenient reference to previous actions/nodes/edges
  // using grouped history
  .removeNode(autoGraph.last.node.updated.with)
  .commit('remove node: kristian')
  // (optionally) clear up action history before next batch of actions
  .clearHistory()
```

Each of these actions will result in an `automerge` commit.

## Auto-message

The API supports auto commit messaging

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

## Settings

To enable or disable special modes or settings, pass an `enable` object as an option whith your settings.

You can pass an `autoCommit` (true|false) option to automatically control if each action is to use an auto-generated commit message.

Note that `autoCommit` is now turned on by default and must be disabled `autoCommit: false` to take back control of your own commit messages.

Another setting `remoteSync`controls whether AutoGraph forces you to sync every action with remote peers. It is enabled by default and enforces that every graph action is followed by a commit.

Example settings:

```js
createAutoGraph({
  enable: {
    autoCommit: false,
    remoteSync: false
  }
})
```

## Graph "hydration" on remote peers

A user on another peer node (f.ex via [MPL](https://github.com/automerge/mpl)) can receive automerge graph updates as JSON updates. These updates can be re-materialized (also known as *hydrated* in front-end speak) back into a graph in memory.

- [graphlib-json-graph]((https://github.com/jsongraph/graphlib-json-graph))
- [ngraph.fromjson](https://github.com/anvaka/ngraph.fromjson)

The remote peer user can make updates to the underlying automerge document via the same AutoGraph API, in this example using the `autoCommit` feature.

```js
// remote peer graph updates (on automerge doc)
const autoGraph = createAutoGraph({
  autoCommit: true
})

autoGraph
  .updateNode('person:javier', {
    job: 'web developer'
  })
  .replaceNode('person:javier', {
    name: 'javier',
    age: 36
    // will implicitly delete the job key since not part of the new node
  })

// Will commit using the following auto-generated messages

// => `updated node: person:javier`
// => `replaced node: person:javier`

// The other peers should see these commit messages as their underlying graph is updated
```

In the future we might make it possible to queue up multiple actions that can be commited as a batch of actions on a document.

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

## Design

The AutoMerge graph can be assigned a graph API with an adapter that operates on the internal graph data (list of `nodes` and `edges` each containining object) using a `GraphDocMutator` instance. You can customize the `GraphDocMutator` by subclassing, or by passing factory methods `createEdgeMutator(options)` or `createNodeMutator(options)` to create the mutators to handle mutation of each respectively.

Graph API calls on the main `AutoGraph` instance such as `autoGraph.addNode(...)` will result in an action being sent to `automerge` which will create and return a new `Committer` instance for that action. The `committer` can then be used to commit the action (or auto-commit if configured in this mode).

The main `commit` method of the `Committer` looks like this:

```js
commit(message?: string) {
  message = message || this.autoGenerateMessage()
  if (!message) {
    this.error('Missing or invalid commit message')
  }

  Automerge.change(this.doc, message, this.createCb())
  if (this.autoCommit) {
    this.commit(message)
  }
  return this.initiator || this
}
```

The `createCb` method creates the callback required by automerge, which will update the underlying JSON like document structure managed by automerge.

```js
createCb() {
  return this[this.name]()
}

addNode(data?: any) {
  data = data || this.data
  this.autoGeneratedMessage = `added node: ${data.id}`
  return (doc: any) => {
    this.mutator.addNode(doc, data)
  }
}
```

Each method such as addNode performs the mutation using the same `GraphDocMutator` instance used by the graph adapter.

## Undo/Redo

The underlying `doc` document may contain a history of `done` actions with their inverse `undo` action.

If an action is undone, the `undo` of the stored action is executed and the action is popped and pushed onto the `undo` list where it can now be executed as `redo`. If another regular action is performed in the meantime, the `redo` action is lost (ie. `undo` list is erased).

For more see [Command Pattern](https://en.wikipedia.org/wiki/Command_pattern)

```js

{
  'do': {
    action: 'addNode',
    data: {
      // ...
    }
  },
  'undo': {
    action: 'removeNode',
    data: {
      // ...
    }
  }
}
```

Note: Undo/Redo logic is not yet implemented, only the underlying lists and actions to make it possible.

## NGraph

- [ngraph](https://github.com/anvaka?utf8=%E2%9C%93&tab=repositories&q=ngraph&type=&language=)
- [ngraph.graph](https://github.com/anvaka/ngraph.graph)
- [ngraph.path](https://github.com/anvaka/ngraph.path)
- [ngraph.tojson](https://github.com/anvaka/ngraph.tojson)
- [ngraph.fromjson](https://github.com/anvaka/ngraph.fromjson)

## Graphlib

- [Graphlib specs](https://github.com/dagrejs/graphlib/wiki)
- [graphlib specification](https://github.com/jsongraph/json-graph-specification#graphs-object) and - - [JSON graph format](http://jsongraphformat.info/) specs.

## Custom graph libs and key layouts

The `DocMutator` (document mutation engine) has built-in support for `graphlib` and `ngraph` via pre-defined key layouts:

```js
const keyLayouts = {
  graphlib: {
    nodes: 'nodes',
    edges: 'edges',
    edge: {
      source: 'source',
      target: 'target'
    }
  },
  ngraph: {
    nodes: 'nodes',
    edges: 'links',
    edge: {
      source: 'fromId',
      target: 'toId'
    }
  }
}
```

To support a custom graph lib, you can pass in a `layouts` option with your own maps and a `layout` option to point to the layout to use.

```js
options = {
  layouts: {
    myGraphLib: {
      // keys
    }
  },
  layout: 'myGraphLib'
}
```

Alternatively directly pass a `keys` option with the keys layout to use.

```js
options = {
  keys: {
    nodes: '$nodes',
    edges: '$edges',
    node: {
      id: '$id'
      data: '$data'
    },
    edge: {
      id: '$id',
      source: '$from',
      target: '$to',
      data: '$data'
    }
  }
}
```

This key layout assumes the following document structure:

```js
{
  $nodes: [{
    $id: 'x',
    $data: {
      // node data
    }
  },
  // more nodes
  ],
  $edges: [{
    $from: 'x',
    $to: 'y',
    $data: {
      // edge data
    }
  }
  // more edges
  ]
}
```

Note: If you leave out assigning a `data` key, data will be merged with the node or edge in question and not reside under a special key. This merge strategy is used by *graphlib*.

## Author

[Kristian Mandrup](https://github.com/kristianmandrup)

## License

MIT
