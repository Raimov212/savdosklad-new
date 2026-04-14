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

    rows, err := db.Query(`
        SELECT relname, conname, contype 
        FROM pg_constraint 
        JOIN pg_class ON pg_class.oid = pg_constraint.conrelid
        WHERE conname LIKE '%marketId%'
    `)
    if err != nil {
        log.Fatal(err)
    }
    defer rows.Close()

    fmt.Println("All constraints with 'marketId' in name:")
    for rows.Next() {
        var relname, conname, contype string
        if err := rows.Scan(&relname, &conname, &contype); err != nil {
            log.Fatal(err)
        }
        fmt.Printf("Table: %s, Constraint: %s, Type: %s\n", relname, conname, contype)
    }
}
