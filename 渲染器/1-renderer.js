const vnode = {
  tag: 'div',
  props: {
    onClick: () => alert('hello')
  },
  children: 'click me'
}

function renderer(vnode, container) {
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

renderer(vnode, document.body)
