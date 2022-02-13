
system:
	@psql postgres -f make.sql
	# @DEBUG=knex:query node make
	@node make
.PHONY: system
