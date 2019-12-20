const parseCookies = cs => Object.fromEntries(cs.split('; ').map(x => x.split('=')))
const cookieEncode = val => typeof val == "string" ? val.replace(/\=/g,"*") : val
const cookieDecode = val => typeof val == "string" ? val.replace(/\*/g,"=") : val

window.setting = {
    set: (key, value) => {
        if(!window.setting.exists("cookies")) document.cookie = "cookies=false;" //if no cookie policy is set default to no cookies
        if(key !== "cookies" && parseCookies(document.cookie)["cookies"] === "false") throw new Error("cookies forbidden") //if trying to write with cookie policy false throw err
        document.cookie = `${key}=${cookieEncode(value)};` //write
    },
    exists: key => {
        const settings = parseCookies(document.cookie)
        return typeof settings[key] != "undefined"
    },
    remove: key => {
        document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:01 GMT;`
    },
    get: key => {
        return key ? cookieDecode(parseCookies(document.cookie)[key]) : parseCookies(document.cookie)
    }
}

window.popup = (type,data) => {
    const html = `<div class="centerDiv popup popup-${type}">
    <h1 class="center">${type}</h1>
    <p>${data}</p>
    <button onclick='$(this).parent().remove()'>Dismiss</button>
    </div>`
    $("body").prepend(html)
}

$(document).ready(() => {
    if(!window.setting.exists("cookies") || window.setting.get("cookies") == "false") {
        $("body").prepend(`<div id="cookie_header" class="banner center"><span id="notice-text">this site uses cookies to store settings. By continuing to use the site you agree to the <a href="/terms">Terms of service</a></span><hr class="mobile"><button onclick="window.setting.set('cookies',true); $('#cookie_header').remove()" id="btn-dismiss" class="btn-yellow">dismiss</button></div>`)
    }
})

/* handle uncought errors */
window.onerror = (err) => {
    window.popup("error",`${err}<br><a class="btn-red" href="https://stackoverflow.com/search?q=${err}">Stack overflow</a>`)
}