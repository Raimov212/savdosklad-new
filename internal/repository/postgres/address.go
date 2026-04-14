package postgres

import (
	"database/sql"
	"fmt"
	"strings"

	"savdosklad/internal/entity"
)

type AddressRepo struct {
	db *sql.DB
}

func NewAddressRepo(db *sql.DB) *AddressRepo {
	return &AddressRepo{db: db}
}

func (r *AddressRepo) Create(address *entity.Address) error {
	// If this is set as default, unset other defaults first
	if address.IsDefault {
		_, _ = r.db.Exec(`UPDATE customer_addresses SET "isDefault" = FALSE WHERE "customerId" = $1`, address.CustomerID)
	}

	query := `INSERT INTO customer_addresses ("customerId", title, address, city, district, "isDefault")
		VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, "createdAt", "updatedAt"`
	return r.db.QueryRow(query,
		address.CustomerID, address.Title, address.Address,
		address.City, address.District, address.IsDefault,
	).Scan(&address.ID, &address.CreatedAt, &address.UpdatedAt)
}

func (r *AddressRepo) GetByCustomerID(customerID int) ([]entity.Address, error) {
	query := `SELECT id, "customerId", title, address, city, district, "isDefault", "createdAt", "updatedAt"
		FROM customer_addresses WHERE "customerId" = $1 ORDER BY "isDefault" DESC, id DESC`
	rows, err := r.db.Query(query, customerID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var addresses []entity.Address
	for rows.Next() {
		var a entity.Address
		if err := rows.Scan(&a.ID, &a.CustomerID, &a.Title, &a.Address, &a.City, &a.District,
			&a.IsDefault, &a.CreatedAt, &a.UpdatedAt); err != nil {
			return nil, err
		}
		addresses = append(addresses, a)
	}
	return addresses, nil
}

func (r *AddressRepo) GetByID(id, customerID int) (*entity.Address, error) {
	query := `SELECT id, "customerId", title, address, city, district, "isDefault", "createdAt", "updatedAt"
		FROM customer_addresses WHERE id = $1 AND "customerId" = $2`
	a := &entity.Address{}
	err := r.db.QueryRow(query, id, customerID).Scan(
		&a.ID, &a.CustomerID, &a.Title, &a.Address, &a.City, &a.District,
		&a.IsDefault, &a.CreatedAt, &a.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return a, nil
}

func (r *AddressRepo) Update(id, customerID int, req *entity.UpdateAddressRequest) error {
	setClauses := []string{}
	args := []interface{}{}
	argIndex := 1

	if req.Title != nil {
		setClauses = append(setClauses, fmt.Sprintf(`title = $%d`, argIndex))
		args = append(args, *req.Title)
		argIndex++
	}
	if req.Address != nil {
		setClauses = append(setClauses, fmt.Sprintf(`address = $%d`, argIndex))
		args = append(args, *req.Address)
		argIndex++
	}
	if req.City != nil {
		setClauses = append(setClauses, fmt.Sprintf(`city = $%d`, argIndex))
		args = append(args, *req.City)
		argIndex++
	}
	if req.District != nil {
		setClauses = append(setClauses, fmt.Sprintf(`district = $%d`, argIndex))
		args = append(args, *req.District)
		argIndex++
	}
	if req.IsDefault != nil {
		if *req.IsDefault {
			_, _ = r.db.Exec(`UPDATE customer_addresses SET "isDefault" = FALSE WHERE "customerId" = $1`, customerID)
		}
		setClauses = append(setClauses, fmt.Sprintf(`"isDefault" = $%d`, argIndex))
		args = append(args, *req.IsDefault)
		argIndex++
	}

	if len(setClauses) == 0 {
		return nil
	}

	setClauses = append(setClauses, `"updatedAt" = NOW()`)
	query := fmt.Sprintf(`UPDATE customer_addresses SET %s WHERE id = $%d AND "customerId" = $%d`,
		strings.Join(setClauses, ", "), argIndex, argIndex+1)
	args = append(args, id, customerID)

	_, err := r.db.Exec(query, args...)
	return err
}

func (r *AddressRepo) Delete(id, customerID int) error {
	_, err := r.db.Exec(`DELETE FROM customer_addresses WHERE id = $1 AND "customerId" = $2`, id, customerID)
	return err
}
