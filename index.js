module.exports = function parallelFn (taskFn, maxParallelism) {
  const parallelism = maxParallelism || Infinity
  let currentTasks = 0

  const queue = []

  const wrapResolveReject = (fn) => function wrappedResolveReject (result) {
    fn(result)
    currentTasks--
    this.called = true
    start()
  }

  function start () {
    const toRun = queue.splice(0, parallelism - currentTasks)
    if (!toRun.length) return

    toRun.forEach(
      ({ resolve, reject, args }) => {
        currentTasks++
        const wrappedResolve = wrapResolveReject(resolve)
        const wrappedReject = wrapResolveReject(reject)
        taskFn(wrappedResolve, wrappedReject, ...args)
      }
    )
  }

  return function (...args) {
    return new Promise((resolve, reject) => {
      queue.push({ resolve, reject, args })
      start()
    })
  }
}
