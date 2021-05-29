const util = require('util')
const fs = require('fs')
let myReadFile = util.promisify(fs.readFile)

myReadFile('./resource/content.txt').then(value => {
    console.log(value.toString())
}, reason => {
    console.log(reason)
})
