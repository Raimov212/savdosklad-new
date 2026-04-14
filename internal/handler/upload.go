package handler

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

type UploadHandler struct{}

func NewUploadHandler() *UploadHandler {
	return &UploadHandler{}
}

// @Summary Upload image
// @Tags Upload
// @Security BearerAuth
// @Accept multipart/form-data
// @Produce json
// @Param file formData file true "Image file"
// @Success 200 {object} map[string]string
// @Router /upload [post]
func (h *UploadHandler) Upload(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Fayl yuklanmadi"})
		return
	}

	// Validate file type
	ext := strings.ToLower(filepath.Ext(file.Filename))
	allowed := map[string]bool{".jpg": true, ".jpeg": true, ".png": true, ".gif": true, ".webp": true}
	if !allowed[ext] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Faqat rasm fayllari ruxsat etiladi (jpg, png, gif, webp)"})
		return
	}

	// Validate file size (max 5MB)
	if file.Size > 5*1024*1024 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Fayl hajmi 5MB dan oshmasligi kerak"})
		return
	}

	// Create images directory if not exists
	if err := os.MkdirAll("images", 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Papka yaratib bo'lmadi"})
		return
	}

	// Generate unique filename
	filename := fmt.Sprintf("%d_%s%s", time.Now().UnixNano(), strings.TrimSuffix(filepath.Base(file.Filename), ext), ext)
	savePath := filepath.Join("images", filename)

	// Save file
	if err := c.SaveUploadedFile(file, savePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Faylni saqlashda xatolik"})
		return
	}

	// Return URL
	imageURL := "/images/" + filename
	c.JSON(http.StatusOK, gin.H{"url": imageURL})
}
