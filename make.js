
const knex = require('knex')
const { faker } = require('@faker-js/faker')
const { flatten } = require('lodash')
console.log('generating initial data...')
const cityList = require('./city.json')
const personIdList = generateIdList(1000000)
const companyIdList = generateIdList(100000)
const cityIdList = generateIdList(cityList.length)
const peopleBucketList = generatePeopleList()
const companyBucketList = generateCompanyList()
console.log('done generating')

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
            await knex.schema.createTable('person', t => {
              t.increments()
              t.timestamps()
              t.string('name').notNull()
              t.string('email').notNull()
            })
            await knex.schema.createTable('company', t => {
              t.increments()
              t.timestamps()
              t.string('name').notNull()
            })
            await knex.schema.createTable('location', t => {
              t.increments()
              t.timestamps()
              t.string('city').notNull()
              t.string('state').notNull()
              t.index(['city'])
              t.index(['state'])
            })
            await knex.schema.createTable('entity_location', t => {
              t.increments()
              t.timestamps()
              t.string('type').notNull()
              t.integer('entity_id').notNull()
              t.foreign('entity_id')
              t.string('entity_type').notNull()
              t.integer('location_id').notNull()
              t.foreign('location_id')
              t.index(['entity_type', 'entity_id'])
            })
            await knex.schema.createTable('membership', t => {
              t.increments()
              t.timestamps()
              t.string('type').notNull()
              t.integer('person_id').notNull()
              t.foreign('person_id')
              t.integer('company_id').notNull()
              t.foreign('company_id')
              t.index(['company_id', 'person_id'])
            })
            await knex.schema.createTable('account', t => {
              t.increments()
              t.timestamps()
              t.integer('entity_id').notNull()
              t.foreign('entity_id')
              t.string('entity_type').notNull()
              t.integer('balance').notNull().defaultTo(0)
              t.index(['entity_type', 'entity_id'])
            })
            await knex.schema.createTable('account_change', t => {
              t.increments()
              t.timestamps()
              t.integer('account_id').notNull()
              t.foreign('account_id')
              t.integer('amount').notNull().defaultTo(0)
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
  }

  for (let i = 0, n = connections.length; i < n; i++) {
    const knex = connections[i]
    await seedBase(knex, i)
  }

  shuffleArray(personIdList)
  shuffleArray(companyIdList)

  const personIdListMembership = personIdList.concat()

  for (let i = 0, n = connections.length; i < n; i++) {
    const knex = connections[i]
    await seedMembership(knex, i, personIdListMembership)
  }

  shuffleArray(personIdList)
  shuffleArray(companyIdList)

  for (let i = 0, n = connections.length; i < n; i++) {
    const knex = connections[i]
    await seedPersonLocation(knex, i)
  }

  shuffleArray(personIdList)
  shuffleArray(companyIdList)

  for (let i = 0, n = connections.length; i < n; i++) {
    const knex = connections[i]
    await seedPersonAccount(knex, i)
    if (i < 4) {
      await seedCompanyAccount(knex, i)
    }
  }

  for (let i = 0, n = connections.length; i < n; i++) {
    const knex = connections[i]
    await knex.destroy()
  }
}

async function migrate(knex) {
  await knex.migrate.latest({ migrationSource: new MigrationSource })
}

async function seedBase(knex, i) {
  if (i === 0) {
    console.log('=== seedBaseLocation ===')
    await knex('location').insert(cityList)
  }

  await seedBasePeople(knex, i)

  if (i < 4) {
    await seedBaseCompany(knex, i)
  }
}

async function seedBasePeople(knex, i) {
  console.log(`=== seedBasePeople ${i} ===`)
  const size = peopleBucketList[i].length
  const bucketList = chunkArray(peopleBucketList[i], 10000)

  for (let k = 0, n = bucketList.length; k < n; k++) {
    const list = bucketList[k]
    const listSize = (i * size) + (list.length * (k + 1))
    console.log('insert person', listSize)
    await knex('person').insert(list)
  }
}

async function seedBaseCompany(knex, i) {
  console.log(`=== seedBaseCompany ${i} ===`)
  const size = companyBucketList[i].length
  const bucketList = chunkArray(companyBucketList[i], 10000)

  for (let k = 0, n = bucketList.length; k < n; k++) {
    const list = bucketList[k]
    const listSize = (i * size) + (list.length * (k + 1))
    console.log('insert company', listSize)
    await knex('company').insert(list)
  }
}

async function seedPersonAccount(knex, i) {
  console.log(`=== seedPersonAccount ${i} ===`)
  const bucketList = chunkArray(personIdList.slice(i * 100000, (i * 100000) + 100000), 5000)

  for (let j = 0, m = bucketList.length; j < m; j++) {
    const list = bucketList[j].map(entity_id => {
      return {
        entity_id,
        entity_type: 'person',
        balance: Math.ceil(randomIntFromInterval(0, 10000000) / 100) * 100
      }
    })

    const listSize = (i * 100000) + ((j + 1) * list.length)

    console.log('insert account', listSize)

    await knex('account').insert(list)
  }
}

