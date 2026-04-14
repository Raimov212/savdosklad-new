package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"savdosklad/internal/entity"
	"savdosklad/internal/usecase"
	"savdosklad/pkg/i18n"
)

type MarketplaceAdminHandler struct {
	uc *usecase.MarketplaceAdminUseCase
}

func NewMarketplaceAdminHandler(uc *usecase.MarketplaceAdminUseCase) *MarketplaceAdminHandler {
	return &MarketplaceAdminHandler{uc: uc}
}

// ==================== CATEGORIES ====================

// CreateCategory godoc
// @Summary      Marketplace kategoriya qo'shish
// @Description  Bazadagi kategoriyani marketplace-ga qo'shish
// @Tags         Admin - Marketplace Categories
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        request body entity.CreateMarketplaceCategoryRequest true "Kategoriya ma'lumotlari"
// @Success      201 {object} entity.MarketplaceCategory
// @Failure      400 {object} map[string]string
// @Router       /admin/marketplace/categories [post]
func (h *MarketplaceAdminHandler) CreateCategory(c *gin.Context) {
	var req entity.CreateMarketplaceCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	cat, err := h.uc.CreateCategory(&req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, cat)
}

// GetCategories godoc
// @Summary      Marketplace kategoriyalar ro'yxati
// @Tags         Admin - Marketplace Categories
// @Security     BearerAuth
// @Produce      json
// @Success      200 {array} entity.MarketplaceCategory
// @Router       /admin/marketplace/categories [get]
func (h *MarketplaceAdminHandler) GetCategories(c *gin.Context) {
	categories, err := h.uc.GetAllCategories()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, categories)
}

// GetCategoryByID godoc
// @Summary      Marketplace kategoriya ID bo'yicha
// @Tags         Admin - Marketplace Categories
// @Security     BearerAuth
// @Param        id path int true "Category ID"
// @Success      200 {object} entity.MarketplaceCategory
// @Router       /admin/marketplace/categories/{id} [get]
func (h *MarketplaceAdminHandler) GetCategoryByID(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": i18n.Tc(c, i18n.MsgInvalidID)})
		return
	}
	cat, err := h.uc.GetCategoryByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": i18n.Tc(c, i18n.MsgNotFound)})
		return
	}
	c.JSON(http.StatusOK, cat)
}

// UpdateCategory godoc
// @Summary      Marketplace kategoriya yangilash
// @Tags         Admin - Marketplace Categories
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        id path int true "Category ID"
// @Param        request body entity.UpdateMarketplaceCategoryRequest true "Yangilanadigan maydonlar"
// @Success      200 {object} map[string]string
// @Router       /admin/marketplace/categories/{id} [put]
func (h *MarketplaceAdminHandler) UpdateCategory(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": i18n.Tc(c, i18n.MsgInvalidID)})
		return
	}

	var req entity.UpdateMarketplaceCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.uc.UpdateCategory(id, &req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": i18n.Tc(c, i18n.MsgUpdated)})
}

// DeleteCategory godoc
// @Summary      Marketplace kategoriya o'chirish
// @Tags         Admin - Marketplace Categories
// @Security     BearerAuth
// @Param        id path int true "Category ID"
// @Success      200 {object} map[string]string
// @Router       /admin/marketplace/categories/{id} [delete]
func (h *MarketplaceAdminHandler) DeleteCategory(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": i18n.Tc(c, i18n.MsgInvalidID)})
		return
	}

	if err := h.uc.DeleteCategory(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": i18n.Tc(c, i18n.MsgDeleted)})
}

// ==================== PRODUCTS ====================

// CreateProduct godoc
// @Summary      Marketplace mahsulot qo'shish
// @Description  Bazadagi mahsulotni marketplace-ga qo'shish (miqdor sinxronizatsiyasi)
// @Tags         Admin - Marketplace Products
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        request body entity.CreateMarketplaceProductRequest true "Mahsulot ma'lumotlari"
// @Success      201 {object} entity.MarketplaceProduct
// @Failure      400 {object} map[string]string
// @Router       /admin/marketplace/products [post]
func (h *MarketplaceAdminHandler) CreateProduct(c *gin.Context) {
	var req entity.CreateMarketplaceProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	product, err := h.uc.CreateProduct(&req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, product)
}

// GetProducts godoc
// @Summary      Marketplace mahsulotlar ro'yxati
// @Tags         Admin - Marketplace Products
// @Security     BearerAuth
// @Produce      json
// @Success      200 {array} entity.MarketplaceProduct
// @Router       /admin/marketplace/products [get]
func (h *MarketplaceAdminHandler) GetProducts(c *gin.Context) {
	products, err := h.uc.GetAllProducts()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, products)
}

// GetProductByID godoc
// @Summary      Marketplace mahsulot ID bo'yicha
// @Tags         Admin - Marketplace Products
// @Security     BearerAuth
// @Param        id path int true "Product ID"
// @Success      200 {object} entity.MarketplaceProduct
// @Router       /admin/marketplace/products/{id} [get]
func (h *MarketplaceAdminHandler) GetProductByID(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": i18n.Tc(c, i18n.MsgInvalidID)})
		return
	}
	product, err := h.uc.GetProductByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": i18n.Tc(c, i18n.MsgProductNotFound)})
		return
	}
	c.JSON(http.StatusOK, product)
}

// UpdateProduct godoc
// @Summary      Marketplace mahsulot yangilash
// @Description  Miqdor o'zgarganda asosiy bazadan sinxronizatsiya qilinadi
// @Tags         Admin - Marketplace Products
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        id path int true "Product ID"
// @Param        request body entity.UpdateMarketplaceProductRequest true "Yangilanadigan maydonlar"
// @Success      200 {object} map[string]string
// @Router       /admin/marketplace/products/{id} [put]
func (h *MarketplaceAdminHandler) UpdateProduct(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": i18n.Tc(c, i18n.MsgInvalidID)})
		return
	}

	var req entity.UpdateMarketplaceProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.uc.UpdateProduct(id, &req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": i18n.Tc(c, i18n.MsgUpdated)})
}

// DeleteProduct godoc
// @Summary      Marketplace mahsulot o'chirish
// @Description  O'chirilganda miqdor asosiy bazaga qaytariladi
// @Tags         Admin - Marketplace Products
// @Security     BearerAuth
// @Param        id path int true "Product ID"
// @Success      200 {object} map[string]string
// @Router       /admin/marketplace/products/{id} [delete]
func (h *MarketplaceAdminHandler) DeleteProduct(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": i18n.Tc(c, i18n.MsgInvalidID)})
		return
	}

	if err := h.uc.DeleteProduct(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": i18n.Tc(c, i18n.MsgDeleted)})
}
