package entity

import "time"

type TotalExpense struct {
	ID            int       `json:"id"`
	BusinessID    int       `json:"businessId"`
	Total         float64   `json:"total"`
	Cash          float64   `json:"cash"`
	Card          float64   `json:"card"`
	Description   *string   `json:"description"`
	CreatedBy     *int      `json:"createdBy"`
	CreatedByName string    `json:"createdByName"` // Join field
	CreatedAt     time.Time `json:"createdAt"`
	UpdatedAt     time.Time `json:"updatedAt"`
}

type Expense struct {
	ID             int       `json:"id"`
	Name           *string   `json:"name"`
	Description    *string   `json:"description"`
	Value          float64   `json:"value"`
	BusinessID     int       `json:"businessId"`
	TotalExpenseID int       `json:"totalExpenseId"`
	ExpenseDate    time.Time `json:"expenseDate"`
	CreatedAt      time.Time `json:"createdAt"`
	UpdatedAt      time.Time `json:"updatedAt"`
}

type CreateTotalExpenseRequest struct {
	BusinessID  int                        `json:"businessId" binding:"required"`
	Total       float64                    `json:"total" binding:"required"`
	Cash        float64                    `json:"cash"`
	Card        float64                    `json:"card"`
	Description string                     `json:"description"`
	Items       []CreateExpenseItemRequest `json:"items"`
}

type CreateExpenseItemRequest struct {
	Name        string  `json:"name" binding:"required"`
	Description string  `json:"description"`
	Value       float64 `json:"value" binding:"required"`
	ExpenseDate string  `json:"expenseDate"`
}

type FixedCost struct {
	ID          int       `json:"id"`
	Name        *string   `json:"name"`
	Description *string   `json:"description"`
	Amount      float64   `json:"amount"`
	Type        int       `json:"type"`
	BusinessID  int       `json:"businessId"`
	IsDeleted   bool      `json:"isDeleted"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

type CreateFixedCostRequest struct {
	BusinessID  int     `json:"businessId" binding:"required"`
	Name        string  `json:"name" binding:"required"`
	Description string  `json:"description"`
	Amount      float64 `json:"amount" binding:"required"`
	Type        int     `json:"type" binding:"required"`
}

type UpdateFixedCostRequest struct {
	Name        *string  `json:"name"`
	Description *string  `json:"description"`
	Amount      *float64 `json:"amount"`
	Type        *int     `json:"type"`
	IsDeleted   *bool    `json:"isDeleted"`
}

type FixedFactedCost struct {
	ID          int       `json:"id"`
	FixedCostID *int      `json:"fixedCostId"`
	Date        time.Time `json:"date"`
	Amount      float64   `json:"amount"`
	BusinessID  int       `json:"businessId"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

type CreateFixedFactedCostRequest struct {
	BusinessID  int     `json:"businessId" binding:"required"`
	FixedCostID *int    `json:"fixedCostId"`
	Date        string  `json:"date" binding:"required"`
	Amount      float64 `json:"amount" binding:"required"`
}
