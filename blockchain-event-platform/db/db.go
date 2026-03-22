package db

import (
	"database/sql"
	"log"

	_ "github.com/lib/pq"
)

var WriteDB *sql.DB 
var ReadDB *sql.DB 

func Init() {
	var err error

	
	WriteDB, err = sql.Open("postgres", "postgres://myuser:mypassword@localhost:5432/blockchain?sslmode=disable")
	if err != nil {
		log.Fatal("Failed to connect primary DB:", err)
	}

	err = WriteDB.Ping()
	if err != nil {
		log.Fatal("Cannot ping primary DB:", err)
	}

	ReadDB, err = sql.Open("postgres", "postgres://myuser:mypassword@localhost:5432/blockchain_read?sslmode=disable")
	if err != nil {
		log.Fatal("Failed to connect replica DB:", err)
	}

	err = ReadDB.Ping()
	if err != nil {
		log.Fatal("Cannot ping replica DB:", err)
	}

	log.Println("Database connections initialized successfully")
}
