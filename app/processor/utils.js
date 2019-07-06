let Logger = require('winston')

let DEFAULT_DELAY = 1000

const TAG = 'UTILS'

function delay (time = DEFAULT_DELAY) {
  return data => new Promise(resolve => {
    Logger.debug(`[${TAG}] Delaying ${time} milliseconds between requests`)

    setTimeout(() => resolve(data), time)
  })
}

let QUEUE = Promise.resolve()

function queue (fn, data) {
  const delayer = delay()

  const ret = QUEUE.then(() => fn(data))

  QUEUE = ret.then(delayer, delayer)

  return ret
}

module.exports = {
  DEFAULT_DELAY,
  delay,
  queue,
}
