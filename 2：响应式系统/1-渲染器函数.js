const data = {
    text: 'hello word'
}

const obj = new Proxy(data, {
    get(target, key) {
        track(target, key)
        return Reflect.get(target, key)
    },
    set(target, key, newValue) {
        // 判断值是否相同
        const val = Reflect.get(target, key)
        if (val === newValue) {
            return false
        }

        const result = Reflect.set(target, key, newValue)
        trigger(target, key)
        return result
    }
})

let activeEffect = undefined

function effect(fn) {
    activeEffect = fn
    fn()
}

// 存储副作用函数得桶
const bucket = new WeakMap()

// 追踪依赖
function track(target, key) {
    if (!activeEffect) return

    let depsMap = bucket.get(target)
    if (!depsMap) {
        depsMap = new Map()
        bucket.set(target, depsMap)
    }

    let deps = depsMap.get(key)

    if (!deps) {
        deps = new Set()
        depsMap.set(key, deps)
    }

    deps.add(activeEffect)
}

function trigger(target, key) {
    const depsMap = bucket.get(target)
    if (!depsMap) return
    const effects = depsMap.get(key)
    if (!effects) return
    effects.forEach(effect => effect())
}

effect(function () {
    console.log('1', obj.text)
    obj.text = 'hello'
    // console.log(obj.text)
})

effect(function () {
    console.log('2', obj.text)
    obj.text = 'hello'
})
