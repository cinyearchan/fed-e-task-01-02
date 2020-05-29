### 简答题

#### 1. 描述引用计数的工作原理和优缺点

核心思想：在内部维护一个引用计数器，给变量设置引用数，判断当前引用数是否为0

三个关键点：

- 内部有一个引用计数器
- 引用关系改变时修改引用数字
- 引用数字为0时立即回收

优点：

- 发现垃圾时立即回收
- 最大限度减少程序暂停

缺点：

- 无法回收循环引用的对象
- 时间开销大

#### 2. 描述标记整理算法的工作流程

分标记和清除两个阶段完成

1. 第一阶段：遍历所有对象找标记活动对象
2. 第二阶段：清除阶段会先执行整理，移动对象位置，将非连续的活动对象在空间上变为连续的，之后遍历所有对象清除没有标记的对象（同时抹除第一阶段中的所有标记，以便下次 GC 可以再次标记），空白空间都是连续的，不会造成空间碎片化

#### 3. 描述 V8 中新生代存储区垃圾回收的流程

回收过程采用复制算法和标记整理，新生代内存区分为两个等大小空间，使用空间为 From，空闲空间为 To，活动对象存储于 From 空间

1. 对 From 空间标记整理后，将活动对象拷贝至 To 空间
2. From 与 To 交换空间完成释放
3. 一轮 GC 还存活的新生代以及 To 空间的使用率超过 25% 时会触发晋升——将新生代对象移动至老生代，进行存储操作

#### 4. 描述增量标记算法在何时使用及工作原理

1. 垃圾回收会阻塞程序的执行，大段时间的垃圾回收会造成卡顿过长
2. 针对老年代存储区的活动特性进行增量标记
3. 将之前大段的停顿时间、一整段的垃圾回收操作拆分为数个小段，
4. 程序之后后触发 GC 机制，遍历对象进行标记，找到直接可达对象，GC 暂停，程序继续执行，如果再次触发 GC，程序暂停，继续标记，找到间接可达对象
5. 在程序执行和标记变量多次交替进行，标记操作完成之后，需要完成垃圾回收操作，程序暂停，GC 执行清除操作后，程序继续执行
6. 提高 GC 效率，提升用户体验

---

### 代码题1

#### 基于以下代码完成下面的四个练习
```javascript
const fp = require('lodash/fp')

// 数据
// horsepower 马力
// dollar_value 价格
// in_stock 库存
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
```

#### 练习题1
##### 使用函数组合 `fp.flowRight()` 重新实现下面这个函数
```javascript
let isLastInStock = function (cars) {
  // 获取最后一条数据
  let last_car = fp.last(cars)
  // 获取最后一条数据的 in_stock 属性值
  return fp.prop('in_stock', last_car)
}
```

答案
```js
let _isLastInStock = fp.flowRight(fp.prop('in_stock'), fp.last)
let _result = _isLastInStock(cars)
console.log(_result) // false
```


#### 练习题2
##### 使用 `fp.flowRight()`、`fp.prop()` 和 `fp.first()` 获取第一个 car 的 name

答案
```js
let getFirstName = fp.flowRight(fp.prop('name'), fp.first)
let firstName = getFirstName(cars)
console.log(firstName) // Ferrari FF
```


#### 练习题3
##### 使用帮助函数 `_average` 重构 `averageDollarValue`，使用函数组合的方式实现
```javascript
let _average = function (xs) {
  return fp.reduce(fp.add, 0, xs) / xs.length // <- 无须改动
}

let averageDollarValue = function (cars) {
  let dollar_values = fp.map(function(car) {
    return car.dollar_value
  }, cars)
  return _average(dollar_values)
}
```

答案
```js
let _averageDollarValue = fp.flowRight(_average, fp.map(fp.prop('dollar_value')))
let _averageDollar = _averageDollarValue(cars)
console.log(_averageDollar) // 922440
```


#### 练习题4
##### 使用 `flowRight` 写一个 `sanitizeNames()` 函数，返回一个下划线连接的小写字符串，把数组中的 name 转换为这种形式：例如，`sanitizeNames(["Hello World"]) => ["hello_world"]`
```javascript
let _underscore = fp.replace(/\W+/g, '_') // <-- 无须改动，并在 sanitizeNames 中使用它
```

答案
```js
let sanitizeNames = fp.map(fp.flowRight(_underscore, fp.toLower))
let _names = sanitizeNames(["Hello World"])
console.log(_names) // ["hello_world"]
```



### 代码题2

#### 基于下面提供的代码，完成后续的四个练习

```javascript
// support.js
class Container {
  static of (value) {
    return new Container(value)
  }
  constructor (value) {
    this._value = value
  }
  map (fn) {
    return Container.of(fn(this._value))
  }
}

class Maybe {
  static of (x) {
    return new Maybe(x)
  }
  isNothing () {
    return this._value === null || this._value === undefined
  }
  constructor (x) {
    this._value = x
  }
  map (fn) {
    return this.isNothing() ? this : Maybe.of(fn(this._value))
  }
}

module.exports = {
  Maybe,
  Container
}
```



#### 练习1

##### 使用 `fp.add(x, y)` 和 `fp.map(f, x)` 创建一个能让 `functor` 里的值增加的函数 `ex1`

```javascript
const fp = require('lodash/fp')
const { Maybe, Container } = require('./support')

let maybe = Maybe.of([5, 6, 1])
let ex1 = // ... 你需要实现的位置
```

答案

```js
let ex1 = x => fp.map(fp.add(1), x)
let r1 = maybe.map(ex1).map(log)
// console.log(r1)
```





#### 练习2

##### 实现一个函数 `ex2` ，能够使用 `fp.first` 获取列表的第一个元素

```javascript
const fp = require('lodash/fp')
const { Maybe, Container } = require('./support')

let xs = Container.of(['do', 'ray', 'me', 'fa', 'so', 'la', 'ti', 'do'])
let ex2 = // ... 你需要实现的位置
```

答案

```js
let ex2 = x => fp.first(x)
let r2 = xs.map(ex2).map(log)
// console.log(r2)
```





#### 练习3

##### 实现一个函数 `ex3` ，使用 `safeProp` 和 `fp.first` 找到 `user` 的名字的首字母

```javascript
const fp = require('lodash/fp')
const { Maybe, Container } = require('./support')

let safeProp = fp.curry(function (x, o) {
  return Maybe.of(o[x])
})
let user = { id: 2, name: "Albert" }
let ex3 = // ... 你需要实现的位置
```

答案

```js
// 答案
// 非开发环境下需移除 map(log)
let ex3 = x => safeProp("name")(x).map(log).map(x => fp.first(x)).map(log)
ex3(user)
```





#### 练习4

##### 使用 `Maybe` 重写 `ex4` ，不要有 `if` 语句

```javascript
const fp = require('lodash/fp')
const { Maybe, Container } = require('./support')

let ex4 = function (n) {
  if (n) {
    return parseInt(n)
  }
}
```

答案

```js
// 改造后
let _ex4 = function (n) {
  return Maybe.of(n).map(x => x === 0 ? undefined : parseInt(x))
}

// 原函数中 n = 0 的情况需要考虑
let testValue = 0 // null // undefined
console.log(ex4(testValue))
console.log(_ex4(testValue))
```

