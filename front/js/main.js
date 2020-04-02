//Global vars. will try to keep short
var collection = {}
window.pluginQueue = []

function parseData(obj) {
    var keys = Object.keys(obj)
    var returnstring = ""
    for(var i = 0; i < keys.length; i++) {
        returnstring+="&"+keys[i]+"="+obj[keys[i]]
    }
    return returnstring
}



function log(type,msg) {
    console.log(`[${type}] ${msg}`)
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
            try {
                if(!options.plain) returnObj = JSON.parse(returnObj)
            } catch(err) {
                if(err) console.log(returnObj)
            }
            if(xhr.readyState === 4 && cb) return cb(returnObj)
        }
}



function isLoggedIn() {
    request({ type: "GET", url: "/api/session" }, function (data) {
        if (data.type === "OK") {
            document.documentElement.setAttribute("loggedIn", "true")
            loadCollections()
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

        for(let i = 0; i < window.pluginQueue.length; i++) {
            window.pluginQueue[i]()
        }
    })
})