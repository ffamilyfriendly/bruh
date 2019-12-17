$(document).ready(() => {
const title = prompt("movie id")
if(!title) alert(">:(")
else {
    console.log("trying to play movie " + title)
   // $("#player").attr("src",`/api/movie/${title}`)
}
})
