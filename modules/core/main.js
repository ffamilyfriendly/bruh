const router = require("express").Router()
const path = require("path")

router.get("/",(req,res) => {
    res.sendFile(path.join(__dirname,"../../front","index.html"))
})

router.get("/terms",(req,res) => {
    res.sendFile(path.join(__dirname,"../../front","tos.html"))
})

router.get("/login",(req,res) => {
    res.sendFile(path.join(__dirname,"../../front","login.html"))
})

router.get("/register",(req,res) => {
    res.sendFile(path.join(__dirname,"../../front","register.html"))
})

//middleware to make sure user is logged in. 
router.use((req,res,next) => {
    const exclude = ["/api/login","/api/register"] //exclude endpoints used to log in
    if(!req.session.user && !exclude.includes(req.url)) return res.redirect(`/login?redirect=${encodeURI(req.url)}`) //if there is no user obj redirect to login page 
    else next() //if user object continue
})

router.get("/home",(req,res) => {
    res.sendFile(path.join(__dirname,"../../front","home.html"))
})

router.get("/watch",(req,res) => {
    res.sendFile(path.join(__dirname,"../../front","watch.html"))
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