const test = require('tape')
const sinon = require('sinon')

const parallelFn = require('./index')

function setup (parallelism = 2) {
  const taskStub = sinon.stub()
  taskStub.resolves()
  return {
    taskStub,
    scheduler: parallelFn(taskStub, parallelism)
  }
}

test('parallelFn creates a task queue up to a max parallelism limit', async (t) => {
  const { taskStub, scheduler } = setup()
  scheduler()
  scheduler()
  scheduler()
  t.ok(taskStub.calledTwice, 'task function only called up to max parallelism')
  t.end()
})

test('parallelFn creates a task queue up to a max parallelism limit and starts functions when possible', async (t) => {
  const { taskStub, scheduler } = setup()
  taskStub.onCall(0).resolves()
  scheduler()
  scheduler()
  await scheduler()
  t.ok(taskStub.calledThrice, 'task function called 3 times')
  t.end()
})

test('parallelFn calls taskFn with original arguments', (t) => {
  const { taskStub, scheduler } = setup()
  const a = 1
  const b = { c: 2 }
  scheduler(a, b)
  t.ok(taskStub.calledWithExactly(a, b), 'task function called with arguments')
  t.ok(taskStub.calledOnce, 'task function called once')
  t.end()
})

test('parallelFn calls taskFn with original context', (t) => {
  const { taskStub, scheduler } = setup()
  const a = 1
  const b = { c: 2 }
  const context = {}
  scheduler.call(context, a, b)
  t.equal(taskStub.thisValues[0], context, 'task function called with correct context')
  t.ok(taskStub.calledOnce, 'task function called once')
  t.end()
})

test('parallelFn returns a promise whose resolution is the return resolution of the task function', async (t) => {
  const { taskStub, scheduler } = setup()
  const expected = 'orange'
  taskStub.onCall(0).resolves(expected)
  const value = await scheduler()
  t.equal(value, expected, 'task function resolution is as expected')
  t.end()
})

test('parallelFn returns the promise rejection when the task function rejects', async (t) => {
  const { taskStub, scheduler } = setup()
  const err = Error('snap!')
  taskStub.onCall(0).rejects(err)
  try {
    await scheduler()
  } catch (e) {
    t.equal(e, err, 'task function rejection throws error')
  }
  t.end()
})

test('parallelFn starts other tasks on task rejection', async (t) => {
  const { taskStub, scheduler } = setup()
  taskStub.onCall(0).resolves()
  try {
    await scheduler()
  } catch (e) {}
  scheduler()
  scheduler()
  t.ok(taskStub.calledThrice, 'task function called 3 times')
  t.end()
})

test('parallelFn has Infinity parallelism when not specified', (t) => {
  const { taskStub, scheduler } = setup(null)
  for (let x = 0; x < 1000; ++x) {
    scheduler()
  }
  t.equal(1000, taskStub.getCalls().length, 'called 1000 times')
  t.end()
})
