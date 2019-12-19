const _url = new URL(window.location.href)
const url = new URLSearchParams(_url.search)
const title = url.get("v")

function timeChanged() {
    try {
        const p = document.getElementById("player")
        window.setting.set("last_watched",title)
        window.setting.set("last_watched_time",p.currentTime)
    } catch(err) {
        //we could do something here... but nah
    }
}

function toDate(time) {
    const d = new Date(time)
    return `${d.getDate()}/${d.getMonth()}/${d.getFullYear()} at ${d.getHours()}:${d.getMinutes()}` //this is the restoftheworld format. If you feel like using "freedom time" just change it a bit
}

//This should work for ios now
function skipto() {
    if(url.has("t")) {
        document.getElementById("player").currentTime = url.get("t")
    }
}

/* 
this code is absolute trash. 
do not look at it
*/

$(document).ready(() => {
if(!title) return window.location = "/home"
const $player = $("#player")
console.log("trying to play movie " + title)
$.get(`/api/info/${title}`,(data) => {
    const meta = JSON.parse(data.meta)
    $("#movie_title").text(data.name)
    $("#movie_category").text(data.category)
    $("#movie_uploaded").text(toDate(meta.uploaded))

    $player.children(":first").attr("src",`/api/movie/${title}`) //set 
    const p = document.getElementById("player")
    p.load() //load
    p.oncanplay = skipto
    $("#loader").fadeOut()
    setInterval(timeChanged,1000)
}).fail(err => {
    if(url.has("dev")) return
    if(err) return window.location = "/home"
})
})
