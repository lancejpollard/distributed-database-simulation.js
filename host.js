
const http = require('http')

const port = process.argv[2]

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.end('okay')
})

server.listen(port, () => {
  console.log(`Listening on ${port}.`)
})
