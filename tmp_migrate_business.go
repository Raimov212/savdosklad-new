package main

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/lib/pq"
)

func main() {
	connStr := "postgres://postgres:postgres@localhost:5432/savdosklad?sslmode=disable"
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	_, err = db.Exec(`ALTER TABLE businesses ADD COLUMN IF NOT EXISTS image TEXT`)
	if err != nil {
		fmt.Printf("Error adding column: %v\n", err)
	} else {
		fmt.Println("Column 'image' successfully added (or already exists) to 'businesses' table.")
	}
}
