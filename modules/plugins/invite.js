const router = require("express").Router()
const path = require("path")
const h = require("../../lib/helpers")
const db = require("../core/database").db

/*
right now there is no way to admin invites through the admin UI.
*/

router.get("/invite/:code", (req, res) => {
    res.sendFile(path.join(__dirname, "../../front/plugin_html", "invite.html"))
})

router.get("/api/get_invite", (req, res) => {
    if (!h.important_params([req.query.id], res)) return
    db.all("DELETE FROM invites WHERE uses < 1")
    db.all(`SELECT * FROM invites WHERE id="${h.sqlEscape(req.query.id)}"`, (err, rows) => {
        const row = rows[0]
        if (!row) return res.status(404).send({ type: "not found", data: "invite not found" })
        const returnObject = {
            invite: row,
            content: undefined
        }
        db.all(`SELECT * FROM movies WHERE level < ${row.level};`, (err, rows) => {
            returnObject.content = rows
            return res.send(returnObject)
        })
    })
})

router.post("/api/use_invite", (req, res) => {
    if (!h.important_params([req.body.id, req.session.user.email], res)) return
    db.all(`SELECT * FROM invites WHERE id="${h.sqlEscape(req.body.id)}"`, (err, rows) => {
        const row = rows[0]
        if (!row) return res.status(404).send({ type: "not found", data: "invite not found" })
        db.all(`UPDATE users SET level = ${row.level} WHERE id = "${req.session.user.email}";`, (err) => {
            db.all(`UPDATE invites SET uses = uses - 1 WHERE id = "${req.body.id}";`)
            if (err) return res.status(500).send("handle err")
            else res.send({ type: "OK", data: "changed user level" })
        })
    })
})


module.exports = {
    enabled: false, //this aint usefull for everyone so i defualt to false
    type: "router",
    base_url: "/",
    router: router
}