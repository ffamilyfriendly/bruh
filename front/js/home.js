function last_played() {
    const last_played = window.setting.get("last_watched")
    const last_played_time = window.setting.get("last_watched_time")
    if(last_played) {
        $("#last").slideDown()
        $("#go_button").attr("href",`/watch?v=${last_played}&t=${last_played_time}`)
    }
}

function dismiss_last() {
    window.setting.remove("last_watched")
    window.setting.remove("last_watched_time")
    $("#last").slideUp()
}

$(document).ready(() => {
    const $loader = $("#loader")
    $.get("/api/get_categories",(data) => {
        for(let row in data) {
            $("#listing").append(`<a class="category" onclick="show_listing('${data[row].name}')" href="#${data[row].name}"><img onerror="this.src='/static/assets/default.png'" src="static/assets/${data[row].name}.png"></a>`)
        }
        $loader.fadeOut()
    })
    last_played()
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