module.exports = {
    port: 3000,   //port. 
    cookie_secret: "bruh",
    metadata: {
        path:"./meta", //where cached metadata is stored
        api_key:"secret" //fetch metadata with themoviedb, get api token at https://www.themoviedb.org/settings/api/request
    }
}