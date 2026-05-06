package postgres

import (
	"database/sql"
	"fmt"
	"savdosklad/internal/entity"
	"time"
)

type CashbackTierRepo struct {
	db *sql.DB
}

func NewCashbackTierRepo(db *sql.DB) *CashbackTierRepo {
	return &CashbackTierRepo{db: db}
}

func (r *CashbackTierRepo) Create(tier *entity.CashbackTier) (int, error) {
	var id int
	err := r.db.QueryRow(
		`INSERT INTO cashback_tiers ("businessId", name, "minSpend", percentage, "createdAt", "updatedAt")
		VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
		tier.BusinessID, tier.Name, tier.MinSpend, tier.Percentage, time.Now(), time.Now(),
	).Scan(&id)
	return id, err
}

func (r *CashbackTierRepo) GetByID(id int) (*entity.CashbackTier, error) {
	var tier entity.CashbackTier
	err := r.db.QueryRow(
		`SELECT id, "businessId", name, "minSpend", percentage, "createdAt", "updatedAt"
		FROM cashback_tiers WHERE id = $1`, id,
	).Scan(&tier.ID, &tier.BusinessID, &tier.Name, &tier.MinSpend, &tier.Percentage, &tier.CreatedAt, &tier.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &tier, nil
}

func (r *CashbackTierRepo) GetByBusinessID(businessID int) ([]entity.CashbackTier, error) {
	rows, err := r.db.Query(
		`SELECT id, "businessId", name, "minSpend", percentage, "createdAt", "updatedAt"
		FROM cashback_tiers WHERE "businessId" = $1 ORDER BY "minSpend" ASC`, businessID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []entity.CashbackTier
	for rows.Next() {
		var tier entity.CashbackTier
		if err := rows.Scan(&tier.ID, &tier.BusinessID, &tier.Name, &tier.MinSpend, &tier.Percentage, &tier.CreatedAt, &tier.UpdatedAt); err != nil {
			return nil, err
		}
		list = append(list, tier)
	}
	return list, nil
}

func (r *CashbackTierRepo) Update(id int, req entity.UpdateCashbackTierRequest) error {
	query := `UPDATE cashback_tiers SET "updatedAt" = $1`
	args := []interface{}{time.Now()}
	argIdx := 2

	if req.Name != nil {
		query += fmt.Sprintf(`, name = $%d`, argIdx)
		args = append(args, *req.Name)
		argIdx++
	}
	if req.MinSpend != nil {
		query += fmt.Sprintf(`, "minSpend" = $%d`, argIdx)
		args = append(args, *req.MinSpend)
		argIdx++
	}
	if req.Percentage != nil {
		query += fmt.Sprintf(`, percentage = $%d`, argIdx)
		args = append(args, *req.Percentage)
		argIdx++
	}

	query += fmt.Sprintf(` WHERE id = $%d`, argIdx)
	args = append(args, id)

	_, err := r.db.Exec(query, args...)
	return err
}

func (r *CashbackTierRepo) Delete(id int) error {
	_, err := r.db.Exec(`DELETE FROM cashback_tiers WHERE id = $1`, id)
	return err
}
