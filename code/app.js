const fp = require('lodash/fp')
const { log, trace } = require('./util')

const cars = [
  {
    name: "Ferrari FF",
    horsepower: 660,
    dollar_value: 700000,
    in_stock: true
  },
  {
    name: "Spyker C12 Zagato",
    horsepower: 650,
    dollar_value: 648000,
    in_stock: false
  },
  {
    name: "Audi R8",
    horsepower: 525,
    dollar_value: 114200,
    in_stock: false
  },
  {
    name: "Asto Martin One-77",
    horsepower: 750,
    dollar_value: 1850000,
    in_stock: true
  },
  {
    name: "Pagani Huayra",
    horsepower: 700,
    dollar_value: 1300000,
    in_stock: false
  }
]


// ----------------------------------------------------------------

// 使用 fp.flowRight() 重新实现 isLastInStock
let isLastInStock = function (cars) {
  // 获取最后一条数据
  let last_car = fp.last(cars)
  // 获取最后一条数据的 in_stock 属性值
  return fp.prop('in_stock', last_car)
}

// 原函数执行结果
let result = isLastInStock(cars)
console.log('原 isLastInStock 结果', result) // false
// 改编函数以及执行结果
let _isLastInStock = fp.flowRight(fp.prop('in_stock'), trace('_isLastInStock 结果'), fp.last)
let _result = _isLastInStock(cars)
console.log(_result) // false

// ----------------------------------------------------------------

// 使用 fp.flowRight()、fp.prop() 和 fp.first() 获取第一个 car 的 name
let getFirstName = fp.flowRight(fp.prop('name'), trace('首辆车 name 为'), fp.first)
let firstName = getFirstName(cars)
console.log(firstName) // Ferrari FF

// ----------------------------------------------------------------


// 使用帮助函数 _average 重构 averageDollarValue，使用函数组合的方式实现
let _average = function (xs) {
  return fp.reduce(fp.add, 0, xs) / xs.length
}

let averageDollarValue = function (cars) {
  let dollar_values = fp.map(function (car) {
    return car.dollar_value
  }, cars)
  return _average(dollar_values)
}

// 原函数执行结果
let averageDollar = averageDollarValue(cars)
console.log('均价为', averageDollar)

// 改编函数以及执行结果
let _averageDollarValue = fp.flowRight(_average, trace('_均价为'), fp.map(fp.prop('dollar_value')))
let _averageDollar = _averageDollarValue(cars)
console.log(_averageDollar)
// ----------------------------------------------------------------


// 使用 flowRight 写一个 sanitizeNames() 函数，
// 返回一个下划线连接的小写字符串，把数字中的 name 转换为这种形式：
// sanitizeNames(["Hello World"]) => ["hello_world"]
let _underscore = fp.replace(/\W+/g, '_')

// let sanitizeNames = fp.flowRight(fp.map(_underscore), trace('转换结果为'), fp.map(fp.toLower))
// 两次 fp.map 遍历可以优化
let sanitizeNames = fp.map(fp.flowRight(_underscore, fp.toLower))
let _names = sanitizeNames(["Hello World"])
console.log(_names) // ["hello_world"]
