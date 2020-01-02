const express = require("express")
const app = express()
const config = require("./config")
const cs = require("express-session")
const store = new cs.MemoryStore()
const getFileList = require("./lib/loader")
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
        console.log(`module "${m}" disabled`)
    } else {
        let load_text = `\nloaded module "${m}"`
        load_text = "#".repeat(load_text.length) + load_text + `\n-type:${mod.type}`
        console.log(load_text)
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

app.listen(config.port)