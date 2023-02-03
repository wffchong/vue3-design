// 用一个全局变量存储被注册的副作用函数
let activeEffect

// effect 栈
const effectStack = []

// 副作用注册函数
function effect(fn) {
  const effectFn = () => {
    // 执行副作用函数前 把副作用函数 从 所有的跟副作用有关的依赖集合 里面删掉，删掉后然后再重新收集依赖，这样就不会造成依赖遗留问题
    cleanup(effectFn)
    // 当 effectFn 执行时，将其设置为当前的 activeEffect
    activeEffect = effectFn

    // 在调用副作用函数之前将当前effectFn压入栈
    effectStack.push(effectFn)

    // fn执行，然后根据 fn 里面的代码执行，例如这里就会 应用到 obj.text 和 obj.ok，就会走到 get 操作里面
    fn()
    // todo：
    /**
     * 这个地方设置为null也是有问题的,我们通过 activeEffect 来保存被 effect 函数注册的副作用函数
     * 但是当 effect 发生嵌套时，这就意味着 activeEffect 永远只能保存一个副作用函数
     * 内层的 副作用函数 会覆盖掉 外层的副作用函数，并且永远不会恢复到原来的值，
     * 这时如果再有响应式数据进行依赖收集，即使这个响应式数据是在外层副作用函数中读取的，
     * 它们收集到的副作用函数也都会是内层副作用函数，这就是问题所在
     *
     * 解决办法：
     * 搞一个栈 用来存放副作用函数,并且始终让 activeEffect 指向栈顶，副作用函数执行完后就推出栈，这样就解决了互相影响的情况
     */
    // activeEffect = null
    // 执行完副作用函数后把其从栈中弹出，并将activeEffect永远指向栈顶
    effectStack.pop()
    activeEffect = effectStack[effectStack.length - 1]
  }
  // effectFn.deps 用来存储所有与该 effect 相关联的依赖集合
  effectFn.deps = []
  // 执行副作用函数
  effectFn()
}

// 存副作用函数的桶
const bucket = new WeakMap()

// 原始数据
// const data = { text: 'hello' }
// const data = {
//   ok: true,
//   text: 'hello'
// }
const data = { foo: true, bar: true }

// 全局变量
let temp1, temp2

const obj = new Proxy(data, {
  get(target, key) {
    track(target, key)
    return target[key]
  },
  set(target, key, newVal) {
    target[key] = newVal
    trigger(target, key)
    return true
  }
})

// 在 get 函数内调用 track 函数 追踪变化
function track(target, key) {
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
  // todo: 这里需要注意的是当前的 activeEffect 不再是之前的 fn 了，而是 effectFn,
  // 也就是上面注册副作用函数里面的箭头函数那一块
  deps.add(activeEffect)
  // deps 就是一个与当前副作用函数存在联系的依赖集合
  // 反向收集依赖 --> 将 副作用函数所对应的依赖集合 收集到 副作用的 deps中
  activeEffect.deps.push(deps)
}

// 在 set 函数内调用 trigger 触发变化
function trigger(target, key) {
  // 根据 target 从桶里面获取 depsMap
  let depsMap = bucket.get(target)
  if (!depsMap) return
  const effects = depsMap.get(key)
  // 执行所有的副作用函数
  // effects && effects.forEach(effect => effect())
  // 在执行副作用函数前需要先把副作用函数对应的依赖清除掉
  const effectsToRun = new Set(effects)
  effectsToRun.forEach(effectFn => effectFn())
}

/**
 *
 * 疑问：
  cleanup 函数中先遍历 effectFn.deps 逐个 delete，循环结束后又将 effectFn.deps.length =0 这样是为了啥，直接执行 effectFn.deps.length = 0 不就好了么？
  解答：
  1.逐个删除：先获取到了依赖集合，然后将该副作用函数从依赖集合中删除，这样就解决了分支切换时产生的遗留副作用函数导致不必要的更新的问题
  2. effectFn.deps.length = 0:逐个删除删除的是依赖集合中的副作用函数，这里将依赖集合清空，然后在 get 时再重新建立联系。为什么要这样做？
  activeEffect.deps 存放的是所有与该副作用函数相关联的依赖集合，它存在的作用就是为了能够找到副作用哪些依赖集合中包合该副作用函数，在“逐个删除”
  一步中已经完成了它的使命，所以将其清空。
 */

function cleanup(effectFn) {
  for (let i = 0; i < effectFn.deps.length; i++) {
    // deps是依赖集合
    const deps = effectFn.deps[i]
    // 从依赖集合中把 effectFn 删除掉
    deps.delete(effectFn)
  }
  effectFn.deps.length = 0
}

effect(function effectFn1() {
  console.log('effectFn1执行')

  effect(function effectFn2() {
    console.log('effectFn2执行')
    temp2 = obj.bar
  })

  temp1 = obj.foo
})

// obj.foo = false
obj.bar = false