package postgres

import (
	"database/sql"
	"fmt"
	"strings"

	"savdosklad/internal/entity"
)

type CustomerRepo struct {
	db *sql.DB
}

func NewCustomerRepo(db *sql.DB) *CustomerRepo {
	return &CustomerRepo{db: db}
}

func (r *CustomerRepo) Create(customer *entity.Customer) error {
	query := `INSERT INTO customers ("firstName", "lastName", "phoneNumber", email, password, image)
		VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, "createdAt", "updatedAt"`
	return r.db.QueryRow(query,
		customer.FirstName, customer.LastName, customer.PhoneNumber,
		customer.Email, customer.Password, customer.Image,
	).Scan(&customer.ID, &customer.CreatedAt, &customer.UpdatedAt)
}

func (r *CustomerRepo) GetByID(id int) (*entity.Customer, error) {
	query := `SELECT id, "firstName", "lastName", "phoneNumber", email, password, image, "createdAt", "updatedAt"
		FROM customers WHERE id = $1`
	customer := &entity.Customer{}
	err := r.db.QueryRow(query, id).Scan(
		&customer.ID, &customer.FirstName, &customer.LastName,
		&customer.PhoneNumber, &customer.Email, &customer.Password,
		&customer.Image, &customer.CreatedAt, &customer.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return customer, nil
}

func (r *CustomerRepo) GetByPhone(phone string) (*entity.Customer, error) {
	query := `SELECT id, "firstName", "lastName", "phoneNumber", email, password, image, "createdAt", "updatedAt"
		FROM customers WHERE "phoneNumber" = $1`
	customer := &entity.Customer{}
	err := r.db.QueryRow(query, phone).Scan(
		&customer.ID, &customer.FirstName, &customer.LastName,
		&customer.PhoneNumber, &customer.Email, &customer.Password,
		&customer.Image, &customer.CreatedAt, &customer.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return customer, nil
}

func (r *CustomerRepo) Update(id int, req *entity.UpdateCustomerRequest) error {
	setClauses := []string{}
	args := []interface{}{}
	argIndex := 1

	if req.FirstName != nil {
		setClauses = append(setClauses, fmt.Sprintf(`"firstName" = $%d`, argIndex))
		args = append(args, *req.FirstName)
		argIndex++
	}
	if req.LastName != nil {
		setClauses = append(setClauses, fmt.Sprintf(`"lastName" = $%d`, argIndex))
		args = append(args, *req.LastName)
		argIndex++
	}
	if req.PhoneNumber != nil {
		setClauses = append(setClauses, fmt.Sprintf(`"phoneNumber" = $%d`, argIndex))
		args = append(args, *req.PhoneNumber)
		argIndex++
	}
	if req.Email != nil {
		setClauses = append(setClauses, fmt.Sprintf(`email = $%d`, argIndex))
		args = append(args, *req.Email)
		argIndex++
	}
	if req.Password != nil {
		setClauses = append(setClauses, fmt.Sprintf(`password = $%d`, argIndex))
		args = append(args, *req.Password)
		argIndex++
	}
	if req.Image != nil {
		setClauses = append(setClauses, fmt.Sprintf(`image = $%d`, argIndex))
		args = append(args, *req.Image)
		argIndex++
	}

	if len(setClauses) == 0 {
		return nil
	}

	setClauses = append(setClauses, `"updatedAt" = NOW()`)
	query := fmt.Sprintf(`UPDATE customers SET %s WHERE id = $%d`, strings.Join(setClauses, ", "), argIndex)
	args = append(args, id)

	_, err := r.db.Exec(query, args...)
	return err
}
