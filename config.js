const path = require("path")

module.exports = {
    port:3000,   //port. 
    media: {
        path:[path.join(__dirname,"/data/media/video")] //MUST be direct path
    }
}