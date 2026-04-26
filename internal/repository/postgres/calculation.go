package postgres

import (
	"database/sql"
	"time"

	"savdosklad/internal/entity"
)

type CalculationRepo struct {
	db *sql.DB
}

func NewCalculationRepo(db *sql.DB) *CalculationRepo {
	return &CalculationRepo{db: db}
}

func (r *CalculationRepo) Create(c *entity.Calculation) (int, error) {
	var id int
	err := r.db.QueryRow(
		`INSERT INTO calculations ("businessId", "totalIncome", "incomeTax", "totalExpense", "totalFixedCosts", salary, "salaryTax", profit, month, year, "totalSale", "addedMoney", "createdAt", "updatedAt")
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING id`,
		c.BusinessID, c.TotalIncome, c.IncomeTax, c.TotalExpense, c.TotalFixedCosts,
		c.Salary, c.SalaryTax, c.Profit, c.Month, c.Year, c.TotalSale, c.AddedMoney,
		time.Now(), time.Now(),
	).Scan(&id)
	return id, err
}

func (r *CalculationRepo) GetByBusinessID(businessID int) ([]entity.Calculation, error) {
	rows, err := r.db.Query(
		`SELECT id, "businessId", "totalIncome", "incomeTax", "totalExpense", "totalFixedCosts", salary, "salaryTax", profit, month, year, "totalSale", "addedMoney", "createdAt", "updatedAt"
		FROM calculations WHERE "businessId" = $1 ORDER BY year DESC, month DESC`, businessID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	list := []entity.Calculation{}
	for rows.Next() {
		var c entity.Calculation
		if err := rows.Scan(&c.ID, &c.BusinessID, &c.TotalIncome, &c.IncomeTax, &c.TotalExpense, &c.TotalFixedCosts,
			&c.Salary, &c.SalaryTax, &c.Profit, &c.Month, &c.Year, &c.TotalSale, &c.AddedMoney,
			&c.CreatedAt, &c.UpdatedAt); err != nil {
			return nil, err
		}
		list = append(list, c)
	}
	return list, nil
}

func (r *CalculationRepo) GetByBusinessIDAndPeriod(businessID, month, year int) (*entity.Calculation, error) {
	var c entity.Calculation
	err := r.db.QueryRow(
		`SELECT id, "businessId", "totalIncome", "incomeTax", "totalExpense", "totalFixedCosts", salary, "salaryTax", profit, month, year, "totalSale", "addedMoney", "createdAt", "updatedAt"
		FROM calculations WHERE "businessId" = $1 AND month = $2 AND year = $3`,
		businessID, month, year,
	).Scan(&c.ID, &c.BusinessID, &c.TotalIncome, &c.IncomeTax, &c.TotalExpense, &c.TotalFixedCosts, &c.Salary, &c.SalaryTax, &c.Profit, &c.Month, &c.Year, &c.TotalSale, &c.AddedMoney, &c.CreatedAt, &c.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &c, err
}

func (r *CalculationRepo) GetStats(bid, month, year int) (*entity.CalculationStats, error) {
	var stats entity.CalculationStats

	// 1. Total Sale
	err := r.db.QueryRow(
		`SELECT COALESCE(SUM(total - discount), 0) FROM total_transactions 
		 WHERE "businessId" = $1 AND EXTRACT(MONTH FROM "createdAt") = $2 AND EXTRACT(YEAR FROM "createdAt") = $3`,
		bid, month, year,
	).Scan(&stats.TotalSale)
	if err != nil {
		return nil, err
	}

	// 2. Total Income (Gross Profit)
	err = r.db.QueryRow(
		`SELECT 
		    COALESCE(
		        (SELECT SUM((t."productPrice" - p."buyPrice") * t."productQuantity")
		         FROM transactions t
		         JOIN products p ON t."productId" = p.id
		         WHERE t."businessId" = $1 AND EXTRACT(MONTH FROM t."createdAt") = $2 AND EXTRACT(YEAR FROM t."createdAt") = $3)
		        - 
		        (SELECT SUM(discount) FROM total_transactions
		         WHERE "businessId" = $1 AND EXTRACT(MONTH FROM "createdAt") = $2 AND EXTRACT(YEAR FROM "createdAt") = $3),
		    0)`,
		bid, month, year,
	).Scan(&stats.TotalIncome)
	if err != nil {
		return nil, err
	}

	// 3. Total Expense (Daily)
	err = r.db.QueryRow(
		`SELECT COALESCE(SUM(total), 0) FROM total_expenses
		 WHERE "businessId" = $1 AND EXTRACT(MONTH FROM "createdAt") = $2 AND EXTRACT(YEAR FROM "createdAt") = $3`,
		bid, month, year,
	).Scan(&stats.TotalExpense)
	if err != nil {
		return nil, err
	}

	// 4. Total Fixed Costs
	err = r.db.QueryRow(
		`SELECT COALESCE(SUM(amount), 0) FROM fixed_costs
		 WHERE "businessId" = $1`,
		bid,
	).Scan(&stats.TotalFixedCosts)
	if err != nil {
		return nil, err
	}

	// 5. Total Salary
	err = r.db.QueryRow(
		`SELECT COALESCE(SUM(amount), 0) FROM employee_salaries
		 WHERE "businessId" = $1 AND month = $2 AND year = $3`,
		bid, month, year,
	).Scan(&stats.TotalSalary)
	if err != nil {
		return nil, err
	}

	return &stats, nil
}

func (r *CalculationRepo) GetIncomeBreakdown(bid, month, year int) ([]entity.IncomeBreakdownItem, error) {
	query := `SELECT 
			p.name, 
			SUM(t."productQuantity") as qty, 
			AVG(t."productPrice") as avg_price, 
			COALESCE(p."buyPrice", 0) as buy_price,
			SUM((t."productPrice" - COALESCE(p."buyPrice", 0)) * t."productQuantity") as total_profit
		 FROM transactions t
		 JOIN products p ON t."productId" = p.id
		 WHERE t."businessId" = $1 
		   AND EXTRACT(MONTH FROM t."createdAt") = $2 
		   AND EXTRACT(YEAR FROM t."createdAt") = $3
		 GROUP BY p.id, p.name, p."buyPrice"
		 ORDER BY total_profit DESC`

	rows, err := r.db.Query(query, bid, month, year)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []entity.IncomeBreakdownItem
	for rows.Next() {
		var item entity.IncomeBreakdownItem
		if err := rows.Scan(&item.ProductName, &item.Quantity, &item.AvgPrice, &item.BuyPrice, &item.TotalProfit); err != nil {
			return nil, err
		}
		list = append(list, item)
	}
	return list, nil
}
func (r *CalculationRepo) GetExpenseBreakdown(bid, month, year int) ([]entity.TotalExpense, error) {
	query := `SELECT id, "total", "cash", "card", "description", "businessId", "createdBy", "createdAt", "updatedAt"
		 FROM total_expenses 
		 WHERE "businessId" = $1 
		   AND EXTRACT(MONTH FROM "createdAt") = $2 
		   AND EXTRACT(YEAR FROM "createdAt") = $3
		 ORDER BY "createdAt" DESC`

	rows, err := r.db.Query(query, bid, month, year)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []entity.TotalExpense
	for rows.Next() {
		var te entity.TotalExpense
		if err := rows.Scan(&te.ID, &te.Total, &te.Cash, &te.Card, &te.Description, &te.BusinessID, &te.CreatedBy, &te.CreatedAt, &te.UpdatedAt); err != nil {
			return nil, err
		}
		list = append(list, te)
	}
	return list, nil
}

func (r *CalculationRepo) GetFixedBreakdown(bid int) ([]entity.FixedCost, error) {
	query := `SELECT id, name, description, amount, type, "businessId", "createdAt", "updatedAt"
		 FROM fixed_costs 
		 WHERE "businessId" = $1 
		 ORDER BY amount DESC`

	rows, err := r.db.Query(query, bid)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []entity.FixedCost
	for rows.Next() {
		var fc entity.FixedCost
		if err := rows.Scan(&fc.ID, &fc.Name, &fc.Description, &fc.Amount, &fc.Type, &fc.BusinessID, &fc.CreatedAt, &fc.UpdatedAt); err != nil {
			return nil, err
		}
		list = append(list, fc)
	}
	return list, nil
}
