var player;
var v = new URLSearchParams(window.location.search).get("v")

function updateDebug() {
    document.getElementById("source").innerText = player.currentSrc
    document.getElementById("buffer").innerText =  (player.currentTime / player.duration) * 100
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
            updateDebug()
            setInterval(updateDebug,5000)
        }
    })
})