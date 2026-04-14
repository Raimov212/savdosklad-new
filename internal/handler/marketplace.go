package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"savdosklad/internal/entity"
	"savdosklad/internal/repository/postgres"
	"savdosklad/internal/usecase"
	"savdosklad/pkg/i18n"
)

type MarketplaceHandler struct {
	uc *usecase.MarketplaceUseCase
}

func NewMarketplaceHandler(uc *usecase.MarketplaceUseCase) *MarketplaceHandler {
	return &MarketplaceHandler{uc: uc}
}

// ==================== PUBLIC ENDPOINTS ====================

// GetProducts godoc
// @Summary      Marketplace mahsulotlar ro'yxati
// @Description  Ommaviy katalogdagi mahsulotlar (filtrlash, qidiruv, pagination)
// @Tags         Marketplace - Catalog
// @Produce      json
// @Param        search query string false "Qidiruv so'zi"
// @Param        categoryId query int false "Marketplace kategoriya ID"
// @Param        minPrice query number false "Minimal narx"
// @Param        maxPrice query number false "Maksimal narx"
// @Param        sortBy query string false "Saralash: price_asc, price_desc, newest, name"
// @Param        page query int false "Sahifa raqami"
// @Param        limit query int false "Sahifadagi elementlar soni"
// @Success      200 {object} map[string]interface{}
// @Router       /marketplace/products [get]
func (h *MarketplaceHandler) GetProducts(c *gin.Context) {
	filter := postgres.ProductFilter{
		Search: c.Query("search"),
		SortBy: c.Query("sortBy"),
	}

	if v, err := strconv.Atoi(c.Query("categoryId")); err == nil {
		filter.CategoryID = v
	}
	if v, err := strconv.ParseFloat(c.Query("minPrice"), 64); err == nil {
		filter.MinPrice = v
	}
	if v, err := strconv.ParseFloat(c.Query("maxPrice"), 64); err == nil {
		filter.MaxPrice = v
	}
	if v, err := strconv.Atoi(c.Query("page")); err == nil {
		filter.Page = v
	}
	if v, err := strconv.Atoi(c.Query("limit")); err == nil {
		filter.Limit = v
	}

	products, total, err := h.uc.GetProducts(filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"products": products,
		"total":    total,
		"page":     filter.Page,
		"limit":    filter.Limit,
	})
}

// GetProductByID godoc
// @Summary      Marketplace mahsulot batafsil
// @Description  Bitta marketplace mahsulotning to'liq ma'lumotlari
// @Tags         Marketplace - Catalog
// @Produce      json
// @Param        id path int true "Marketplace Product ID"
// @Success      200 {object} entity.MarketplaceProduct
// @Failure      404 {object} map[string]string
// @Router       /marketplace/products/{id} [get]
func (h *MarketplaceHandler) GetProductByID(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": i18n.Tc(c, i18n.MsgInvalidProductID)})
		return
	}

	product, err := h.uc.GetProductByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": i18n.Tc(c, i18n.MsgProductNotFound)})
		return
	}

	c.JSON(http.StatusOK, product)
}

// GetCategories godoc
// @Summary      Marketplace kategoriyalar ro'yxati
// @Description  Ko'rinadigan marketplace kategoriyalar
// @Tags         Marketplace - Catalog
// @Produce      json
// @Success      200 {array} entity.MarketplaceCategory
// @Router       /marketplace/categories [get]
func (h *MarketplaceHandler) GetCategories(c *gin.Context) {
	categories, err := h.uc.GetCategories()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, categories)
}

// GetBusinesses godoc
// @Summary      Bizneslar ro'yxati
// @Description  Barcha bizneslar (do'konlar)
// @Tags         Marketplace - Catalog
// @Produce      json
// @Success      200 {array} entity.Business
// @Router       /marketplace/businesses [get]
func (h *MarketplaceHandler) GetBusinesses(c *gin.Context) {
	businesses, err := h.uc.GetBusinesses()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, businesses)
}

// ==================== CART ENDPOINTS (Auth required) ====================

// GetCart godoc
// @Summary      Savatni ko'rish
// @Description  Joriy customer savatini mahsulotlar bilan ko'rish
// @Tags         Marketplace - Cart
// @Produce      json
// @Security     BearerAuth
// @Success      200 {object} entity.Cart
// @Router       /marketplace/cart [get]
func (h *MarketplaceHandler) GetCart(c *gin.Context) {
	customerID := c.GetInt("customerID")

	cart, err := h.uc.GetCart(customerID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, cart)
}

