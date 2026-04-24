package entity

import "time"

type Calculation struct {
	ID              int       `json:"id"`
	BusinessID      int       `json:"businessId"`
	TotalIncome     float64   `json:"totalIncome"`
	IncomeTax       float64   `json:"incomeTax"`
	TotalExpense    float64   `json:"totalExpense"`
	TotalFixedCosts float64   `json:"totalFixedCosts"`
	Salary          float64   `json:"salary"`
	SalaryTax       float64   `json:"salaryTax"`
	Profit          float64   `json:"profit"`
	Month           int       `json:"month"`
	Year            int       `json:"year"`
	TotalSale       float64   `json:"totalSale"`
	AddedMoney      float64   `json:"addedMoney"`
	CreatedAt       time.Time `json:"createdAt"`
	UpdatedAt       time.Time `json:"updatedAt"`
}

type CalculationStats struct {
	TotalSale       float64 `json:"totalSale"`
	TotalIncome     float64 `json:"totalIncome"`
	TotalExpense    float64 `json:"totalExpense"`
	TotalFixedCosts float64 `json:"totalFixedCosts"`
	TotalSalary     float64 `json:"totalSalary"`
}

type CreateCalculationRequest struct {
	BusinessID      int     `json:"businessId" binding:"required"`
	TotalIncome     float64 `json:"totalIncome"`
	IncomeTax       float64 `json:"incomeTax"`
	TotalExpense    float64 `json:"totalExpense"`
	TotalFixedCosts float64 `json:"totalFixedCosts"`
	Salary          float64 `json:"salary"`
	SalaryTax       float64 `json:"salaryTax"`
	Profit          float64 `json:"profit"`
	Month           int     `json:"month" binding:"required"`
	Year            int     `json:"year" binding:"required"`
	TotalSale       float64 `json:"totalSale"`
	AddedMoney      float64 `json:"addedMoney"`
}
