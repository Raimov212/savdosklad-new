package handler

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/xuri/excelize/v2"

	"savdosklad/internal/entity"
	"savdosklad/internal/usecase"
)

type ExcelHandler struct {
	productUC  *usecase.ProductUseCase
	categoryUC *usecase.CategoryUseCase
}

func NewExcelHandler(productUC *usecase.ProductUseCase, categoryUC *usecase.CategoryUseCase) *ExcelHandler {
	return &ExcelHandler{productUC: productUC, categoryUC: categoryUC}
}

// ==================== CATEGORIES ====================

// @Summary      Export categories to Excel
// @Tags         Excel
// @Security     BearerAuth
// @Produce      application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
// @Param        businessId query int true "Business ID"
// @Success      200 {file} file
// @Router       /excel/categories/export [get]
func (h *ExcelHandler) ExportCategories(c *gin.Context) {
	businessID, _ := strconv.Atoi(c.Query("businessId"))
	if businessID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "businessId is required"})
		return
	}

	categories, err := h.categoryUC.GetByBusinessID(businessID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	f := excelize.NewFile()
	sheet := "Categories"
	f.SetSheetName("Sheet1", sheet)

	// Headers
	headers := []string{"№", "Nomi", "Yaratilgan sana"}
	for i, h := range headers {
		cell, _ := excelize.CoordinatesToCellName(i+1, 1)
		f.SetCellValue(sheet, cell, h)
	}

	// Style for headers
	style, _ := f.NewStyle(&excelize.Style{
		Font:      &excelize.Font{Bold: true, Size: 12},
		Fill:      excelize.Fill{Type: "pattern", Color: []string{"#4472C4"}, Pattern: 1},
		Alignment: &excelize.Alignment{Horizontal: "center"},
	})
	f.SetCellStyle(sheet, "A1", "C1", style)

	// Data
	for i, cat := range categories {
		row := i + 2
		f.SetCellValue(sheet, fmt.Sprintf("A%d", row), i+1)
		f.SetCellValue(sheet, fmt.Sprintf("B%d", row), cat.Name)
		f.SetCellValue(sheet, fmt.Sprintf("C%d", row), cat.CreatedAt.Format("2006-01-02"))
	}

	// Column widths
	f.SetColWidth(sheet, "A", "A", 10)
	f.SetColWidth(sheet, "B", "B", 30)
	f.SetColWidth(sheet, "C", "C", 20)

	fileName := fmt.Sprintf("categories_%d_%s.xlsx", businessID, time.Now().Format("20060102"))
	c.Header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=%s", fileName))

	if err := f.Write(c.Writer); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
	}
}

// @Summary      Import categories from Excel
// @Tags         Excel
// @Security     BearerAuth
// @Accept       multipart/form-data
// @Produce      json
// @Param        businessId formData int true "Business ID"
// @Param        file formData file true "Excel file"
// @Success      200 {object} map[string]interface{}
// @Router       /excel/categories/import [post]
func (h *ExcelHandler) ImportCategories(c *gin.Context) {
	businessID, _ := strconv.Atoi(c.PostForm("businessId"))
	if businessID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "businessId is required"})
		return
	}

	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "file is required"})
		return
	}

	src, err := file.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer src.Close()

	f, err := excelize.OpenReader(src)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid Excel file"})
		return
	}
	defer f.Close()

	sheet := f.GetSheetName(0)
	rows, err := f.GetRows(sheet)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	created := 0
	var errors []string

	for i, row := range rows {
		if i == 0 { // skip header
			continue
		}
		if len(row) < 1 || row[0] == "" {
			continue
		}

		name := row[0]
		req := entity.CreateCategoryRequest{
			BusinessID: businessID,
			Name:       name,
		}

		if _, err := h.categoryUC.Create(req); err != nil {
			errors = append(errors, fmt.Sprintf("Row %d (%s): %v", i+1, name, err))
		} else {
			created++
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"created": created,
		"errors":  errors,
	})
}

