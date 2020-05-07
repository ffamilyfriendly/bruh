const router = require("express").Router()
const conf = require("../../config")
const fs = require("fs")
const db = require("../core/1.database").db
const request = require("request")

/*  This endpoint gets any metadata for the requested title.
* Metadata is cached in a folder but if no metadata is found the server will request the metadata
* from themoviedb
*/
router.get("/meta/:id",(req,res) => {
    if(fs.existsSync(`${conf.metadata.path}/meta.${req.params.id}.json`)) {
        //file exists
        res.send(fs.readFileSync(`${conf.metadata.path}/meta.${req.params.id}.json`))
    } else {
        db.all(`SELECT * FROM content WHERE id = "${req.params.id}"`,(err,rows) => {
            if(rows && rows[0]) {
                const movie = rows[0]
                if(!movie) return res.status(404).send("movie not found")
                request(`https://api.themoviedb.org/3/search/multi?query=${movie.displayname}&api_key=${conf.metadata.api_key}`,(e, response, body) => {
                    if(body) {
                        const answer = JSON.parse(body)

                        if(!answer || !answer.results) return res.status(500).send({type:"INTERNAL_ERROR",data:"could not get any metadata"})

                        //filter away any persons
                        answer.results = answer.results.filter(m => m.media_type !== "person")

                        //sort by vote count
                        answer.results = answer.results.sort((a, b) => b.vote_count - a.vote_count)

                        //write the metadata to the cache file
                        fs.writeFileSync(`${conf.metadata.path}/meta.${req.params.id}.json`,JSON.stringify(answer.results[0]))

                        //send the metadata
                        res.json(answer.results[0])
                    } else {
                        res.status(404).send({type:"not found",data:"meta not found"})
                    }
                })
            } else res.status(404).send({type:"not found",data:"meta not found"})
        })
    }
})

router.delete("/admin/meta/:id",(req,res) => {
    fs.unlink(`${conf.metadata.path}/meta.${req.params.id}.json`, (err) => {
        if(err) return res.status(500).send({type:"INTERNAL_ERROR",data:err.message})
        else res.status(200).send({type:"OK",data:"file deleted"})
    })
})

module.exports = {
    type: "router", 
    enabled:false,
    base_url: "/api/",
    router: router,
    meta: {
        name:"metadata",
        description:"fetches metadata about movies. requires a authentication token"
    }
}