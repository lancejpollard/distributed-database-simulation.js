
system:
	@psql postgres -f make.sql
	@node make
.PHONY: system