// @Summary      Download category import template
// @Tags         Excel
// @Security     BearerAuth
// @Produce      application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
// @Success      200 {file} file
// @Router       /excel/categories/template [get]
func (h *ExcelHandler) CategoryTemplate(c *gin.Context) {
	f := excelize.NewFile()
	sheet := "Categories"
	f.SetSheetName("Sheet1", sheet)

	headers := []string{"Nomi"}
	for i, h := range headers {
		cell, _ := excelize.CoordinatesToCellName(i+1, 1)
		f.SetCellValue(sheet, cell, h)
	}

	style, _ := f.NewStyle(&excelize.Style{
		Font:      &excelize.Font{Bold: true, Size: 12},
		Fill:      excelize.Fill{Type: "pattern", Color: []string{"#4472C4"}, Pattern: 1},
		Alignment: &excelize.Alignment{Horizontal: "center"},
	})
	f.SetCellStyle(sheet, "A1", "A1", style)

	// Example
	f.SetCellValue(sheet, "A2", "Oziq-ovqat")

	f.SetColWidth(sheet, "A", "A", 30)

	c.Header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	c.Header("Content-Disposition", "attachment; filename=category_import_template.xlsx")

	if err := f.Write(c.Writer); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
	}
}

// ==================== PRODUCTS ====================

// @Summary      Export products to Excel
// @Tags         Excel
// @Security     BearerAuth
// @Produce      application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
// @Param        businessId query int true "Business ID"
// @Success      200 {file} file
// @Router       /excel/products/export [get]
func (h *ExcelHandler) ExportProducts(c *gin.Context) {
	businessID, _ := strconv.Atoi(c.Query("businessId"))
	if businessID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "businessId is required"})
		return
	}

	products, err := h.productUC.GetByBusinessID(businessID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Get categories for mapping
	categories, _ := h.categoryUC.GetByBusinessID(businessID)
	catMap := make(map[int]string)
	for _, cat := range categories {
		catMap[cat.ID] = cat.Name
	}

	f := excelize.NewFile()
	sheet := "Products"
	f.SetSheetName("Sheet1", sheet)

	// Headers
	headers := []string{"ID", "Nomi", "Qisqa tavsif", "To'liq tavsif", "Narxi", "Chegirma", "Miqdori", "Shtrixkod", "Davlat", "Kategoriya", "Kategoriya ID"}
	for i, h := range headers {
		cell, _ := excelize.CoordinatesToCellName(i+1, 1)
		f.SetCellValue(sheet, cell, h)
	}

	// Style for headers
	style, _ := f.NewStyle(&excelize.Style{
		Font:      &excelize.Font{Bold: true, Size: 11},
		Fill:      excelize.Fill{Type: "pattern", Color: []string{"#4472C4"}, Pattern: 1},
		Alignment: &excelize.Alignment{Horizontal: "center"},
	})
	headerEnd, _ := excelize.CoordinatesToCellName(len(headers), 1)
	f.SetCellStyle(sheet, "A1", headerEnd, style)

	// Data
	for i, p := range products {
		row := i + 2
		f.SetCellValue(sheet, fmt.Sprintf("A%d", row), p.ID)
		if p.Name != nil {
			f.SetCellValue(sheet, fmt.Sprintf("B%d", row), *p.Name)
		}
		if p.ShortDescription != nil {
			f.SetCellValue(sheet, fmt.Sprintf("C%d", row), *p.ShortDescription)
		}
		if p.FullDescription != nil {
			f.SetCellValue(sheet, fmt.Sprintf("D%d", row), *p.FullDescription)
		}
		f.SetCellValue(sheet, fmt.Sprintf("E%d", row), p.Price)
		f.SetCellValue(sheet, fmt.Sprintf("F%d", row), p.Discount)
		f.SetCellValue(sheet, fmt.Sprintf("G%d", row), p.Quantity)
		if p.Barcode != nil {
			f.SetCellValue(sheet, fmt.Sprintf("H%d", row), *p.Barcode)
		}
		if p.Country != nil {
			f.SetCellValue(sheet, fmt.Sprintf("I%d", row), *p.Country)
		}
		f.SetCellValue(sheet, fmt.Sprintf("J%d", row), catMap[p.CategoryID])
		f.SetCellValue(sheet, fmt.Sprintf("K%d", row), p.CategoryID)
	}

	// Column widths
	widths := map[string]float64{"A": 10, "B": 25, "C": 20, "D": 30, "E": 12, "F": 10, "G": 10, "H": 18, "I": 15, "J": 20, "K": 14}
	for col, w := range widths {
		f.SetColWidth(sheet, col, col, w)
	}

	fileName := fmt.Sprintf("products_%d_%s.xlsx", businessID, time.Now().Format("20060102"))
	c.Header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=%s", fileName))

	if err := f.Write(c.Writer); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
	}
}

