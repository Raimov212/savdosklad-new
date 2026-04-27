package postgres

import (
	"database/sql"
	"fmt"
	"savdosklad/internal/entity"
	"time"
)

type TransactionRepo struct {
	db *sql.DB
}

func NewTransactionRepo(db *sql.DB) *TransactionRepo {
	return &TransactionRepo{db: db}
}

func (r *TransactionRepo) CreateTotalTransaction(tt *entity.TotalTransaction) (int, error) {
	var id int
	err := r.db.QueryRow(
		`INSERT INTO total_transactions ("total", "cash", "card", "click", "debt", "discount", "clientNumber", "description", "debtLimitDate", "businessId", "clientId", "createdBy", "createdAt", "updatedAt")
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING id`,
		tt.Total, tt.Cash, tt.Card, tt.Click, tt.Debt, tt.Discount, tt.ClientNumber, tt.Description, tt.DebtLimitDate, tt.BusinessID, tt.ClientID, tt.CreatedBy, time.Now(), time.Now(),
	).Scan(&id)
	return id, err
}

func (r *TransactionRepo) CreateTransaction(t *entity.Transaction) (int, error) {
	tx, err := r.db.Begin()
	if err != nil {
		return 0, err
	}
	defer tx.Rollback()

	var id int
	err = tx.QueryRow(
		`INSERT INTO transactions (description, "productPrice", "productQuantity", "productId", "businessId", "totalTransactionId", "createdAt", "updatedAt")
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
		t.Description, t.ProductPrice, t.ProductQuantity, t.ProductID, t.BusinessID, t.TotalTransactionID, time.Now(), time.Now(),
	).Scan(&id)
	if err != nil {
		return 0, err
	}

	_, err = tx.Exec(`UPDATE products SET quantity = quantity - $1 WHERE id = $2`, t.ProductQuantity, t.ProductID)
	if err != nil {
		return 0, err
	}

	return id, tx.Commit()
}

func (r *TransactionRepo) GetTotalTransactionByID(id int) (*entity.TotalTransaction, error) {
	var tt entity.TotalTransaction
	err := r.db.QueryRow(
		`SELECT t.id, t."total", t."cash", t."card", t."click", t."debt", t."discount", t."clientNumber", t."description", t."debtLimitDate", t."businessId", t."clientId", t."createdBy", t."createdAt", t."updatedAt",
		        COALESCE(c."fullName", ''), COALESCE(u."firstName" || ' ' || u."lastName", '')
		 FROM total_transactions t
		 LEFT JOIN clients c ON t."clientId" = c.id
		 LEFT JOIN users u ON t."createdBy" = u.id
		 WHERE t.id = $1`, id,
	).Scan(&tt.ID, &tt.Total, &tt.Cash, &tt.Card, &tt.Click, &tt.Debt, &tt.Discount, &tt.ClientNumber, &tt.Description, &tt.DebtLimitDate, &tt.BusinessID, &tt.ClientID, &tt.CreatedBy, &tt.CreatedAt, &tt.UpdatedAt, &tt.ClientName, &tt.CreatedByName)
	if err != nil {
		return nil, err
	}
	return &tt, nil
}

func (r *TransactionRepo) GetTotalTransactionsByBusinessID(bid int) ([]entity.TotalTransaction, error) {
	rows, err := r.db.Query(
		`SELECT t.id, t."total", t."cash", t."card", t."click", t."debt", t."discount", t."clientNumber", t."description", t."debtLimitDate", t."businessId", t."clientId", t."createdBy", t."createdAt", t."updatedAt",
		        COALESCE(c."fullName", ''), COALESCE(u."firstName" || ' ' || u."lastName", '')
		 FROM total_transactions t
		 LEFT JOIN clients c ON t."clientId" = c.id
		 LEFT JOIN users u ON t."createdBy" = u.id
		 WHERE t."businessId" = $1 ORDER BY t.id DESC`, bid,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	list := []entity.TotalTransaction{}
	for rows.Next() {
		var tt entity.TotalTransaction
		if err := rows.Scan(&tt.ID, &tt.Total, &tt.Cash, &tt.Card, &tt.Click, &tt.Debt, &tt.Discount, &tt.ClientNumber, &tt.Description, &tt.DebtLimitDate, &tt.BusinessID, &tt.ClientID, &tt.CreatedBy, &tt.CreatedAt, &tt.UpdatedAt, &tt.ClientName, &tt.CreatedByName); err != nil {
			return nil, err
		}
		list = append(list, tt)
	}
	return list, nil
}

func (r *TransactionRepo) GetTransactionsByTotalID(totalID int) ([]entity.Transaction, error) {
	rows, err := r.db.Query(
		`SELECT t.id, t.description, t."productPrice", t."productQuantity", t."productId", t."businessId", t."totalTransactionId", t."createdAt", t."updatedAt",
		        COALESCE(p.name, ''), COALESCE(p.barcode, ''),
		        COALESCE(SUM(r."productQuantity"), 0) as refundedQty,
		        COALESCE(SUM(r."productPrice" * r."productQuantity"), 0) as refundedSum
		 FROM transactions t
		 LEFT JOIN products p ON t."productId" = p.id
		 LEFT JOIN refunds r ON t.id = r."transactionId"
		 WHERE t."totalTransactionId" = $1 
		 GROUP BY t.id, t.description, t."productPrice", t."productQuantity", t."productId", t."businessId", t."totalTransactionId", t."createdAt", t."updatedAt", p.name, p.barcode
		 ORDER BY t.id`, totalID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	list := []entity.Transaction{}
	for rows.Next() {
		var t entity.Transaction
		if err := rows.Scan(
			&t.ID, &t.Description, &t.ProductPrice, &t.ProductQuantity, &t.ProductID, &t.BusinessID, &t.TotalTransactionID, &t.CreatedAt, &t.UpdatedAt,
			&t.ProductName, &t.ProductBarcode, &t.RefundedQuantity, &t.RefundedSum,
		); err != nil {
			return nil, err
		}
		list = append(list, t)
	}
	return list, nil
}

func (r *TransactionRepo) GetTotalTransactionsByPeriod(bid int, start, end time.Time) ([]entity.TotalTransaction, error) {
	rows, err := r.db.Query(
		`SELECT t.id, t."total", t."cash", t."card", t."click", t."debt", t."discount", t."clientNumber", t."description", t."debtLimitDate", t."businessId", t."clientId", t."createdBy", t."createdAt", t."updatedAt",
		        COALESCE(c."fullName", ''), COALESCE(u."firstName" || ' ' || u."lastName", '')
		 FROM total_transactions t
		 LEFT JOIN clients c ON t."clientId" = c.id
		 LEFT JOIN users u ON t."createdBy" = u.id
		 WHERE t."businessId" = $1 AND t."createdAt" >= $2 AND t."createdAt" <= $3 ORDER BY t.id DESC`,
		bid, start, end,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	list := []entity.TotalTransaction{}
	for rows.Next() {
		var tt entity.TotalTransaction
		if err := rows.Scan(&tt.ID, &tt.Total, &tt.Cash, &tt.Card, &tt.Click, &tt.Debt, &tt.Discount, &tt.ClientNumber, &tt.Description, &tt.DebtLimitDate, &tt.BusinessID, &tt.ClientID, &tt.CreatedBy, &tt.CreatedAt, &tt.UpdatedAt, &tt.ClientName, &tt.CreatedByName); err != nil {
			return nil, err
		}
		list = append(list, tt)
	}
	return list, nil
}

func (r *TransactionRepo) GetStats(bid int, start, end *time.Time) (entity.TransactionStats, error) {
	queryString := `SELECT 
		COALESCE(SUM(total), 0), 
		COALESCE(SUM(cash), 0), 
		COALESCE(SUM(card), 0), 
		COALESCE(SUM(click), 0), 
		COALESCE(SUM(debt), 0), 
		COUNT(*) 
	FROM total_transactions WHERE "businessId" = $1`
	args := []interface{}{bid}
	idx := 2
	if start != nil {
		queryString += fmt.Sprintf(` AND "createdAt" >= $%d`, idx)
		args = append(args, *start)
		idx++
	}
	if end != nil {
		queryString += fmt.Sprintf(` AND "createdAt" <= $%d`, idx)
		args = append(args, *end)
		idx++
	}
	var s entity.TransactionStats
	err := r.db.QueryRow(queryString, args...).Scan(&s.Total, &s.Cash, &s.Card, &s.Click, &s.Debt, &s.Count)
	return s, err
}

func (r *TransactionRepo) GetRecentTransactionsByBusinessID(bid int, limit int) ([]entity.TotalTransaction, error) {
	rows, err := r.db.Query(
		`SELECT t.id, t."total", t."cash", t."card", t."click", t."debt", t."discount", t."clientNumber", t."description", t."debtLimitDate", t."businessId", t."clientId", t."createdBy", t."createdAt", t."updatedAt",
		        COALESCE(c."fullName", ''), COALESCE(b.name, ''), COALESCE(u."firstName" || ' ' || u."lastName", '')
		 FROM total_transactions t
		 LEFT JOIN clients c ON t."clientId" = c.id
		 LEFT JOIN businesses b ON t."businessId" = b.id
		 LEFT JOIN users u ON t."createdBy" = u.id
		 WHERE t."businessId" = $1
		 ORDER BY t.id DESC LIMIT $2`, bid, limit,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	list := []entity.TotalTransaction{}
	for rows.Next() {
		var tt entity.TotalTransaction
		if err := rows.Scan(&tt.ID, &tt.Total, &tt.Cash, &tt.Card, &tt.Click, &tt.Debt, &tt.Discount, &tt.ClientNumber, &tt.Description, &tt.DebtLimitDate, &tt.BusinessID, &tt.ClientID, &tt.CreatedBy, &tt.CreatedAt, &tt.UpdatedAt, &tt.ClientName, &tt.BusinessName, &tt.CreatedByName); err != nil {
			return nil, err
		}
		list = append(list, tt)
	}
	return list, nil
}

func (r *TransactionRepo) GetRecentTransactionsByClientID(clientID int, limit int) ([]entity.TotalTransaction, error) {
	rows, err := r.db.Query(
		`SELECT t.id, t."total", t."cash", t."card", t."click", t."debt", t."discount", t."clientNumber", t."description", t."debtLimitDate", t."businessId", t."clientId", t."createdBy", t."createdAt", t."updatedAt",
		        COALESCE(c."fullName", ''), COALESCE(b.name, ''), COALESCE(u."firstName" || ' ' || u."lastName", '')
		 FROM total_transactions t
		 LEFT JOIN clients c ON t."clientId" = c.id
		 LEFT JOIN businesses b ON t."businessId" = b.id
		 LEFT JOIN users u ON t."createdBy" = u.id
		 WHERE t."clientId" = $1
		 ORDER BY t.id DESC LIMIT $2`, clientID, limit,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	list := []entity.TotalTransaction{}
	for rows.Next() {
		var tt entity.TotalTransaction
		if err := rows.Scan(&tt.ID, &tt.Total, &tt.Cash, &tt.Card, &tt.Click, &tt.Debt, &tt.Discount, &tt.ClientNumber, &tt.Description, &tt.DebtLimitDate, &tt.BusinessID, &tt.ClientID, &tt.CreatedBy, &tt.CreatedAt, &tt.UpdatedAt, &tt.ClientName, &tt.BusinessName, &tt.CreatedByName); err != nil {
			return nil, err
		}
		list = append(list, tt)
	}
	return list, nil
}

func (r *TransactionRepo) UpdateTotalTransaction(tt *entity.TotalTransaction) error {
	_, err := r.db.Exec(
		`UPDATE total_transactions SET "total"=$1, "cash"=$2, "card"=$3, "click"=$4, "debt"=$5, "discount"=$6, "clientNumber"=$7, "description"=$8, "debtLimitDate"=$9, "clientId"=$10, "updatedAt"=$11
		 WHERE id = $12`,
		tt.Total, tt.Cash, tt.Card, tt.Click, tt.Debt, tt.Discount, tt.ClientNumber, tt.Description, tt.DebtLimitDate, tt.ClientID, time.Now(), tt.ID,
	)
	return err
}

func (r *TransactionRepo) GetTransactionByID(id int) (*entity.Transaction, error) {
	var t entity.Transaction
	err := r.db.QueryRow(
		`SELECT id, description, "productPrice", "productQuantity", "productId", "businessId", "totalTransactionId", "createdAt", "updatedAt"
		 FROM transactions WHERE id = $1`, id,
	).Scan(&t.ID, &t.Description, &t.ProductPrice, &t.ProductQuantity, &t.ProductID, &t.BusinessID, &t.TotalTransactionID, &t.CreatedAt, &t.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &t, nil
}

func (r *TransactionRepo) UpdateTransaction(t *entity.Transaction) error {
	_, err := r.db.Exec(
		`UPDATE transactions SET description=$1, "productPrice"=$2, "productQuantity"=$3, "updatedAt"=$4 WHERE id = $5`,
		t.Description, t.ProductPrice, t.ProductQuantity, time.Now(), t.ID,
	)
	return err
}

func (r *TransactionRepo) DeleteTransaction(id int) error {
	_, err := r.db.Exec(`DELETE FROM transactions WHERE id = $1`, id)
	return err
}
