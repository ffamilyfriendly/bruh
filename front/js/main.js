const parseCookies = cs => Object.fromEntries(cs.split('; ').map(x => x.split('=')))

window.setting = {
    set: (key, value) => {
        if(!window.setting.exists("cookies")) document.cookie = "cookies=false;" //if no cookie policy is set default to no cookies
        if(key !== "cookies" && parseCookies(document.cookie)["cookies"] === "false") throw new Error("cookies forbidden") //if trying to write with cookie policy false throw err
        document.cookie = `${key}=${value};` //write
    },
    exists: key => {
        const settings = parseCookies(document.cookie)
        return typeof settings[key] != "undefined"
    },
    remove: key => {
        document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:01 GMT;`
    },
    get: key => {
        return key ? parseCookies(document.cookie)[key] : parseCookies(document.cookie)
    }
}

$(document).ready(() => {
    if(!window.setting.exists("cookies") || window.setting.get("cookies") == "false") {
        $("body").prepend(`<div id="cookie_header" class="banner center"><span id="notice-text">this site uses cookies to store settings. By continuing to use the site you agree to the <a href="#tos">Terms of service</a></span><hr class="mobile"><button onclick="window.setting.set('cookies',true); $('#cookie_header').remove()" id="btn-dismiss" class="btn-yellow">dismiss</button></div>`)
    }
})