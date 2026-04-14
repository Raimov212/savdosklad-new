package postgres

import (
	"database/sql"
	"fmt"
	"testing"

	"savdosklad/config"

	_ "github.com/lib/pq"
)

func TestClientRepo_Search(t *testing.T) {
	cfg, _ := config.Load()
	db, _ := sql.Open("postgres", cfg.DB.DSN())
	repo := NewClientRepo(db)

	bid := 22
	query := "Jasur"

	clients, err := repo.Search(bid, query)
	if err != nil {
		t.Fatalf("Search failed: %v", err)
	}

	fmt.Printf("Found %d clients for query '%s' in BizID %d:\n", len(clients), query, bid)
	for _, c := range clients {
		fmt.Printf("- %s (%s)\n", c.FullName, c.Phone)
	}

	// List all just to see
	rows, _ := db.Query(`SELECT id, "fullName", phone FROM clients WHERE "businessId" = $1`, bid)
	fmt.Println("All clients for biz 22:")
	for rows.Next() {
		var id int
		var name, ph string
		rows.Scan(&id, &name, &ph)
		fmt.Printf("- %d: %s (%s)\n", id, name, ph)
	}
}
