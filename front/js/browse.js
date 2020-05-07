let curr = null

const dispMovieInf = (movie) => {
    $("#mvinf_play").attr("href",`/watch?v=${movie}`)
    curr = movie

    //metadata
    $.get(`/api/meta/${curr}`, (data) => {
        try {
            data = JSON.parse(data)
        } catch(err) {
            if(err) console.log({err,data})
        }
        
        $("#mvinf_title").text(data.title)
    })
    .fail(err => {
        console.log(err)
    })
}

const delContent = () => {
    if(!confirm("are you sure you want to delete?")) return
    $.ajax({
        url:`/api/admin/content/${curr}`,
        type:"DELETE",
        success: () => {
            window.location.reload()
        },
        error: (data) => {
            alert("could not do action (check browser console)")
            console.error(data)
        }
    })
}

const delMetadataFile = () => {
    if(!confirm("are you sure you want to delete the metadata file?")) return
    $.ajax({
        url:`/api/admin/meta/${curr}`,
        type:"DELETE",
        success: () => {
            alert("done!")
            window.location.reload()
        },
        error: (data) => {
            alert("could not do action (check browser console)")
            console.error(data)
        }
    })
}

const fixMeta = (it) => {
    it = $(it)
    const id = it.attr("data-id")
    $.get(`/api/meta/${id}`, (data) => {
        try {
            data = JSON.parse(data)
        } catch(err) {
            if(err) console.log({err,data})
        }
        
        it.find("[data-role='thumbnail']").attr("src",`https://image.tmdb.org/t/p/w600_and_h900_bestv2${data.poster_path}`)
        it.find("[data-role='displayname']").text(data.title)
        it.find("[data-role='description']").text(data.overview)
    })
    .fail(err => {
        console.log(err)
    })
}

$(document).ready(() => {
    $("div").find("[data-autometa='1']").each(function() {
        fixMeta(this)
    })
})