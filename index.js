const stream = require("clarinet").createStream()
const isRaw = process.argv.some((arg) => arg.toLowerCase() == "--raw")

const types = {
    "boolean":"t.boolean",
    "object":"t.object",
    "number":"t.number",
    "string":"t.string"
}

stream.on("openobject", (key) => {
    process.stdout.write(`t.type({${key}:`)
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

if (!isRaw) {
    process.stdout.write('const RootInterface = ')
}

process.stdin.pipe(stream)