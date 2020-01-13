//Global vars. will try to keep short
var collection = {}

function parseData(obj) {
    var keys = Object.keys(obj)
    var returnstring = ""
    for(var i = 0; i < keys.length; i++) {
        returnstring+="&"+keys[i]+"="+obj[keys[i]]
    }
    return returnstring
}

function request(options, cb) {
    var xhr = new XMLHttpRequest()
        xhr.open(options.type, options.url, true)
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
        xhr.send(options.data)
        xhr.onreadystatechange = function() {
            if(window.debug) console.log(xhr.response)
            var returnObj = xhr.response
            if(!options.plain) returnObj = JSON.parse(returnObj)
            if(xhr.readyState === 4) return cb(returnObj)
        }
}


/*
<div class="card" style="width: 18rem;">
  <img src="..." class="card-img-top" alt="...">
  <div class="card-body">
    <h5 class="card-title">Card title</h5>
    <p class="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
    <a href="#" class="btn btn-primary">Go somewhere</a>
  </div>
</div>
*/

function loadCat(id) {
    if(!id) return
    console.log(id)
    var m = document.getElementById("categories")
    var f = document.getElementById("media")
    if(!m) return
    m.innerHTML = ""
    request({
        type:"GET",
        url:"/api/media?filter="+id
    },function(data) {
        if(data.type === "OK") {
            console.log(data)
            var cats = data.data
            for(var i = 0; i < cats.length; i++) {
                cats[i].data = JSON.parse(cats[i].data)
                var e = document.createElement("div")
                e.classList = "card category"
                e.style.width = "18rem"
                if(cats[i].type === "category") {
                    e.innerHTML = `
                    <a onclick="loadCat('${cats[i].id}')" href="?navigation=${cats[i].id}">
                    <img src="${cats[i].data.image}" class="card-img-top" alt="NO image found">
                    <div class="card-body">
                      <h5 class="card-title">${cats[i].id}</h5>
                      <p class="card-text">${cats[i].data.description||"No description"}</p>
                    </div>
                    </a>
                    `
                    m.append(e)
                } else {
                    e.innerHTML = `
                    <a href="/watch?v=${cats[i].id}">
                    <img src="${cats[i].data.image}" class="card-img-top" alt="NO image found">
                    <div class="card-body">
                      <h5 class="card-title">${cats[i].data.name||"No name"}</h5>
                      <p class="card-text">${cats[i].data.description||"No description"}</p>
                    </div>
                    </a>
                    `
                    f.append(e)
                }
                
            }
        }
    })


}

function loadCollections() {
    var v = new URLSearchParams(window.location.search).get("navigation")
    loadCat(v||"NOPARENT")
}

function isLoggedIn() {
    request({ type: "GET", url: "/api/session" }, function (data) {
        if (data.type === "OK") {
            document.documentElement.setAttribute("loggedIn", "true")
            loadCollections()
        }
    })
}

function login() {
    var password = document.getElementById("password").value
    var username = document.getElementById("username").value
    var warning = document.getElementById("login_warning")
    if (!password || !username) {
        warning.innerText = "password or username field not filled in"
        warning.style.display = "inherit"
        warning.classList = "alert alert-warning"
        return
    }
    request({
        url: "/api/login",
        type: "POST",
        data: "password=" + password + "&username=" + username
    }, (data) => {
        if (data.type == "logged in") {
            warning.innerText = "Logged in!"
            warning.style.display = "inherit"
            warning.classList = "alert alert-success"
            setTimeout(function () { window.location.reload() }, 3000)
        } else {
            warning.innerText = "Error: " + data.data
            warning.style.display = "inherit"
            warning.classList = "alert alert-danger"
        }
    })
}

/*
const fs = require("fs")
module.exports = dir => {
    let res = []
    fs.readdirSync(dir).forEach(file => {
        const fileDir = `${dir}/${file}`
        const stat = fs.statSync(fileDir)

        if (stat && stat.isDirectory())
            res = [...res, ...module.exports(fileDir)]
        else res.push(fileDir)
    })

    return res

}
*/

function parsePaths(data) {
    var arr = data.split("/")
    for (let i = 0; i < arr.length; i++) {
        let item = arr[i]
        if (!collection[item] && arr[i + 1]) collection[item] = {}
        else { collection[arr[i - 1]] = item }
    }
}

function collections() {
    //<li class="tab col s3"><a href="#test1">Test 1</a></li>
    var cList = document.getElementById("collections")
    if (!cList) return
    request({
        type: "GET",
        url: "/api/collections"
    }, function (data) {
        for (var i = 0; i < data.length; i++) {
            var item = data[i]
            var cat = document.createElement("li")
            cat.classList = "tab col s3"
            cat.innerHTML = "<a onclick='loadCat(\"" + item.id + "\")' href='#" + item.id + "'>" + item.id + "</a>"
            cList.append(cat)
        }
    })
}

document.addEventListener("DOMContentLoaded", function () {
    isLoggedIn()
    request({
        type: "GET",
        url: "/api/admin/get_users"
    }, function (data) {
        if (!data.type && data.type != "error") {
            document.documentElement.setAttribute("admin", "true")

        }
    })
})