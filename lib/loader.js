/*
this code is stolen shamelessly from Wait_What_ who is much better then me at coding.
His gitlab: https://gitlab.com/Wait_What_/
*/
const fs = require("fs")
module.exports = dir => {
    let res = []
    fs.readdirSync(dir).forEach(file => {
        const fileDir = `${dir}/${file}`
        const stat = fs.statSync(fileDir)

        if (stat && stat.isDirectory())
            res = [...res, ...module.exports(fileDir)]
        else res.push(fileDir)
    })

    return res

}