// MyComponent 是一个对象
const MyComponent = {
  render() {
    return {
      tag: 'div',
      props: {
        onClick: () => alert('hello')
      },
      children: 'click me'
    }
  }
}

const vnode1 = {
  tag: 'div',
  props: {
    onClick: () => alert('hello')
  },
  children: 'click me'
}

const vnode2 = {
  tag: MyComponent
}

// 挂载普通节点
function mountElement(vnode, container) {
  // 1：创建一个 vnode.tag 的标签
  const el = document.createElement(vnode.tag)

  // 2：处理props
  for (const key in vnode.props) {
    // 如果以 on 开头，则代表是事件
    if (/^on/.test(key)) {
      el.addEventListener(key.substring(2).toLowerCase(), vnode.props[key])
    }
  }

  // 3：处理 children
  if (typeof vnode.children === 'string') {
    el.appendChild(document.createTextNode(vnode.children))
  } else if (Array.isArray(vnode.children)) {
    vnode.children.forEach(child => renderer(child, el))
  }
  container.appendChild(el)
}

// 挂载组件
function mountComponent(vnode, container) {
  // vnode.tag 是对象，调用他的 render 方法既可以拿到虚拟 dom
  const subTree = vnode.tag.render()
  renderer(subTree, container)
}

function renderer(vnode, container) {
  if (typeof vnode.tag === 'string') {
    mountElement(vnode, container)
  } else if (typeof vnode.tag === 'object') {
    // 描述的是组件
    mountComponent(vnode, container)
  }
}

renderer(vnode2, document.body)
