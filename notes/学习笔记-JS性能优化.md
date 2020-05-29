### JS 性能优化

性能优化不可避免，所有能够提高程序运行效率的操作都可以看做是优化，以下将主要说明前端在 JS 性能方面的优化

- 内存管理
- 垃圾回收与常见 GC 算法
- V8 引擎的垃圾回收
- Performance 工具
- 代码优化实例



---



#### 内存管理

##### 内存管理原因

程序都是在内存中运行的，如果不及时对内存进行回收、释放，有可能导致内存泄漏、内存用尽，影响程序正常运行

##### 内存管理介绍

- 内存：由可读写单元组成，表示一片可操作空间
- 管理：人为的去操作一片空间的申请、使用和释放
- 内存管理：开发者主动申请空间、使用空间、释放空间
- 管理流程：申请——使用——释放

##### JS 中的内存管理

```js
// 申请
let obj = {}

// 使用
obj.name = 'lg'

// 释放
obj = null

```



---



#### JS 中的垃圾回收

##### JS 中的垃圾

- JS 中内存管理是自动的
- 对象不再被引用时是垃圾
- 对象不能从根上访问到时是垃圾

##### JS 中的可达对象

- 可以访问到的对象就是可达对象（引用、作用域链）
- 可达的标准就是从根出发是否能够被找到
- JS 中的根就可以理解为是全局变量对象

```js
// reference

let obj = { name: 'xm' } // xm 对象空间 被 obj 引用，从全局角度来看，obj 此时可达

let ali = obj // xm 对象空间此时多了一次引用

obj = null // xm 对象空间此时失去了 obj 对其的引用，但 xm 对象空间仍然是可达的，因为 ali 仍保持着对 xm 对象空间的引用

```

```js
// 可达
function objGroup (obj1, obj2) {
  obj1.next = obj2
  obj2.prev = obj1
  
  return {
    o1: obj1,
    o2: obj2
  }
}

let obj = objGroup({
  name: 'obj1'
}, {
  name: 'obj2'
})

console.log(obj)
/*
{
  o1: {
    name: 'obj1',
    next: {
      name: 'obj2',
      prev: [Circular]
    }
  },
  o2: {
    name: 'obj2',
    prev: {
      name: 'obj1',
      next: [Circular]
    }
  }
}
*/

// 如果此时执行
delete obj.o1
delete obj.o2.prev
// 此时无法通过任何途径访问到 obj1 对象空间，obj1 此时不可达，会被视作垃圾，将被回收
```



----



#### GC 算法介绍

- GC 可以找到内存中的垃圾、并回收和释放空间

- GC 是一种机制，垃圾回收器完成具体的工作
- 工作的内容就是查找垃圾释放空间、回收空间
- GC 算法就是垃圾回收器工作时查找和回收所遵循的规则



#### 常见 GC 算法

- 引用计数
- 标记清除
- 标记整理
- 分代回收



##### 引用计数算法实现原理

核心思想：在内部维护一个引用计数器，给变量设置引用数，判断当前引用数是否为0

关键在于：

- 引用计数器
- 引用关系改变时修改引用数字
- 引用数字为0时立即回收

```js
// reference count

function fn () {
  const num1 = 1
  const num2 = 2
}

fn()
// fn 执行完毕后，外界无法引用 num1 num2，引用数都为 0，所占内存空间被回收
```



##### 引用计数算法的优缺点

优点

- 发现垃圾时立即回收
- 最大限度减少程序暂停

缺点

- 无法回收循环引用的对象
- 时间开销大

```js
function fn () {
  const obj1 = {}
  const obj2 = {}
  
  obj1.name = obj2
  obj2.name = obj1
  
  return 'I am a coder'
}

fn()
// fn 执行完毕之后，由于 obj1 和 obj2 相互引用，如果使用引用计数算法，二者引用数都不为零，所占内存空间无法被回收，造成内存泄漏
```



##### 标记清除算法实现原理

核心思想：分标记和清除两个阶段完成，回收相应的空间

