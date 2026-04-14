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
		log.Fatalf("db open error: %v", err)
	}
	defer db.Close()

	var clientID sql.NullInt64
	err = db.QueryRow(`SELECT "clientId" FROM total_transactions WHERE id = $1`, 3489).Scan(&clientID)
	if err != nil {
		log.Fatalf("query total_transactions error: %v", err)
	}

	if !clientID.Valid {
		fmt.Println("Transaction 3489 has no client")
		return
	}

	var tgID sql.NullInt64
	err = db.QueryRow(`SELECT "telegramUserId" FROM clients WHERE id = $1`, clientID.Int64).Scan(&tgID)
	if err != nil {
		log.Fatalf("query clients error: %v", err)
	}

	if !tgID.Valid || tgID.Int64 == 0 {
		fmt.Printf("Client %d has no telegram linked\n", clientID.Int64)
	} else {
		fmt.Printf("Client %d has Telegram ID: %d\n", clientID.Int64, tgID.Int64)
	}
}
