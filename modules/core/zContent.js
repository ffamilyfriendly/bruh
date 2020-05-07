const router = require("express").Router()
const h = require("../../lib/helpers")
const db = require("./1.database").db
const store = require("../../index").store //cookie store

//create category

// id TEXT PRIMARY KEY, displayname TEXT, description TEXT, thumbnail TEXT, parent TEXT, type TEXT, path TEXT, autometa INTEGER
router.post("/admin/content/:id",(req,res) => {
    const { parent, displayname = "no displayname ", description = "no description", thumbnail = "none", type, path = "none", autometa = 0 } = req.body
    const id = req.params.id
    if (!h.important_params([parent, type], res)) return

    db.run(`INSERT INTO content VALUES("${id}","${displayname}","${description}","${thumbnail}","${parent}","${type}","${path}",${autometa});`,(err) => {
        if(err) return res.send(err.message)
        else res.redirect(`/browse/${parent}`)
    })
})

router.delete("/admin/content/:id", (req,res) => {
    db.all(`DELETE FROM content WHERE id = "${req.params.id}"`,(e) => {
        if(e) return res.status(500).send({type:"INTERNAL_ERROR",data:e.message})
        else res.status(200).send({type:"OK",data:"content deleted"})
    })
})


//search media
router.get("/search",(req,res) => {
    const query = req.query.q
    if (!h.important_params([query], res)) return

    db.all(`SELECT * FROM content WHERE displayname LIKE "%${query}%" OR id LIKE "%${query}%"`,(err,rows) => {
        if(err) return res.send({type:"ERROR",data:err})
        res.send({type:"OK",data:rows})
    })
})

/* main function that serves the file.
*  it runs a db query any time the endpoint is called (which is a lot when serving big files).
*  in the future the query might be cached?
*/
router.get("/media/:session/:id",(req,res) => {
    const { session, id } = req.params
    store.get(session,(err,sess) => {
        if (!h.important_params([session, id, sess], res)) return

        db.all(`SELECT * FROM content WHERE id = "${id}"`,(err,rows) => {
            let row = rows[0]
            if(row && row.path) {
                try {
                    res.sendFile(row.path)
                } catch(err) {
                    h.log(err,"FILE_ERROR")
                }  
            } else {
                res.status(404).send("not found")
            }
        })
    })
})

//endpoint to register a watched time
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

//get last_watched whatever
router.get("/hasWatched",(req,res) => {
    const id = req.query.id
    if (!h.important_params([id], res)) return

    db.all(`SELECT * FROM last_watched WHERE id = "${id+req.session.user.username}"`,(err,rows) => {
        if(err) return res.send({type:"error",data:err})
        else res.send(rows)
    })
})

module.exports = {
    type: "router",
    base_url: "/api/",
    router: router,
    meta: {
        name:"core.content",
        description:"manages serving and creating of the content"
    }
}