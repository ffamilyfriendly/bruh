const sqlite3 = require("sqlite3")
const db = new sqlite3.Database("./data/data.db")
const run = () => {
    db.serialize(() => {
        console.log("preparing database...")
        db.run("CREATE TABLE IF NOT EXISTS users (email TEXT PRIMARY KEY,password TEXT,level INTEGER)"); //user. level starts at 0
        db.run("CREATE TABLE IF NOT EXISTS categories (name TEXT PRIMARY KEY,image TEXT)")  //category
        db.run("CREATE TABLE IF NOT EXISTS movies (id TEXT PRIMARY KEY,name TEXT,category TEXT,path TEXT)"); //movies. path is stored to mp4 file instead of blob... I learned this the hard way
    })
}

module.exports = {
    db:db,
    type: "modules",
    run:run
}