- 第一阶段：遍历所有对象找标记活动对象
- 第二阶段：遍历所有对象清除没有标记的对象（同时抹除第一阶段中的所有标记，以便下次 GC 可以再次标记）

##### 标记清除算法优缺点

优点

- 可以解决对象循环引用的回收操作

缺点

- 容易造成空间碎片化（回收的垃圾对象其本身在地址上是不连续的）



##### 标记整理算法实现原理

标记整理可以看做是标记清除的增强，同样分为标记、清除两个阶段完成

- 标记阶段的操作和标记清除算法一致
- 清除阶段会先执行整理，移动对象位置



清除阶段操作：

- 回收前

| 活动 |    | 活动 | 非活动 | 活动 |
|---|---|---|---|---|
| 活动 | 非活动 | 活动 | | 活动  |
|     | 活动 |     | 非活动 |     |
| 活动 |     | 活动 |      | 活动 |

- 整理后

| 活动 | 活动 | 活动 | 非活动 |  |
|---|---|---|---|---|
| 活动 | 活动 | 活动 |  |  |
| 活动 | 活动 | 活动 | 非活动 | 非活动 |
| 活动 | 活动 |  |  |  |

- 回收后

| 活动 | 活动 | 活动 |  |  |
|---|---|---|---|---|
| 活动 | 活动 | 活动 |  |  |
| 活动 | 活动 | 活动 |  |  |
| 活动 | 活动 |  |  |  |



> 相较于标记清除算法，标记整理算法优势在于内存空间里不会存在大批量的分散的小空间，空间是连续的



#### 常见 GC 算法总结

- 引用计数
  - 可以即时回收垃圾对象
  - 减少程序卡顿时间
  - 无法回收循环引用的对象
  - 资源消耗较大
- 标记清除
  - 可以回收循环引用的对象
  - 容易产生碎片化空间，浪费空间
  - 不会立即回收垃圾对象
- 标记整理
  - 减少碎片化空间
  - 不会立即回收垃圾对象



---



#### 认识 V8

- 一款主流的 JavaScript 执行引擎
- 采用即时编译
- 内存设限



##### V8 垃圾回收策略

采用分代回收的思想，内存分为新生代和老生代，针对不同生代的对象采用具体的算法



###### V8 中常见的 GC 算法

- 分代回收
- 空间复制
- 标记清除
- 标记整理
- 标记增量

---



##### 分代回收

- V8 内存空间一分为二（大空间和小空间）

| 新生代（小空间） | 老生代（大空间） |
| ---------------- | ---------------- |
| （From）(To)     | 老生代存储区     |



###### 新生代对象说明

- 小空间用于存储新生代对象（64位32M | 32位16M）

- 新生代指的是存活时间较短的对象（比如说，在函数执行完毕之后，函数局部作用域内的空间会被回收，对象存活时间较短，而全局作用域，可能要等到程序结束运行退出之后才会被回收）



###### 新生代对象回收实现

- 回收过程采用复制算法 + 标记整理
- 新生代内存区分为两个等大小空间
- 使用空间为 From，空闲空间为 To
- 活动对象存储于 From 空间
- 标记整理后将活动对象拷贝至 To 空间
- From 与 To 交换空间完成释放

回收细节说明

- 拷贝过程中可能出现晋升——将新生代对象移动至老生代，进行存储操作
- 晋升的标准：一轮 GC 还存活的新生代需要晋升；To 空间的使用率超过 25%



###### 老年（生）代对象说明

- 老年代对象存放在右侧老生代区域
- 64位操作系统1.4G，32位操作系统700M
- 老年代对象就是指存活时间较长的对象（比如全局作用域下的变量，闭包中放置的变量数据）



###### 老年代对象回收实现

- 主要采用标记清除、标记整理、增量标记算法
- 首先使用标记清除完成垃圾空间的回收（针对老年代空间，会采用标记清除以回收空间）
- 采用标记整理进行空间优化（当新生代对象移动到老生代存储区即晋升时，老生代存储区又不足以存放这些数据，此时会采用标记整理算法进行空间整理回收）
- 采用增量标记进行效率优化



