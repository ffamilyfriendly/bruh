function upload_movie() {
    const $stat = $("#fileStat")
    const $statxt = $stat.children(":first")
    const $bar = $("#bar") //Imma be honest with you cheif... this bar is useless but it gives people hope
    $stat.slideDown() //slide down fole uplaod status thing
    $statxt.text("starting uploading process...") 
    $bar.css("width","10%")

    const path = $("#file_path").val()
    const name = $("#name").val()
    const category = $("#category").val()
    const level = $("#level").val()


    
    $.ajax({
        type:"POST",
        url:"/api/admin/upload",
        data:{path,name,category,level},
        success: data => {
            $bar.css("width","100%")
            $statxt.text(`media created! path:${data}`)
            setTimeout(() => { //timeout so user has time to read
                $stat.slideUp()
            },3000) 
        },
        error: err => {
            console.log(err)
        }
    })
}

const upload_category = e => {
    e.preventDefault()

    const $stat = $("#fileStat")
    const $statxt = $stat.children(":first")
    const $bar = $("#bar") //Imma be honest with you cheif... this bar is useless but it gives people hope

    $stat.slideDown() //slide down fole uplaod status thing
    $statxt.text("starting uploading process...") 
    $bar.css("width","10%")

    const $file = $("input[name='category_image']") //get file input
    const $name = $("input[name='category_name']")
    const $level = $('input[name="category_level"]')
    const file = $file.prop("files")[0]

    if(!$name.val()) return $stat.slideUp()

    const fd = new FormData()
    fd.append("name",$name.val())
    fd.append("level",$level.val())
    file ? fd.append("image",file) : null

    $.ajax({
        type:"POST",
        url:"/api/admin/new_category",
        data:fd,
        processData:false,
        contentType:false,
        success: data => {
            $bar.css("width","100%")
            $statxt.text(`media created! path:${data}`)
            setTimeout(() => { //timeout so user has time to read
                $stat.slideUp()
            },3000) 
        },
        error: err => {
            console.log(err)
        }
    })
}

$(document).ready(() => {
    $("a[trigger]").click(function() {
        const $id = $(this).attr("trigger")
        $(`#${$id}`).toggle()
    })
    $("#category_upload").submit(upload_category)
})

var unsaved = {
    user:{},
    movie:{}
}

function user_changed(e) {
    $("#unsaved_warning").slideDown()
    const $value = $(e)
    console.log($value)
    const $row = $value.parent().parent()
    unsaved.user[$row.children(":first").text()] = $value.val()
}

function select_filepath(path) {
    $("#select_file_overlay").hide()
    if(!path) return 
    $("#file_path").val(path)
}

function select_file() {
    const $overlay = $("#select_file_overlay")
    const $list = $("#select_file_list")
    $.get("/api/admin/get_content",(data) => {
        for(let file in data) {
            $list.append(`<li style="cursor: pointer;" onclick="select_filepath('${data[file]}')">${data[file]}${[".mp4",".avi",".wmv",".mov"].includes(data[file].match(/\.\w{1,5}$/gi)[0]) ? "" : " <b style='color:red;'>(not video file)</b>"}</li>`)
        }
        $overlay.show()
    })
}

function answer_ticket(id) {
    const answer = prompt(`answer request with id "${id}"`)
   // if(!answer) return
   $.ajax({
       type:"POST",
       url:"/api/admin/answer_request",
       data:{id,answer},
       success: data => {
           console.log(data)
       },
       error: err => {
           console.log(err)
       }
   })
}

function delete_ticket(id) {
    $.get(`/api/admin/delete_request?id=${id}`,(data) => {
        if(data) location.reload()
    })
}

function load_tickets() {
    const $list = $("#request_list")
    $.get("/api/get_requests",(data) => {
        for(let request in data) {
            $list.append(`<li><b>Request: </b>${data[request].request} <b>answer: </b><a onclick="answer_ticket('${data[request].id}')" href="#requests">${data[request].answer}</a> <a onclick="delete_ticket('${data[request].id}')" href="#requests">delete</a></li>`)
        }
    })
}

function movie_changed(type,e) {
    $("#unsaved_warning").slideDown()
    const $ele = $(e)
    const $row = $ele.parent().parent()
    if(!unsaved.movie[$row.children(":first").text()]) unsaved.movie[$row.children(":first").text()] = {}
    unsaved.movie[$row.children(":first").text()][type] = $ele.val()
}

function save() {
    if(Object.keys(unsaved.user).length !== 0) {
        for(let user in unsaved.user) {
            $.ajax({
                type:"POST",
                url:"api/admin/edit_user",
                data:{email:user,level:unsaved.user[user]},
                success: data => {
                    console.log(data)
                },
                error: err => {
                    console.error(err)
                }
            })
        }
        unsaved.user = {}
    }
    if(Object.keys(unsaved.movie).length !== 0) {
        for(let movie in unsaved.movie) {
            const _movie = unsaved.movie[movie]
            $.ajax({
                type:"POST",
                url:"api/admin/edit_movie",
                data:{id:movie,changes:_movie},
                success: data => {
                    console.log(data)
                },
                error: err => {
                    console.error(err)
                }
            })
        }
        unsaved.movie = {}
    }
    $("#unsaved_warning").slideUp()
}

function load_users() {
    const $table = $("#user_body")
    $.get("/api/admin/get_users",(data) => {
        for(let i = 0; i < data.length; i++) {
            const row = data[i]
            $table.append(`<tr><th>${row.email}</th><th><input type="number" onchange="user_changed(this)" value="${row.level}"></th></tr>`)
        }
    })
}

function load_movies() {
    const $table = $("#movie_body")
    $.get("/api/get_movies",(data) => {
        for(let movie in data) {
            movie = data[movie]
            console.log(movie)
            $table.append(`<tr><th>${movie.id}</th><th>${movie.path}</th><th><input type="text" onchange="movie_changed('category',this)" value="${movie.category}"></th><th><input onchange="movie_changed('level',this)" type="number" value="${movie.level}"></th></tr>`)
        }
    })
}

function delete_movie() {
    const id = prompt("movie id")
    if(!id) return
    $.ajax({
        type:"POST",
        url:"/api/admin/remove_movie",
        data:{id},
        success: data => {
            location.reload()
        },
        error: err => {
            alert("could not delete movie (check logs)")
            console.log(err)
        }
    })
}