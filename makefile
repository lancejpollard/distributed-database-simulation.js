
database:
	@psql postgres -f make.sql
	@node make
.PHONY: database

service:
	@npm run start
.PHONY: service
