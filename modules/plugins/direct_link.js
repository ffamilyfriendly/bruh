const h = require("../../lib/helpers")
const router = require("express").Router()

// I would not recomend enabling this file lol

const direct_links = {
    gubbe:10
}

router.get("/:id", (req, res) => {
    if (!h.important_params([req.params.id], res)) return
    if(!direct_links[req.params.id]) return res.redirect("/")
    else {
        req.session.user = {email:"_temp",level:direct_links[req.params.id]}
        return res.redirect("/home")
    }
})

module.exports = {
    enabled: false, //this aint usefull for everyone so i defualt to false
    type: "router",
    base_url: "/direct/",
    router: router
}