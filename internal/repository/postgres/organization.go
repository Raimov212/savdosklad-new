package postgres

import (
	"database/sql"
	"time"

	"savdosklad/internal/entity"
)

type OrganizationRepo struct {
	db *sql.DB
}

func NewOrganizationRepo(db *sql.DB) *OrganizationRepo {
	return &OrganizationRepo{db: db}
}

func (r *OrganizationRepo) Create(org *entity.Organization) (int, error) {
	var id int
	err := r.db.QueryRow(
		`INSERT INTO organizations ("userId", "orgName", "inn", "bankName", "mfo", "bankAccount", "logo", "description", "createdAt", "updatedAt")
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
		org.UserID, org.OrgName, org.Inn, org.BankName, org.Mfo, org.BankAccount, org.Logo, org.Description, time.Now(), time.Now(),
	).Scan(&id)
	return id, err
}

func (r *OrganizationRepo) GetByID(id int) (*entity.Organization, error) {
	var org entity.Organization
	err := r.db.QueryRow(
		`SELECT id, "userId", "orgName", "inn", "bankName", "mfo", "bankAccount", "logo", "description", "createdAt", "updatedAt"
		FROM organizations WHERE id = $1`, id,
	).Scan(&org.ID, &org.UserID, &org.OrgName, &org.Inn, &org.BankName, &org.Mfo, &org.BankAccount, &org.Logo, &org.Description, &org.CreatedAt, &org.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &org, nil
}

func (r *OrganizationRepo) GetByUserID(userID int) ([]entity.Organization, error) {
	rows, err := r.db.Query(
		`SELECT id, "userId", "orgName", "inn", "bankName", "mfo", "bankAccount", "logo", "description", "createdAt", "updatedAt"
		FROM organizations WHERE "userId" = $1 ORDER BY id`, userID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []entity.Organization
	for rows.Next() {
		var org entity.Organization
		if err := rows.Scan(&org.ID, &org.UserID, &org.OrgName, &org.Inn, &org.BankName, &org.Mfo, &org.BankAccount, &org.Logo, &org.Description, &org.CreatedAt, &org.UpdatedAt); err != nil {
			return nil, err
		}
		list = append(list, org)
	}
	return list, nil
}

func (r *OrganizationRepo) Update(id int, org *entity.Organization) error {
	_, err := r.db.Exec(
		`UPDATE organizations SET "orgName"=$1, "inn"=$2, "bankName"=$3, "mfo"=$4, "bankAccount"=$5, "logo"=$6, "description"=$7, "updatedAt"=$8
		WHERE id = $9`,
		org.OrgName, org.Inn, org.BankName, org.Mfo, org.BankAccount, org.Logo, org.Description, time.Now(), id,
	)
	return err
}

func (r *OrganizationRepo) Delete(id int) error {
	_, err := r.db.Exec(`DELETE FROM organizations WHERE id = $1`, id)
	return err
}
