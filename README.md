## parallel-fn

A small utility to prevent certain (perhaps costly) functions from being called in parallel up to a limit.

#### Usage

```js
const parallelWrappedFn = parallelFn(
  taskFn,
  maxParallelism
)
```
taskFn must return a promise and will receive the same context and arguments it is called with


##### Example

```js
const parallelFn = require('parallel-fn')

const taskFn = async function (a, b, c) {
  const result = await someHeavyDatabaseCall(a, b, c)
  // do some work
  const something = result.map(() => ...)
  return something
}

const parallelDbFn = parallelFn(taskFn, 4)

/* elsewhere */

const longList = [1, 2, 3, 4, ... 100]

longList.forEach(async (item) => {
  const result = await parallelDbFn('a', 'b', item)
  console.log(result)
})

```

In the above example all 100 calls will be put into a queue and parallel-fn will ensure that only 4 will be running at any point

#### Installation

```
$ npm install parallel-fn
```

### Running the tests
The tests use async/await so a modern (>= v8.0.0) node version should be used

```bash
make test
make test-coverage
```
