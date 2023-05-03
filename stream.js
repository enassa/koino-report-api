const fs = require('fs')
const readStream = fs.createReadStream('./bog1.txt', {encoding: 'utf-8'});
const writeStream = fs.createWriteStream('./bog6.txt', {encoding: 'utf-8'});
// readStream.on('data', (chunk)=>{
//     console.log('------ NEW CHUNK -----')
//     console.log(chunk)
//     writeStream.write('\nNEW CHUNK\n')
//     writeStream.write(chunk)
// })

readStream.pipe(writeStream)