// @Summary      Import products from Excel
// @Tags         Excel
// @Security     BearerAuth
// @Accept       multipart/form-data
// @Produce      json
// @Param        businessId formData int true "Business ID"
// @Param        file formData file true "Excel file (.xlsx)"
// @Success      200 {object} map[string]interface{}
// @Router       /excel/products/import [post]
func (h *ExcelHandler) ImportProducts(c *gin.Context) {
	businessID, _ := strconv.Atoi(c.PostForm("businessId"))
	if businessID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "businessId is required"})
		return
	}

	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "file is required"})
		return
	}

	src, err := file.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer src.Close()

	f, err := excelize.OpenReader(src)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid Excel file"})
		return
	}
	defer f.Close()

	sheet := f.GetSheetName(0)
	rows, err := f.GetRows(sheet)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	created := 0
	updated := 0
	skipped := 0
	var importErrors []string

	for i, row := range rows {
		if i == 0 { // skip header
			continue
		}
		if len(row) < 2 {
			continue
		}

		// Parse: ID(0), Name(1), ShortDesc(2), FullDesc(3), Price(4), Discount(5), Quantity(6), Barcode(7), Country(8), Category(9), CategoryID(10)
		idStr := getCell(row, 0)
		name := getCell(row, 1)
		if name == "" {
			continue
		}

		price, _ := strconv.ParseFloat(getCell(row, 4), 64)
		discount, _ := strconv.ParseFloat(getCell(row, 5), 64)
		quantity, _ := strconv.Atoi(getCell(row, 6))
		barcode := getCell(row, 7)
		country := getCell(row, 8)
		categoryID, _ := strconv.Atoi(getCell(row, 10))

		if categoryID == 0 {
			importErrors = append(importErrors, fmt.Sprintf("Row %d (%s): categoryId is required", i+1, name))
			continue
		}

		productID, _ := strconv.Atoi(idStr)

		// If ID is provided, try to update existing product
		if productID > 0 {
			// Check if product exists in DB
			existing, err := h.productUC.GetByID(productID)
			if err == nil && existing != nil {
				// Product exists — update it
				shortDesc := getCell(row, 2)
				fullDesc := getCell(row, 3)
				qty := quantity
				updReq := entity.UpdateProductRequest{
					Name:             &name,
					ShortDescription: &shortDesc,
					FullDescription:  &fullDesc,
					Price:            &price,
					Discount:         &discount,
					Quantity:         &qty,
					CategoryID:       &categoryID,
				}
				if barcode != "" {
					updReq.Barcode = &barcode
				}
				if country != "" {
					updReq.Country = &country
				}
				if err := h.productUC.Update(productID, updReq); err != nil {
					importErrors = append(importErrors, fmt.Sprintf("Row %d (ID:%d, %s): %v", i+1, productID, name, err))
					skipped++
				} else {
					updated++
				}
				continue
			}
			// Product with this ID not found — create new
		}

		// Create new product (ID is empty or not found in DB)
		req := entity.CreateProductRequest{
			Name:             name,
			ShortDescription: getCell(row, 2),
			FullDescription:  getCell(row, 3),
			Price:            &price,
			Discount:         discount,
			Quantity:         &quantity,
			Barcode:          barcode,
			Country:          country,
			CategoryID:       categoryID,
			BusinessID:       businessID,
		}

		if _, err := h.productUC.Create(req); err != nil {
			if barcode != "" {
				importErrors = append(importErrors, fmt.Sprintf("Row %d (%s, barcode: %s): %v", i+1, name, barcode, err))
			} else {
				importErrors = append(importErrors, fmt.Sprintf("Row %d (%s): %v", i+1, name, err))
			}
			skipped++
		} else {
			created++
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"created": created,
		"updated": updated,
		"skipped": skipped,
		"errors":  importErrors,
	})
}

