
const KNEX = require('knex')
const http = require('http')

const integer = parseInt(process.argv[2])
const port = 1234 + integer
const databaseUrl = `postgresql://localhost:5432/ddsjs_test_${integer + 1}_replica_1`
const knex = KNEX({
  client: 'pg',
  connection: {
    connectionString: databaseUrl,
  },
  pool: {
    min: 2,
    max: 10
  }
})

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.end('okay')
})

server.listen(port, () => {
  console.log(`Listening on ${port}.`)
})
