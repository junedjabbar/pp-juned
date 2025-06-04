export function safeStringify(obj) {
    const seen = new Set()
    return JSON.stringify(obj, (key, value) => {
        if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) {
                return '[Circular]'
            }
            seen.add(value)
        }

        return value
    }, 3)
}