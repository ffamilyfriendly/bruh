const router = require("express").Router()
const db = require("./database").db

// helpers
const h = require("../../lib/helpers")

// crypt
const bcrypt = require('bcrypt');
const saltRounds = 10;

//login
router.post("/login",(req,res) => {
    const {email, password} = req.body //extract emai and password from body
    if(!h.important_params([email,password],res)) return
    if(!h.validate([email],"user")) return res.status(400).send({type:"bad request",data:"not valid email adress"})
    db.all(`SELECT * FROM users WHERE id="${h.sqlEscape(email)}"`,(err,row) => {
        if(!row[0]) return res.status(401).send({type:"credentials",data:"wrong username/password"})
        row = row[0]
        if(err){ console.error(err); return res.status(500).send({type:"internal error",data:"could not fetch user data"})}
        bcrypt.compare(password,row.password,(err,resu) => {
            if(err){ console.error(err); return res.status(500).send({type:"internal error",data:"could not compare passwords"})}
            if(resu) {
                req.session.user = {email:row.id,level:row.level} //set cookie session
                return res.status(200).send({type:"logged in",data:"redirecting..."})
            } else {
                return res.status(401).send({type:"credentials",data:"wrong username/password"})
            }
        })
    })
})

//create new account
router.post("/register",(req,res) => {
    const {email, password} = req.body
    if(!h.important_params([email,password],res)) return
    if(!h.validate([email],"user")) return res.status(400).send({type:"bad request",data:"not valid email adress"})
    bcrypt.genSalt(saltRounds,(err,salt) => {
        if(err) {console.error(err); return res.status(500).send({type:"internal error",data:"could not generate salt"})}
        bcrypt.hash(password,salt,(err,hash) => {
            if(err) {console.error(err); return res.status(500).send({type:"internal error",data:"could not generate hash"})}
            db.run(`INSERT INTO users VALUES("${h.sqlEscape(email)}","${hash}",0)`,(err) => {
                if(err) {return res.status(500).send({type:"internal error",data:"could not save user"})}
                else return res.status(201).send({type:"created",data:"user created! logging in..."})
            })
        })
    })
})

router.get("/logout",(req,res) => {
    req.session.destroy()
    res.redirect("/")
})

router.get("/update_user",(req,res) => {
    const email = req.session.user.email
    db.all(`SELECT * FROM users WHERE id = "${email}"`,(err,rows) => {
        const row = rows[0]
        if(!row || err) return res.status(500).send({type:"internal error",data:"could not get user"})
        req.session.user = {email:row.id,level:row.level} //set cookie session
        return res.send({type:"OK",data:req.sessionID}) //return cookie ID.
    })
})

//requests are public
router.get("/get_requests",(req,res) => {
    db.all("SELECT * FROM requests",(err,rows) => {
        if(err) return res.status(500).send({type:"internal error",data:err})
        else res.send(rows)
    })
})

router.post("/new_request",(req,res) => {
    const request = req.body.request
    if(!h.important_params([request],res)) return
    db.run(`INSERT INTO requests VALUES ("${h.generate_id(2000)}","${h.sqlEscape(request)}","not answered")`,(err) => {
        if(err) {console.error(err); return res.status(500).send({type:"internal error",data:"could not generate hash"})}
        else res.status(201).send({type:"created",data:`request ticket created`})
    })
})

// from here and below are admin only endpoints (this will include zContent.js since it is loaded after this module)
router.use("/admin",(req,res,next) => {
    if(!req.session || !req.session.user || req.session.user.level < 100) return res.status(403).send({type:"unauthorised",data:"user cookie session does not exist or user level is less then 100"})
    else next()
})

router.get("/admin/get_users",(req,res) => {
    db.all("SELECT id, level FROM users",(err,rows) => {
        if(err) return res.status(500).send({type:"internal error",data:"could not query users"})
        else res.send(rows)
    })
})

module.exports = {
    type: "router",
    base_url: "/api/",
    router:router
}