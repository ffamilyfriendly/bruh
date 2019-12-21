const _url = new URL(window.location.href)
const url = new URLSearchParams(_url.search)
const title = url.get("v")
let player


function timeChanged() {
    try {
        window.setting.set("last_watched",title)
        window.setting.set("last_watched_time",player.currentTime())
    } catch(err) {
        //we could do something here... but nah
    }
}

function toDate(time) {
    const d = new Date(time)
    return `${d.getDate()}/${d.getMonth()}/${d.getFullYear()} at ${d.getHours()}:${d.getMinutes()}` //this is the restoftheworld format. If you feel like using "freedom time" just change it a bit
}

function getInf() {
    const p = document.getElementById("player");
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
    $menu.css({left:event.pageX-($menu.width()+10),top:event.pageY-($menu.height()+10)})
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
    sourceTag.setAttribute('src', `api/movie/${title}`);
    sourceTag.setAttribute('type', 'video/mp4');
    vid.appendChild(sourceTag)
    document.getElementById('info').prepend(vid);
    videojs("player")
    player = videojs.getPlayer("player")
    setupMeta()
    setupMenu()
    skipto()
}

$(document).ready(() => {
createSource() //create video element
setInterval(() => timeChanged(),window.setting.get("updatePlayerState")||5000) //store last played cookies every selected or 5th second
})
