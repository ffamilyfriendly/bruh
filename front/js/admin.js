function upload_movie() {
    const path = $("#movie_path").val()
    const name = $("#movie_name").val()
    const category = $("#movie_category").val()
    const level = $("#movie_level").val()   
    $.ajax({
        type:"POST",
        url:"/api/admin/upload",
        data:{path,name,category,level},
        success: data => {
            location.reload()
        },
        error: err => {
            window.popup("error","could not save movie. (check logs)")
            console.log(err)
        }
    })
}

function upload_category() {
    const image = $("#category_image").val()
    const name = $("#category_name").val()
    const level = $("#category_level").val()   
    $.ajax({
        type:"POST",
        url:"/api/admin/new_category",
        data:{image,name,level},
        success: data => {
            location.reload()
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
})

function select_filepath(path) {
    $("#select_file_overlay").hide()
    if(!path) return 
    $("#file_path").val(path)
}

function suggest_file(files) {
    const inputValue = $("#movie_path").val()
    const $s = $("#suggest_movies")
    if(inputValue != "" && files.length != 0) {
        $s.show()
    } else $s.hide()
    $s.empty()
    const $p = $("#movie_path") 
    const pos = $p.position()
    for(let i = 0; i < files.length; i++) {
        const matched = files[i].split(inputValue)
        if(inputValue === files[i]) {
            $s.hide()
            return
        }
        $s.append(`<li><b>${inputValue}</b>${matched[1]}</li>`)
    }
    $s.css({width:$p.css("width"),left:pos.left+"px",top:(pos.top+$s.height())+"px"})
}

function media_path(e) {
    const curr_val = $("#movie_path").val()
    $.get("/api/admin/get_content",(data) => {
        data = data.filter(f => f.startsWith(curr_val))
        suggest_file(data)
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
