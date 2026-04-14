package postgres

import (
	"database/sql"
	"time"

	"savdosklad/internal/entity"
)

type MoneyRepo struct {
	db *sql.DB
}

func NewMoneyRepo(db *sql.DB) *MoneyRepo {
	return &MoneyRepo{db: db}
}

func (r *MoneyRepo) Create(m *entity.Money) (int, error) {
	var id int
	err := r.db.QueryRow(
		`INSERT INTO money (value, description, "amountType", "businessId", "createdAt", "updatedAt")
		VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
		m.Value, m.Description, m.AmountType, m.BusinessID, time.Now(), time.Now(),
	).Scan(&id)
	return id, err
}

func (r *MoneyRepo) GetByBusinessID(businessID int) ([]entity.Money, error) {
	rows, err := r.db.Query(
		`SELECT id, value, description, "amountType", "businessId", "createdAt", "updatedAt"
		FROM money WHERE "businessId" = $1 ORDER BY id DESC`, businessID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []entity.Money
	for rows.Next() {
		var m entity.Money
		if err := rows.Scan(&m.ID, &m.Value, &m.Description, &m.AmountType, &m.BusinessID, &m.CreatedAt, &m.UpdatedAt); err != nil {
			return nil, err
		}
		list = append(list, m)
	}
	return list, nil
}