// @Summary      Download product import template
// @Tags         Excel
// @Security     BearerAuth
// @Produce      application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
// @Param        businessId query int true "Business ID"
// @Success      200 {file} file
// @Router       /excel/products/template [get]
func (h *ExcelHandler) ProductTemplate(c *gin.Context) {
	businessID, _ := strconv.Atoi(c.Query("businessId"))

	f := excelize.NewFile()
	sheet := "Products"
	f.SetSheetName("Sheet1", sheet)

	headers := []string{"ID (ixtiyoriy)", "Nomi", "Qisqa tavsif", "To'liq tavsif", "Narxi", "Chegirma", "Miqdori", "Shtrixkod (unique)", "Davlat", "Kategoriya", "Kategoriya ID"}
	for i, h := range headers {
		cell, _ := excelize.CoordinatesToCellName(i+1, 1)
		f.SetCellValue(sheet, cell, h)
	}

	style, _ := f.NewStyle(&excelize.Style{
		Font:      &excelize.Font{Bold: true, Size: 11},
		Fill:      excelize.Fill{Type: "pattern", Color: []string{"#4472C4"}, Pattern: 1},
		Alignment: &excelize.Alignment{Horizontal: "center"},
	})
	headerEnd, _ := excelize.CoordinatesToCellName(len(headers), 1)
	f.SetCellStyle(sheet, "A1", headerEnd, style)

	// Example row
	f.SetCellValue(sheet, "A2", "") // ID bo'sh = yangi tovar qo'shiladi
	f.SetCellValue(sheet, "B2", "Coca-Cola 1L")
	f.SetCellValue(sheet, "C2", "Ichimlik")
	f.SetCellValue(sheet, "D2", "Coca-Cola gazli ichimlik 1 litr")
	f.SetCellValue(sheet, "E2", 12000)
	f.SetCellValue(sheet, "F2", 0)
	f.SetCellValue(sheet, "G2", 100)
	f.SetCellValue(sheet, "H2", "4901234567890")
	f.SetCellValue(sheet, "I2", "UZ")
	f.SetCellValue(sheet, "J2", "")
	f.SetCellValue(sheet, "K2", 1)

	widths := map[string]float64{"A": 14, "B": 22, "C": 18, "D": 30, "E": 12, "F": 10, "G": 10, "H": 20, "I": 12, "J": 20, "K": 15}
	for col, w := range widths {
		f.SetColWidth(sheet, col, col, w)
	}

	// Add categories sheet for reference
	if businessID > 0 {
		catSheet := "Categories"
		f.NewSheet(catSheet)
		f.SetCellValue(catSheet, "A1", "ID")
		f.SetCellValue(catSheet, "B1", "Nomi")
		f.SetColWidth(catSheet, "A", "A", 10)
		f.SetColWidth(catSheet, "B", "B", 25)

		categories, _ := h.categoryUC.GetByBusinessID(businessID)
		for i, cat := range categories {
			f.SetCellValue(catSheet, fmt.Sprintf("A%d", i+2), cat.ID)
			f.SetCellValue(catSheet, fmt.Sprintf("B%d", i+2), cat.Name)
		}
	}

	c.Header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	c.Header("Content-Disposition", "attachment; filename=product_import_template.xlsx")

	if err := f.Write(c.Writer); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
	}
}

func getCell(row []string, idx int) string {
	if idx < len(row) {
		return row[idx]
	}
	return ""
}
