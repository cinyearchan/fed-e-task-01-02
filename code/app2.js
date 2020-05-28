const fp = require('lodash/fp')
const { Maybe, Container } = require('./support')

// 使用 fp.add(x, y) 和 fp.map(f, x) 创建一个能让 functor 里的值增加的函数 ex1
let maybe = Maybe.of([5, 6, 1])
let ex1 = 

// 实现一个函数 ex2，能够使用 fp.first 获取列表的第一个元素
let xs = Container.of(['do', 'ray', 'me', 'fa', 'so', 'la', 'ti', 'do'])
let ex2 = 

// 实现一个函数 ex3，使用 safeProp 和 fp.first 找到 user 的名字和首字母
let safeProp = fp.curry(function (x, o) {
  return Maybe.of(o[x])
})
let user = { id: 2, name: "Albert" }
let ex3 = 

// 使用 Maybe 重写 ex4，不要有 if 语句
let ex4 = function (n) {
  if (n) {
    return parseInt(n)
  }
}
