// 用一个全局变量存储被注册的副作用函数
let activeEffect

// 副作用注册函数
function effect(fn) {
  // 当调用副作用注册函数时，将 fn 赋值给 activeEffect
  activeEffect = fn
  fn()
}

// 存副作用函数的桶
const bucket = new Set()

// 原始数据
const data = { text: 'hello' }

const obj = new Proxy(data, {
  get(target, key) {
    activeEffect && bucket.add(activeEffect)
    return target[key]
  },
  set(target, key, newVal) {
    target[key] = newVal
    bucket.forEach(effect => effect())
    return true
  }
})

// 注册一个匿名的副作用函数
effect(() => {
  console.log('effect run') // 会打印两次
  document.body.innerText = obj.text
})

// obj.text = '123'
setTimeout(() => {
  // 副作用函数中并没有读取 notExit 的值，但是也会触发 effect 重新执行
  // todo: 即 notExit 与 上面的副作用函数不应该产生依赖才对，这里只会执行定时器里面的代码,不应该是响应式的
  // 即现在的设计是不管访问的是 obj 的那一个 key 都会触发 get 函数执行，导致依赖收集，这样是不对的，需要重新设计桶的结构
  obj.notExit = 'hello vue'
}, 1000)
