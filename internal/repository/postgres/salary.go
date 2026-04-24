package postgres

import (
	"database/sql"
	"time"

	"savdosklad/internal/entity"
)

type SalaryRepo struct {
	db *sql.DB
}

func NewSalaryRepo(db *sql.DB) *SalaryRepo {
	return &SalaryRepo{db: db}
}

func (r *SalaryRepo) Create(s *entity.EmployeeSalary) (int, error) {
	var id int
	err := r.db.QueryRow(
		`INSERT INTO employee_salaries ("employeeId", "businessId", amount, month, year, description, "createdAt", "updatedAt")
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
		s.EmployeeID, s.BusinessID, s.Amount, s.Month, s.Year, s.Description,
		time.Now(), time.Now(),
	).Scan(&id)
	return id, err
}

func (r *SalaryRepo) GetByBusinessID(bid int) ([]entity.EmployeeSalary, error) {
	rows, err := r.db.Query(
		`SELECT s.id, s."employeeId", u."firstName" || ' ' || u."lastName", s."businessId", s.amount, s.month, s.year, s.description, s."createdAt", s."updatedAt"
		FROM employee_salaries s
		JOIN users u ON s."employeeId" = u.id
		WHERE s."businessId" = $1 ORDER BY s.year DESC, s.month DESC, s."createdAt" DESC`, bid,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []entity.EmployeeSalary
	for rows.Next() {
		var s entity.EmployeeSalary
		if err := rows.Scan(&s.ID, &s.EmployeeID, &s.EmployeeName, &s.BusinessID, &s.Amount, &s.Month, &s.Year, &s.Description, &s.CreatedAt, &s.UpdatedAt); err != nil {
			return nil, err
		}
		list = append(list, s)
	}
	return list, nil
}

func (r *SalaryRepo) GetByEmployeeID(empID int) ([]entity.EmployeeSalary, error) {
	rows, err := r.db.Query(
		`SELECT s.id, s."employeeId", u."firstName" || ' ' || u."lastName", s."businessId", s.amount, s.month, s.year, s.description, s."createdAt", s."updatedAt"
		FROM employee_salaries s
		JOIN users u ON s."employeeId" = u.id
		WHERE s."employeeId" = $1 ORDER BY s.year DESC, s.month DESC, s."createdAt" DESC`, empID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []entity.EmployeeSalary
	for rows.Next() {
		var s entity.EmployeeSalary
		if err := rows.Scan(&s.ID, &s.EmployeeID, &s.EmployeeName, &s.BusinessID, &s.Amount, &s.Month, &s.Year, &s.Description, &s.CreatedAt, &s.UpdatedAt); err != nil {
			return nil, err
		}
		list = append(list, s)
	}
	return list, nil
}

func (r *SalaryRepo) GetByPeriod(bid, month, year int) ([]entity.EmployeeSalary, error) {
	rows, err := r.db.Query(
		`SELECT s.id, s."employeeId", u."firstName" || ' ' || u."lastName", s."businessId", s.amount, s.month, s.year, s.description, s."createdAt", s."updatedAt"
		FROM employee_salaries s
		JOIN users u ON s."employeeId" = u.id
		WHERE s."businessId" = $1 AND s.month = $2 AND s.year = $3`, bid, month, year,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []entity.EmployeeSalary
	for rows.Next() {
		var s entity.EmployeeSalary
		if err := rows.Scan(&s.ID, &s.EmployeeID, &s.EmployeeName, &s.BusinessID, &s.Amount, &s.Month, &s.Year, &s.Description, &s.CreatedAt, &s.UpdatedAt); err != nil {
			return nil, err
		}
		list = append(list, s)
	}
	return list, nil
}

func (r *SalaryRepo) GetTotalByPeriod(bid, month, year int) (float64, error) {
	var total float64
	err := r.db.QueryRow(
		`SELECT COALESCE(SUM(amount), 0) FROM employee_salaries WHERE "businessId" = $1 AND month = $2 AND year = $3`,
		bid, month, year,
	).Scan(&total)
	return total, err
}

func (r *SalaryRepo) Delete(id int) error {
	_, err := r.db.Exec(`DELETE FROM employee_salaries WHERE id = $1`, id)
	return err
}
