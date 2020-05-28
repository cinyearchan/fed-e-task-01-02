const _ = require('lodash')

// 引入辅助调试函数
const log = v => {
  console.log(v)
  return v
}
const trace = _.curry((tag, v) => {
  console.log(tag)
  return v
})

module.exports = {
  log,
  trace
}