function delete_user(id) {
    request({
        type:"DELETE",
        url:"/api/admin/delete",
        data: parseData({id:id, type:"users"})
    },(data) => {
        if(data.type === "deleted") window.location.reload()
        else alert(`could not delete user with id "${id}": ${data.data}`)
    })
}

$(document).ready(function() {
    request({
        type:"GET",
        url: "/api/admin/get_users"
    },(data) => {
        for(let i = 0; i < data.length; i++) {
            const item = data[i]
            const html = `<li>${item.id} ${item.admin == 1 ? "<small>(admin)</small>" : ""} <a href="#" onclick="delete_user('${item.id}')">[DELETE]</a></li>`
            $("#uList").append(html)
        }
    })
})