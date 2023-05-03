// const xyz = require('./people')
const fs = require('fs')
let a = fs.readFile('./nate.text', (error,data)=>{
    console.log(error, data)
})
