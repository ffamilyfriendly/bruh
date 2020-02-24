var player;
var v = new URLSearchParams(window.location.search).get("v")
var lastWatched;
var tickerLim = 20 //will update last watched when ticker is greater then tickerLim
var ticker = 0;


function updateDebug() {
    document.getElementById("source").innerText = player.currentSrc
    document.getElementById("buffer").innerText =  (player.currentTime / player.duration) * 100
}

function updateLastWatched() {
    if(ticker > tickerLim) {
        request({
            type:"POST",
            url:"/api/register_watched",
            data:parseData({id:v,time:player.currentTime}),
            plain:false
        })
        ticker = 0
    }
    ticker++
}

function getMeta(id) {
    if(window.plugins.metadata && window.plugins.metadata.enabled) {
        $("#metabox").show()
    request({
        type:"GET",
        url:`/api/meta/${id}`
    },(data) => {
        console.log(data)
        $("#movie_poster").attr("src",`https://image.tmdb.org/t/p/w300/${data.poster_path}`)
        $("#movie_title").text(data.original_title)
        $("#movie_description").text(data.overview)
        $("#movie_release").text(data.release_date)
        $("#movie_rating").text(data.vote_average)
    })
}
}

function continueFromLast(e) {
    player.currentTime = lastWatched
    $('#lw').modal("hide")
}

function dissmissLast(e) {
    request({
        type:"POST",
        url:"/api/remove_watched",
        data:parseData({id:v})
    })
    $('#lw').modal("hide")
}

function hasLastWatched() {
    request({
        type:"GET",
        url:"/api/hasWatched?id="+v
    },function(data) {
        if(data && data[0]) {
            lastWatched = data[0].location
            document.getElementById("last_watched").innerText = data[0].location
            $('#lw').modal()
            player.removeEventListener("play",arguments.calee)
        }
    })
}


document.addEventListener("DOMContentLoaded",function() {
    player = document.getElementById("mainPlayer")
    if(!v) return
    request({
        type:"GET",
        url:"/api/session"
    },function(data) {
        if(data.type && data.type === "OK") {
            var source = document.createElement("source")
            source.type = "video/mp4"
            source.src = "/api/media/"+data.data+"/"+v
            player.append(source)
            player.addEventListener("play",hasLastWatched)
            player.addEventListener("timeupdate",updateLastWatched)
            updateDebug()
            setInterval(updateDebug,5000)

            setTimeout(() => {getMeta(v)},500) //this is a very bad way to do it but wait 1s/2 to let main script fetch plugin list
        }
    })
})