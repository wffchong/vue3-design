function renderer(vNode, container) {
    if (typeof vNode.tag === 'string') {
        mountElement(vNode, container)
    } else if (typeof vNode.tag === 'object') {
        // 如果是对象，说明描述的是组件
        mountComponent(vNode, container)
    }
}

function mountElement(vNode, container) {
    // 创建一个节点
    const el = document.createElement(vNode.tag)

    for (const key in vNode.props) {
        // 如果以on开头，代表是事件
        if (/^on/.test(key)) {
            el.addEventListener(key.substring(2).toLocaleLowerCase(), vNode.props[key])
        }
    }

    // 处理children
    if (typeof vNode.children === 'string') {
        el.appendChild(document.createTextNode(vNode.children))
    } else if (Array.isArray(vNode.children)) {
        // 是数组就直接递归
        vNode.children.forEach(child => renderer(child, el))
    }

    container.appendChild(el)
}

function mountComponent(vNode, container) {
    // subTree 就是组件返回的虚拟DOM
    const subTree = vNode.tag.render()
    // 递归调用renderer方法
    renderer(subTree, container)
}

// 组件上面有个render方法，返回的就是虚拟DOM
const myComponent = {
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

const vNode = {
    tag: myComponent
}

renderer(vNode, document.querySelector('#app'))
