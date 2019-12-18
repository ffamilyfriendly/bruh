$(document).ready(() => {
    const $loader = $("#loader")
    $.get("/api/get_categories",(data) => {
        for(let row in data) {
            $("#listing").append(`<a class="category" onclick="show_listing('${data[row].name}')" href="#${data[row].name}"><img onerror="this.src='/static/assets/default.png'" src="static/assets/${data[row].name}.png"></a>`)
        }
        $loader.fadeOut()
    })
})

function show_listing(name) {
    if(!name) return
    const $overlay = $("#overlay")
    $overlay.fadeIn()
    $("#list_name").text(name)
    const $list = $("#movie_list")
    $list.empty()
    $.get(`/api/get_movies?category=${name}`,(data) => {
        for(let row in data) {
            $list.append(`<li><a href="/watch?v=${data[row].id}">${data[row].name}</a></li>`)
        }
    })
}