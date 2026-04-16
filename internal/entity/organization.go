package entity

import "time"

type Organization struct {
	ID            int       `json:"id"`
	UserID        int       `json:"userId"`
	OrgName       string    `json:"orgName"`
	Inn           string    `json:"inn"`
	BankName      string    `json:"bankName"`
	Mfo           string    `json:"mfo"`
	BankAccount   string    `json:"bankAccount"`
	Logo          string    `json:"logo"`
	Description   string    `json:"description"`
	CreatedAt     time.Time `json:"createdAt"`
	UpdatedAt     time.Time `json:"updatedAt"`
}

type CreateOrganizationRequest struct {
	OrgName       string `json:"orgName" binding:"required"`
	Inn           string `json:"inn"`
	BankName      string `json:"bankName"`
	Mfo           string `json:"mfo"`
	BankAccount   string `json:"bankAccount"`
	Logo          string `json:"logo"`
	Description   string `json:"description"`
}

type UpdateOrganizationRequest struct {
	OrgName       *string `json:"orgName"`
	Inn           *string `json:"inn"`
	BankName      *string `json:"bankName"`
	Mfo           *string `json:"mfo"`
	BankAccount   *string `json:"bankAccount"`
	Logo          *string `json:"logo"`
	Description   *string `json:"description"`
}
