function buildMedia(cat) {
    const html = `
        <div class="card category">
            <a ${cat.type === "category" ? `href="?navigation=${cat.id}` : `href="watch?v=${cat.id}" target="blank"`}">
            <img src="${cat.image}" class="card-img-top" alt="NO image found">
            <div class="card-body">
            <h5 class="card-title">${cat.displayname}</h5>
            <p class="card-text">${cat.childData.description.substring(0,100)+"..."}</p>
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
                log(cat.id,"fetching content data")
                request({
                    type:"GET",
                    url:`/api/media/${cat.type}/${cat.id}`
                }, (_data) => {
                    cat.childData = _data.data
                    //if any supported property is "auto" and the meta plugin is enabled fetch metadata from tmdb
                    if(cat.childData && [cat.image,cat.childData.description].includes("auto") && window.plugins.metadata && window.plugins.metadata.enabled) {
                        request({
                            type:"GET",
                            url:`/api/meta/${cat.id}`
                        }, (meta) => {
                            cat.image = cat.image === "auto" ? `https://image.tmdb.org/t/p/w300${meta.poster_path}` : cat.image
                            cat.childData.description = cat.childData.description === "auto" ? meta.overview : cat.childData.description
                            buildMedia(cat)
                        })
                    } else {
                        if(!cat.childData) cat.childData =[{description:"something went wrong..."}]
                        buildMedia(cat)
                    }     
                })           
            }
        }
    })
}

function loadCollections() {
    var v = new URLSearchParams(window.location.search).get("navigation")
    loadCat(v||"root")
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

function searchTitles() {
    //prepare
    let query = $("#q").val()
    if(query === "") return
    $("#searchRes").removeClass("hide")
    let list = $("#results")
    $("#query").text(query)
    list.empty()

    //search
    request({
        type:"GET",
        url:`/api/search?q=${query}`
    },(data) => {
        if(data.type === "OK") {
            const results = data.data.filter(r => r.type !== "category")
            for(let i = 0; i < results.length; i++) {
                list.append(`<li><a href="/watch?v=${results[i].id}">${results[i].displayname}</a></li>`)
            }
            $("#query_total").text(results.length)
        }
    })
}