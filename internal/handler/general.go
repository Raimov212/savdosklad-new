package handler

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"

	"savdosklad/internal/entity"
	"savdosklad/internal/usecase"
	"savdosklad/pkg/i18n"
)

type BusinessHandler struct{ uc *usecase.BusinessUseCase }

func NewBusinessHandler(uc *usecase.BusinessUseCase) *BusinessHandler {
	return &BusinessHandler{uc: uc}
}

// @Summary Create business
// @Tags Businesses
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param input body entity.CreateBusinessRequest true "Create"
// @Success 201 {object} map[string]int
// @Router /businesses [post]
func (h *BusinessHandler) Create(c *gin.Context) {
	if c.GetInt("role") < 1 {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only admins can create businesses"})
		return
	}
	var req entity.CreateBusinessRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	userID := c.GetInt("userID")
	id, err := h.uc.Create(userID, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"id": id})
}

// @Summary Get all businesses
// @Tags Businesses
// @Security BearerAuth
// @Produce json
// @Success 200 {array} entity.Business
// @Router /businesses [get]
func (h *BusinessHandler) GetAll(c *gin.Context) {
	list, err := h.uc.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, list)
}

// @Summary Get business by ID
// @Tags Businesses
// @Security BearerAuth
// @Param id path int true "Business ID"
// @Success 200 {object} entity.Business
// @Router /businesses/{id} [get]
func (h *BusinessHandler) GetByID(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	b, err := h.uc.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": i18n.Tc(c, i18n.MsgNotFound)})
		return
	}
	c.JSON(http.StatusOK, b)
}

// @Summary Get businesses by user
// @Tags Businesses
// @Security BearerAuth
// @Success 200 {array} entity.Business
// @Router /businesses/my [get]
func (h *BusinessHandler) GetMy(c *gin.Context) {
	uid := c.GetInt("userID")
	list, err := h.uc.GetByUserID(uid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, list)
}

