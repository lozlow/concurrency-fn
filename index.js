module.exports = function promiseThing (maxConcurrency, taskFn) {
  const concurrency = maxConcurrency
  let currentTasks = 0

  const queue = []

  const wrapResolveReject = (fn) => (result) => {
    fn(result)
    currentTasks--
    start()
  }

  function start () {
    const toRun = queue.splice(0, concurrency - currentTasks)
    if (!toRun.length) return
    toRun.forEach(
      ({ resolve, reject, args }) => {
        currentTasks++
        taskFn(wrapResolveReject(resolve), wrapResolveReject(reject), ...args)
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
