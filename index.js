const express = require("express")
const app = express()
const config = require("./config")
const cs = require("cookie-session")

const getFileList = require("./lib/loader")
app.use(require("body-parser").urlencoded({extended:true}))
app.use(cs({
    name:"session",
    keys:["bruh"],
    maxAge: 24 * 60 * 60 * 1000
}))
const fileUpload = require("express-fileupload")
app.use(fileUpload())
app.use("/static",express.static("front"))

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

app.get("*",(req,res) => {
    res.sendFile(require("path").join(__dirname,"./front","404.html"))
})

app.listen(config.port)