###### 细节对比

- 新生代区域垃圾回收使用空间换时间
- 老生代区域垃圾回收不适合复制算法（数据多、消耗空间、效率低下）



###### 增量标记

<img src="增量标记.png" width="900" height="300" alt="增量标记" />

垃圾回收会阻塞程序的执行，针对老年代区域进行增量标记，将之前大段的停顿时间拆分为数个小段，提高 GC 效率，提升用户体验



---



##### V8 垃圾回收总结

- V8 内存设置上限
- V8 采用基于分代回收思想实现垃圾回收
- V8 内存分为新生代和老生代
- V8 垃圾回收常见的 GC 算法



---



#### Chrome 工具使用

- GC 的目的是为了实现内存空间的良性循环
- 良性循环的基石是合理使用
- 时刻关注才能确定是否合理
- Performance 提供多种监控方式



##### 内存问题的体现

外在表现

- 页面出现延迟加载或经常性暂停（底层可能出现频繁的垃圾回收）
- 页面持续性出现糟糕的性能（内存膨胀）
- 页面的性能随时间延长越来越差（内存泄漏）



##### 监控内存的方式

###### 界定内存问题的标准

- 内存泄漏：内存使用持续升高（通过 performance 走势图判断，在代码中定位问题模块）
- 内存膨胀：在多数设备上都存在性能问题（可能是硬件设备本身问题，在流行设备上运行程序，判断是设备问题还是程序问题）
- 频繁垃圾回收：通过内存变化图进行分析



###### 具体的方式

- 浏览器任务管理器

  快捷键（Shift + Esc）调出界面

  - 内存（原生内存，DOM节点占据的原生内存大小）

  - JS内存（小括号内数值为当前页面所有可达对象占据的内存大小，如果数值不断增大，要么在不断创建新对象，要么当前现有对象在不断增长）

- Timeline 时序图记录

  相比于任务管理器，可以更加精确的定位导致内存出问题的代码位置

- 堆快照查找分离 DOM

  留存 JS 堆照片

  DOM 节点的几种形态：

  - 界面元素存活在 DOM 树上
  - 作为垃圾对象时的 DOM 节点（DOM 节点从树上脱离，且 JS 代码中也没有引用）
  - 分离状态的 DOM 节点（从 DOM 树上脱离，但在 JS 代码中存在引用，会导致内存泄漏）

  Devtools - Memory 根据 Profiles -> Take snapshot，在快照中查找 Detached 分离 DOM

- 判断是否存在频繁的垃圾回收

  判断原因：

  - GC 工作时应用程序是停止的
  - 频繁且过长的 GC 会导致应用假死
  - 用户使用中感知应用卡顿

  依据：

  - Timeline 中频繁的上升下降
  - 任务管理器中数据频繁的增加减小



---



##### 开发者工具小结

- Performance 使用流程
- 内存问题的相关分析
- Performance 时序图监控内存变化
- 任务管理器监控内存变化
- Memory 堆快照查找分离 DOM



---



#### 代码优化

##### 精准测试 JavaScript 性能

