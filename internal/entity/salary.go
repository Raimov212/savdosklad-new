package entity

import "time"

type EmployeeSalary struct {
	ID          int       `json:"id"`
	EmployeeID  int       `json:"employeeId"`
	EmployeeName string    `json:"employeeName"` // Join field
	BusinessID  int       `json:"businessId"`
	Amount      float64   `json:"amount"`
	Month       int       `json:"month"`
	Year        int       `json:"year"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

type CreateSalaryRequest struct {
	EmployeeID  int     `json:"employeeId" binding:"required"`
	BusinessID  int     `json:"businessId" binding:"required"`
	Amount      float64 `json:"amount" binding:"required"`
	Month       int     `json:"month" binding:"required"`
	Year        int     `json:"year" binding:"required"`
	Description string  `json:"description"`
}
