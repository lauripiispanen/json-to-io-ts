const { spawn } = require('child_process')

const script_name = 'index'

test('outputs a simple object', async () => {
    await expectOutput(
        "{ \"foo\": true, \"bar\": false }",
        "t.type({foo:t.boolean,bar:t.boolean})",
        true)
})

test('outputs nested types', async () => {
    await expectOutput(
        "{ \"foo\": true, \"bar\": { \"foo\": 1, \"bar\": false } }",
        "t.type({foo:t.boolean,bar:t.type({foo:t.number,bar:t.boolean})})",
        true)
})

test('outputs arrays', async () => {
    await expectOutput(
        "[{\"foo\":\"bar\"}]",
        "t.array(t.type({foo:t.string}))",
        true)
})

test('outputs root type by default', async () => {
    await expectOutput(
        "[{\"foo\":\"bar\"}]",
        "const RootInterface = t.array(t.type({foo:t.string}))")
})

test('overwrites duplicate keys', async () => {
    await expectOutput(
        "{\"foo\":\"bar\",\"foo\": 2}",
        "const RootInterface = t.type({foo:t.number})")
})

const expectOutput = async (input, output, raw = false) => {
    await failExceptions(async () => {
        const process_output = await process_input(input, raw)
        expect(process_output.toString()).toBe(output)
    })
}

const process_input = async (input, raw = false) => {
    const args = [].concat(
        [script_name],
        raw ? ["--raw"] : []
    )
    const ps = spawn(process.argv[0], args)
    return new Promise((resolve, reject) => {
        let stdout_chunks = []
        let stderr_chunks = []
        ps.on('close', (code, signal) => {
            if (code !== 0) {
                reject({
                    code: code,
                    stdout: Buffer.from(stdout_chunks.join(""), 'utf-8').toString(),
                    stderr: Buffer.from(stderr_chunks.join(""), 'utf-8').toString()
                })
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

const failExceptions = async (fn) => {
    try {
        return await fn.apply(this, arguments)
    } catch (e) {
        fail(e)
    }
}