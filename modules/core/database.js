const sqlite3 = require("sqlite3")
const db = new sqlite3.Database("./data/data.db")
const run = () => {
    db.serialize(() => {
        console.log("preparing database...")
        db.run("CREATE TABLE IF NOT EXISTS users (email TEXT PRIMARY KEY,password TEXT,level INTEGER)") 
    })
}

module.exports = {
    db:db,
    type: "modules",
    run:run
}