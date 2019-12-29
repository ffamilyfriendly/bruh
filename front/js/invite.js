let id

function parseUrl() {
    return window.location.href.split("invite/")[1]
}

function setupPage(data) {
    for(let i = 0; i < data.content.length; i++) {
        const movie = data.content[i]
        $("#list").append(`<li>${movie.name}</li>`)
    }
}

function join() {
    if(!id) return
    $.ajax({
        type:"POST",
        url:"/api/use_invite",
        data:{id},
        success:data=> {
            $.get("/api/update_user",() => {
                window.location = "/home"
            })
            window.popup("warn","could not update user")
        },
        error:err => {
            window.popup("error","could not use invite (check logs)")
            console.error(err)
        }
    })
}

$(document).ready(() => {
    id = parseUrl()
    $.get(`/api/get_invite?id=${id}`,(data) => {
        setupPage(data)
    }).fail(err => {
        window.location = "/home"
    })
})