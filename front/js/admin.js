window.debug = false

function newInvite() {
    var text = document.getElementById("invite_text")
    var uses = document.getElementById("invite_uses")
    var warning = document.getElementById("fields_warning")

    if(!text.value || !uses.value) {
        warning.innerText = "required fields are empty"
        warning.style.display = "block"
        return
    }
    request({
        type:"POST",
        url:"/api/admin/new_invite",
        data:"id="+text.value+"&uses="+uses.value
    },function(data) {
        if(data.type === "created") {
            window.location.reload()
        } else {
            warning.innerText = "Error: " + data.data + " (check logs)"
            console.log(data)
            warning.style.display = "block"
        }
    })
}

function newMedia() {
    var name = document.getElementById("media_name")
    var parent = document.getElementById("media_parent")
    var path = document.getElementById("media_path")
    var desc = document.getElementById("media_desc")
    var warning = document.getElementById("media_warning")

    if(!name.value || !parent.value || !path.value) {
        warning.innerText = "required fields are empty"
        warning.style.display = "block"
        return
    }
    //const { id, name, path, parent } = req.body
    request({
        type:"POST",
        url:"/api/admin/new_media",
        data:parseData({name:name.value,description:desc.value,parent:parent.value,path:path.value,id:btoa(Math.floor(Math.random() * 2000).toString())})
    },function(data) {
        console.log(data)
    })
}

function runSql() {
    var query = document.getElementById("query")
    var output = document.getElementById("queryOutput")

    request({
        type:"POST",
        url:"/api/admin/query_database",
        data:parseData({sql:query.value}),
        plain:true
    }, function(data) {
        output.innerText = data
    })
}

function newCollection() {
    var name = document.getElementById("collection_name")
    var parent = document.getElementById("collection_path")
    var image = document.getElementById("collection_image")
    var desc = document.getElementById("collection_description")
    var warning = document.getElementById("collection_warning")

    if(!name.value) {
        warning.innerText = "required fields are empty"
        warning.style.display = "block"
        return
    }
    request({
        type:"POST",
        url:"/api/admin/new_category",
        data:"id="+name.value+"&parent="+parent.value+"&image="+image.value+"&description="+desc.value
    },function(data) {
        if(data.type === "created") {
            window.location.reload()
        } else {
            warning.innerText = "Error: " + data.data + " (check logs)"
            console.log(data)
            warning.style.display = "block"
        }
    })
}

function users_table() {
    request({
        type:"GET",
        url:"/api/admin/get_users"
    },function(data) {
        var table = document.getElementById("users_table")
        for(var i = 0; i < data.length; i++) {
            var user = data[i]
            var elem = document.createElement("tr")
            elem.innerHTML = "<th scope='row'>"+i+"</th><td>"+user.id+"</td>"
            table.append(elem)
        }
    })
}

function invites_table() {
    request({
        type:"GET",
        url:"/api/admin/get_invites"
    },function(data) {
        var table = document.getElementById("invites_table")
        for(var i = 0; i < data.length; i++) {
            var invite = data[i]
            var elem = document.createElement("tr")
            elem.innerHTML = "<th scope='row'>"+i+"</th><td>"+invite.id+"</td><td>"+invite.uses+"</td>"
            table.append(elem)
        }
    })
}

function collections_table() {
    request({
        type:"GET",
        url:"/api/media"
    },function(data) {
        var ctable = document.getElementById("collections_table")
        var mtable = document.getElementById("media_table")
        data = data.data
        for(var i = 0; i < data.length; i++) {
            var collection = data[i]
            var elem = document.createElement("tr")
            elem.innerHTML = "<th scope='row'>"+i+"</th><td>"+collection.id+"</td><td>"+collection.parent+"</td>"
            if(collection.type === "category") {
                ctable.append(elem)
            } else mtable.append(elem)
        }
    })
}

function timeWhen(tm) {
    var seconds = Math.floor((new Date() - tm) / 1000);

    var interval = Math.floor(seconds / 31536000);
  
    if (interval > 1) {
      return interval + " years";
    }
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) {
      return interval + " months";
    }
    interval = Math.floor(seconds / 86400);
    if (interval > 1) {
      return interval + " days";
    }
    interval = Math.floor(seconds / 3600);
    if (interval > 1) {
      return interval + " hours";
    }
    interval = Math.floor(seconds / 60);
    if (interval > 1) {
      return interval + " minutes";
    }
    return Math.floor(seconds) + " seconds";
}

function prepareMain() {
    var agentList = document.getElementById("agentList")
    var lgList = document.getElementById("logList")
    request({
        type:"GET",
        url:"/api/admin/connected"
    },function(data) {
        var keys = Object.keys(data.sessions)
        for(var i = 0; i < keys.length; i++) {
        var li = document.createElement("li")
        var user = JSON.parse(data.sessions[keys[i]])
        li.innerHTML = "<b>id: </b>"+keys[i]+" <b>Agent: </b>" + user.user.activity.agent + " <b>Media:</b> " + user.user.activity.media + " <b> When: </b>" + timeWhen(user.user.activity.time) + " ago"
        agentList.append(li)
        }
    })

    request({
        type:"GET",
        url:"/api/admin/logs",
        plain:true
    },function(data) {
        var logList = data.split("\n")
        for(var i = 0; i < logList.length; i++) {
            var li = document.createElement("li")
            li.innerHTML = "<code>" + logList[i] + "</code>"
            lgList.append(li)
        }
    })
}

function filterLogs() {
    var filter = document.getElementById("filter").value
    var list = document.getElementById("logList")
    for(var i = 0; i < list.childNodes.length; i++) {
        var child = list.children[i]
        if(child && child.innerHTML.includes(filter)) {
            child.classList.add("filter-item")
        } else if(child) {
            child.classList.remove("filter-item")
        }
    }
}

document.addEventListener("DOMContentLoaded",function() {
    collections_table()
    invites_table()
    users_table()
    prepareMain()
})
