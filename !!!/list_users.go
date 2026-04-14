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

    rows, err := db.Query(`SELECT id, "userName", role FROM users`)
    if err != nil {
        log.Fatal(err)
    }
    defer rows.Close()

    for rows.Next() {
        var id, role int
        var username string
        rows.Scan(&id, &username, &role)
        fmt.Printf("User: %d, %s, Role: %d\n", id, username, role)
    }
}
