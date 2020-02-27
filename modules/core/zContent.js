const router = require("express").Router()
const h = require("../../lib/helpers")
const db = require("./database").db
const store = require("../../index").store //cookie store

//create category
router.post("/admin/new_category",(req,res) => {
    const { parent, name, image, description } = req.body
    const id = h.generate_id(2000)
    if (!h.important_params([id, name, parent], res)) return

    db.run(`INSERT INTO content VALUES("${id}","${name}","${image||"https://i.ytimg.com/vi/OXpjl87Cy9A/hqdefault.jpg"}","${parent}","category","${id}");`,(err) => {
        db.run(`INSERT INTO category VALUES("${id}","${description}")`)
        if(err) return res.status(500).send({ type: "internal error", data: err }) 
        else res.send({type:"created",data:"created category"})
        h.log("category_created",`created category with id '${id}'`)
    })
})

//update category
router.patch("/admin/update_category",(req,res) => {
    const {parent, name, image, description, id} = req.body
    if (!h.important_params([id, name, parent, image, description], res)) return

    db.all(`UPDATE content SET displayname = "${name}", image = "${image}", parent = "${parent}" WHERE id = "${id}"`)
    db.all(`UPDATE category SET description = "${description}" WHERE id = "${id}"`)
    res.send({type:"updated",data:"updated things"})
})

//create media
router.post("/admin/new_media",(req,res) => {
    const {name, path, image, parent, description } = req.body
    const id = h.generate_id(20000)
    if (!h.important_params([id, name, image, parent, description, path], res)) return

    h.log("media_created",`created media with id '${id}'`)

    db.run(`INSERT INTO content VALUES("${id}","${name}","${image}",'${parent}',"media","${id}")`,(err) => {
        db.run(`INSERT INTO media VALUES("${id}","${path}","${description}")`)
        if(err) return res.status(500).send({ type: "internal error", data: err }) 
        else res.send({type:"created",data:"created media"})
    })
})

//update media
router.patch("/admin/update_media",(req,res) => {
    const {parent, name, image, description, path, id} = req.body
    if (!h.important_params([id, name, parent, image, path, description], res)) return

    db.all(`UPDATE content SET displayname = "${name}", image = "${image}", parent = "${parent}" WHERE id = "${id}"`)
    db.all(`UPDATE media SET description = "${description}", path = "${path}" WHERE id = "${id}"`)
    res.send({type:"updated",data:"updated things"})
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

//sends all media. Might put a limit and offset to the query later but it isnt needed rn. This aint netflix sized
router.get("/media",(req,res) => {
    const {filter} = req.query
    db.all(`SELECT * FROM content ${filter ? `WHERE parent = "${filter}"`:""}`,(err,rows) => {
        res.send({type:"OK",data:rows})
    })
})

//get child of common "content" object
router.get("/media/category/:id",(req,res) => {
    db.all(`SELECT * FROM category WHERE id = "${req.params.id}"`,(err, rows) => {
        if(err) return res.send({type:"ERROR",data:err})
        else    res.send({type:"OK",data:rows[0]})
    })
})

//see above
router.get("/media/media/:id",(req,res) => {
    db.all(`SELECT * FROM media WHERE id = "${req.params.id}"`,(err, rows) => {
        if(err) return res.send({type:"ERROR",data:err})
        else    res.send({type:"OK",data:rows[0]})
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

        db.all(`SELECT * FROM media WHERE id = "${id}"`,(err,rows) => {
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

//endpoint to remove a watched time
router.post("/remove_watched",(req,res) => {
    let id = req.body.id
    if (!h.important_params([id], res)) return

    db.all(`DELETE FROM last_watched WHERE id="${id+req.session.user.username}"`,(err) => {
        if(err) return res.send({type:"err",data:err})
        else res.send({type:"OK",data:"deleted"})
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

/* endpoint to create a new invite. currently not availible through admin dashboard
* TODO: add usage of this endpoint via admin dash
*/
router.post("/admin/new_invite",(req,res) => {
    const { id, uses } = req.body
    h.log(`creating invite with id '${id}'`,"media")
    if (!h.important_params([id, uses], res)) return

    db.run(`INSERT INTO invites VALUES("${id}",${uses})`,(err) => {
        if(err) return res.status(500).send({ type: "internal error", data: err }) 
        else res.send({type:"created",data:"created invite"})
    })
})

//get invites 
router.get("/admin/get_invites", (req, res) => {
    db.all("SELECT * FROM invites", (err, rows) => {
        if (err) return res.status(500).send({ type: "internal error", data: "could not query users" })
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