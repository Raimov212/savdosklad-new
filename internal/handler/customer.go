package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"savdosklad/internal/entity"
	"savdosklad/internal/usecase"
	"savdosklad/pkg/i18n"
)

type CustomerHandler struct {
	uc *usecase.CustomerUseCase
}

func NewCustomerHandler(uc *usecase.CustomerUseCase) *CustomerHandler {
	return &CustomerHandler{uc: uc}
}

// Register godoc
// @Summary      Customer ro'yxatdan o'tish
// @Description  Yangi marketplace customer yaratish
// @Tags         Marketplace - Auth
// @Accept       json
// @Produce      json
// @Param        request body entity.RegisterCustomerRequest true "Customer ma'lumotlari"
// @Success      201 {object} entity.Customer
// @Failure      400 {object} map[string]string
// @Router       /marketplace/auth/register [post]
func (h *CustomerHandler) Register(c *gin.Context) {
	var req entity.RegisterCustomerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	customer, err := h.uc.Register(c, &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, customer)
}

// Login godoc
// @Summary      Customer kirish
// @Description  Telefon raqam va parol bilan kirish
// @Tags         Marketplace - Auth
// @Accept       json
// @Produce      json
// @Param        request body entity.LoginCustomerRequest true "Login ma'lumotlari"
// @Success      200 {object} entity.LoginCustomerResponse
// @Failure      401 {object} map[string]string
// @Router       /marketplace/auth/login [post]
func (h *CustomerHandler) Login(c *gin.Context) {
	var req entity.LoginCustomerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	resp, err := h.uc.Login(&req)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, resp)
}

// GetProfile godoc
// @Summary      Customer profili
// @Description  Joriy customer profilini ko'rish
// @Tags         Marketplace - Profile
// @Produce      json
// @Security     BearerAuth
// @Success      200 {object} entity.Customer
// @Failure      404 {object} map[string]string
// @Router       /marketplace/profile [get]
func (h *CustomerHandler) GetProfile(c *gin.Context) {
	customerID := c.GetInt("customerID")

	customer, err := h.uc.GetByID(customerID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": i18n.Tc(c, i18n.MsgCustomerNotFound)})
		return
	}

	c.JSON(http.StatusOK, customer)
}

// UpdateProfile godoc
// @Summary      Customer profilini yangilash
// @Description  Customer ma'lumotlarini yangilash
// @Tags         Marketplace - Profile
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        request body entity.UpdateCustomerRequest true "Yangilanadigan maydonlar"
// @Success      200 {object} entity.Customer
// @Failure      400 {object} map[string]string
// @Router       /marketplace/profile [put]
func (h *CustomerHandler) UpdateProfile(c *gin.Context) {
	customerID := c.GetInt("customerID")

	var req entity.UpdateCustomerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.uc.Update(customerID, &req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	customer, _ := h.uc.GetByID(customerID)
	c.JSON(http.StatusOK, customer)
}
