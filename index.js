const stream = require("clarinet").createStream()
const isRaw = process.argv.some((arg) => arg.toLowerCase() == "--raw")

const value_types = {
    "boolean":"t.boolean",
    "object":"t.object",
    "number":"t.number",
    "string":"t.string"
}

class ValueNode {
    constructor(parent, value) {
        this.value = value_types[typeof value]
        this.parent = parent
    }
    render() {
        return this.value
    }
}

class ObjectNode {
    constructor(parent, key) {
        this.props = {}
        this.parent = parent
        this.current_key = key
    }
    render() {
        return [
            't.type({',
            Object.keys(this.props).map((key) => 
                `${key}:${this.props[key].render()}`
            ).join(","),
            '})'
        ].join("")
    }
    accept(node) {
        this.props[this.current_key] = node
    }
}

class ArrayNode {
    constructor(parent) {
        this.children = []
        this.parent = parent
    }
    render() {
        return [
            't.array(',
            [...new Set(this.children
                .map((it) => it.render()))
            ].join(","),
            ')'
        ].join("")
    }
    accept(node) {
        this.children.push(node)
    }
}

let root_node = null
let current_node = null

const acceptNode = (child_node) => {
    if (root_node === null) {
        root_node = child_node
    }
    if (current_node !== null) {
        current_node.accept(child_node)
    }
    current_node = child_node
}

stream.on("openobject", (key) => {
    acceptNode(new ObjectNode(current_node, key))
})
stream.on("closeobject", () => {
    current_node = current_node.parent
})
stream.on("key", (key) => {
    current_node.current_key = key
})
stream.on("value", (value) => {
    acceptNode(new ValueNode(current_node, value))
    current_node = current_node.parent
})
stream.on("openarray", () => {
    acceptNode(new ArrayNode(current_node))
})
stream.on("closearray", () => {
    current_node = current_node.parent
})

stream.on("end", () => {
    process.stdout.write(root_node.render())
})

if (!isRaw) {
    process.stdout.write('const RootInterface = ')
}

process.stdin.pipe(stream)