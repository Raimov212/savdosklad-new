package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"savdosklad/internal/entity"
	"savdosklad/internal/usecase"
	"savdosklad/pkg/i18n"
)

type CashbackHandler struct {
	uc     *usecase.CashbackTierUseCase
	userUC *usecase.UserUseCase
}

func NewCashbackHandler(uc *usecase.CashbackTierUseCase, userUC *usecase.UserUseCase) *CashbackHandler {
	return &CashbackHandler{uc: uc, userUC: userUC}
}

func (h *CashbackHandler) checkPerm(c *gin.Context, bid int, action string) bool {
	if c.GetInt("role") >= 1 {
		return true
	}
	uid := c.GetInt("userID")
	has, err := h.userUC.HasPermission(uid, bid, action)
	if err != nil || !has {
		c.JSON(http.StatusForbidden, gin.H{"error": "Forbidden: No permission for this business"})
		return false
	}
	return true
}

func (h *CashbackHandler) CreateTier(c *gin.Context) {
	var req entity.CreateCashbackTierRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if !h.checkPerm(c, req.BusinessID, "edit") { // Usually settings are "edit" permission
		return
	}
	id, err := h.uc.Create(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"id": id})
}

func (h *CashbackHandler) GetTiersByBusinessID(c *gin.Context) {
	bid, _ := strconv.Atoi(c.Query("businessId"))
	list, err := h.uc.GetByBusinessID(bid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, list)
}

func (h *CashbackHandler) UpdateTier(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var req entity.UpdateCashbackTierRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	// We might need to fetch the tier to check business ID permission
	tier, err := h.uc.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tier not found"})
		return
	}
	if !h.checkPerm(c, tier.BusinessID, "edit") {
		return
	}

	if err := h.uc.Update(id, req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": i18n.Tc(c, i18n.MsgUpdated)})
}

func (h *CashbackHandler) DeleteTier(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	tier, err := h.uc.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tier not found"})
		return
	}
	if !h.checkPerm(c, tier.BusinessID, "edit") {
		return
	}

	if err := h.uc.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": i18n.Tc(c, i18n.MsgDeleted)})
}
