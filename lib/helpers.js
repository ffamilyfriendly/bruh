
/* validate form*/
exports.validate = (arr,type) => {
    let passed = false
    switch(type) {
        case "user":
        const regex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/gmi
        passed = regex.test(arr[0])
        break;
    }
    return passed
}

exports.important_params = (arr,res) => {
    if(arr.includes(undefined)){
        res.status(400).send({type:"bad request",data:"insufficient amount of parameters passed"})
        return false
    } else return true
}

exports.generate_id = max => Buffer.from(Math.floor(Math.random() * max).toString()).toString("base64")