- 本质上就是采集大量的执行样本进行数学统计和分析，对开发人员来说不现实
- 使用基于 Benchmark.js 的 [https://jsperf.com](https://jsperf.com/) 完成测试



##### Jsperf 使用

- 填写详细的测试用例信息（title、slug用于生成短链接便于访问）
- 填写准备代码（DOM 操作时经常使用）
- 填写必要有 setup (当前操作的前置准备动作) 与 teardown (所有代码执行完毕之后要做的销毁操作) 代码
- 填写测试代码片段



##### 优化原则

- 慎用全局变量

  原因：

  - 全局变量定义在全局执行上下文，是所有作用域链的顶端
  - 全局执行上下文一直存在于上下文执行栈，直到程序退出
  - 如果某个局部作用域出现了同名变量则会遮蔽或污染全局

```js
// 全局变量
var i, str = ''
for (i = 0; i < 1000; i++) {
  str += i
}

// 局部变量
for (let i = 0; i < 1000; i++) {
  let str = ''
  str += i
}

```



- 缓存全局变量

  将使用中无法避免的全局变量缓存到局部

```js
// 未缓存全局变量
function fn1 () {
  let a = document.getElementById('btn1')
  let b = document.getElementById('btn2')
  let c = document.getElementById('btn3')
}

// 缓存全局变量
function fn2 () {
  let obj = document
  let a = obj.getElementById('btn1')
  let b = obj.getElementById('btn2')
  let c = obj.getElementById('btn3')
}

```



- 通过原型新增方法

  在原型对象上新增实例对象需要的方法

```js
// 在内部直接定义方法
var fn1 = function () {
  this.foo = function () {
    console.log(11111)
  }
}

let f1 = new fn1()

// 在原型对象上新增方法
var fn2 = function () {}
fn2.prototype.foo = function () {
  console.log(11111)
}

let f1 = new fn1()

```



- 避开闭包陷阱

  - 闭包是一种强大的语法

  - 闭包使用不当很容易出现内存泄漏
  - 不要为了闭包而闭包

```js
function test (func) {
  console.log(func())
}

function test2 () {
  var name = 'lg'
  return name
}
// 1
test(function () {
  var name = 'lg'
  return name
})
// 2 重新定义成函数进行传递，避开闭包陷阱
test(test2)

```



- 避免属性访问方法使用

  JS 中的面向对象

  - JS 不需要属性的访问方法，所有属性都是外部可见的
  - 使用属性访问方法只会增加一层重定义，没有访问的控制力

```js
// 1 通过属性访问方法获取属性
function Person () {
  this.name = 'ming'
  this.age = 18
  this.getAge = function () {
    return this.age
  }
}

const p1 = new Person()
const a = p1.getAge()

// 2 不通过属性访问方法获取属性
function Person() {
  this.name = 'ming'
  this.age = 18
}

const p2 = new Person()
const b = p2.age

```



- For 循环优化

```js
var arrList = []
arrList[10000] = 'ming'

// before
for (var i = 0; i < arrList.length; i++) {
  console.log(arrList[i])
}

// after
for (var i = arrList.length; i; i--) {
  console.log(arrList[i])
}

```



- 选择最优的循环方法

```js
var arrList = new Array(1, 2, 3, 4, 5)

// 最快 forEach
arrList.forEach(function (item) {
  console.log(item)
})

// 其次，优化后的 for
for (var i = arrList.length; i; i--) {
  console.log(arrList[i])
}

// 最慢 for in
for (var j in arrList) {
  console.log(arrList[j])
}

```



- 节点添加优化

  节点的添加操作必然会有回流和重绘

```js
for (var i = 0; i < 10; i++) {
  var oP = document.createElement('p')
  oP.innerHTML = i
  document.body.appendChild(oP)
}

// 优化
const fragEle = document.createDocumentFragment()
for (var i = 0; i < 10; i++) {
  var oP = document.createElement('p')
  oP.innerHTML = i
  // 文档碎片接收创建的节点
  fragEle.appendChild(oP)
}
// 统一处理节点的插入操作
document.body.appendChild(fragEle)

```



- 克隆优化节点操作

```js
// 创建节点
for (var i = 0; i < 3; i++) {
  var oP = document.createElement('p')
  oP.innerHTML = i
  document.body.appendChild(oP)
}

// 克隆节点
// 存在相似节点 box1 => <p id="box1">old</p>
var oldP = document.getElementById('box1')
for (var i = 0; i < 3; i++) {
  var newP = oldP.cloneNode(false)
  oP.innerHTML = i
  document.body.appendChild(oP)
}

```



- 直接量替换 new Object()

```js
// before
var a = [1, 2, 3]

// after
var a1 = new Array(3)
a1[0] = 1
a1[1] = 2
a1[2] = 3
```

