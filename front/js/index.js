const login = () => {
    const username = $("#username")
    const password = $("#password")

    if(!username.val() || !password.val()) {
        username.attr("class",username.val() ? "" : "border border-danger") 
        password.attr("class",password.val() ? "" : "border border-danger") 
        return
    }

    $.ajax({
        url:"/api/login",
        type:"POST",
        data:{username:username.val(),password:password.val()},
        success: (data) => {
            $("#loggedin_error").slideUp()
            $("#loggedin_success").slideDown()
            setTimeout(() => {location.reload()},3000)
        },
        error: (data) => {
            console.log(data)
            $("#loggedin_error").slideDown()
        }
    })
}