const router = require("express").Router()
const path = require("path")

router.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../../front", "index.html"))
})

router.get("/invite", (req, res) => {
    res.sendFile(path.join(__dirname, "../../front/", "invite.html"))
})


//middleware to make sure user is logged in. 
router.use((req, res, next) => {
    const exclude = ["/api/login", "/api/register"] //exclude endpoints used to log in
    if (req.url.includes("/api/media/")) return next() //this might cause issues... or not
    if (!req.session.user && !exclude.includes(req.url)) return res.send({type:"error",data:"you must be logged in"}) //if there is no user obj redirect to login page 
    else next() //if user object continue
})

router.get("/admin", (req, res) => {
    if (!req.session.user || !req.session.user.admin) return res.status(403).send({ type: "unauthorised", data: "user cookie session does not exist or user level is less then 100" })
    res.sendFile(path.join(__dirname, "../../front/admin", "dashMain.html"))
})

router.get("/watch", (req, res) => {
    res.sendFile(path.join(__dirname, "../../front", "watch.html"))
})

module.exports = {
    type: "router",
    base_url: "/",
    router: router
}