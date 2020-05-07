const router = require("express").Router()
const db = require("./1.database").db

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
        if (err) { console.log(err); return res.status(500).send({ type: "internal error", data: "could not fetch user data" }) }
        bcrypt.compare(password, row.password, (err, resu) => {
            if (err) { console.log(err); return res.status(500).send({ type: "internal error", data: "could not compare passwords" }) }
            if (resu) {
                req.session.user = { username: row.id, admin:Boolean(row.admin), activity:{}} //set cookie session
                return res.status(200).send({ type: "LOGIN_OK", data: "redirecting..." })
            } else {
                return res.status(401).send({ type: "LOGIN_CRED", data: "wrong username/password" })
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
            if (err) { console.log(err); return res.status(500).send({ type: "internal_error", data: "could not generate salt" }) }
            bcrypt.hash(password, salt, (err, hash) => {
                if (err) { console.log(err); return res.status(500).send({ type: "internal_error", data: "could not generate hash" }) }
                db.run(`INSERT INTO users VALUES("${h.sqlEscape(username)}","${hash}",0)`, (err) => {
                    db.all(`UPDATE invites SET uses = uses - 1 WHERE id = "${invite}"`);
                    h.log("user_created",`new user '${username}' registered!`)
                    if (err) { return res.status(500).send({ type: "internal_error", data: "could not save user" }) }
                    else return res.status(201).send({ type: "user_created", data: "user created! logging in..." })
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

router.get("/admin/get_users", (req, res) => {
    db.all("SELECT id, admin FROM users", (err, rows) => {
        if (err) return res.status(500).send({ type: "internal error", data: "could not query users" })
        else res.send(rows)
    })
})

router.get("/admin/logs",(req,res) => {
    db.run("SELECT * FROM audit",(e,data) => {
        res.send(data)
    })
})

module.exports = {
    type: "router",
    base_url: "/api/",
    router: router,
    meta: {
        name:"core.user_api",
        description:"handles the users"
    }
}