$(document).ready(() => {
const _url = new URL(window.location.href)
const url = new URLSearchParams(_url.search)
const title = url.get("v")
if(!title) return window.location = "/home"
window.setting.set("last_watched",title)
const $player = $("#player")
console.log("trying to play movie " + title)
$.get(`/api/info/${title}`,(data) => {
    $("#movie_title").text(data.name)
    $("#movie_category").text(data.category)
    $("#movie_path").text(data.path)

    $player.children(":first").attr("src",`/api/movie/${title}`) //set 
    document.getElementById("player").load() //load
    $("#loader").fadeOut()
}).fail(err => {
    if(err) return window.location = "/home"
})
})
