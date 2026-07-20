db-create:
	docker run -d \
		--name senior-fit-db \
		-e POSTGRES_USER=postgres \
		-e POSTGRES_PASSWORD=password \
		-e POSTGRES_DB=senior-fit \
		-p 5432:5432 \
		postgres:16

db-stop:
	docker stop senior-fit-db

db-start:
	docker start senior-fit-db

db-rm:
	docker rm -f senior-fit-db
