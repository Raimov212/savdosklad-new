package entity

import "time"

type Customer struct {
	ID          int       `json:"id"`
	FirstName   string    `json:"firstName"`
	LastName    string    `json:"lastName"`
	PhoneNumber string    `json:"phoneNumber"`
	Email       *string   `json:"email"`
	Password    string    `json:"-"`
	Image       string    `json:"image"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

type RegisterCustomerRequest struct {
	FirstName   string `json:"firstName" binding:"required"`
	LastName    string `json:"lastName" binding:"required"`
	PhoneNumber string `json:"phoneNumber" binding:"required"`
	Email       string `json:"email"`
	Password    string `json:"password" binding:"required,min=6"`
	Image       string `json:"image"`
}

type LoginCustomerRequest struct {
	PhoneNumber string `json:"phoneNumber" binding:"required"`
	Password    string `json:"password" binding:"required"`
}

type LoginCustomerResponse struct {
	Token    string   `json:"token"`
	Customer Customer `json:"customer"`
}

type UpdateCustomerRequest struct {
	FirstName   *string `json:"firstName"`
	LastName    *string `json:"lastName"`
	PhoneNumber *string `json:"phoneNumber"`
	Email       *string `json:"email"`
	Password    *string `json:"password"`
	Image       *string `json:"image"`
}
