package repository

import (
	"savdosklad/internal/entity"
	"time"
)

type UserRepository interface {
	Create(user *entity.User) (int, error)
	GetByID(id int) (*entity.User, error)
	GetByUsername(username string) (*entity.User, error)
	GetByTelegramID(tgID int64) (*entity.User, error)
	GetByPhoneNumber(phone string) (*entity.User, error)
	GetAll() ([]entity.User, error)
	Update(id int, req entity.UpdateUserRequest) error
	UpdateTelegramID(id int, tgID int64) error
	UpdateLanguage(id int, lang string) error
	GetByCreatedBy(adminID int) ([]entity.User, error)
	Delete(id int) error
	HasPermission(userID, businessID int, action string) (bool, error)
}

type BusinessRepository interface {
	Create(business *entity.Business) (int, error)
	GetByID(id int) (*entity.Business, error)
	GetByUserID(userID int) ([]entity.Business, error)
	GetAll() ([]entity.Business, error)
	Update(id int, req entity.UpdateBusinessRequest) error
	Delete(id int) error
}

type CategoryRepository interface {
	Create(category *entity.Category) (int, error)
	GetByID(id int) (*entity.Category, error)
	GetByBusinessID(businessID int) ([]entity.Category, error)
	Update(id int, req entity.UpdateCategoryRequest) error
	Delete(id int) error
}

type ProductRepository interface {
	Create(product *entity.Product) (int, error)
	GetByID(id int) (*entity.Product, error)
	GetByBusinessID(businessID int) ([]entity.Product, error)
	GetByUserID(userID int) ([]entity.Product, error)
	GetByCategoryID(categoryID int) ([]entity.Product, error)
	Update(id int, req entity.UpdateProductRequest) error
	Delete(id int) error
	Search(bid int, query string) ([]entity.Product, error)
	SearchByUserID(userID int, query string) ([]entity.Product, error)
	BulkDelete(bid int, categoryId *int, productIds []int) error
	GetByIDs(ids []int) ([]entity.Product, error)
	CreateBulkDeleteRequest(req *entity.BulkDeleteRequest) (int, error)
	GetBulkDeleteRequests() ([]entity.BulkDeleteRequest, error)
	UpdateBulkDeleteRequestStatus(id int, status string) error
}

type ClientRepository interface {
	Create(client *entity.Client) (int, error)
	GetByID(id int) (*entity.Client, error)
	GetByBusinessID(bid int) ([]entity.Client, error)
	GetByTelegramID(tgID int64) ([]entity.Client, error)
	GetByPhoneNumber(phone string) ([]entity.Client, error)
	Search(bid int, query string) ([]entity.Client, error)
	GetTotalDebt(clientID int) (float64, error)
	Update(id int, req entity.UpdateClientRequest) error
	UpdateTelegramID(id int, tgID int64) error
	UpdateLanguage(id int, lang string) error
	Delete(id int) error
}

type TransactionRepository interface {
	CreateTotalTransaction(tt *entity.TotalTransaction) (int, error)
	CreateTransaction(t *entity.Transaction) (int, error)
	GetTotalTransactionByID(id int) (*entity.TotalTransaction, error)
	GetTotalTransactionsByBusinessID(bid int) ([]entity.TotalTransaction, error)
	GetTotalTransactionsByPeriod(bid int, start, end time.Time) ([]entity.TotalTransaction, error)
	GetTransactionsByTotalID(totalID int) ([]entity.Transaction, error)
	GetRecentTransactionsByBusinessID(bid int, limit int) ([]entity.TotalTransaction, error)
	GetRecentTransactionsByClientID(clientID int, limit int) ([]entity.TotalTransaction, error)
	GetStats(bid int, start, end *time.Time) (entity.TransactionStats, error)
	UpdateTotalTransaction(tt *entity.TotalTransaction) error
}

type RefundRepository interface {
	CreateTotalRefund(tr *entity.TotalRefund) (int, error)
	CreateRefund(r *entity.Refund) (int, error)
	GetTotalRefundByID(id int) (*entity.TotalRefund, error)
	GetTotalRefundsByBusinessID(bid int) ([]entity.TotalRefund, error)
	GetTotalRefundsByPeriod(bid int, start, end time.Time) ([]entity.TotalRefund, error)
	GetRefundsByTotalID(totalID int) ([]entity.Refund, error)
	GetStats(bid int, start, end *time.Time) (entity.RefundStats, error)
}

type ExpenseRepository interface {
	CreateTotalExpense(te *entity.TotalExpense) (int, error)
	CreateExpense(e *entity.Expense) (int, error)
	GetTotalExpensesByBusinessID(bid int) ([]entity.TotalExpense, error)
	GetTotalExpensesByPeriod(bid int, start, end time.Time) ([]entity.TotalExpense, error)
	GetExpensesByTotalID(totalID int) ([]entity.Expense, error)
	CreateFixedCost(fc *entity.FixedCost) (int, error)
	GetFixedCostsByBusinessID(businessID int) ([]entity.FixedCost, error)
	UpdateFixedCost(id int, req entity.UpdateFixedCostRequest) error
	CreateFixedFactedCost(ffc *entity.FixedFactedCost) (int, error)
	GetFixedFactedCostsByBusinessID(businessID int) ([]entity.FixedFactedCost, error)
}

type MoneyRepository interface {
	Create(money *entity.Money) (int, error)
	GetByBusinessID(businessID int) ([]entity.Money, error)
}

type CalculationRepository interface {
	Create(calc *entity.Calculation) (int, error)
	GetByBusinessID(businessID int) ([]entity.Calculation, error)
	GetByBusinessIDAndPeriod(businessID, month, year int) (*entity.Calculation, error)
}

type OrganizationRepository interface {
	Create(org *entity.Organization) (int, error)
	GetByID(id int) (*entity.Organization, error)
	GetByUserID(userID int) ([]entity.Organization, error)
	Update(id int, org *entity.Organization) error
	Delete(id int) error
}


