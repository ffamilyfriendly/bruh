const fs = require("fs")
let logBuffer = []

function saveLogs() {
    fs.appendFile("./logfile.txt",logBuffer.join("\n"),(err) => {
        if(err) console.log(`[LOGGER ERROR]: ${err.message}`)
        else logBuffer = []
    })
}

exports.log = (content, type="LOG",saveDirect = false) => {
    const date = new Date()
    const logString = `[${date.getUTCHours()}:${date.getMinutes()}:${date.getUTCSeconds()}/${type.toUpperCase()}]: ${content}`
    console.log(logString)
    logBuffer.push(logString)
    if(logBuffer.length > 10 || saveDirect) saveLogs()
}

exports.important_params = (arr, res) => {
    if (arr.includes(undefined)) {
        res.status(400).send({ type: "bad request", data: "insufficient amount of parameters passed" })
        return false
    } else return true
}

//very basic but should work
exports.sqlEscape = sql => {
    return sql.replace(/\"|\'|\;/gi, ".")
}

exports.generate_id = max => Buffer.from(Math.floor(Math.random() * max).toString()).toString("base64")