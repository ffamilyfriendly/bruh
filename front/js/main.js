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
            if(returnObj === "") return
            if(!options.plain) returnObj = JSON.parse(returnObj)
            if(xhr.readyState === 4 && cb) return cb(returnObj)
        }
}

function buildMedia(cat) {
    const html = `
        <div class="card category">
            <a ${cat.type === "category" ? `href="?navigation=${cat.id}` : `href="watch?v=${cat.id}" target="blank"`}">
            <img src="${cat.image}" class="card-img-top" alt="NO image found">
            <div class="card-body">
            <h5 class="card-title">${cat.displayname}</h5>
            <p class="card-text">${cat.childData[0].description.substring(0,100)+"..."}</p>
            </div>
            </a>
        </div>
    `
    $("#media").append(html)
}

function loadCat(id) {
    if(!id) return
    request({
        type:"GET",
        url:"/api/media?filter="+id+"&context=true"
    },function(data) {
        if(data.type === "OK") {
            for(var i = 0; i < data.data.length; i++) {
                const cat = data.data[i]

                //if any supported property is "auto" and the meta plugin is enabled fetch metadata from tmdb
                if(cat.childData && [cat.image,cat.childData[0].description].includes("auto") && window.plugins.metadata && window.plugins.metadata.enabled) {
                    request({
                        type:"GET",
                        url:`/api/meta/${cat.id}`
                    }, (meta) => {
                        cat.image = cat.image === "auto" ? `https://image.tmdb.org/t/p/w300${meta.poster_path}` : cat.image
                        cat.childData[0].description = cat.childData[0].description === "auto" ? meta.overview : cat.childData[0].description
                        buildMedia(cat)
                    })
                } else {
                    if(!cat.childData) cat.childData =[{description:"something went wrong..."}]
                    buildMedia(cat)
                }                
            }
        }
    })
}

function loadCollections() {
    var v = new URLSearchParams(window.location.search).get("navigation")
    loadCat(v||"root")
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

    //check plugin-list
    request({
        type:"GET",
        url:"/plugins",
        plain:true
    }, (data) => {
        window.plugins = {}
        data = JSON.parse(data)
        for(let i = 0; i < data.length; i++) {
            window.plugins[data[i].name] = data[i]
        }
    })
})