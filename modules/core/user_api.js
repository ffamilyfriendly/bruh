const router = require("express").Router()
const db = require("./database").db

// crypt
const bcrypt = require('bcrypt');
const saltRounds = 10;

router.post("/login",(req,res) => {
    const {email, password} = req.body
    if(!email || !password) return res.status(400).send({type:"bad request",data:"insufficient amount of parameters passed"})
    db.all(`SELECT 1 FROM users WHERE email="${email}"`,(err,row) => {
        if(err){ console.error(err); return res.status(500).send({type:"internal error",data:"could not fetch user data"})}
        bcrypt.compare(password,row.password,(err,res) => {
            if(err){ console.error(err); return res.status(500).send({type:"internal error",data:"could not compare passwords"})}
            if(res) {
                
            } else {

            }
        })
    })
})


module.exports = {
    type: "router",
    base_url: "/api/",
    router:router
}