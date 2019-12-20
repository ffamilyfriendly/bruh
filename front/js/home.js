function last_played() {
    const last_played = window.setting.get("last_watched")
    const last_played_time = window.setting.get("last_watched_time")
    if(last_played) {
        $("#last").slideDown()
        $("#go_button").attr("href",`/watch?v=${last_played}&t=${last_played_time}`)
    }
}

function request_movie() {
    const request = $("#request").val()
    if(!request) return
    $.ajax({
        type:"post",
        url:"/api/new_request",
        data:{request},
        success: data => {
            location.reload() //reload to laod new tickets
        },
        error: err => {
            alert("could not request movie (check logs)")
            console.error(err)
        }
    })
}

function dismiss_last() {
    window.setting.remove("last_watched")
    window.setting.remove("last_watched_time")
    $("#last").slideUp()
}

function load_tickets() {
    const $list = $("#tickets")
    $.get("/api/get_requests",(data) => {
        for(let request in data) {
            $list.append(`<li><b>Request: </b>${data[request].request} <b>answer: </b>${data[request].answer}</li>`)
        }
    })
}

$(document).ready(() => {
    const $loader = $("#loader")
    load_tickets()
    $.get("/api/get_categories",(data) => {
        for(let row in data) {
            $("#listing").append(`<a class="category" onclick="show_listing('${data[row].id}')" href="#"><img onerror="this.src='/static/assets/default.png'" src="static/assets/${data[row].id}.png"></a>`)
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
            $list.append(`<li><a href="/watch?v=${data[row].id}">${data[row].id}</a></li>`)
        }
    })
}