
# Distributed Database Experiment in JavaScript

Can simulate distributed transactions by having 100 node apps running locally, each with some data on them. Have a model that has lots of joins. Make a transaction on the distributed system with simulated latency. Make a query against the distributed system. Each has its own database which is independent of the others, to simulate sharding. There are 10,000 records in each database, for a total of 1 million or so records. You want to find a list of 100 records.
