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

function continueFromLast() {
    player.currentTime = lastWatched
    $('#lw').modal("hide")
}

function dissmissLast() {
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
        }
    })
}

document.addEventListener("DOMContentLoaded",function() {
    player = document.getElementById("mainPlayer")
    hasLastWatched()
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
            player.addEventListener("timeupdate",updateLastWatched)
            updateDebug()
            setInterval(updateDebug,5000)
        }
    })
})