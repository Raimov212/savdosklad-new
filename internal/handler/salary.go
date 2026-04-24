package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"savdosklad/internal/entity"
	"savdosklad/internal/usecase"
)

type SalaryHandler struct {
	uc *usecase.SalaryUseCase
}

func NewSalaryHandler(uc *usecase.SalaryUseCase) *SalaryHandler {
	return &SalaryHandler{uc: uc}
}

// @Summary Create salary payment
// @Tags Salaries
// @Security BearerAuth
// @Param input body entity.CreateSalaryRequest true "Create"
// @Success 201 {object} map[string]int
// @Router /salaries [post]
func (h *SalaryHandler) Create(c *gin.Context) {
	var req entity.CreateSalaryRequest
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

// @Summary Get salaries by business
// @Tags Salaries
// @Security BearerAuth
// @Param businessId query int true "Business ID"
// @Success 200 {array} entity.EmployeeSalary
// @Router /salaries [get]
func (h *SalaryHandler) GetByBusinessID(c *gin.Context) {
	bid, _ := strconv.Atoi(c.Query("businessId"))
	list, err := h.uc.GetByBusinessID(bid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, list)
}

// @Summary Get salaries by employee
// @Tags Salaries
// @Security BearerAuth
// @Param employeeId path int true "Employee ID"
// @Success 200 {array} entity.EmployeeSalary
// @Router /salaries/employee/{employeeId} [get]
func (h *SalaryHandler) GetByEmployeeID(c *gin.Context) {
	empID, _ := strconv.Atoi(c.Param("employeeId"))
	list, err := h.uc.GetByEmployeeID(empID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, list)
}

// @Summary Get total salary by period
// @Tags Salaries
// @Security BearerAuth
// @Param businessId query int true "Business ID"
// @Param month query int true "Month"
// @Param year query int true "Year"
// @Success 200 {object} map[string]float64
// @Router /salaries/total [get]
func (h *SalaryHandler) GetTotalByPeriod(c *gin.Context) {
	bid, _ := strconv.Atoi(c.Query("businessId"))
	month, _ := strconv.Atoi(c.Query("month"))
	year, _ := strconv.Atoi(c.Query("year"))
	total, err := h.uc.GetTotalByPeriod(bid, month, year)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"total": total})
}

// @Summary Delete salary payment
// @Tags Salaries
// @Security BearerAuth
// @Param id path int true "ID"
// @Success 200 {object} map[string]string
// @Router /salaries/{id} [delete]
func (h *SalaryHandler) Delete(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	if err := h.uc.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Deleted"})
}
