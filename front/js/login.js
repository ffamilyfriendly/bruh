function login() {
    const email = $("#email").val()
    const password = $("#password").val()
    $.ajax({
        type:"POST",
        url:"/api/login",
        data: {email,password},
        success: data => {
            console.log(data)
        },
        error: err => {
            $("#login_form").prepend(`<div class="login_error">${err.responseJSON.data}</div>`)
        }
    })
}

