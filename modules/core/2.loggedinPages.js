const router = require("express").Router()
const path = require("path")
const db = require("./1.database").db

router.get("/browse/:id", (req, res) => {
    db.all(`SELECT * FROM content WHERE parent = "${req.params.id}"`, (err, rows) => {
        res.render("browse",{data:rows,user:req.session.user,curr:req.params.id})
    })
})

router.get("/watch",(req,res) => {
    if(!req.query.v) return res.redirect("/")
    db.all(`SELECT * FROM content WHERE id = "${req.query.v}" AND type = "movie"`,(err,data) => {
        if(err) return res.status(500).send({type:"INTERNAL_ERROR",data:err.message})
        else {
            if(!data[0]) return res.redirect("/error#404")
            res.render("watch",{user:req.query.user,movie:data[0],sessionid:req.sessionID})
        }
    })
})

module.exports = {
    type: "router",
    base_url: "/",
    router: router,
    meta: {
        name:"core.main",
        description:"serves the html-files for logged in only"
    }
}