const router = require("express").Router()
const db = require("./database").db

// helpers
const h = require("../../lib/helpers")

// crypt
const bcrypt = require('bcrypt');
const saltRounds = 10;

//login
router.post("/login", (req, res) => {
    const { username, password } = req.body //extract emai and password from body
    if (!h.important_params([username, password], res)) return
    db.all(`SELECT * FROM users WHERE id="${h.sqlEscape(username)}"`, (err, row) => {
        if (!row[0]) return res.status(401).send({ type: "credentials", data: "wrong username/password" })
        row = row[0]
        if (err) { h.log(err,"ERROR"); return res.status(500).send({ type: "internal error", data: "could not fetch user data" }) }
        bcrypt.compare(password, row.password, (err, resu) => {
            if (err) { h.log(err,"ERROR"); return res.status(500).send({ type: "internal error", data: "could not compare passwords" }) }
            if (resu) {
                req.session.user = { username: row.id, admin:Boolean(row.admin), activity:{}} //set cookie session
                return res.status(200).send({ type: "logged in", data: "redirecting..." })
            } else {
                h.log(`Visitor with IP ${req.ip} made attempt to log in to account with name "${username}"`,"CREDENTIALS")
                return res.status(401).send({ type: "credentials", data: "wrong username/password" })
            }
        })
    })
})

//create new account
router.post("/register", (req, res) => {
    const { username, password, invite } = req.body
    if (!h.important_params([username, password, invite], res)) return
    db.all(`SELECT * FROM invites WHERE id="${invite}"`,(err,data) => {
        if(!data[0] || data[0].uses <= 0) return res.send({type:"error",data:"no such invite"})
        bcrypt.genSalt(saltRounds, (err, salt) => {
            if (err) { h.log(err,"ERROR"); return res.status(500).send({ type: "internal error", data: "could not generate salt" }) }
            bcrypt.hash(password, salt, (err, hash) => {
                if (err) { h.log(err,"ERROR"); return res.status(500).send({ type: "internal error", data: "could not generate hash" }) }
                db.run(`INSERT INTO users VALUES("${h.sqlEscape(username)}","${hash}",0)`, (err) => {
                    db.all(`UPDATE invites SET uses = uses - 1 WHERE id = "${invite}"`);
                    if (err) { return res.status(500).send({ type: "internal error", data: "could not save user" }) }
                    else return res.status(201).send({ type: "created", data: "user created! logging in..." })
                })
            })
        })
    })

})

router.get("/logout", (req, res) => {
    req.session.destroy()
    res.redirect("/")
})

router.get("/update_user", (req, res) => {
    const email = req.session.user.email
    db.all(`SELECT * FROM users WHERE id = "${email}"`, (err, rows) => {
        const row = rows[0]
        if (!row || err) return res.status(500).send({ type: "internal error", data: "could not get user" })
        req.session.user = { email: row.id, level: row.level } //set cookie session
        return res.send({ type: "OK", data: req.session.user }) //return cookie ID.
    })
})

router.get("/session",(req,res) => {
    return res.send({type:"OK",data:req.sessionID})
})

// from here and below are admin only endpoints (this will include zContent.js since it is loaded after this module)
router.use("/admin", (req, res, next) => {
    if (!req.session || !req.session.user || !req.session.user.admin) return res.status(403).send({ type: "unauthorised", data: "user cookie session does not exist or user is not admin" })
    else next()
})

router.delete("/admin/delete",(req,res) => {
    const {id,type} = req.body
    if (!h.important_params([id,type], res)) return
    db.all(`DELETE FROM ${type} WHERE id = "${id}"`,(err) => {
        if(err) return res.send({type:"error",data:err})
        else return res.send({type:"deleted",data:"user deleted"})
    })
})

router.get("/admin/get_users", (req, res) => {
    db.all("SELECT id, admin FROM users", (err, rows) => {
        if (err) return res.status(500).send({ type: "internal error", data: "could not query users" })
        else res.send(rows)
    })
})

router.get("/admin/connected",(req,res) => {
    res.send(require("../../index").store)
})

router.get("/admin/logs",(req,res) => {
    require("fs").readFile("./logfile.txt",(err,data) => {
        if(err) return res.send(err)
        else res.send(data)
    })
})

module.exports = {
    type: "router",
    base_url: "/api/",
    router: router
}