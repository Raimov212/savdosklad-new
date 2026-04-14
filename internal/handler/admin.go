package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"savdosklad/internal/entity"
	"savdosklad/internal/usecase"
	"savdosklad/pkg/i18n"
)

// AdminHandler handles admin-only operations
type AdminHandler struct {
	userUC   *usecase.UserUseCase
	regionUC *usecase.RegionUseCase
}

func NewAdminHandler(userUC *usecase.UserUseCase, regionUC *usecase.RegionUseCase) *AdminHandler {
	return &AdminHandler{userUC: userUC, regionUC: regionUC}
}

// SuperAdminOnly middleware — checks if user role is SuperAdmin (2)
func SuperAdminOnly() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("role")
		if !exists || role.(int) != entity.RoleSuperAdmin {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": i18n.Tc(c, "Admin huquqi kerak")})
			return
		}
		c.Next()
	}
}

// AdminOrAbove middleware — checks if user role is Admin (1) or SuperAdmin (2)
func AdminOrAbove() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("role")
		if !exists || role.(int) < entity.RoleAdmin {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": i18n.Tc(c, "Admin huquqi kerak")})
			return
		}
		c.Next()
	}
}

// ==================== USERS ====================

// @Summary Get all users (Admin only)
// @Tags Admin User Management
// @Security BearerAuth
// @Accept json
// @Produce json
// @Success 200 {array} entity.User
// @Router /admin/users [get]
func (h *AdminHandler) GetAllUsers(c *gin.Context) {
	users, err := h.userUC.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, users)
}

// @Summary Update user details/role/expiration
// @Tags Admin User Management
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param id path int true "User ID"
// @Param request body entity.UpdateUserRequest true "Update user request"
// @Success 200 {object} map[string]string
// @Router /admin/users/{id} [put]
func (h *AdminHandler) UpdateUser(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": i18n.Tc(c, "Noto'g'ri ID")})
		return
	}

	var req entity.UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.userUC.Update(id, req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": i18n.Tc(c, i18n.MsgUpdated)})
}

// @Summary Delete user
// @Tags Admin User Management
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param id path int true "User ID"
// @Success 200 {object} map[string]string
// @Router /admin/users/{id} [delete]
func (h *AdminHandler) DeleteUser(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": i18n.Tc(c, "Noto'g'ri ID")})
		return
	}

	if err := h.userUC.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": i18n.Tc(c, i18n.MsgDeleted)})
}

// @Summary Extend user subscription by username
// @Tags Admin User Management
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param request body entity.ExtendSubscriptionRequest true "Extend subscription request"
// @Success 200 {object} map[string]string
// @Router /admin/users/extend [post]
func (h *AdminHandler) ExtendSubscription(c *gin.Context) {
	var req entity.ExtendSubscriptionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.userUC.ExtendSubscription(req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Foydalanuvchi muddati uzaytirildi"})
}

// ==================== REGIONS ====================

// @Summary Create a region
// @Tags Admin Geography
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param request body entity.CreateRegionRequest true "Create region request"
// @Success 201 {object} map[string]int
// @Router /admin/regions [post]
func (h *AdminHandler) CreateRegion(c *gin.Context) {
	var req entity.CreateRegionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	id, err := h.regionUC.CreateRegion(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"id": id})
}

// @Summary Get all regions
// @Tags Admin Geography
// @Security BearerAuth
// @Accept json
// @Produce json
// @Success 200 {array} entity.Region
// @Router /admin/regions [get]
func (h *AdminHandler) GetRegions(c *gin.Context) {
	regions, err := h.regionUC.GetAllRegions()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, regions)
}

// @Summary Update region
// @Tags Admin Geography
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param id path int true "Region ID"
// @Param request body entity.UpdateRegionRequest true "Update region request"
// @Success 200 {object} map[string]string
// @Router /admin/regions/{id} [put]
func (h *AdminHandler) UpdateRegion(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": i18n.Tc(c, "Noto'g'ri ID")})
		return
	}

	var req entity.UpdateRegionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.regionUC.UpdateRegion(id, req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": i18n.Tc(c, "Viloyat yangilandi")})
}

