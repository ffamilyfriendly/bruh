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

        $("#mvinf_title").text(data.title||"no title found")
        $("#mvinf_image").attr("src",`https://image.tmdb.org/t/p/w600_and_h900_bestv2${data.poster_path}`)
        $("#mvinf_backdrop").attr("src",`https://image.tmdb.org/t/p/original${data.backdrop_path}`)
        $("#mvinf_desc").text(data.overview)
        $("#mvinf_release").text(data.release_date||"none found")
        $("#mvinf_ratings").text(data.vote_average||"none found")
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
            if(err) console.log({check:`Could not fetch parse metadata. Is the module enabled?`,data})
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
    console.log("Hello! \n//JH 07/10 -20")
    $("div").find("[data-autometa='1']").each(function() {
        fixMeta(this)
    })
})