// @Summary Update business
// @Tags Businesses
// @Security BearerAuth
// @Param id path int true "ID"
// @Param input body entity.UpdateBusinessRequest true "Update"
// @Success 200 {object} map[string]string
// @Router /businesses/{id} [put]
func (h *BusinessHandler) Update(c *gin.Context) {
	if c.GetInt("role") < 1 {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only admins can update businesses"})
		return
	}
	id, _ := strconv.Atoi(c.Param("id"))
	var req entity.UpdateBusinessRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.uc.Update(id, req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": i18n.Tc(c, i18n.MsgUpdated)})
}

// @Summary Delete business
// @Tags Businesses
// @Security BearerAuth
// @Param id path int true "ID"
// @Success 200 {object} map[string]string
// @Router /businesses/{id} [delete]
func (h *BusinessHandler) Delete(c *gin.Context) {
	if c.GetInt("role") < 1 {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only admins can delete businesses"})
		return
	}
	id, _ := strconv.Atoi(c.Param("id"))
	if err := h.uc.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": i18n.Tc(c, i18n.MsgDeleted)})
}

// ---- Category Handler ----
type CategoryHandler struct {
	uc     *usecase.CategoryUseCase
	userUC *usecase.UserUseCase
}

func NewCategoryHandler(uc *usecase.CategoryUseCase, userUC *usecase.UserUseCase) *CategoryHandler {
	return &CategoryHandler{uc: uc, userUC: userUC}
}

func (h *CategoryHandler) checkPerm(c *gin.Context, bid int, action string) bool {
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

// @Summary Create category
// @Tags Categories
// @Security BearerAuth
// @Param input body entity.CreateCategoryRequest true "Create"
// @Success 201 {object} map[string]int
// @Router /categories [post]
func (h *CategoryHandler) Create(c *gin.Context) {
	var req entity.CreateCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if !h.checkPerm(c, req.BusinessID, "add") {
		return
	}
	id, err := h.uc.Create(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"id": id})
}

// @Summary Get categories by business
// @Tags Categories
// @Security BearerAuth
// @Param businessId query int true "Business ID"
// @Success 200 {array} entity.Category
// @Router /categories [get]
func (h *CategoryHandler) GetByBusinessID(c *gin.Context) {
	bid, _ := strconv.Atoi(c.Query("businessId"))
	list, err := h.uc.GetByBusinessID(bid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, list)
}

// @Summary Update category
// @Tags Categories
// @Security BearerAuth
// @Param id path int true "ID"
// @Param input body entity.UpdateCategoryRequest true "Update"
// @Success 200 {object} map[string]string
// @Router /categories/{id} [put]
func (h *CategoryHandler) Update(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var req entity.UpdateCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if req.BusinessID != 0 && !h.checkPerm(c, req.BusinessID, "edit") {
		return
	}
	if err := h.uc.Update(id, req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": i18n.Tc(c, i18n.MsgUpdated)})
}

// @Summary Delete category
// @Tags Categories
// @Security BearerAuth
// @Param id path int true "ID"
// @Param businessId query int true "Business ID"
// @Success 200 {object} map[string]string
// @Router /categories/{id} [delete]
func (h *CategoryHandler) Delete(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	bid, _ := strconv.Atoi(c.Query("businessId"))
	if bid != 0 && !h.checkPerm(c, bid, "delete") {
		return
	}
	if err := h.uc.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": i18n.Tc(c, i18n.MsgDeleted)})
}

// ---- Product Handler ----
type ProductHandler struct {
	uc     *usecase.ProductUseCase
	userUC *usecase.UserUseCase
}

func NewProductHandler(uc *usecase.ProductUseCase, userUC *usecase.UserUseCase) *ProductHandler {
	return &ProductHandler{uc: uc, userUC: userUC}
}

func (h *ProductHandler) checkPerm(c *gin.Context, bid int, action string) bool {
	role := c.GetInt("role")
	if role >= 1 {
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

// @Summary Create product
// @Tags Products
// @Security BearerAuth
// @Param input body entity.CreateProductRequest true "Create"
// @Success 201 {object} map[string]int
// @Router /products [post]
func (h *ProductHandler) Create(c *gin.Context) {
	var req entity.CreateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if !h.checkPerm(c, req.BusinessID, "add") {
		return
	}
	id, err := h.uc.Create(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"id": id})
}

// @Summary Get products by business
// @Tags Products
// @Security BearerAuth
// @Param businessId query int true "Business ID"
// @Success 200 {array} entity.Product
// @Router /products [get]
func (h *ProductHandler) GetByBusinessID(c *gin.Context) {
	idsStr := c.Query("ids")
	if idsStr != "" {
		fmt.Printf("Fetching products by IDs: %s\n", idsStr)
		var ids []int
		for _, s := range strings.Split(idsStr, ",") {
			s = strings.TrimSpace(s)
			if s == "" {
				continue
			}
			id, _ := strconv.Atoi(s)
			if id > 0 {
				ids = append(ids, id)
			}
		}
		list, err := h.uc.GetByIDs(ids)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		fmt.Printf("Found %d products for IDs %v\n", len(list), ids)
		c.JSON(http.StatusOK, list)
		return
	}

	bid, _ := strconv.Atoi(c.Query("businessId"))
	list, err := h.uc.GetByBusinessID(bid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, list)
}

// @Summary Get all user's products
// @Tags Products
// @Security BearerAuth
// @Success 200 {array} entity.Product
// @Router /products/my [get]
func (h *ProductHandler) GetMyProducts(c *gin.Context) {
	uid := c.MustGet("userID").(int)
	list, err := h.uc.GetByUserID(uid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, list)
}

// @Summary Search products
// @Tags Products
// @Security BearerAuth
// @Param businessId query int false "Business ID"
// @Param q query string true "Query"
// @Success 200 {array} entity.Product
// @Router /products/search [get]
func (h *ProductHandler) Search(c *gin.Context) {
	bid, _ := strconv.Atoi(c.Query("businessId"))
	query := c.Query("q")
	var list []entity.Product
	var err error
	if bid != 0 {
		list, err = h.uc.Search(bid, query)
	} else {
		uid := c.MustGet("userID").(int)
		list, err = h.uc.SearchByUserID(uid, query)
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, list)
}

// @Summary Get product by ID
// @Tags Products
// @Security BearerAuth
// @Param id path int true "ID"
// @Success 200 {object} entity.Product
// @Router /products/{id} [get]
func (h *ProductHandler) GetByID(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	p, err := h.uc.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": i18n.Tc(c, i18n.MsgNotFound)})
		return
	}
	c.JSON(http.StatusOK, p)
}

// @Summary Update product
// @Tags Products
// @Security BearerAuth
// @Param id path int true "ID"
// @Param input body entity.UpdateProductRequest true "Update"
// @Success 200 {object} map[string]string
// @Router /products/{id} [put]
func (h *ProductHandler) Update(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var req entity.UpdateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.uc.Update(id, req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": i18n.Tc(c, i18n.MsgUpdated)})
}

// @Summary Delete product
// @Tags Products
// @Security BearerAuth
// @Param id path int true "ID"
// @Success 200 {object} map[string]string
// @Router /products/{id} [delete]
func (h *ProductHandler) Delete(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	p, err := h.uc.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": i18n.Tc(c, i18n.MsgNotFound)})
		return
	}
	if !h.checkPerm(c, p.BusinessID, "delete") {
		return
	}
	if err := h.uc.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": i18n.Tc(c, i18n.MsgDeleted)})
}

// @Summary Bulk delete products
// @Tags Products
// @Security BearerAuth
// @Param businessId query int true "Business ID"
// @Param categoryId query int false "Category ID"
// @Success 200 {object} map[string]string
// @Router /products/bulk [delete]
func (h *ProductHandler) BulkDelete(c *gin.Context) {
	bid, _ := strconv.Atoi(c.Query("businessId"))
	if bid == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "businessId is required"})
		return
	}

	var cidPtr *int
	cidStr := c.Query("categoryId")
	if cidStr != "" {
		cid, _ := strconv.Atoi(cidStr)
		cidPtr = &cid
	}

	var pIds []int
	idsStr := c.Query("ids")
	if idsStr != "" {
		for _, s := range strings.Split(idsStr, ",") {
			id, _ := strconv.Atoi(s)
			if id > 0 {
				pIds = append(pIds, id)
			}
		}
	}

	if err := h.uc.BulkDelete(bid, cidPtr, pIds); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": i18n.Tc(c, i18n.MsgDeleted)})
}

