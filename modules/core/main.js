const router = require("express").Router()
const path = require("path")

router.get("/",(req,res) => {
    res.sendFile(path.join(__dirname,"../../front","index.html"))
})

router.get("/login",(req,res) => {
    res.sendFile(path.join(__dirname,"../../front","login.html"))
})

module.exports = {
    type: "router",
    base_url: "/",
    router:router
}