const router = require("express").Router()
//maybe using a different database file is good for content delivery but idc
const db = require("./database").db




module.exports = {
    type: "router",
    base_url: "/api/cdn/",
    router:router
}