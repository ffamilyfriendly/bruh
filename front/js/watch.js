function timeChanged() {
    const p = document.getElementById("player")
    window.setting.set("last_watched_time",p.currentTime)
}

function toDate(time) {
    const d = new Date(time)
    return `${d.getDate()}/${d.getMonth()}/${d.getFullYear()} at ${d.getHours()}:${d.getMinutes()}` //this is the restoftheworld format. If you feel like using "freedom time" just change it a bit
}

/* 
this code is absolute trash. 
do not look at it
*/

$(document).ready(() => {
const _url = new URL(window.location.href)
const url = new URLSearchParams(_url.search)
const title = url.get("v")
const skipto = url.get("t")
if(!title) return window.location = "/home"
window.setting.set("last_watched",title)
const $player = $("#player")
console.log("trying to play movie " + title)
$.get(`/api/info/${title}`,(data) => {
    const meta = JSON.parse(data.meta)
    $("#movie_title").text(data.name)
    $("#movie_category").text(data.category)
    $("#movie_uploaded").text(toDate(meta.uploaded))
    console.log(meta)

    $player.children(":first").attr("src",`/api/movie/${title}`) //set 
    const p = document.getElementById("player")
    p.load() //load
    if(skipto) p.currentTime = skipto //if time is passed skip to that location
    $("#loader").fadeOut()
    setInterval(timeChanged,1000)

    
}).fail(err => {
    if(err) return window.location = "/home"
})
})
