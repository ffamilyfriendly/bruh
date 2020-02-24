const sqlite3 = require("sqlite3")
const db = new sqlite3.Database("./data/data.db")
const run = () => {
    db.serialize(() => {
        db.run("CREATE TABLE IF NOT EXISTS audit (type TEXT, reason TEXT, date TEXT)")
        db.run("CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY,password TEXT,admin INTEGER)")
        db.run("CREATE TABLE IF NOT EXISTS last_watched (id TEXT PRIMARY KEY, location INTEGER)")
        db.run("CREATE TABLE IF NOT EXISTS invites (id TEXT PRIMARY KEY, uses INTEGER)")
        db.run("CREATE TABLE IF NOT EXISTS content (id TEXT PRIMARY KEY,displayname TEXT, image TEXT, parent TEXT, type TEXT, child TEXT)")

        //types
        db.run("CREATE TABLE IF NOT EXISTS media (id TEXT, path TEXT, description TEXT)")
        db.run("CREATE TABLE IF NOT EXISTS category (id TEXT, description TEXT)")
    })
}

module.exports = {
    db: db,
    type: "modules",
    run: run,
    meta: {
        name:"core.database",
        description:"prepares the database"
    }
}