func (h *ProductHandler) CreateBulkDeleteRequest(c *gin.Context) {
	var req entity.BulkDeleteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	req.CreatedBy = c.GetInt("userID")
	id, err := h.uc.CreateBulkDeleteRequest(&req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"id": id, "message": "Request sent for approval"})
}

func (h *ProductHandler) GetBulkDeleteRequests(c *gin.Context) {
	if c.GetInt("role") < 2 {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}
	list, err := h.uc.GetBulkDeleteRequests()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, list)
}

func (h *ProductHandler) ApproveBulkDeleteRequest(c *gin.Context) {
	if c.GetInt("role") < 2 {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}
	id, _ := strconv.Atoi(c.Param("id"))
	status := c.Query("status") // approved or rejected

	if status == "approved" {
		// Fetch request details (I'll need a GetBulkDeleteRequestByID repo method, or just do it simple)
		// For now, I'll assume the client sends the data back or I fetch it.
		// Actually, I'll just implement a simple GetByID for requests.
	}
	
	if err := h.uc.UpdateBulkDeleteRequestStatus(id, status); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Status updated"})
}


// ---- Client Handler ----
type ClientHandler struct {
	uc     *usecase.ClientUseCase
	userUC *usecase.UserUseCase
}

func NewClientHandler(uc *usecase.ClientUseCase, userUC *usecase.UserUseCase) *ClientHandler {
	return &ClientHandler{uc: uc, userUC: userUC}
}

