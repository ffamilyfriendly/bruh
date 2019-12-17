$(document).ready(() => {
    $("a[trigger]").click(function() {
        const $id = $(this).attr("trigger")
        $(`#${$id}`).toggle()
    })
})

function load_users() {
    const $table = $("#user_body")
    $.get("/api/get_users",(data) => {
        for(let i = 0; i < data.length; i++) {
            const row = data[i]
            $table.append(`<tr><th>${row.email}</th><th>${row.level}</th></tr>`)
        }
    })
}