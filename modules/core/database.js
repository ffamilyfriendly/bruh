const sqlite3 = require("sqlite3")
const db = new sqlite3.Database("./data/data.db")
const run = () => {
    db.serialize(() => {
        console.log("preparing database...")
        db.run("CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY,password TEXT,level INTEGER)"); //user. level starts at 0
        db.run("CREATE TABLE IF NOT EXISTS categories (id TEXT PRIMARY KEY,image TEXT, level INTEGER)")  //category
        db.run("CREATE TABLE IF NOT EXISTS movies (id TEXT PRIMARY KEY,name TEXT,category TEXT,path TEXT,level INTEGER,meta TEXT)"); //movies. path is stored to mp4 file instead of blob... I learned this the hard way
        db.run("CREATE TABLE IF NOT EXISTS requests (id TEXT PRIMARY KEY, request TEXT, answer TEXT)") //requests
    })
}

module.exports = {
    db:db,
    type: "modules",
    run:run
}