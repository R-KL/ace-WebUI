
let ringBuffer = [];
let lineBuffer = '';
let commands = {
}
/**
 * Registers a command with its execution function.
 * @param {string} command - The command string.
 * @param {string|object} option - The function to execute or a string response.
 */
function execCommand(command, obj) {
        for (const key in obj) {
        if (typeof obj[key] === "function") {
            obj[key] = obj[key].bind(obj);
        }
    }
    commands[command] = obj;
}
/**
 * Initializes terminal Output
 * @param {string} InitalValue - The fist string to display in terminal
 * @returns {string} The initialized output string.
 */
function nl(input) {
    return input + '\r\n>>> ';
}
function ln(input) {
    return '\r\n' + input;
}
/**
 * Parses input data, updates the ring and line buffers, and builds output.
 * Handles special characters like newline, Ctrl+C, Ctrl+L, and backspace.
 * @param {string} data - The input character or string to parse.
 * @returns {string} The updated output string.
 */
function ParseInput(data) {
    let output = '';
    lineBuffer += data;
    if (data === '\x03') { // Ctrl+C
        output += nl('^C');
        lineBuffer = '';
    } else if (data === '\x1bc') { // Ctrl+L
        output += '\x1bc';
        lineBuffer = '';
    } else if (data === '\x7f') { // Backspace
        if (lineBuffer.length > 1) {
            lineBuffer = lineBuffer.slice(0, -2);
            output += '\b \b';
        }
        else {
            lineBuffer = lineBuffer.slice(0, -1);
        }
    } else { output += data; }
    if (ringBuffer.length > 100) { ringBuffer.shift(); }
    if (data === '\r' || data === '\n') {
        const input = lineBuffer.trim();
        const tokens = input.split(/\s+/);

        const cmd = tokens[0];
        const sub = tokens[1];
        const arg = tokens.slice(2).join(" ");

        const entry = commands[cmd];
        let result = "";

        if (!entry) {
            result = `${cmd}: command not found`;

        } else if (typeof entry === "function") {
            // Simple function command
            result = entry(arg);

        } else if (typeof entry === "object") {
            // Object-style command
            if (!sub || !entry[sub]) {
                result = `${cmd}: invalid subcommand`;
            } else {
                const fn = entry[sub];
                if (typeof fn === "function") {
                    result = fn.call(entry, arg);
                } else {
                    result = fn;
                }
            }
        }
        lineBuffer = '';
        output += nl(ln(result));
        ringBuffer.push(input);
    }

    return output;
};

/**
 * Returns the requested buffer type.
 * @param {string} type - The buffer type: 'ring' for ringBuffer or 'line' for lineBuffer.
 * @param {number} index - Unused parameter (possibly for future indexing).
 * @returns {Array|string} The ringBuffer array if type is 'ring', otherwise the lineBuffer string.
 */
function getBuffer(type, index) {
    // Returns the requested buffer type.
    if (type === 'ring') {
        return ringBuffer;
    } else if (type === 'line') {
        return lineBuffer;
    }
    return lineBuffer;
}

export { ParseInput, getBuffer, execCommand, nl };