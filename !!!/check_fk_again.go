package main

import (
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

    var name string
    err = db.QueryRow(`
        SELECT conname 
        FROM pg_constraint 
        WHERE conname = 'businesses_marketId_key'
    `).Scan(&name)
    if err != nil {
        fmt.Println("businesses_marketId_key NOT found")
    } else {
        fmt.Printf("businesses_marketId_key FOUND: %s\n", name)
    }
}
