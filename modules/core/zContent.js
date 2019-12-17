const router = require("express").Router()
const fs = require("fs")
//maybe using a different database file is good for content delivery but idc
const db = require("./database").db

router.get("/movie/:id",(req,res) => {
    const id = req.params.id
    db.all(`SELECT * FROM movies WHERE id = "${id}"`,(err,row) => {
        if(err) return res.status(500).send({type:"internal error",data:err})
        row = row[0]
        if(!row) return res.status(404).send({type:"not found",data:"media is not found"})
        res.sendFile(require("path").join(__dirname,"../../",row.path))
    })
})

// from here and below are admin only endpoints
router.use((req,res,next) => {
    if(!req.session || !req.session.user || req.session.user.level < 100) return res.status(403).send({type:"unauthorised",data:"user cookie session does not exist or user level is less then 100"})
    else next()
})

router.post("/upload",(req,res) => {
    const file = req.files.file
    const id = "bruh"
    console.log(`Incomming file:\nname:${file.name}\nsize:${file.size}`)
    const media_path = `./data/media/video/${id}.mp4`
    fs.writeFileSync(media_path,file.data)
    db.run(`INSERT INTO movies VALUES ("${id}","${file.name}","test","${media_path}")`,(err) => {
        if(err) return res.status(500).send({type:"internal error",data:"could not upload file"});
        else res.status(201).send({type:"created",data:"movie uploaded!"})
    })
})


module.exports = {
    type: "router",
    base_url: "/api/",
    router:router
}