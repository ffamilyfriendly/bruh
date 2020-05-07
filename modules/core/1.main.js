const router = require("express").Router()
const path = require("path")
const db = require("./1.database").db

router.get("/", (req, res) => {
    if(req.session && req.session.user) {
        res.redirect("/browse/root")
    } else {
        res.sendFile(path.join(__dirname, "../../front", "index.html"))
    }
})

router.get("/error", (req, res) => {
    res.sendFile(path.join(__dirname, "../../front/", "error.html"))
})

router.get("/invite/:id", (req, res) => {
    db.all(`SELECT * FROM invites WHERE id = "${req.params.id}"`,(e,rows) => {
        if(rows[0]) {
            res.render("invite.ejs",{invite:rows[0]})
        } else {
            res.redirect("/error#INVITE_NOT_EXIST")
        }
    })
})

router.get("/plugins",(req,res) => {
    res.send(require("../../index").plugins)
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

module.exports = {
    type: "router",
    base_url: "/",
    router: router,
    meta: {
        name:"core.main",
        description:"serves the html-files"
    }
}