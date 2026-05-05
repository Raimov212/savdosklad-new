package entity

import "time"

type OrderStatus string

const (
	OrderStatusPending   OrderStatus = "PENDING"
	OrderStatusConfirmed OrderStatus = "CONFIRMED"
	OrderStatusRejected  OrderStatus = "REJECTED"
	OrderStatusDelivered OrderStatus = "DELIVERED"
)

type Order struct {
	ID           int         `json:"id"`
	CustomerID   int         `json:"customerId"`
	BusinessID   *int        `json:"businessId"`
	BusinessName string      `json:"businessName,omitempty"`
	Customer     *Customer   `json:"customer,omitempty"`
	Status       OrderStatus `json:"status"`
	TotalSum     float64     `json:"totalSum"`
	CreatedAt    time.Time   `json:"createdAt"`
	UpdatedAt    time.Time   `json:"updatedAt"`
	Items        []OrderItem `json:"items,omitempty"`
}

type OrderItem struct {
	ID                   int                `json:"id"`
	OrderID              int                `json:"orderId"`
	MarketplaceProductID int                `json:"marketplaceProductId"`
	Product              *MarketplaceProduct `json:"product,omitempty"`
	Quantity             int                `json:"quantity"`
	Price                float64            `json:"price"`
}

type CreateOrderRequest struct {
	Items []struct {
		MarketplaceProductID int `json:"marketplaceProductId" binding:"required"`
		Quantity             int `json:"quantity" binding:"required,min=1"`
	} `json:"items" binding:"required,min=1"`
}

type UpdateOrderStatusRequest struct {
	Status OrderStatus `json:"status" binding:"required"`
}