async function seedCompanyAccount(knex, i) {
  console.log(`=== seedCompanyAccount ${i} ===`)
  const bucketList = chunkArray(companyIdList.slice(i * 25000, (i * 25000) + 25000), 5000)

  for (let j = 0, m = bucketList.length; j < m; j++) {
    const list = bucketList[j].map(entity_id => {
      return {
        entity_id,
        entity_type: 'company',
        balance: Math.ceil(randomIntFromInterval(100000, 100000000) / 1000) * 1000
      }
    })

    const listSize = (i * 25000) + ((j + 1) * list.length)

    console.log('insert account', listSize)

    await knex('account').insert(list)
  }
}

async function seedMembership(knex, i, personIdList) {
  console.log(`=== seedMembership ${i} ===`)
  const cIdList = companyIdList.slice(i * 10000, (i * 10000) + 10000)
  const membershipTypeList = [`admin`, `employee`, `manager`]
  const pIdList = personIdList.splice(i * 100000, (i * 100000) + 100000)
  const max = Math.floor(pIdList.length / 10000)

  const finalMembershipList = []

  for (let k = 0, n = cIdList.length; k < n; k++) {
    const company_id = cIdList[k]

    const membershipList = pIdList.splice(0, randomIntFromInterval(2, max))
      .map(person_id => {
        const type = membershipTypeList[randomIntFromInterval(0, 2)]
        return {
          type,
          person_id,
          company_id
        }
      })

    finalMembershipList.push(...membershipList)

    if (pIdList.length === 0) {
      break
    }
  }

  const bucketList = chunkArray(finalMembershipList, 5000)
  for (let j = 0, m = bucketList.length; j < m; j++) {
    const list = bucketList[j]
    const listSize = (j * 5000) + (j + 1) * list.length

    console.log('insert membership', listSize)

    await knex('membership').insert(list)
  }
}

async function seedPersonLocation(knex, i) {
  console.log(`=== seedPersonLocation ${i} ===`)
  const locationTypeList = [`work`, `home`]

  const bucketList = chunkArray(personIdList.slice(i * 100000, (i * 100000) + 100000), 5000)

  for (let j = 0, m = bucketList.length; j < m; j++) {
    const list = bucketList[j]
    const entityLocationList = []
    const isDiffWork = randomIntFromInterval(0, 4) === 1
    let location_id = cityIdList[randomIntFromInterval(0, cityIdList.length - 1)]

    for (let k = 0, n = locationTypeList.length; k < n; k++) {
      const type = locationTypeList[k]

      if (type === 'home' && isDiffWork) {
        location_id = cityIdList[randomIntFromInterval(0, cityIdList.length - 1)]
      }

      list.forEach(entity_id => {
        entityLocationList.push({
          type,
          entity_id,
          entity_type: 'person',
          location_id
        })
      })
    }

    const listSize = (i * 200000) + (j + 1) * entityLocationList.length

    console.log('insert entity_location', listSize)

    await knex('entity_location').insert(entityLocationList)
  }
}

function generateIdList(size) {
  const list = []
  let i = 1
  while (i < size) {
    list.push(i++)
  }
  shuffleArray(list)
  return list
}

function generatePeopleList() {
  let i = 0
  const n = 1000000
  const people = []
  const emails = {}
  while (i < n) {
    let email
    while (true) {
      email = faker.internet.email()
      if (!emails[email]) {
        emails[email] = true
        break
      }
    }
    const person = {
      name: faker.name.findName(),
      email,
    }
    people.push(person)
    i++
  }
  return chunkArray(people, n / 10)
}

function generateCompanyList() {
  let i = 0
  const n = 100000
  const companyList = []
  while (i < n) {
    const company = {
      name: faker.company.companyName(),
    }
    companyList.push(company)
    i++
  }
  return chunkArray(companyList, n / 4)
}

function makeConnections() {
  let i = 1
  const connections = []
  while (i < 11) {
    const connection = makeConnection(`postgresql://localhost:5432/ddsjs_test_${i}_replica_1`)
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

function chunkArray(arr, len) {
  var chunks = [],
      i = 0,
      n = arr.length;

  while (i < n) {
    chunks.push(arr.slice(i, i += len));
  }

  return chunks;
}

function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

function weightedRandom(items, weights) {
  if (items.length !== weights.length) {
    throw new Error('Items and weights must be of the same size');
  }

  if (!items.length) {
    throw new Error('Items must not be empty');
  }

  const cumulativeWeights = [];
  for (let i = 0; i < weights.length; i += 1) {
    cumulativeWeights[i] = weights[i] + (cumulativeWeights[i - 1] || 0);
  }

  const maxCumulativeWeight = cumulativeWeights[cumulativeWeights.length - 1];
  const randomNumber = maxCumulativeWeight * Math.random();

  for (let itemIndex = 0; itemIndex < items.length; itemIndex += 1) {
    if (cumulativeWeights[itemIndex] >= randomNumber) {
      return items[itemIndex]
    }
  }
}

function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}
