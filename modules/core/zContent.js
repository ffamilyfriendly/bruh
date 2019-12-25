const router = require("express").Router()
const fs = require("fs")
const conf = require("../../config")
const h = require("../../lib/helpers")
const db = require("./database").db
const store = require("../../index").store //cookie store

//get movies
router.get("/get_movies", (req, res) => {
    const category = req.query.category //category query is optional. if one is passed only movies from that category will be returned
    db.all(`SELECT * FROM movies WHERE level < ${req.session.user.level} ${category ? `AND category = "${h.sqlEscape(category)}"` : ""}`, (err, rows) => {
        if (err) return res.status(500).send({ type: "internal error", data: err })
        else res.send(rows)
    })
})

//get all categories. 
router.get("/get_categories", (req, res) => {
    db.all(`SELECT * FROM categories WHERE level < ${req.session.user.level}`, (err, rows) => {
        if (err) return res.status(500).send({ type: "internal error", data: err })
        else res.send(rows)
    })
})

//send movie

/*
this method now requires you to pass the session id. this is to allow airplay since it isnt working in earlier versions
due to it getting blocked by the "not logged in filter". Hopefully this way the media is "publicly" availible as long as you have the link
*/
router.get("/movie/:session/:id", (req, res) => {
    const { session, id } = req.params //id of movie
    store.get(session, (err, sess) => {
        if (!h.important_params([id, session, sess], res)) return
        const user = sess.user
        db.all(`SELECT * FROM movies WHERE id = "${h.sqlEscape(id)}" AND level < ${user.level}`, (err, row) => {
            if (err) return res.status(500).send({ type: "internal error", data: err })
            row = row[0] //this is a dumb way to do this but i cant get it to work otherwise
            if (!row) return res.status(404).send({ type: "not found", data: "media is not found" })
            res.sendFile(row.path)
        })
    })
})

//get info about movie
router.get("/info/:id", (req, res) => {
    const id = req.params.id
    db.all(`SELECT * FROM movies WHERE id = "${h.sqlEscape(id)}" AND level < ${req.session.user.level}`, (err, row) => {
        if (err) return res.status(500).send({ type: "internal error", data: err })
        row = row[0]
        if (!row) return res.status(404).send({ type: "not found", data: "media is not found" })
        res.send(row)
    })
})

//this endpoint is EXTREMELY dangerous. It should be safe since user level is checked but i'll have to work on this
router.post("/admin/save_changes", (req, res) => {
    const { table, id, changes } = req.body
    if (!h.important_params([table, id, changes], res)) return
    //construct SQL query... this code is very bodged but itworks™️
    let sql = `UPDATE ${table} SET `
    const keys = Object.keys(changes)
    for (let i = 0; i < keys.length; i++) {
        let change = keys[i]
        changes[change] = typeof changes[change] == "number" ? changes[change] : `"${changes[change]}"`
        sql += `${change} = ${changes[change]}${keys[i + 1] ? "," : ""} ` //bodge... such a lovely word
    }
    sql += ` WHERE id = "${id}"`
    db.all(sql, (err) => {
        if (err) return res.status(500).send({ type: "internal error", data: err })
        else res.status(200).send({ type: "OK", data: `updated "${table}" table` })
    })
})

router.post("/admin/remove", (req, res) => {
    const { table, identifier } = req.body
    if (!h.important_params([table, identifier], res)) return
    const sql = `DELETE FROM ${table} WHERE id = "${identifier}"`
    db.all(sql, (err) => {
        console.log(err)
        if (err) return res.status(500).send({ type: "internal error", data: err })
        else res.status(200).send({ type: "OK", data: "deleted" })
    })

})

router.get("/admin/get_content", (req, res) => {
    let paths = []
    for (let i = 0; i < conf.media.path.length; i++) {
        paths.push(...require("../../lib/loader")(conf.media.path[i]))
    }
    res.send(paths)
})

//upload a movie
router.post("/admin/upload", (req, res) => {
    const { name, level, path, category } = req.body
    if (!h.important_params([name, level, path, category], res)) return
    const id = h.generate_id(2000) //generate id

    const meta = {
        uploaded: +new Date() //unix epoch
    }

    db.run(`INSERT INTO movies VALUES ("${id}","${name}","${category}","${path}",${level},'${JSON.stringify(meta)}')`, (err) => {
        console.log(err)
        if (err) return res.status(500).send({ type: "internal error", data: err });
        else res.status(201).send({ type: "created", data: path })
    })
})

//create a category
router.post("/admin/new_category", (req, res) => {
    const { name, level } = req.body
    if (!h.important_params([name, level], res)) return
    const image = req.files ? req.files.image : null //image
    let media_path //initialize media path

    if (image) {
        media_path = `./front/assets/${name}.png`
        fs.writeFileSync(media_path, image.data)
    } else media_path = "./front/assets/defualt.png"
    db.run(`INSERT INTO categories VALUES ("${name}","${media_path}",${level})`, (err) => {
        if (err) return res.status(500).send({ type: "internal error", data: err });
        else res.status(201).send({ type: "created", data: media_path })
    })
})

module.exports = {
    type: "router",
    base_url: "/api/",
    router: router
}