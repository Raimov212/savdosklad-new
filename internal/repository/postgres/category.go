package postgres

import (
	"database/sql"
	"fmt"
	"time"

	"savdosklad/internal/entity"
)

type CategoryRepo struct {
	db *sql.DB
}

func NewCategoryRepo(db *sql.DB) *CategoryRepo {
	return &CategoryRepo{db: db}
}

func (r *CategoryRepo) Create(c *entity.Category) (int, error) {
	var id int
	err := r.db.QueryRow(
		`INSERT INTO categories ("businessId", name, image, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5) RETURNING id`,
		c.BusinessID, c.Name, c.Image, time.Now(), time.Now(),
	).Scan(&id)
	return id, err
}

func (r *CategoryRepo) GetByID(id int) (*entity.Category, error) {
	var c entity.Category
	err := r.db.QueryRow(
		`SELECT id, "businessId", name, image, "createdAt", "updatedAt" FROM categories WHERE id = $1`, id,
	).Scan(&c.ID, &c.BusinessID, &c.Name, &c.Image, &c.CreatedAt, &c.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &c, nil
}

func (r *CategoryRepo) GetByBusinessID(businessID int) ([]entity.Category, error) {
	rows, err := r.db.Query(
		`SELECT id, "businessId", name, image, "createdAt", "updatedAt" FROM categories WHERE "businessId" = $1 ORDER BY id`, businessID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []entity.Category
	for rows.Next() {
		var c entity.Category
		if err := rows.Scan(&c.ID, &c.BusinessID, &c.Name, &c.Image, &c.CreatedAt, &c.UpdatedAt); err != nil {
			return nil, err
		}
		list = append(list, c)
	}
	return list, nil
}

func (r *CategoryRepo) Update(id int, req entity.UpdateCategoryRequest) error {
	query := `UPDATE categories SET "updatedAt" = $1`
	args := []interface{}{time.Now()}
	argIdx := 2

	if req.Name != nil {
		query += fmt.Sprintf(`, name = $%d`, argIdx)
		args = append(args, *req.Name)
		argIdx++
	}
	if req.Image != nil {
		query += fmt.Sprintf(`, image = $%d`, argIdx)
		args = append(args, *req.Image)
		argIdx++
	}

	query += fmt.Sprintf(` WHERE id = $%d`, argIdx)
	args = append(args, id)

	_, err := r.db.Exec(query, args...)
	return err
}

func (r *CategoryRepo) Delete(id int) error {
	_, err := r.db.Exec(`DELETE FROM categories WHERE id = $1`, id)
	return err
}
