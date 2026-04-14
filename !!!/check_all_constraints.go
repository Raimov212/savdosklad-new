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

    var tableName, constraintName, constraintType string
    rows, err := db.Query(`
        SELECT table_name, constraint_name, constraint_type
        FROM information_schema.table_constraints
        WHERE table_name = 'businesses'
    `)
    if err != nil {
        log.Fatal(err)
    }
    defer rows.Close()

    fmt.Println("Constraints on businesses:")
    for rows.Next() {
        if err := rows.Scan(&tableName, &constraintName, &constraintType); err != nil {
            log.Fatal(err)
        }
        fmt.Printf("Constraint: %s, Type: %s\n", constraintName, constraintType)
    }
}
