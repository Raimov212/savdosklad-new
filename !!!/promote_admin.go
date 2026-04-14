package main

import (
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

    _, err = db.Exec(`UPDATE users SET role = 2 WHERE id = 10`)
    if err != nil {
        log.Fatal(err)
    }
}
