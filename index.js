const stream = require("clarinet").createStream()
let isRoot = true
const types = {
    "boolean":"t.boolean",
    "object":"t.object",
    "number":"t.number",
    "string":"t.string"
}

stream.on("openobject", (key) => {
    if (isRoot) {
        isRoot = false
        process.stdout.write(`t.type({${key}:`)
    } else {
        process.stdout.write(`t.object({${key}:`)
    }
})
stream.on("closeobject", () => {
    process.stdout.write("})")    
})
stream.on("key", (key) => {
    process.stdout.write(`,${key}:`)
})
stream.on("value", (value) => {
    process.stdout.write(types[typeof value])
})
stream.on("openarray", () => {
    process.stdout.write('t.array(')
})
stream.on("closearray", () => {
    process.stdout.write(')')
})

process.stdin.pipe(stream)