/*
TODO: document this
haha like that will ever happen
*/

const router = require("express").Router()
const fs = require("fs")
//maybe using a different database file is good for content delivery but idc
const db = require("./database").db

const allowed = (req,row) => row.level <= req.session.user.level

router.get("/get_movies",(req,res) => {
    db.all(`SELECT * FROM movies WHERE level < ${req.session.user.level}`,(err,rows) => {
        if(err) return res.status(500).send({type:"internal error",data:err})
        else res.send(rows)
    })
})

router.get("/movie/:id",(req,res) => {
    const id = req.params.id
    db.all(`SELECT * FROM movies WHERE id = "${id}"`,(err,row) => {
        if(err) return res.status(500).send({type:"internal error",data:err})
        row = row[0]
        if(!row) return res.status(404).send({type:"not found",data:"media is not found"})
        if(!allowed(req,row)) return res.status(403).send({type:"unauthorized",data:"you are not allowed to view this content"})
        res.sendFile(require("path").join(__dirname,"../../",row.path))
    })
})

router.get("/info/:id",(req,res) => {
    const id = req.params.id
    db.all(`SELECT * FROM movies WHERE id = "${id}"`,(err,row) => {
        if(err) return res.status(500).send({type:"internal error",data:err})
        row = row[0]
        if(!row) return res.status(404).send({type:"not found",data:"media is not found"})
        if(!allowed(req,row)) return res.status(403).send({type:"unauthorized",data:"you are not allowed to view this content"})
        res.send(row)
    })
})

// from here and below are admin only endpoints
router.use((req,res,next) => {
    if(!req.session.user || req.session.user.level < 100) return res.status(403).send({type:"unauthorised",data:"user cookie session does not exist or user level is less then 100"})
    else next()
})

router.post("/edit_movie",(req,res) => {
    const {id,changes} = req.body
    if(!id || !changes) return res.status(400).send({type:"bad request",data:"missing params"})
    let sql = `UPDATE movies SET `
    const keys = Object.keys(changes)
    for(let i = 0; i < keys.length; i++) {
        let change = keys[i]
        changes[change] = change === "level" ? changes[change] : `"${changes[change]}"`
        sql += `${change} = ${changes[change]}${keys[i+1] ? "," : ""} ` //bodge... such a lovely word
    }
    sql += ` WHERE id = "${id}"`
    db.all(sql,(err) => {
        if(err) return res.status(500).send({type:"internal error",data:err})
        else res.status(200).send({type:"OK",data:"updated movie table"})
    })
})

router.post("/remove_movie",(req,res) => {
    const id = req.body.id
    if(!id) return res.status(400).send({type:"bad request",data:"no id passed"})
    db.all(`SELECT * FROM movies WHERE id = "${id}"`,(err,row) => {
        if(err) return res.status(500).send({type:"internal error",data:"could not query database"})
        row = row[0]
        if(!row) return res.status(404).send({type:"not found",data:`row with id "${id}" not found`})
        else {
            db.all(`DELETE FROM movies where id = "${id}"`)
            fs.unlink(row.path,(err) => {
                if(err) return res.status(500).send({type:"internal error",data:err})
                else res.status(200).send({type:"OK",data:"successfully deleted row and file"})
            })
        } 
    })
})

router.post("/upload",(req,res) => {
    const file = req.files.file
    const {name,level, category} = req.body
    const id = Buffer.from(Math.floor(Math.random() * 2000).toString()).toString("base64") //generate id
    console.log(`Incomming file:\nname:${file.name}\nsize:${file.size}`)
    const media_path = `./data/media/video/${id}.mp4` //media path
    fs.writeFileSync(media_path,file.data) //write data
    db.run(`INSERT INTO movies VALUES ("${id}","${name}","${category}","${media_path}",${level})`,(err) => {
        console.log(err)
        if(err) return res.status(500).send({type:"internal error",data:err});
        else res.status(201).send({type:"created",data:media_path})
    })
})

router.post("/new_category",(req,res) => {
    const name = req.body.name
    const image = req.files ? req.files.image : null
    let media_path
    //image path is in static directory. Anyone can see there images but I dont see the trouble tbh
    if(image) {
        media_path = `./front/assets/${name}.png`
        fs.writeFileSync(media_path,image.data)
    } else media_path = "./front/assets/defualt.png"
    db.run(`INSERT INTO categories VALUES ("${name}","${media_path}")`,(err) => {
        if(err) return res.status(500).send({type:"internal error",data:err});
        else res.status(201).send({type:"created",data:media_path})
    })

})


module.exports = {
    type: "router",
    base_url: "/api/",
    router:router
}