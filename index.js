const express = require("express")
const app = express()
const config = require("./config")
const cs = require("express-session")
const store = new cs.MemoryStore()

const getFileList = require("./lib/loader")
const log = require("./lib/helpers").log

app.use(require("body-parser").urlencoded({ extended: true }))
app.use(cs({
    secret: config.cookie_secret,
    resave: true,
    saveUninitialized: true,
    store: store,
    cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000
    }
}))
app.use("/static", express.static("front"))

module.exports = {
    store: store
}

getFileList("./modules").forEach(m => {
    const mod = require(m)
    if (mod.enabled === false) {
        log(`module "${m}" disabled`)
    } else {
        log(`loaded module "${m}"`)
        if (mod.type === "router") {
            app.use(mod.base_url, mod.router)
        } else if (mod.type === "modules") {
            mod.run()
        }
    }
})

app.get("*", (req, res) => {
    res.sendFile(require("path").join(__dirname, "./front", "404.html"))
})

const shutdown = () => {
    log("shutting down...","exit",true)
    setTimeout(() => {process.exit(0)},1000) //allow time for writing to logfile
}

process.on("SIGINT",() => {shutdown()})

app.listen(config.port)