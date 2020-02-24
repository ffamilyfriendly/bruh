let _data = {}
let active;

function new_media() {
    const name = $("#new_name").val(),
        description = $("#new_description").val(),
        image = $("#new_image").val(),
        path = $("#new_path").val(),
        parent = $("#new_parent").val();
    
    if([name,description,image,path,parent].includes("")) return $("#newMed").addClass("notice")
    else {
        $("#newMed").removeClass("notice")
        request({
            type:"POST",
            url:"/api/admin/new_media",
            data: parseData({name,description,image,path,parent})
        }, (data) => {
            if(data.type === "created") window.location.reload()
            else alert(`could not create media: ${data.data}`)
        })
    }
}

function delete_media() {
    request({
        type:"DELETE",
        url:"/api/admin/delete",
        data: parseData({id:active.id, type:"content"})
    },(data) => {
        if(data.type === "deleted") {
            request({
                type:"DELETE",
                url:"/api/admin/delete",
                data: parseData({id:active.id, type:"media"})
            },(dataa) => {
                if(dataa.type === "deleted") {
                    alert("deleted!")
                    window.location.reload()
                } else {
                    alert("could delete content but not media")
                }
            })
        } else {
            alert("could not delete content")
        }
    })
}

function save_media() {
    const name = $("#edit_name").val(),
        description = $("#edit_description").val(),
        image = $("#edit_image").val(),
        parent = $("#edit_parent").val(),
        path = $("#edit_path").val(),
        id = active.id;

    request({
        type:"PATCH",
        url:"/api/admin/update_media",
        data:parseData({name,description,image,parent,id,path}),
        plain:true
    }, () => {
        window.location.reload()
    })
}

function edit(id) {
    active = _data[id]
    $("#edit_name").val(active.displayname)
    $("#edit_description").val(active.childData[0].description)
    $("#edit_image").val(active.image)
    $("#edit_parent").val(active.parent)
    $("#edit_path").val(active.childData[0].path)
}

$(document).ready(function() {
    request({
        type:"GET",
        url: "/api/media?context=true"
    },(data) => {
        for(let i = 0; i < data.data.length; i++) {
            const item = data.data[i]
            if(item.type === "media") {
                _data[item.id] = item
                const html = `<li class="list-group-item d-flex justify-content-between align-items-center"><span> <b>name: </b>${item.displayname}<small>(${item.id})</small> <b>parent:</b> ${item.parent} </span> <span data-toggle="modal" data-target="#editModal" onclick="edit('${item.id}')" class="badge badge-secondary badge-pill">edit</span></li>`
                $("#mainList").append(html)
            }
        }
    })
})