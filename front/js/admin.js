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
    console.log(fd)
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

function get_input_type(type) {
    let input_type
    switch(type) {
        case "string":
        input_type = "text"
        break;
        default:
        input_type = type
        break;
    }
    return input_type
}

var unsaved = {

}

function generate_head(row) { //pretty straight-forward function
    let html = `<thead><tr>`
    const keys = Object.keys(row)
    for(let i = 0; i < keys.length; i++) {
        html += `<th>${keys[i]}</th>`
    }
    html += `</th></thead>`
    return html
}

function populate_table(table,data,func) {
    const $table = $("#"+table)
    unsaved[table] = {}
    if(!$table) return console.error("could not populate table (no table body)")
    if(data.length === 0) return $table.html("<b>no data</b>") //casting undefined to object with Object.keys() in generate head function gives error. besides, no reason to continue function if no data is avalible
    $table.append(generate_head(data[0])) //generate table head
    const $tbody = $(`<tbody></tbody>`).appendTo($table) //generate table body
    for(let row in data) { //for every row in the data
        const keys = Object.keys(data[row]) 
        let html = `<tr>` 
        for(let i = 0; i < keys.length; i++) {
            const key = keys[i]
            const value = data[row][key]
            html += `<th><input onchange="table_edit('${table}','${key}','${data[row].id}',this.value)" type="${get_input_type(typeof value)}" value="${value}"></th>` //run function get_input_type to make sure type is correct
        }
        if(func) {
            //this is ugly but works, just like me but minus the works part
            html += `<th><button onclick="${func}(this)">action</button></th>`
        }
        html += `</tr>`
        $tbody.append(html)
    }
}

//this code is increadibly flawed
function table_edit(table,key,identifier,value) {
    if(key === "id") return console.error("identifier may not be the same as key")
    $("#unsaved_warning").slideDown()
    if(!unsaved[table][identifier]) unsaved[table][identifier] = {}
    unsaved[table][identifier][key] = value
}


function load_dash() {
    $.get("/api/admin/get_users",(data) => {
        populate_table("users",data)
        $("#overview_user").text(data.length)
    })
    $.get("/api/get_movies",(data) => {
        populate_table("movies",data)
        $("#overview_movies").text(data.length)
    })
    $.get("/api/get_categories",(data) => {
        console.log(data)
        populate_table("categories",data)
        $("#overview_categories").text(data.length)
    })
    $.get("/api/get_requests",(data) => {
        populate_table("requests",data)
        $("#overview_requests").text(data.length)
    })
}

$(document).ready(() => {
    load_dash()
    $("a[trigger]").click(function() {
        const $id = $(this).attr("trigger")
        $(`#${$id}`).toggle()
    })
    $("#_categories").submit(upload_category)
})

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
    $list.empty()
    $.get("/api/admin/get_content",(data) => {
        for(let file in data) {
            /*right now only mp4 is supported.
            feel free to edit support based on availible formats https://www.w3schools.com/html/html5_video.asp
            */
            $list.append(`<li style="cursor: pointer;" onclick="select_filepath('${data[file]}')">${data[file]}${[".mp4",".ogg"].includes(data[file].match(/\.\w{1,5}$/gi)[0]) ? "" : " <b style='color:red;'>(format not supported)</b>"}</li>`)
        }
        $overlay.show()
    })
}

function answer_ticket(id) {
    const answer = prompt(`answer request with id "${id}"`)
    if(!answer) return
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

function movie_changed(type,e) {
    $("#unsaved_warning").slideDown()
    const $ele = $(e)
    const $row = $ele.parent().parent()
    if(!unsaved.movie[$row.children(":first").text()]) unsaved.movie[$row.children(":first").text()] = {}
    unsaved.movie[$row.children(":first").text()][type] = $ele.val()
}

function save() {
    const keys = Object.keys(unsaved)
    for(let i = 0; i < keys.length; i++) {
        const table = keys[i]
        const _keys = Object.keys(unsaved[table])
        if(typeof _keys != "undefined") {
            for(let j = 0; j < _keys.length; j++) {
                $.ajax({
                    type:"POST",
                    url:"/api/admin/save_changes",
                    data: {table:table,id:_keys[j],changes:unsaved[table][_keys[j]]},
                    success: data => {
                        console.log(data)
                    },
                    error: err => {
                        console.error(err)
                    }
                })
            }
        }
    }
    $("#unsaved_warning").slideUp()
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