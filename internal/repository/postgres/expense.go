package postgres

import (
	"database/sql"
	"savdosklad/internal/entity"
	"time"
)

type ExpenseRepo struct {
	db *sql.DB
}

func NewExpenseRepo(db *sql.DB) *ExpenseRepo {
	return &ExpenseRepo{db: db}
}

func (r *ExpenseRepo) CreateTotalExpense(te *entity.TotalExpense) (int, error) {
	var id int
	err := r.db.QueryRow(
		`INSERT INTO total_expenses ("total", "cash", "card", "description", "businessId", "createdBy", "createdAt")
		VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
		te.Total, te.Cash, te.Card, te.Description, te.BusinessID, te.CreatedBy, time.Now(),
	).Scan(&id)
	return id, err
}

func (r *ExpenseRepo) CreateExpense(e *entity.Expense) (int, error) {
	var id int
	err := r.db.QueryRow(
		`INSERT INTO expenses (name, description, value, "businessId", "totalExpenseId", "expenseDate", "createdAt", "updatedAt")
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
		e.Name, e.Description, e.Value, e.BusinessID, e.TotalExpenseID, e.ExpenseDate, time.Now(), time.Now(),
	).Scan(&id)
	return id, err
}

func (r *ExpenseRepo) GetTotalExpensesByBusinessID(bid int) ([]entity.TotalExpense, error) {
	rows, err := r.db.Query(
		`SELECT t.id, t."total", t."cash", t."card", t."description", t."businessId", t."createdBy", t."createdAt",
		        COALESCE(u."firstName" || ' ' || u."lastName", '')
		 FROM total_expenses t
		 LEFT JOIN users u ON t."createdBy" = u.id
		 WHERE t."businessId" = $1 ORDER BY t.id DESC`, bid,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	list := []entity.TotalExpense{}
	for rows.Next() {
		var te entity.TotalExpense
		if err := r.scanTotalExpense(rows, &te); err != nil {
			return nil, err
		}
		list = append(list, te)
	}
	return list, nil
}

func (r *ExpenseRepo) GetExpensesByTotalID(totalID int) ([]entity.Expense, error) {
	rows, err := r.db.Query(
		`SELECT id, name, description, value, "businessId", "totalExpenseId", "expenseDate", "createdAt", "updatedAt"
		FROM expenses WHERE "totalExpenseId" = $1 ORDER BY id`, totalID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	list := []entity.Expense{}
	for rows.Next() {
		var e entity.Expense
		if err := rows.Scan(&e.ID, &e.Name, &e.Description, &e.Value, &e.BusinessID, &e.TotalExpenseID, &e.ExpenseDate, &e.CreatedAt, &e.UpdatedAt); err != nil {
			return nil, err
		}
		list = append(list, e)
	}
	return list, nil
}

func (r *ExpenseRepo) GetTotalExpensesByPeriod(bid int, start, end time.Time) ([]entity.TotalExpense, error) {
	rows, err := r.db.Query(
		`SELECT t.id, t."total", t."cash", t."card", t."description", t."businessId", t."createdBy", t."createdAt",
		        COALESCE(u."firstName" || ' ' || u."lastName", '')
		 FROM total_expenses t
		 LEFT JOIN users u ON t."createdBy" = u.id
		 WHERE t."businessId" = $1 AND t."createdAt" >= $2 AND t."createdAt" <= $3 ORDER BY t.id DESC`,
		bid, start, end,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	results := []entity.TotalExpense{}
	for rows.Next() {
		var t entity.TotalExpense
		if err := r.scanTotalExpense(rows, &t); err != nil {
			return nil, err
		}
		results = append(results, t)
	}
	return results, nil
}

func (r *ExpenseRepo) scanTotalExpense(rows *sql.Rows, t *entity.TotalExpense) error {
	return rows.Scan(&t.ID, &t.Total, &t.Cash, &t.Card, &t.Description, &t.BusinessID, &t.CreatedBy, &t.CreatedAt, &t.CreatedByName)
}

func (r *ExpenseRepo) CreateFixedCost(fc *entity.FixedCost) (int, error) {
	var id int
	err := r.db.QueryRow(
		`INSERT INTO fixed_costs (name, description, amount, type, "businessId", "createdAt", "updatedAt")
		VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
		fc.Name, fc.Description, fc.Amount, fc.Type, fc.BusinessID, time.Now(), time.Now(),
	).Scan(&id)
	return id, err
}

func (r *ExpenseRepo) GetFixedCostsByBusinessID(bid int) ([]entity.FixedCost, error) {
	rows, err := r.db.Query(
		`SELECT id, name, description, amount, type, "businessId", "createdAt", "updatedAt"
		FROM fixed_costs WHERE "businessId" = $1 ORDER BY id DESC`, bid,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	list := []entity.FixedCost{}
	for rows.Next() {
		var fc entity.FixedCost
		if err := rows.Scan(&fc.ID, &fc.Name, &fc.Description, &fc.Amount, &fc.Type, &fc.BusinessID, &fc.CreatedAt, &fc.UpdatedAt); err != nil {
			return nil, err
		}
		list = append(list, fc)
	}
	return list, nil
}

func (r *ExpenseRepo) UpdateFixedCost(id int, req entity.UpdateFixedCostRequest) error {
	_, err := r.db.Exec(`UPDATE fixed_costs SET amount = $1, "updatedAt" = $2 WHERE id = $3`, req.Amount, time.Now(), id)
	return err
}

func (r *ExpenseRepo) CreateFixedFactedCost(ffc *entity.FixedFactedCost) (int, error) {
	var id int
	err := r.db.QueryRow(
		`INSERT INTO fixed_facted_costs ("amount", "date", "businessId", "fixedCostId", "createdAt", "updatedAt")
		VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
		ffc.Amount, ffc.Date, ffc.BusinessID, ffc.FixedCostID, time.Now(), time.Now(),
	).Scan(&id)
	return id, err
}

func (r *ExpenseRepo) GetFixedFactedCostsByBusinessID(bid int) ([]entity.FixedFactedCost, error) {
	rows, err := r.db.Query(
		`SELECT id, "amount", "date", "businessId", "fixedCostId", "createdAt", "updatedAt"
		FROM fixed_facted_costs WHERE "businessId" = $1 ORDER BY id DESC`, bid,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	list := []entity.FixedFactedCost{}
	for rows.Next() {
		var ffc entity.FixedFactedCost
		if err := rows.Scan(&ffc.ID, &ffc.Amount, &ffc.Date, &ffc.BusinessID, &ffc.FixedCostID, &ffc.CreatedAt, &ffc.UpdatedAt); err != nil {
			return nil, err
		}
		list = append(list, ffc)
	}
	return list, nil
}
