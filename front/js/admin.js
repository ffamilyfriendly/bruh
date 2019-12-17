const upload = e => {
    e.preventDefault()
    const $stat = $("#fileStat")
    const $statxt = $stat.children(":first")
    const $bar = $("#bar")

    $stat.slideDown() //slide down fole uplaod status thing
    $statxt.text("starting uploading process...") 

    const $file = $("input[name='file']") //get file input
    const file = $file.prop("files")[0] //get file

    if(!file) return $statxt.text("Error: no file") //if no file tell user they are bad 
    else $statxt.text(`file: ${file.name} size: ${file.size}mb`) // if file say there is file

    const fd = new FormData()
    fd.append("file",file)

    $.ajax({
        type:"POST",
        url:"/api/upload",
        data:fd,
        processData:false,
        contentType:false,
        success: data => {
            alert("!!!")
            console.log(data)
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
    $("#file_upload").submit(upload)
})

var unsaved = {
    user:{}
}

function user_changed(e) {
    $("#unsaved_warning").slideDown()
    const $value = $(e)
    console.log($value)
    const $row = $value.parent().parent()
    unsaved.user[$row.children(":first").text()] = $value.val()
}

function save() {
    if(Object.keys(unsaved.user).length !== 0) {
        for(let user in unsaved.user) {
            $.ajax({
                type:"POST",
                url:"api/edit_user",
                data:{email:user,level:unsaved.user[user]},
                success: data => {
                    console.log(data)
                },
                error: err => {
                    console.error(err)
                }
            })
        }
    }
    $("#unsaved_warning").slideUp()
}

function load_users() {
    const $table = $("#user_body")
    $.get("/api/get_users",(data) => {
        for(let i = 0; i < data.length; i++) {
            const row = data[i]
            $table.append(`<tr><th>${row.email}</th><th><input type="number" onchange="user_changed(this)" value="${row.level}"></th></tr>`)
        }
    })
}