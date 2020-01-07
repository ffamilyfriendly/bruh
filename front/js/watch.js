const _url = new URL(window.location.href)
const url = new URLSearchParams(_url.search)
const title = url.get("v")
const season = {
    isSeries:false,
    episode:00,
    seson:00,
    name:"",
    hasNotified:false
}
let player

function endsSoon() {
    if(season.isSeries && !season.hasNotified) {
        if(player.isFullscreen()) player.exitFullscreen()
        $("#notification-next").show()
        setTimeout(function() {
            let nrm = Number(season.episode)+1
            let constructedName = `${season.name.split(/S[0-9]{2,}E[0-9]{2,}/gi)[0]}S${season.seson}E${nrm < 10 ?  `0${nrm}` : `${nrm}` }`
            $.get(`/api/get_movies?name=${constructedName}`,(data) => {
                if(!data[0]) return console.log("not found")
                else window.location = `/watch?v=${data[0].id}`
            })
        },1000*10)
        season.hasNotified = true
    }
}

function timeChanged() {
    try {
        window.setting.set("last_watched",title)
        window.setting.set("last_watched_time",player.currentTime())
        if(player.currentTime() > player.duration()-10) endsSoon()
    } catch(err) {
        //we could do something here... but nah
    }
}

function parseTitle(title) {
    try {

    
    const return_inf = {
        season: title.match(/S[0-9]{2,}/)[0].split("S")[1],
        episode: title.match(/E[0-9]{2,}/)[0].split("E")[1]
    }
    return return_inf
    } catch(err) {
        console.warn(err)
    }
}

function toDate(time) {
    const d = new Date(time)
    return `${d.getDate()}/${d.getMonth()}/${d.getFullYear()} at ${d.getHours()}:${d.getMinutes()}` //this is the restoftheworld format. If you feel like using "freedom time" just change it a bit
}

//This should work for ios now
function skipto() {
    if(url.has("t")) {
        player.currentTime(url.get("t"))
    }
}

const generateDebugModal = () => {
    const main = document.createElement("ul")
    const info = [{label:"% in buffer",data:(player.bufferedPercent() * 100)},{label:"source",data:player.currentSrc()},{label:"last watched",data:`${window.setting.get("last_watched")}/${window.setting.get("last_watched_time")}`}]

    for(let i = 0; i < info.length; i++) {
        const item = info[i]
        const listItem = document.createElement("li")
        listItem.innerHTML = `<b>${item.label}:</b> ${item.data}`
        main.append(listItem)
    }
    return main
}

function debugMenu() {
    player.createModal(generateDebugModal(),{pauseOnOpen:false})
}

function optionsmenu(event) {
    let firstclick = true
    const $menu = $("#optionsmenu")
    $menu.fadeIn()
    $menu.css({left:event.pageX,top:event.pageY})
    $("body").click((e) => {
        if(e.target.id !== "optionsmenu" && !$(e.target).parents("#optionsmenu").length && !firstclick) {
            $menu.fadeOut()
        }
        firstclick = !firstclick 
    })
}

function setupMenu() {
let Button = videojs.getComponent('Button');
    let settingsButton = videojs.extend(Button, {
        constructor: function() {
        Button.apply(this, arguments);
        this.addClass("vjs-icon-cog")
        },
        handleClick: optionsmenu
    });
videojs.registerComponent('settingsButton', settingsButton);
player.controlBar.addChild('settingsButton', {});
}

function setupMeta() {
    $.get(`/api/info/${title}`,(data) => {
        const meta = JSON.parse(data.meta)
        $("#movie_title").text(data.name)
        const episodem = parseTitle(data.name)
        if(episodem) {
            season.episode = episodem.episode
            season.seson = episodem.season
            season.name = data.name
            season.isSeries = !!episodem.episode
        }

        $("#movie_category").text(data.category)
        $("#movie_uploaded").text(toDate(meta.uploaded))
        $("#loader").fadeOut()
    }).fail(err => {
        if(url.has("dev")) return
        if(err) return window.popup("error","media you are attempting to watch does not exist or you dont have access to it.<a href='/home'> go back</a>")
    })
}

function createSource() {
    //create video
    var vid = document.createElement('video');
    vid.classList.add("video-js")
    vid.id = "player"
    vid.setAttribute("data-setup",'{}')
    vid.setAttribute("controls",true)

    //create source
    var sourceTag = document.createElement("source")
    $.get("/api/session",(data) => {
        sourceTag.setAttribute('src', `api/movie/${data.data}/${title}`);
        sourceTag.setAttribute('type', 'video/mp4');
        vid.appendChild(sourceTag)
        document.getElementById('info').prepend(vid);
        videojs("player")
        player = videojs.getPlayer("player")
        setupMeta()
        setupMenu()
        player.one("play",() => {
            skipto()
        }) 
    })
}

$(document).ready(() => {
createSource() //create video element
setInterval(() => timeChanged(),window.setting.get("updatePlayerState")||5000) //store last played cookies every selected or 5th second
})
