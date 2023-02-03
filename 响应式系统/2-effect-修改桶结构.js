// 用一个全局变量存储被注册的副作用函数
let activeEffect

// 副作用注册函数
function effect(fn) {
  // 当调用副作用注册函数时，将 fn 赋值给 activeEffect
  activeEffect = fn
  console.log(activeEffect);
  fn()
  // 这里需要在 fn 执行后，将 activeEffect 设置为null，不然有可能有问题，比如有两个响应式数据，再执行某一个set的时候
  // 会导致上一次的 activeEffect 并不是当前的 key 对应的依赖，导致依赖收集错误
  // 下面有举例子，注册下面这行代码后会导致 104 行的 hello 执行两次
  activeEffect = null
}

// 存副作用函数的桶
const bucket = new WeakMap()

// 原始数据
const data = { text: 'hello' }
const data1 = { text: 'hello' }

const obj = new Proxy(data, {
  get(target, key) {
    // 如果 activeEffect 没有值，直接return
    if (!activeEffect) return target[key]

    // 根据 target 从桶中获取 depsMap，它是一个 map 类型，key --> effects
    let depsMap = bucket.get(target)
    // 如果不存在就新建一个，并且与 target 关联
    if (!depsMap) {
      depsMap = new Map()
      bucket.set(target, depsMap)
    }

    // 再根据 key 从 depsMap 中取出 deps,它是一个set类型
    // 里面存储着所有与当前 key 有关联的副作用函数 effects
    let deps = depsMap.get(key)
    // 如果不存在就新建一个，并且与 key 关联
    if (!deps) {
      deps = new Set()
      depsMap.set(key, deps)
    }
    // 最后将当前激活的 activeEffect 放到桶里面
    deps.add(activeEffect)
    return target[key]
  },
  set(target, key, newVal) {
    target[key] = newVal
    // 根据 target 从桶里面获取 depsMap
    let depsMap = bucket.get(target)
    if (!depsMap) return
    const effects = depsMap.get(key)
    // 执行所有的副作用函数
    console.log(effects);
    effects && effects.forEach(effect => effect())
    return true
  }
})

const obj1 = new Proxy(data1, {
  get(target, key) {
    // 如果 activeEffect 没有值，直接return
    if (!activeEffect) return target[key]

    // 根据 target 从桶中获取 depsMap，它是一个 map 类型，key --> effects
    let depsMap = bucket.get(target)
    // 如果不存在就新建一个，并且与 target 关联
    if (!depsMap) {
      depsMap = new Map()
      bucket.set(target, depsMap)
    }

    // 再根据 key 从 depsMap 中取出 deps,它是一个set类型
    // 里面存储着所有与当前 key 有关联的副作用函数 effects
    let deps = depsMap.get(key)
    // 如果不存在就新建一个，并且与 key 关联
    if (!deps) {
      deps = new Set()
      depsMap.set(key, deps)
    }
    // 最后将当前激活的 activeEffect 放到桶里面
    deps.add(activeEffect)
    return target[key]
  },
  set(target, key, newVal) {
    target[key] = newVal
    // 根据 target 从桶里面获取 depsMap
    let depsMap = bucket.get(target)
    if (!depsMap) return
    const effects = depsMap.get(key)
    // 执行所有的副作用函数
    effects && effects.forEach(effect => effect())
    return true
  }
})

// 注册一个匿名的副作用函数
effect(() => {
  document.body.innerText = obj.text
})

effect(() => {
  console.log(obj1.text)
})

obj.text = '123'
