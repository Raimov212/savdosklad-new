package main

import (
	"database/sql"
	"fmt"
	"log"
	_ "github.com/lib/pq"
	"savdosklad/config"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatal(err)
	}

	connStr := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable",
		cfg.DB.Host, cfg.DB.Port, cfg.DB.User, cfg.DB.Password, cfg.DB.DBName)
	
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	rows, err := db.Query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'")
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()

	fmt.Println("Columns in 'users' table:")
	for rows.Next() {
		var col string
		if err := rows.Scan(&col); err != nil {
			log.Fatal(err)
		}
		fmt.Println("-", col)
	}
}
