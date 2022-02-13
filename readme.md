
# Distributed Database Experiment in JavaScript

Can simulate distributed transactions by having 10 database shards running locally, 3 replicas, each with some data on them. Have a model that has lots of joins. Make a transaction on the distributed system with simulated latency. Make a query against the distributed system. Each has its own database which is independent of the others, to simulate sharding. There are 10,000 records in each database, for a total of 1 million or so records. You want to find a list of 100 records.

The models are:

- person
- company
- membership: A person can join many companies, and companies can have many people.
- location: 1000 popular US cities with state.
- account: A bank account the person or company has, they can have multiple accounts.
- account_change: A record of how much was added or removed from an account.
- entity_location: The join model between a person or company and a location.

So there are a 3 replicas, each with 10 databases. One database is considered the main database, which has some important information such as the centralized locations. There are 1 million people, scattered across the 10 databases. There are 100k companies, on 4 databases. There are a random number of employees between 2 and 2000 at companies, with roles employee or manager. Each employee has a home address and an optionally different work address, about 20% have a different work address. Each person and company has an account.

When a company pays a person, we deduct from their account and add to the person's account in a distributed transaction.