func (h *ClientHandler) checkPerm(c *gin.Context, bid int, action string) bool {
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

// @Summary Create client
// @Tags Clients
// @Security BearerAuth
// @Param input body entity.CreateClientRequest true "Create"
// @Success 201 {object} map[string]int
// @Router /clients [post]
func (h *ClientHandler) Create(c *gin.Context) {
	var req entity.CreateClientRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if req.BusinessID != 0 && !h.checkPerm(c, req.BusinessID, "add") {
		return
	}
	id, err := h.uc.Create(req)
	if err != nil {
		if strings.Contains(err.Error(), "belongs to a staff member") {
			c.JSON(http.StatusBadRequest, gin.H{"error": i18n.Tc(c, i18n.MsgClientPhoneIsUser)})
			return
		}
		if strings.Contains(err.Error(), "clients_business_phone_unique") || strings.Contains(err.Error(), "clients_phone_unique") {
			c.JSON(http.StatusBadRequest, gin.H{"error": i18n.Tc(c, i18n.MsgPhoneAlreadyRegistered)})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"id": id})
}

// @Summary Get clients by business
// @Tags Clients
// @Security BearerAuth
// @Param businessId query int true "Business ID"
// @Success 200 {array} entity.Client
// @Router /clients [get]
func (h *ClientHandler) GetByBusinessID(c *gin.Context) {
	bid, _ := strconv.Atoi(c.Query("businessId"))
	list, err := h.uc.GetByBusinessID(bid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, list)
}

// @Summary Update client
// @Tags Clients
// @Security BearerAuth
// @Param id path int true "ID"
// @Param input body entity.UpdateClientRequest true "Update"
// @Success 200 {object} map[string]string
// @Router /clients/{id} [put]
func (h *ClientHandler) Update(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var req entity.UpdateClientRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if req.BusinessID != 0 && !h.checkPerm(c, req.BusinessID, "edit") {
		return
	}
	if err := h.uc.Update(id, req); err != nil {
		if strings.Contains(err.Error(), "belongs to a staff member") {
			c.JSON(http.StatusBadRequest, gin.H{"error": i18n.Tc(c, i18n.MsgClientPhoneIsUser)})
			return
		}
		if strings.Contains(err.Error(), "clients_business_phone_unique") || strings.Contains(err.Error(), "clients_phone_unique") {
			c.JSON(http.StatusBadRequest, gin.H{"error": i18n.Tc(c, i18n.MsgPhoneAlreadyRegistered)})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": i18n.Tc(c, i18n.MsgUpdated)})
}

// @Summary Delete client
// @Tags Clients
// @Security BearerAuth
// @Param id path int true "ID"
// @Param businessId query int true "Business ID"
// @Success 200 {object} map[string]string
// @Router /clients/{id} [delete]
func (h *ClientHandler) Delete(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	bid, _ := strconv.Atoi(c.Query("businessId"))
	if bid != 0 && !h.checkPerm(c, bid, "delete") {
		return
	}
	if err := h.uc.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": i18n.Tc(c, i18n.MsgDeleted)})
}

// ---- Transaction Handler ----
type TransactionHandler struct {
	uc     *usecase.TransactionUseCase
	userUC *usecase.UserUseCase
}

func NewTransactionHandler(uc *usecase.TransactionUseCase, userUC *usecase.UserUseCase) *TransactionHandler {
	return &TransactionHandler{uc: uc, userUC: userUC}
}

func (h *TransactionHandler) checkPerm(c *gin.Context, bid int, action string) bool {
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

// @Summary Create sale (total transaction + items)
// @Tags Transactions
// @Security BearerAuth
// @Param input body entity.CreateTotalTransactionRequest true "Create"
// @Success 201 {object} map[string]int
// @Router /transactions [post]
func (h *TransactionHandler) Create(c *gin.Context) {
	var req entity.CreateTotalTransactionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	userID := c.GetInt("userID")
	id, err := h.uc.CreateSale(userID, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"id": id})
}

// @Summary Get transactions by business
// @Tags Transactions
// @Security BearerAuth
// @Param businessId query int true "Business ID"
// @Success 200 {array} entity.TotalTransaction
// @Router /transactions [get]
func (h *TransactionHandler) GetByBusinessID(c *gin.Context) {
	bid, _ := strconv.Atoi(c.Query("businessId"))
	startStr := c.Query("startDate")
	endStr := c.Query("endDate")

	if startStr != "" && endStr != "" {
		start, errS := time.Parse("2006-01-02", startStr)
		end, errE := time.Parse("2006-01-02", endStr)
		if errS == nil && errE == nil {
			// Set end to end of day
			end = time.Date(end.Year(), end.Month(), end.Day(), 23, 59, 59, 0, end.Location())
			list, err := h.uc.GetByPeriod(bid, start, end)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			c.JSON(http.StatusOK, list)
			return
		}
	}

	list, err := h.uc.GetByBusinessID(bid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, list)
}

// @Summary Get transaction items
// @Tags Transactions
// @Security BearerAuth
// @Param id path int true "Total Transaction ID"
// @Success 200 {array} entity.Transaction
// @Router /transactions/{id}/items [get]
func (h *TransactionHandler) GetItems(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	list, err := h.uc.GetItems(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, list)
}

// @Summary Update total transaction (totals/payments)
// @Tags Transactions
// @Security BearerAuth
// @Param id path int true "Total Transaction ID"
// @Param input body entity.UpdateTotalTransactionRequest true "Update"
// @Success 200 {object} map[string]string
// @Router /transactions/{id} [put]
func (h *TransactionHandler) Update(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var req entity.UpdateTotalTransactionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.uc.UpdateSale(id, req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": i18n.Tc(c, i18n.MsgUpdated)})
}

// @Summary Add items to transaction
// @Tags Transactions
// @Security BearerAuth
// @Param id path int true "Total Transaction ID"
// @Param businessId query int true "Business ID"
// @Param input body []entity.CreateTransactionItemRequest true "Items"
// @Success 200 {object} map[string]string
// @Router /transactions/{id}/items [post]
func (h *TransactionHandler) AddItems(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	bid, _ := strconv.Atoi(c.Query("businessId"))
	var items []entity.CreateTransactionItemRequest
	if err := c.ShouldBindJSON(&items); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.uc.AddItemsToSale(id, bid, items); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": i18n.Tc(c, i18n.MsgUpdated)})
}

// @Summary Send transaction receipt to customer via Telegram
// @Tags Transactions
// @Security BearerAuth
// @Param id path int true "Total Transaction ID"
// @Param pdf formData file false "PDF file"
// @Param image formData file false "Image file"
// @Success 200 {object} map[string]string
// @Router /transactions/{id}/send-telegram [post]
func (h *TransactionHandler) SendTelegram(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	var pdfBytes, imgBytes []byte

	pdfFile, _ := c.FormFile("pdf")
	if pdfFile != nil {
		f, _ := pdfFile.Open()
		defer f.Close()
		buf := make([]byte, pdfFile.Size)
		_, _ = f.Read(buf)
		pdfBytes = buf
	}

	imgFile, _ := c.FormFile("image")
	if imgFile != nil {
		f, _ := imgFile.Open()
		defer f.Close()
		buf := make([]byte, imgFile.Size)
		_, _ = f.Read(buf)
		imgBytes = buf
	}

	if err := h.uc.SendReceipt(id, pdfBytes, imgBytes); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Sent successfully"})
}

// ---- Refund Handler ----
type RefundHandler struct {
	uc     *usecase.RefundUseCase
	userUC *usecase.UserUseCase
}

func NewRefundHandler(uc *usecase.RefundUseCase, userUC *usecase.UserUseCase) *RefundHandler {
	return &RefundHandler{uc: uc, userUC: userUC}
}

func (h *RefundHandler) checkPerm(c *gin.Context, bid int, action string) bool {
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

// @Summary Create refund
// @Tags Refunds
// @Security BearerAuth
// @Param input body entity.CreateTotalRefundRequest true "Create"
// @Success 201 {object} map[string]int
// @Router /refunds [post]
func (h *RefundHandler) Create(c *gin.Context) {
	var req entity.CreateTotalRefundRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if req.BusinessID != 0 && !h.checkPerm(c, req.BusinessID, "add") {
		return
	}
	userID := c.GetInt("userID")
	id, err := h.uc.Create(userID, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"id": id})
}

// @Summary Get refunds by business
// @Tags Refunds
// @Security BearerAuth
// @Param businessId query int true "Business ID"
// @Success 200 {array} entity.TotalRefund
// @Router /refunds [get]
func (h *RefundHandler) GetByBusinessID(c *gin.Context) {
	bid, _ := strconv.Atoi(c.Query("businessId"))
	startStr := c.Query("startDate")
	endStr := c.Query("endDate")

	if startStr != "" && endStr != "" {
		start, errS := time.Parse("2006-01-02", startStr)
		end, errE := time.Parse("2006-01-02", endStr)
		if errS == nil && errE == nil {
			end = time.Date(end.Year(), end.Month(), end.Day(), 23, 59, 59, 0, end.Location())
			list, err := h.uc.GetByPeriod(bid, start, end)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			c.JSON(http.StatusOK, list)
			return
		}
	}

	list, err := h.uc.GetByBusinessID(bid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, list)
}

// @Summary Get refund items
// @Tags Refunds
// @Security BearerAuth
// @Param id path int true "Total Refund ID"
// @Success 200 {array} entity.Refund
// @Router /refunds/{id}/items [get]
func (h *RefundHandler) GetItems(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	list, err := h.uc.GetItems(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, list)
}

// ---- Expense Handler ----
type ExpenseHandler struct {
	uc     *usecase.ExpenseUseCase
	userUC *usecase.UserUseCase
}

func NewExpenseHandler(uc *usecase.ExpenseUseCase, userUC *usecase.UserUseCase) *ExpenseHandler {
	return &ExpenseHandler{uc: uc, userUC: userUC}
}

func (h *ExpenseHandler) checkPerm(c *gin.Context, bid int, action string) bool {
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

// @Summary Create total expense
// @Tags Expenses
// @Security BearerAuth
// @Param input body entity.CreateTotalExpenseRequest true "Create"
// @Success 201 {object} map[string]int
// @Router /expenses [post]
func (h *ExpenseHandler) Create(c *gin.Context) {
	var req entity.CreateTotalExpenseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if req.BusinessID != 0 && !h.checkPerm(c, req.BusinessID, "add") {
		return
	}
	userID := c.GetInt("userID")
	id, err := h.uc.CreateTotalExpense(userID, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"id": id})
}

// @Summary Get expenses by business
// @Tags Expenses
// @Security BearerAuth
// @Param businessId query int true "Business ID"
// @Success 200 {array} entity.TotalExpense
// @Router /expenses [get]
func (h *ExpenseHandler) GetByBusinessID(c *gin.Context) {
	bid, _ := strconv.Atoi(c.Query("businessId"))
	startStr := c.Query("startDate")
	endStr := c.Query("endDate")

	if startStr != "" && endStr != "" {
		start, errS := time.Parse("2006-01-02", startStr)
		end, errE := time.Parse("2006-01-02", endStr)
		if errS == nil && errE == nil {
			end = time.Date(end.Year(), end.Month(), end.Day(), 23, 59, 59, 0, end.Location())
			list, err := h.uc.GetByPeriod(bid, start, end)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			c.JSON(http.StatusOK, list)
			return
		}
	}

	list, err := h.uc.GetTotalExpensesByBusinessID(bid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, list)
}

// @Summary Create fixed cost
// @Tags FixedCosts
// @Security BearerAuth
// @Param input body entity.CreateFixedCostRequest true "Create"
// @Success 201 {object} map[string]int
// @Router /fixed-costs [post]
func (h *ExpenseHandler) CreateFixedCost(c *gin.Context) {
	var req entity.CreateFixedCostRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	id, err := h.uc.CreateFixedCost(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"id": id})
}

// @Summary Get fixed costs by business
// @Tags FixedCosts
// @Security BearerAuth
// @Param businessId query int true "Business ID"
// @Success 200 {array} entity.FixedCost
// @Router /fixed-costs [get]
func (h *ExpenseHandler) GetFixedCostsByBusinessID(c *gin.Context) {
	bid, _ := strconv.Atoi(c.Query("businessId"))
	list, err := h.uc.GetFixedCostsByBusinessID(bid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, list)
}

// @Summary Update fixed cost
// @Tags FixedCosts
// @Security BearerAuth
// @Param id path int true "ID"
// @Param input body entity.UpdateFixedCostRequest true "Update"
// @Success 200 {object} map[string]string
// @Router /fixed-costs/{id} [put]
func (h *ExpenseHandler) UpdateFixedCost(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var req entity.UpdateFixedCostRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.uc.UpdateFixedCost(id, req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": i18n.Tc(c, i18n.MsgUpdated)})
}

// ---- Money Handler ----
type MoneyHandler struct{ uc *usecase.MoneyUseCase }

func NewMoneyHandler(uc *usecase.MoneyUseCase) *MoneyHandler { return &MoneyHandler{uc: uc} }

// @Summary Create money movement
// @Tags Money
// @Security BearerAuth
// @Param input body entity.CreateMoneyRequest true "Create"
// @Success 201 {object} map[string]int
// @Router /money [post]
func (h *MoneyHandler) Create(c *gin.Context) {
	var req entity.CreateMoneyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	id, err := h.uc.Create(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"id": id})
}

// @Summary Get money by business
// @Tags Money
// @Security BearerAuth
// @Param businessId query int true "Business ID"
// @Success 200 {array} entity.Money
// @Router /money [get]
func (h *MoneyHandler) GetByBusinessID(c *gin.Context) {
	bid, _ := strconv.Atoi(c.Query("businessId"))
	list, err := h.uc.GetByBusinessID(bid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, list)
}

// ---- Calculation Handler ----
type CalculationHandler struct{ uc *usecase.CalculationUseCase }

func NewCalculationHandler(uc *usecase.CalculationUseCase) *CalculationHandler {
	return &CalculationHandler{uc: uc}
}

func (h *CalculationHandler) GetStats(c *gin.Context) {
	bid, _ := strconv.Atoi(c.Query("businessId"))
	month, _ := strconv.Atoi(c.Query("month"))
	year, _ := strconv.Atoi(c.Query("year"))

	stats, err := h.uc.GetStats(bid, month, year)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, stats)
}

// @Summary Create calculation
// @Tags Calculations
// @Security BearerAuth
// @Param input body entity.CreateCalculationRequest true "Create"
// @Success 201 {object} map[string]int
// @Router /calculations [post]
func (h *CalculationHandler) Create(c *gin.Context) {
	var req entity.CreateCalculationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	id, err := h.uc.Create(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"id": id})
}

// @Summary Get calculations by business
// @Tags Calculations
// @Security BearerAuth
// @Param businessId query int true "Business ID"
// @Success 200 {array} entity.Calculation
// @Router /calculations [get]
func (h *CalculationHandler) GetByBusinessID(c *gin.Context) {
	bid, _ := strconv.Atoi(c.Query("businessId"))
	list, err := h.uc.GetByBusinessID(bid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, list)
}
func RegisterRoutes(
	r *gin.RouterGroup,
	userH *UserHandler,
	businessH *BusinessHandler,
	categoryH *CategoryHandler,
	productH *ProductHandler,
	clientH *ClientHandler,
	transactionH *TransactionHandler,
	refundH *RefundHandler,
	expenseH *ExpenseHandler,
	moneyH *MoneyHandler,
	calculationH *CalculationHandler,
	organizationH *OrganizationHandler,
	salaryH *SalaryHandler,
) {
	// User Handlers
	r.GET("/users", userH.GetAll)
	r.GET("/users/my-employees", userH.GetMyEmployees)
	r.POST("/users/employees", userH.CreateEmployee)
	r.POST("/users/telegram-link", userH.GenerateTelegramLink)
	r.GET("/users/:id", userH.GetByID)
	r.PUT("/users/:id", userH.Update)
	r.DELETE("/users/:id", userH.Delete)

	// Business Handlers
	r.POST("/businesses", businessH.Create)
	r.GET("/businesses", businessH.GetAll)
	r.GET("/businesses/my", businessH.GetMy)
	r.GET("/businesses/:id", businessH.GetByID)
	r.PUT("/businesses/:id", businessH.Update)
	r.DELETE("/businesses/:id", businessH.Delete)

	// Category Handlers
	r.POST("/categories", categoryH.Create)
	r.GET("/categories", categoryH.GetByBusinessID)
	r.PUT("/categories/:id", categoryH.Update)
	r.DELETE("/categories/:id", categoryH.Delete)

	// Product Handlers
	r.POST("/products", productH.Create)
	r.GET("/products", productH.GetByBusinessID)
	r.GET("/products/my", productH.GetMyProducts)
	r.GET("/products/search", productH.Search)
	r.GET("/products/:id", productH.GetByID)
	r.PUT("/products/:id", productH.Update)
	r.DELETE("/products/:id", productH.Delete)
	r.DELETE("/products/bulk", productH.BulkDelete)
	r.POST("/products/bulk/request", productH.CreateBulkDeleteRequest)
	r.GET("/products/bulk/requests", productH.GetBulkDeleteRequests)
	r.POST("/products/bulk/requests/:id/status", productH.ApproveBulkDeleteRequest)

	// Client Handlers
	r.POST("/clients", clientH.Create)
	r.GET("/clients", clientH.GetByBusinessID)
	r.PUT("/clients/:id", clientH.Update)
	r.DELETE("/clients/:id", clientH.Delete)

	// Transaction Handlers
	r.POST("/transactions", transactionH.Create)
	r.GET("/transactions", transactionH.GetByBusinessID)
	r.PUT("/transactions/:id", transactionH.Update)
	r.GET("/transactions/:id/items", transactionH.GetItems)
	r.POST("/transactions/:id/items", transactionH.AddItems)
	r.POST("/transactions/:id/send-telegram", transactionH.SendTelegram)

	// Refund Handlers
	r.POST("/refunds", refundH.Create)
	r.GET("/refunds", refundH.GetByBusinessID)
	r.GET("/refunds/:id/items", refundH.GetItems)
	// Expense Handlers
	r.POST("/expenses", expenseH.Create)
	r.GET("/expenses", expenseH.GetByBusinessID)
	r.POST("/fixed-costs", expenseH.CreateFixedCost)
	r.GET("/fixed-costs", expenseH.GetFixedCostsByBusinessID)
	r.PUT("/fixed-costs/:id", expenseH.UpdateFixedCost)

	// Money Handlers
	r.POST("/money", moneyH.Create)
	r.GET("/money", moneyH.GetByBusinessID)

	// Calculation Handlers
	r.POST("/calculations", calculationH.Create)
	r.GET("/calculations", calculationH.GetByBusinessID)
	r.GET("/calculations/stats", calculationH.GetStats)

	// Salary Handlers
	r.POST("/salaries", salaryH.Create)
	r.GET("/salaries", salaryH.GetByBusinessID)
	r.GET("/salaries/total", salaryH.GetTotalByPeriod)
	r.GET("/salaries/employee/:employeeId", salaryH.GetByEmployeeID)
	r.DELETE("/salaries/:id", salaryH.Delete)

	// Organization Handlers
	r.POST("/organizations", organizationH.Create)
	r.GET("/organizations/my", organizationH.GetMyOrganizations)
	r.GET("/organizations/:id", organizationH.GetByID)
	r.PUT("/organizations/:id", organizationH.Update)
	r.DELETE("/organizations/:id", organizationH.Delete)
}
