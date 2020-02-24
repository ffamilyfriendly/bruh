let _data = {};
let active;

function new_category() {
    $("#newCat").removeClass("notice")
    const name = $("#new_displayname").val(),
        description = $("#new_description").val(),
        parent = $("#new_parent").val(),
        image = $("#new_image").val()
    
    //check if all has assigned value
    if([name,parent,description,image].includes("")) {
        $("#newCat").addClass("notice")
        return
    }
    
    request({
        type:"POST",
        url:"/api/admin/new_category",
        data: parseData({name,description,parent,image})
    },(data) => {
        if(data.type === "bad request") {
            return alert(`could not create category: ${data.data}`)
        } else {
            if(data.type === "created") {
                window.location.reload()
            } else {
                alert(`could not create category: ${data.data}`)
            }
        }
    })
}

function save_category() {
    const name = $("#edit_displayname").val(),
        description = $("#edit_description").val(),
        image = $("#edit_image").val(),
        parent = $("#edit_parent").val(),
        id = active.id;

    request({
        type:"PATCH",
        url:"/api/admin/update_category",
        data:parseData({name,description,image,parent,id})
    }, () => {
        window.location.reload()
    })
}

function delete_category() {
    request({
        type:"DELETE",
        url:"/api/admin/delete",
        data: parseData({id:active.id, type:"content"})
    },(data) => {
        if(data.type === "deleted") {
            request({
                type:"DELETE",
                url:"/api/admin/delete",
                data: parseData({id:active.id, type:"category"})
            },(dataa) => {
                if(dataa.type === "deleted") {
                    alert("deleted!")
                    window.location.reload()
                } else {
                    alert("could delete content but not category")
                }
            })
        } else {
            alert("could not delete content")
        }
    })

}

function edit(id) {
    active = _data[id]
    $("#edit_displayname").val(active.displayname)
    $("#edit_description").val(active.childData[0].description)
    $("#edit_image").val(active.image)
    $("#edit_parent").val(active.parent)
}

$(document).ready(function() {
    request({
        type:"GET",
        url: "/api/media?context=true"
    },(data) => {
        for(let i = 0; i < data.data.length; i++) {
            const item = data.data[i]
            if(item.type === "category") {
                _data[item.id] = item
                const html = `<li class="list-group-item d-flex justify-content-between align-items-center"><span> <b>name: </b>${item.displayname}<small>(${item.id})</small> <b>parent:</b> ${item.parent} </span> <span data-toggle="modal" data-target="#editModal" onclick="edit('${item.id}')" class="badge badge-secondary badge-pill">edit</span></li>`
                $("#mainList").append(html)
            }
        }
    })
})