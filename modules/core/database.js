const sqlite3 = require("sqlite3")
const db = new sqlite3.Database("./data/data.db")
const run = () => {
    db.serialize(() => {
        db.run("CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY,password TEXT,admin INTEGER)"); 
        db.run("CREATE TABLE IF NOT EXISTS content (id TEXT PRIMARY KEY, parent TEXT, type TEXT, data TEXT)")
        db.run("CREATE TABLE IF NOT EXISTS invites (id TEXT PRIMARY KEY, uses INTEGER)")
    })
}

module.exports = {
    db: db,
    type: "modules",
    run: run
}