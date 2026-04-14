package main

import (
	"context"
	"fmt"
	"log"
	"savdosklad/config"
	"savdosklad/pkg/database"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatal(err)
	}

	db, err := database.NewPostgresDB(cfg.DB)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	rows, err := db.Query(`SELECT id, "userName", "telegramUserId", "brandName", "brandImage" FROM users`)
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()

	fmt.Println("Users in DB:")
	for rows.Next() {
		var id int
		var username string
		var tgID int64
		var brandName, brandImage *string
		rows.Scan(&id, &username, &tgID, &brandName, &brandImage)
		
		bn := "nil"
		if brandName != nil { bn = *brandName }
		bi := "nil"
		if brandImage != nil { bi = *brandImage }
		
		fmt.Printf("ID: %d, User: %s, TG_ID: %d, Brand: %s, Image: %s\n", id, username, tgID, bn, bi)
	}
}
