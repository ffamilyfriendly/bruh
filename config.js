const path = require("path")

module.exports = {
    port:3000,   //port. 
    cookie_secret:"bruh",
    media: {
        path:[path.join(__dirname,"/data/media/video")] //MUST be direct path. Will itterate through child directories so dont set something stupid like root
    }
}