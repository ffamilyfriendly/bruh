const sqlite3 = require("sqlite3")
const db = require("../core/database").db
const run = () => {
    db.serialize(() => {
        console.log("preparing invite database...")
        db.run("CREATE TABLE IF NOT EXISTS invites (id TEXT PRIMARY KEY,uses INTEGER,level INTEGER)");
    })
}

module.exports = {
    type: "modules",
    run:run
}