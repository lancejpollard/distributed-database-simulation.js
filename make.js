
const knex = require('knex')

class MigrationSource {
  getMigrations() {
    return Promise.resolve(['make'])
  }

  getMigrationName(migration) {
    return migration
  }

  getMigration(migration) {
    switch(migration) {
      case 'make':
        return {
          async up(knex) {
            await knex.schema.createTable('company', t => {
              t.increments()
              t.timestamps()
              t.string('name')
            })
          },

          async down(knex) {

          }
        }
    }
  }
}

const connections = makeConnections()

start()

async function start() {
  for (let i = 0, n = connections.length; i < n; i++) {
    const knex = connections[i]
    await migrate(knex)
    await seed(knex)
    await knex.destroy()
  }
}

async function migrate(knex) {
  await knex.migrate.latest({ migrationSource: new MigrationSource })
}

async function seed(knex) {

}

function makeConnections() {
  let i = 1
  const connections = []
  while (i < 11) {
    const connection = makeConnection(`postgresql://localhost:5432/ddsjs_test_${i}`)
    connections.push(connection)
    i++
  }
  return connections
}

function makeConnection(url) {
  const config = {
    client: 'pg',
    connection: {
      connectionString: url,
    },
    pool: {
      min: 2,
      max: 10
    }
  }

  return knex(config)
}
