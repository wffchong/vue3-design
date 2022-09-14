const vNode = {
    tag: 'div',
    props: {
        onClick: () => alert('hello')
    },
    children: 'click me'
}


/**
 *
 *
 * @param {*} vNode 虚拟 DOM 对象
 * @param {*} container 一个真实的 DOM 元素，作为挂载点，渲染器会把虚拟 DOM 渲染到该挂载点上
 */
function renderer(vNode, container) {
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

renderer(vNode, document.querySelector('#app'))