// AddToCart godoc
// @Summary      Savatga qo'shish
// @Description  Marketplace mahsulotni savatga qo'shish
// @Tags         Marketplace - Cart
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        request body entity.AddCartItemRequest true "Mahsulot va soni"
// @Success      201 {object} entity.CartItem
// @Failure      400 {object} map[string]string
// @Router       /marketplace/cart/items [post]
func (h *MarketplaceHandler) AddToCart(c *gin.Context) {
	customerID := c.GetInt("customerID")

	var req entity.AddCartItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	item, err := h.uc.AddToCart(customerID, &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, item)
}

// UpdateCartItem godoc
// @Summary      Savat elementini yangilash
// @Description  Savatdagi mahsulot sonini o'zgartirish
// @Tags         Marketplace - Cart
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id path int true "Cart Item ID"
// @Param        request body entity.UpdateCartItemRequest true "Yangi son"
// @Success      200 {object} map[string]string
// @Failure      400 {object} map[string]string
// @Router       /marketplace/cart/items/{id} [put]
func (h *MarketplaceHandler) UpdateCartItem(c *gin.Context) {
	customerID := c.GetInt("customerID")
	itemID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": i18n.Tc(c, i18n.MsgInvalidItemID)})
		return
	}

	var req entity.UpdateCartItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.uc.UpdateCartItem(customerID, itemID, req.Quantity); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": i18n.Tc(c, i18n.MsgCartItemUpdated)})
}

// RemoveCartItem godoc
// @Summary      Savatdan o'chirish
// @Description  Mahsulotni savatdan olib tashlash
// @Tags         Marketplace - Cart
// @Produce      json
// @Security     BearerAuth
// @Param        id path int true "Cart Item ID"
// @Success      200 {object} map[string]string
// @Router       /marketplace/cart/items/{id} [delete]
func (h *MarketplaceHandler) RemoveCartItem(c *gin.Context) {
	customerID := c.GetInt("customerID")
	itemID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": i18n.Tc(c, i18n.MsgInvalidItemID)})
		return
	}

	if err := h.uc.RemoveCartItem(customerID, itemID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": i18n.Tc(c, i18n.MsgCartItemRemoved)})
}

// ==================== ADDRESS ENDPOINTS (Auth required) ====================

// CreateAddress godoc
// @Summary      Manzil qo'shish
// @Description  Yangi yetkazib berish manzili qo'shish
// @Tags         Marketplace - Addresses
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        request body entity.CreateAddressRequest true "Manzil ma'lumotlari"
// @Success      201 {object} entity.Address
// @Failure      400 {object} map[string]string
// @Router       /marketplace/addresses [post]
func (h *MarketplaceHandler) CreateAddress(c *gin.Context) {
	customerID := c.GetInt("customerID")

	var req entity.CreateAddressRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	address, err := h.uc.CreateAddress(customerID, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, address)
}

// GetAddresses godoc
// @Summary      Manzillar ro'yxati
// @Description  Customer manzillari ro'yxati
// @Tags         Marketplace - Addresses
// @Produce      json
// @Security     BearerAuth
// @Success      200 {array} entity.Address
// @Router       /marketplace/addresses [get]
func (h *MarketplaceHandler) GetAddresses(c *gin.Context) {
	customerID := c.GetInt("customerID")

	addresses, err := h.uc.GetAddresses(customerID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, addresses)
}

// UpdateAddress godoc
// @Summary      Manzilni yangilash
// @Description  Mavjud manzilni yangilash
// @Tags         Marketplace - Addresses
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id path int true "Address ID"
// @Param        request body entity.UpdateAddressRequest true "Yangilanadigan maydonlar"
// @Success      200 {object} map[string]string
// @Failure      400 {object} map[string]string
// @Router       /marketplace/addresses/{id} [put]
func (h *MarketplaceHandler) UpdateAddress(c *gin.Context) {
	customerID := c.GetInt("customerID")
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": i18n.Tc(c, i18n.MsgInvalidAddressID)})
		return
	}

	var req entity.UpdateAddressRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.uc.UpdateAddress(id, customerID, &req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": i18n.Tc(c, i18n.MsgAddressUpdated)})
}

// DeleteAddress godoc
// @Summary      Manzilni o'chirish
// @Description  Manzilni o'chirib tashlash
// @Tags         Marketplace - Addresses
// @Produce      json
// @Security     BearerAuth
// @Param        id path int true "Address ID"
// @Success      200 {object} map[string]string
// @Router       /marketplace/addresses/{id} [delete]
func (h *MarketplaceHandler) DeleteAddress(c *gin.Context) {
	customerID := c.GetInt("customerID")
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": i18n.Tc(c, i18n.MsgInvalidAddressID)})
		return
	}

	if err := h.uc.DeleteAddress(id, customerID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": i18n.Tc(c, i18n.MsgAddressDeleted)})
}
