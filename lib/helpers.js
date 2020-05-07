const db = require("../modules/core/1.database").db

exports.log = (type, reason) => {
    const date = new Date()
    db.run(`INSERT INTO audit VALUES("${type}","${reason}","${date}")`)
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