const triggerConfetti = () => {
    $("#joined").slideDown()
    confetti.start()
    setTimeout(() => { window.location = "/" },1000 * 5)
}

const handleRegErr = (data) => {
    console.log(data)
    console.error("not implemented")
}


const register = () => {
    const invtoken = $("#invite_token")
    const username = $("#username")
    const password = $("#password")
    if(!invtoken.val()) return window.location = "/error#INVITE_NOT_EXIST"
    if(!username.val() || !password.val()) return

    $.ajax({
        url:"/api/register",
        type:"POST",
        data:{invite:invtoken.val(),username:username.val(),password:password.val()},
        success: (data) => {
            if(data.type === "user_created") triggerConfetti()
            else handleRegErr(data)
        },
        error: (data) => {
            handleRegErr(data)
        }
    })
}
