module.exports = function parallelFn (taskFn, maxParallelism) {
  const parallelism = maxParallelism || Infinity
  let currentTasks = 0

  const queue = []

  const wrapResolveReject = (fn) => function wrappedResolveReject (result) {
    fn(result)
    currentTasks--
    start()
  }

  function start () {
    const toRun = queue.splice(0, parallelism - currentTasks)
    if (!toRun.length) return

    toRun.forEach(
      ({ resolve, reject, args, self }) => {
        currentTasks++
        taskFn.apply(self, args)
          .then(wrapResolveReject(resolve))
          .catch(wrapResolveReject(reject))
      }
    )
  }

  return function (...args) {
    return new Promise((resolve, reject) => {
      queue.push({ resolve, reject, args, self: this })
      start()
    })
  }
}
