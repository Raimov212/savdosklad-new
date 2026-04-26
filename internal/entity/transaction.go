package entity

import "time"

type TransactionStats struct {
	Total float64
	Cash  float64
	Card  float64
	Click float64
	Debt  float64
	Count int
}

type RefundStats struct {
	Total float64
	Count int
}

type Transaction struct {
	ID                 int       `json:"id"`
	Description        *string   `json:"description"`
	ProductPrice       float64   `json:"productPrice"`
	ProductQuantity    int       `json:"productQuantity"`
	ProductID          int       `json:"productId"`
	BusinessID         int       `json:"businessId"`
	TotalTransactionID int       `json:"totalTransactionId"`
	ProductName        string    `json:"productName"`    // Join field
	ProductBarcode     string    `json:"productBarcode"` // Join field
	RefundedQuantity   int       `json:"refundedQuantity"` // Join field
	RefundedSum        float64   `json:"refundedSum"`      // Join field
	CreatedAt          time.Time `json:"createdAt"`
	UpdatedAt          time.Time `json:"updatedAt"`
}

type TotalTransaction struct {
	ID            int        `json:"id"`
	Description   *string    `json:"description"`
	Total         float64    `json:"total"`
	Cash          float64    `json:"cash"`
	Card          float64    `json:"card"`
	Click         float64    `json:"click"`
	Debt          float64    `json:"debt"`
	Discount      float64    `json:"discount"`
	ClientNumber  *string    `json:"clientNumber"`
	DebtLimitDate *time.Time `json:"debtLimitDate"`
	BusinessID    int        `json:"businessId"`
	ClientID      *int       `json:"clientId"`
	ClientName    string     `json:"clientName"`   // Join field
	BusinessName  string     `json:"businessName"` // Join field
	CreatedBy     *int       `json:"createdBy"`
	CreatedByName string     `json:"createdByName"` // Join field
	CreatedAt     time.Time  `json:"createdAt"`
	UpdatedAt     time.Time  `json:"updatedAt"`
}

type CreateTotalTransactionRequest struct {
	BusinessID    int                            `json:"businessId" binding:"required"`
	ClientID      *int                           `json:"clientId"`
	Total         float64                        `json:"total" binding:"required"`
	Cash          float64                        `json:"cash"`
	Card          float64                        `json:"card"`
	Click         float64                        `json:"click"`
	Debt          float64                        `json:"debt"`
	Discount      float64                        `json:"discount"`
	ClientNumber  string                         `json:"clientNumber"`
	Description   string                         `json:"description"`
	DebtLimitDate *time.Time                     `json:"debtLimitDate"`
	Items         []CreateTransactionItemRequest `json:"items" binding:"required"`
}

type CreateTransactionItemRequest struct {
	ProductID       int     `json:"productId" binding:"required"`
	ProductQuantity int     `json:"productQuantity" binding:"required"`
	ProductPrice    float64 `json:"productPrice" binding:"required"`
	BusinessID      int     `json:"businessId"` // Added to track store origin
	Description     string  `json:"description"`
}

type TotalRefund struct {
	ID            int        `json:"id"`
	Description   *string    `json:"description"`
	Total         float64    `json:"total"`
	Cash          float64    `json:"cash"`
	Card          float64    `json:"card"`
	Click         float64    `json:"click"`
	Debt          float64    `json:"debt"`
	Discount      float64    `json:"discount"`
	ClientNumber  *string    `json:"clientNumber"`
	DebtLimitDate *time.Time `json:"debtLimitDate"`
	BusinessID    int        `json:"businessId"`
	ClientID      *int       `json:"clientId"`
	ClientName    string     `json:"clientName"`   // Join field
	BusinessName  string     `json:"businessName"` // Join field
	CreatedBy     *int       `json:"createdBy"`
	CreatedByName string     `json:"createdByName"` // Join field
	CreatedAt     time.Time  `json:"createdAt"`
	UpdatedAt     time.Time  `json:"updatedAt"`
}

type Refund struct {
	ID              int       `json:"id"`
	Description     *string   `json:"description"`
	ProductPrice    float64   `json:"productPrice"`
	ProductQuantity int       `json:"productQuantity"`
	ProductID       int       `json:"productId"`
	BusinessID      int       `json:"businessId"`
	TotalRefundID   int       `json:"totalRefundId"`
	TransactionID   int       `json:"transactionId"`
	CreatedBy       *int      `json:"createdBy"`     // New field
	CreatedByName   string    `json:"createdByName"` // Join field
	CreatedAt       time.Time `json:"createdAt"`
	UpdatedAt       time.Time `json:"updatedAt"`
}

type CreateTotalRefundRequest struct {
	BusinessID    int                       `json:"businessId" binding:"required"`
	ClientID      *int                      `json:"clientId"`
	Total         float64                   `json:"total" binding:"required"`
	Cash          float64                   `json:"cash"`
	Card          float64                   `json:"card"`
	Click         float64                   `json:"click"`
	Debt          float64                   `json:"debt"`
	Discount      float64                   `json:"discount"`
	ClientNumber  string                    `json:"clientNumber"`
	Description   string                    `json:"description"`
	DebtLimitDate *time.Time                `json:"debtLimitDate"`
	Items         []CreateRefundItemRequest `json:"items" binding:"required"`
}

type CreateRefundItemRequest struct {
	ProductID       int     `json:"productId" binding:"required"`
	ProductQuantity int     `json:"productQuantity" binding:"required"`
	ProductPrice    float64 `json:"productPrice" binding:"required"`
	Description     string  `json:"description"`
	TransactionID   int     `json:"transactionId"`
}

type UpdateTotalTransactionRequest struct {
	Total         float64    `json:"total"`
	Cash          float64    `json:"cash"`
	Card          float64    `json:"card"`
	Click         float64    `json:"click"`
	Debt          float64    `json:"debt"`
	Discount      float64    `json:"discount"`
	ClientID      *int       `json:"clientId"`
	ClientNumber  string     `json:"clientNumber"`
	Description   string     `json:"description"`
	DebtLimitDate *time.Time `json:"debtLimitDate"`
}
