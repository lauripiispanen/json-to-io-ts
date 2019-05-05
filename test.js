const { spawn } = require('child_process')

const script_name = 'index'

test('outputs a simple object', async () => {
    const output = await process_input("{ \"foo\": true, \"bar\": false }")
    expect(output.toString()).toBe("t.type({foo:t.boolean,bar:t.boolean})")
})

test('outputs a nested object', async () => {
    const output = await process_input("{ \"foo\": true, \"bar\": { \"foo\": 1, \"bar\": false } }")
    expect(output.toString()).toBe("t.type({foo:t.boolean,bar:t.object({foo:t.number,bar:t.boolean})})")
})
test('outputs arrays', async () => {
    const output = await process_input("[{\"foo\":\"bar\"}]")
    expect(output.toString()).toBe("t.array(t.type({foo:t.string}))")
})

const process_input = async (input) => {
    const ps = spawn(process.argv[0], [script_name])
    return new Promise((resolve, reject) => {
        let stdout_chunks = []
        let stderr_chunks = []
        ps.on('close', (code, signal) => {
            if (code !== 0) {
                reject({code: code, stderr: Buffer.from(stderr_chunks.join(""), 'utf-8')})
            } else {
                resolve(Buffer.from(stdout_chunks.join(""), 'utf-8'))
            }
        })
        ps.stdout.on('data', (chunk) => {
            stdout_chunks.push(chunk)
        })
        ps.stderr.on('data', (chunk) => {
            stderr_chunks.push(chunk)
        })
        ps.stdin.write(input)

        ps.stdin.end()
    })
}