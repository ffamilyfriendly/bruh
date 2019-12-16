const express = require("express")
const app = express()
const config = require("./config")

const getFileList = require("./lib/loader")
app.use(require("body-parser").urlencoded({extended:true}))
getFileList("./modules").forEach(m => {
    const module = require(m)
    let load_text = `\nloaded module "${m}"`
    load_text = "#".repeat(load_text.length) + load_text + `\n-type:${module.type}` 
    console.log(load_text)
    if(module.type === "router") {
        app.use(module.base_url,module.router)
    } else if(module.type === "modules") {
        module.run()
    }
})

app.use("/static",express.static("front"))

app.listen(config.port)