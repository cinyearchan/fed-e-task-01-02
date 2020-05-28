const fp = require('lodash/fp')
const { Maybe, Container } = require('./support')
const { log } = require('./util')

// ------------------------------------------------------------------------

// 使用 fp.add(x, y) 和 fp.map(f, x) 创建一个能让 functor 里的值增加的函数 ex1
let maybe = Maybe.of([5, 6, 1])

// 答案
let ex1 = x => fp.map(fp.add(1), x)
let r1 = maybe.map(ex1).map(log)
// console.log(r1)

// ------------------------------------------------------------------------

// 实现一个函数 ex2，能够使用 fp.first 获取列表的第一个元素
let xs = Container.of(['do', 'ray', 'me', 'fa', 'so', 'la', 'ti', 'do'])

// 答案
let ex2 = x => fp.first(x)
let r2 = xs.map(ex2).map(log)
// console.log(r2)

// ------------------------------------------------------------------------

// 实现一个函数 ex3，使用 safeProp 和 fp.first 找到 user 的名字和首字母
let safeProp = fp.curry(function (x, o) {
  return Maybe.of(o[x])
})
let user = { id: 2, name: "Albert" }

// let ex3 = x => safeProp(fp.first, 'name')
// let r3 = safeProp("name")(user)
// console.log('r3', r3) // 
// console.log('first', r3.map(x => fp.first(x)))

// 答案
let ex3 = x => safeProp("name")(x).map(log).map(x => fp.first(x)).map(log)
ex3(user)

// ------------------------------------------------------------------------

// 使用 Maybe 重写 ex4，不要有 if 语句
let ex4 = function (n) {
  if (n) {
    return parseInt(n)
  }
}

// 改造后
let _ex4 = function (n) {
  return Maybe.of(n).map(x => x === 0 ? undefined : parseInt(x))
}

// 原函数中 n = 0 的情况需要考虑
let testValue = 0 // null // undefined
console.log(ex4(testValue))
console.log(_ex4(testValue))