// @Summary Delete region
// @Tags Admin Geography
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param id path int true "Region ID"
// @Success 200 {object} map[string]string
// @Router /admin/regions/{id} [delete]
func (h *AdminHandler) DeleteRegion(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": i18n.Tc(c, "Noto'g'ri ID")})
		return
	}

	if err := h.regionUC.DeleteRegion(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": i18n.Tc(c, "Viloyat o'chirildi")})
}

// ==================== DISTRICTS ====================

// @Summary Create a district
// @Tags Admin Geography
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param request body entity.CreateDistrictRequest true "Create district request"
// @Success 201 {object} map[string]int
// @Router /admin/districts [post]
func (h *AdminHandler) CreateDistrict(c *gin.Context) {
	var req entity.CreateDistrictRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	id, err := h.regionUC.CreateDistrict(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"id": id})
}

// @Summary Get all districts (optionally by regionId)
// @Tags Admin Geography
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param regionId query int false "Filter by Region ID"
// @Success 200 {array} entity.District
// @Router /admin/districts [get]
func (h *AdminHandler) GetDistricts(c *gin.Context) {
	regionIDStr := c.Query("regionId")
	if regionIDStr != "" {
		regionID, err := strconv.Atoi(regionIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": i18n.Tc(c, "Noto'g'ri regionId")})
			return
		}
		districts, err := h.regionUC.GetDistrictsByRegionID(regionID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, districts)
		return
	}

	districts, err := h.regionUC.GetAllDistricts()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, districts)
}

// @Summary Update district
// @Tags Admin Geography
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param id path int true "District ID"
// @Param request body entity.UpdateDistrictRequest true "Update district request"
// @Success 200 {object} map[string]string
// @Router /admin/districts/{id} [put]
func (h *AdminHandler) UpdateDistrict(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": i18n.Tc(c, "Noto'g'ri ID")})
		return
	}

	var req entity.UpdateDistrictRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.regionUC.UpdateDistrict(id, req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": i18n.Tc(c, "Tuman yangilandi")})
}

// @Summary Delete district
// @Tags Admin Geography
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param id path int true "District ID"
// @Success 200 {object} map[string]string
// @Router /admin/districts/{id} [delete]
func (h *AdminHandler) DeleteDistrict(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": i18n.Tc(c, "Noto'g'ri ID")})
		return
	}

	if err := h.regionUC.DeleteDistrict(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": i18n.Tc(c, "Tuman o'chirildi")})
}

// ==================== MARKETS ====================

// @Summary Create a market
// @Tags Admin Geography
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param request body entity.CreateMarketRequest true "Create market request"
// @Success 201 {object} map[string]int
// @Router /admin/markets [post]
func (h *AdminHandler) CreateMarket(c *gin.Context) {
	var req entity.CreateMarketRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	id, err := h.regionUC.CreateMarket(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"id": id})
}

// @Summary Get all markets (optionally by districtId)
// @Tags Admin Geography
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param districtId query int false "Filter by District ID"
// @Success 200 {array} entity.Market
// @Router /admin/markets [get]
func (h *AdminHandler) GetMarkets(c *gin.Context) {
	districtIDStr := c.Query("districtId")
	if districtIDStr != "" {
		districtID, err := strconv.Atoi(districtIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": i18n.Tc(c, "Noto'g'ri districtId")})
			return
		}
		markets, err := h.regionUC.GetMarketsByDistrictID(districtID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, markets)
		return
	}

	markets, err := h.regionUC.GetAllMarkets()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, markets)
}

// @Summary Update market
// @Tags Admin Geography
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param id path int true "Market ID"
// @Param request body entity.UpdateMarketRequest true "Update market request"
// @Success 200 {object} map[string]string
// @Router /admin/markets/{id} [put]
func (h *AdminHandler) UpdateMarket(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": i18n.Tc(c, "Noto'g'ri ID")})
		return
	}

	var req entity.UpdateMarketRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.regionUC.UpdateMarket(id, req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": i18n.Tc(c, "Bozor yangilandi")})
}

// @Summary Delete market
// @Tags Admin Geography
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param id path int true "Market ID"
// @Success 200 {object} map[string]string
// @Router /admin/markets/{id} [delete]
func (h *AdminHandler) DeleteMarket(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": i18n.Tc(c, "Noto'g'ri ID")})
		return
	}

	if err := h.regionUC.DeleteMarket(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": i18n.Tc(c, "Bozor o'chirildi")})
}
