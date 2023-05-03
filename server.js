const http = require('http')
const fs = require('fs')
const server = http.createServer((req, res)=>{
     res.setHeader('Content-type', 'text/html')

     let path = './views/'

     switch (req.url) {
         case '/':
             path += 'home.html'
             res.statusCode =  200
             break;
         case '/about':
             path += 'about.html'
             res.statusCode =  200
             break;
         case '/about-me':
             res.statusCode = 301
             res.setHeader('Location','about')
             res.end()
             break;
         case '/contact':
             path += 'contact.html'
             res.statusCode =  200
             break;
         default:
             path += '404.html'
             res.statusCode =  404
             break;
     }
     fs.readFile(path, (err, data) => {
        if(err){
            console.log(err)
        }else{
            res.end(data)
        }
     })
    
})
server.listen(3033, 'localhost',() => {
    console.log('listening to port 3000')
})