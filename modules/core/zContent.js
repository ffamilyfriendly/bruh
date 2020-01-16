const router = require("express").Router()
const fs = require("fs")
const conf = require("../../config")
const h = require("../../lib/helpers")
const db = require("./database").db
const store = require("../../index").store //cookie store

//struct CREATE TABLE IF NOT EXISTS content (id TEXT PRIMARY KEY, parent TEXT, type TEXT, data TEXT)

router.post("/admin/new_category",(req,res) => {
    const { id, parent, image, description } = req.body
    h.log(`creating category with id "${id}"`,"media")
    const data = {
        image:image||"https://i.ytimg.com/vi/OXpjl87Cy9A/hqdefault.jpg",
        description:description
    }
    if (!h.important_params([id, parent], res)) return
    db.run(`INSERT INTO content VALUES("${id}","${parent||"NOPARENT"}","category",'${JSON.stringify(data)}')`,(err) => {
        if(err) return res.status(500).send({ type: "internal error", data: err }) 
        else res.send({type:"created",data:"created category"})
    })
})

router.post("/admin/new_media",(req,res) => {
    const { id, name, path, image, parent, description } = req.body
    if (!h.important_params([id, name, path], res)) return
    h.log(`creating media with id "${id}"`,"media")
    const data = {
        image:image||"https://i.ytimg.com/vi/OXpjl87Cy9A/hqdefault.jpg",
        path:path,
        name:name,
        description:description
    }
    db.run(`INSERT INTO content VALUES("${id}","${parent||"NOPARENT"}","media",'${JSON.stringify(data)}')`,(err) => {
        if(err) return res.status(500).send({ type: "internal error", data: err }) 
        else res.send({type:"created",data:"created media"})
    })
})

router.get("/media",(req,res) => {
    const filter = req.query.filter
    db.all(`SELECT * FROM content ${filter ? `WHERE parent = "${filter}"`:""}`,(err,rows) => {
        res.send({type:"OK",data:rows})
    })
})

router.get("/media/:session/:id",(req,res) => {
    const { session, id } = req.params
    store.get(session,(err,sess) => {
        if (!h.important_params([session, id, sess], res)) return
        db.all(`SELECT * FROM content WHERE id = "${id}"`,(err,rows) => {
            let row = rows[0]
            row.data = JSON.parse(row.data)
            if(row.type === "media" && row.data.path) {
                try {
                    res.sendFile(row.data.path)
                } catch(err) {
                    h.log(err,"FILE_ERROR")
                }  
            }
        })
    })
})

router.post("/register_watched",(req,res) => {
    let { id, time } = req.body
    time = Number(time)
    if (!h.important_params([id, time], res)) return
    if(typeof time != "number") return res.send({type:"Type mismatch",data:"time must be a number"})
    const sql = `INSERT OR REPLACE INTO last_watched VALUES("${id+req.session.user.username}",${time})`
    db.all(sql,(err) => {
        if(err) return res.send({type:"err",data:err})
        else return res.send({type:"OK",data:"registered last watched"})
    })
})

router.post("/remove_watched",(req,res) => {
    let id = req.body.id
    if (!h.important_params([id], res)) return
    db.all(`DELETE FROM last_watched WHERE id="${id+req.session.user.username}"`,(err) => {
        if(err) return res.send({type:"err",data:err})
        else res.send({type:"OK",data:"deleted"})
    })
})

router.get("/hasWatched",(req,res) => {
    const id = req.query.id
    if (!h.important_params([id], res)) return
    db.all(`SELECT * FROM last_watched WHERE id = "${id+req.session.user.username}"`,(err,rows) => {
        if(err) return res.send({type:"error",data:err})
        else res.send(rows)
    })
})

router.post("/admin/new_invite",(req,res) => {
    const { id, uses } = req.body
    h.log(`creating invite with id "${id}"`,"media")
    if (!h.important_params([id, uses], res)) return
    db.run(`INSERT INTO invites VALUES("${id}",${uses})`,(err) => {
        if(err) return res.status(500).send({ type: "internal error", data: err }) 
        else res.send({type:"created",data:"created invite"})
    })
})

router.post("/admin/query_database",(req,res) => {
    const sql = req.body.sql
    if (!h.important_params([sql], res)) return
    db.all(sql,(err,rows) => {
        if(err) return res.send(err)
        else res.send(rows)
    })
})


router.get("/admin/get_invites", (req, res) => {
    db.all("SELECT * FROM invites", (err, rows) => {
        if (err) return res.status(500).send({ type: "internal error", data: "could not query users" })
        else res.send(rows)
    })
})


module.exports = {
    type: "router",
    base_url: "/api/",
    router: router
}