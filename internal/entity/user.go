package entity

import "time"

// Role constants for RBAC
const (
	RoleEmployee   = 0 // Xodim/Kassir — Admin tomonidan qo'shiladi
	RoleAdmin      = 1 // Biznes egasi — Ro'yxatdan o'tadi
	RoleSuperAdmin = 2 // Tizim boshqaruvchisi
	RoleClient     = 3 // Mijoz — Marketplace/Telegram bot uchun
)

type BusinessPermission struct {
	BusinessID int  `json:"businessId"`
	CanAdd     bool `json:"canAdd"`
	CanEdit    bool `json:"canEdit"`
	CanDelete  bool `json:"canDelete"`
}

type User struct {
	ID                  int                  `json:"id"`
	FirstName           string               `json:"firstName"`
	LastName            string               `json:"lastName"`
	PhoneNumber         *string              `json:"phoneNumber"`
	UserName            string               `json:"userName"`
	Password            string               `json:"-"`
	Role                int                  `json:"role"`
	InviterCode         *string              `json:"inviterCode"`
	OfferCode           *string              `json:"offerCode"`
	IsVerified          bool                 `json:"isVerified"`
	IsExpired           bool                 `json:"isExpired"`
	Image               *string              `json:"image"`
	BrandName           *string              `json:"brandName"`
	BrandImage          *string              `json:"brandImage"`
	TelegramUserID      int64                `json:"telegramUserId"`
	Language            string               `json:"language"`
	MarketID            *int                 `json:"marketId"`
	CreatedBy           *int                 `json:"createdBy"`
	BusinessIDs         []int                `json:"businessIds"`
	BusinessPermissions []BusinessPermission `json:"businessPermissions"`
	ExpirationDate      time.Time            `json:"expirationDate"`
	CreatedAt           time.Time            `json:"createdAt"`
	UpdatedAt           time.Time            `json:"updatedAt"`
}

type RegisterRequest struct {
	FirstName           string               `json:"firstName" binding:"required"`
	LastName            string               `json:"lastName" binding:"required"`
	PhoneNumber         string               `json:"phoneNumber"`
	UserName            string               `json:"userName" binding:"required"`
	Password            string               `json:"password" binding:"required,min=6"`
	Image               string               `json:"image"`
	BrandName           string               `json:"brandName"`
	BrandImage          string               `json:"brandImage"`
	MarketID            *int                 `json:"marketId"`
	BusinessIDs         []int                `json:"businessIds"`
	BusinessPermissions []BusinessPermission `json:"businessPermissions"`
	OfferCode           string               `json:"offerCode"`
	Role                int                  `json:"role"`
	ExpirationDate      *time.Time           `json:"expirationDate"`
}

type LoginRequest struct {
	UserName string `json:"userName" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type LoginResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}

type UpdateUserRequest struct {
	FirstName           *string              `json:"firstName"`
	LastName            *string              `json:"lastName"`
	PhoneNumber         *string              `json:"phoneNumber"`
	Password            *string              `json:"password"`
	Role                *int                 `json:"role"`
	IsVerified          *bool                `json:"isVerified"`
	IsExpired           *bool                `json:"isExpired"`
	Image               *string              `json:"image"`
	BrandName           *string              `json:"brandName"`
	BrandImage          *string              `json:"brandImage"`
	MarketID            *int                 `json:"marketId"`
	BusinessIDs         []int                `json:"businessIds"`
	BusinessPermissions []BusinessPermission `json:"businessPermissions"`
	CreatedBy           *int                 `json:"createdBy"`
	ExpirationDate      *time.Time           `json:"expirationDate"`
}

type ExtendSubscriptionRequest struct {
	UserName       string `json:"userName" binding:"required"`
	ExpirationDate string `json:"expirationDate" binding:"required" example:"2026-04-28 00:00:00"`
}

type ForgotPasswordRequest struct {
	UserName string `json:"userName" binding:"required"`
}

type ResetPasswordRequest struct {
	UserName    string `json:"userName" binding:"required"`
	Code        string `json:"code" binding:"required"`
	NewPassword string `json:"newPassword" binding:"required,min=6"`
}
