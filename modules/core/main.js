const router = require("express").Router()
const path = require("path")

router.get("/",(req,res) => {
    res.sendFile(path.join(__dirname,"../../front","index.html"))
})

router.get("/login",(req,res) => {
    res.sendFile(path.join(__dirname,"../../front","login.html"))
})

router.get("/register",(req,res) => {
    res.sendFile(path.join(__dirname,"../../front","register.html"))
})

router.get("/admin",(req,res) => {
    if(!req.session.user || req.session.user.level < 100) return res.status(403).send({type:"unauthorised",data:"user cookie session does not exist or user level is less then 100"})
    else res.sendFile(path.join(__dirname,"../../front","admin.html"))
})

module.exports = {
    type: "router",
    base_url: "/",
    router:router
}