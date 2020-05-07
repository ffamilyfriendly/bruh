$(document).ready(() => {
    if($("#metabox").attr("data-autometa") === "1") {
        const metaId = $("#metabox").attr("data-id")
        $.get(`/api/meta/${metaId}`,(data) => {
            if(typeof data === "string") data = JSON.parse(data)
            $("#meta_image").attr("src",`https://image.tmdb.org/t/p/w600_and_h900_bestv2${data.poster_path}`)
            $("#meta_title").text(data.title)
            $("#meta_description").text(data.overview)
        })
    }

    $.get(`/api/hasWatched?id=${$("#metabox").attr("data-id")}`,(data) => {
        if(data[0]) {
            $("#hasWatched").slideDown()
            $("#skipbtn").attr("onClick",`skipTo(${data[0].location})`)
        }
    }).fail(err => console.error(err))
})

const skipTo = (t) => {
    const vid = document.getElementById("mainVideo")
    vid.currentTime = t
    $("#hasWatched").slideUp()
}

let ticker = 0;

const registerLastWatched = (time) => {
    ticker++
    if(ticker > 30) {
        ticker = 0
        const id = $("#metabox").attr("data-id")
        $.ajax({
            type:"POST",
            url:"/api/register_watched",
            data:{id,time},
            success:() => {
                console.log(`[LAST WATCHED] successfully registered time ${time} for ${id}`)
            },
            error:(data) => {
                console.error(`[LAST WATCHED] could not register time ${time} for ${id}`)
                console.error(data)
            }
        })
    }
}