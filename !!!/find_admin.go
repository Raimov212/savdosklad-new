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

    var username, password string
    err = db.QueryRow(`SELECT "userName", password FROM users WHERE role = 2 LIMIT 1`).Scan(&username, &password)
    if err != nil {
        log.Fatal(err)
    }
    fmt.Printf("Admin candidate: %s\n", username)
}
