const router = require("express").Router()
const conf = require("../../config")
const fs = require("fs")
const db = require("../core/database").db
const request = require("request")

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
                    const answer = JSON.parse(body)
                    answer.results = answer.results.sort((a, b) => b.vote_count - a.vote_count)
                    fs.writeFileSync(`${conf.metadata.path}/meta.${req.params.id}.json`,JSON.stringify(answer.results[0]))
                    res.json(answer.results[0])
                })
            } else res.status(404).send({type:"not found",data:"meta not found"})
        })
    }
})

module.exports = {
    type: "router",
    enabled:true,
    base_url: "/api/",
    router: router,
    meta: {
        name:"metadata",
        description:"fetches metadata about movies. requires a authentication token"
    }
}