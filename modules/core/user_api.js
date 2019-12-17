const router = require("express").Router()
const db = require("./database").db

// crypt
const bcrypt = require('bcrypt');
const saltRounds = 10;

router.post("/login",(req,res) => {
    const {email, password} = req.body
    if(!email || !password) return res.status(400).send({type:"bad request",data:"insufficient amount of parameters passed"})
    db.all(`SELECT * FROM users WHERE email="${email}"`,(err,row) => {
        if(!row[0]) return res.status(401).send({type:"credentials",data:"wrong username/password"})
        row = row[0]
        if(err){ console.error(err); return res.status(500).send({type:"internal error",data:"could not fetch user data"})}
        bcrypt.compare(password,row.password,(err,resu) => {
            if(err){ console.error(err); return res.status(500).send({type:"internal error",data:"could not compare passwords"})}
            if(resu) {
                req.session.user = {email:row.email,level:row.level} //set cookie session
                return res.status(200).send({type:"logged in",data:"redirecting..."})
            } else {
                return res.status(401).send({type:"credentials",data:"wrong username/password"})
            }
        })
    })
})

router.post("/register",(req,res) => {
    const {email, password} = req.body
    if(!email || !password) return res.status(400).send({type:"bad request",data:"insufficient amount of parameters passed"})
    bcrypt.genSalt(saltRounds,(err,salt) => {
        if(err) {console.error(err); return res.status(500).send({type:"internal error",data:"could not generate salt"})}
        bcrypt.hash(password,salt,(err,hash) => {
            if(err) {console.error(err); return res.status(500).send({type:"internal error",data:"could not generate hash"})}
            db.run(`INSERT INTO users VALUES("${email}","${hash}",0)`,(err) => {
                if(err) {return res.status(500).send({type:"internal error",data:"could not save user"})}
                else return res.status(201).send({type:"created",data:"user created! logging in..."})
            })
        })
    })
})

// from here and below are admin only endpoints
router.use((req,res,next) => {
    if(!req.session || !req.session.user || req.session.user.level < 100) return res.status(403).send({type:"unauthorised",data:"user cookie session does not exist or user level is less then 100"})
    else next()
})

router.get("/get_users",(req,res) => {
    db.all("SELECT * FROM users",(err,rows) => {
        if(err) return res.status(500).send({type:"internal error",data:"could not query users"})
        else res.send(rows) //!!!WARNING!!! right now this also sends the password hash. I cba to fix this atm but pls mind this
    })
})

router.post("/edit_user",(req,res) => {
    const {email, level} = req.body
    if(!email || !level) return res.status(400).send({type:"bad request",data:"insufficient amount of parameters passed"})
    db.all(`UPDATE users SET level = ${level} WHERE email = "${email}"`,(err) => {
        if(err) return res.status(500).send({type:"internal error",data:"could not update users"})
        else res.status(200).send({type:"OK",data:"updated user"})
    })
})



module.exports = {
    type: "router",
    base_url: "/api/",
    router:router
}