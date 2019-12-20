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
            window.popup("error","could not save movie. (check logs)")
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
            window.popup("error","could not save category. (check logs)")
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
            html += `<th><button onclick="${func}">delete</button></th>`
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

function request_action(type,e) {
    const confirm = prompt("are you sure? (y/n)")
    if(!confirm || confirm.toLowerCase() !=="y") return
    const $row = $(e).parent().parent()
    const $identifier = $row.children(":first").children(":first").val()
    $.ajax({
        type:"POST",
        url:"/api/admin/remove",
        data:{table:type,identifier:$identifier},
        success: data => {
            location.reload()
        },
        error: err => {
            window.popup("error",err)
        }
    })
}

function load_dash() {
    $.get("/api/admin/get_users",(data) => {
        populate_table("users",data,"request_action('users',this)")
        $("#overview_user").text(data.length)
    })
    $.get("/api/get_movies",(data) => {
        populate_table("movies",data,"request_action('movies',this)")
        $("#overview_movies").text(data.length)
    })
    $.get("/api/get_categories",(data) => {
        console.log(data)
        populate_table("categories",data,"request_action('categories',this)")
        $("#overview_categories").text(data.length)
    })
    $.get("/api/get_requests",(data) => {
        populate_table("requests",data,"request_action('requests',this)")
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
        console.log(data)
        for(let file in data) {
            /*right now only mp4 is supported.
            feel free to edit support based on availible formats https://www.w3schools.com/html/html5_video.asp
            */
            try {
            $list.append(`<li style="cursor: pointer;" onclick="select_filepath('${data[file]}')">${data[file]}${[".mp4",".ogg"].includes(data[file].match(/\.\w{1,5}$/gi)[0]) ? "" : " <b style='color:red;'>(format not supported)</b>"}</li>`)
            } catch(err) {
                console.warn(err)
            }
        }
        $overlay.show()
    }).fail(err => {
        window.popup("error",err)
    })
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
                        window.popup("error","could not save settings. (check logs)")
                        console.log(err)
                    }
                })
            }
        }
    }
    $("#unsaved_warning").slideUp()
}
