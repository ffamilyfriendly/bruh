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
app.set('view engine', 'ejs');
app.set("views",require("path").join(__dirname,"./front/views"))

let plugins = []

module.exports = {
    store: store,
    plugins:plugins
}

getFileList("./modules").forEach(m => {
    const mod = require(m)
    if(!mod.meta) mod.meta = {name:"this plugin has no name",description:"this plugin has no description",readme:"this plugin has no readme file"}
    plugins.push({
        enabled: !(mod.enabled === false),
        name: mod.meta.name || "this plugin has no name",
        description: mod.meta.description||"this plugin has no description",
        readme:mod.meta.readme||"this plugin has no readme file",
        type:mod.type
    })

    if (mod.enabled === false) {
        //do something here possibly idk
    } else {
        if (mod.type === "router") {
            app.use(mod.base_url, mod.router)
        } else if (mod.type === "modules") {
            mod.run()
        }
    }
})

app.get("*", (req, res) => {
    res.redirect("/error#404")
})

app.listen(config.port, () => {
console.log(`
 _                _     
| |__  _ __ _   _| |__  
| '_ \\| '__| | | | '_ \\ 
| |_) | |  | |_| | | | |
|_.__/|_|   \\__,_|_| |_|
########################
Port: ${config.port}
Pid: ${process.pid}
Any issues? Report them on the repo with log.

Thank you for using BRUH!`)
})