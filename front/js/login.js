
function login() {
    const email = $("#email").val() //get email
    const password = $("#password").val() //get password
    $.ajax({
        type:"POST",
        url:"/api/login",
        data: {email,password},
        success: data => {
            $("#login_form").prepend(`<div class="login_success">${data.data}</div>`)
            const url = new URL(window.location.href) 
            let c = url.searchParams.has("redirect") ? decodeURIComponent(url.searchParams.get("redirect")) : "/home" //get decoded redirect param
            window.location = c
            //TODO: if redirect param is outside domain give warning so no fraud or whatever 
        },
        error: err => {
            $("#login_form").prepend(`<div class="login_error">${err.responseJSON.data}</div>`)
        }
    })
}

function register() {
    const email = $("#email").val()
    const password = $("#password").val()
    $.ajax({
        type:"POST",
        url:"/api/register",
        data: {email,password},
        success: data => {
            $("#login_form").prepend(`<div class="login_success">${data.data}</div>`)
            login()
        },
        error: err => {
            $("#login_form").prepend(`<div class="login_error">${err.responseJSON.data}</div>`)
        }
    })
}


