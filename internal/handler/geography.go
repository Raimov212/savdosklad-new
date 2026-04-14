package handler

import (
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"savdosklad/internal/usecase"
)

type GeographyHandler struct {
	uc *usecase.RegionUseCase
}

func NewGeographyHandler(uc *usecase.RegionUseCase) *GeographyHandler {
	return &GeographyHandler{uc: uc}
}

// @Summary Get all regions
// @Tags Geography
// @Produce json
// @Success 200 {array} entity.Region
// @Router /regions [get]
func (h *GeographyHandler) GetRegions(c *gin.Context) {
	regions, err := h.uc.GetAllRegions()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	log.Printf("Geography: Fetched %d regions", len(regions))
	c.JSON(http.StatusOK, regions)
}

// @Summary Get all districts by region
// @Tags Geography
// @Produce json
// @Param regionId query int true "Region ID"
// @Success 200 {array} entity.District
// @Router /districts [get]
func (h *GeographyHandler) GetDistricts(c *gin.Context) {
	regionIDStr := c.Query("regionId")
	if regionIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "regionId query parametri kerak"})
		return
	}

	regionID, err := strconv.Atoi(regionIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Noto'g'ri regionId"})
		return
	}

	districts, err := h.uc.GetDistrictsByRegionID(regionID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	log.Printf("Geography: Fetched %d districts for regionId=%d", len(districts), regionID)
	c.JSON(http.StatusOK, districts)
}

// @Summary Get all markets by district
// @Tags Geography
// @Produce json
// @Param districtId query int true "District ID"
// @Success 200 {array} entity.Market
// @Router /markets [get]
func (h *GeographyHandler) GetMarkets(c *gin.Context) {
	districtIDStr := c.Query("districtId")
	if districtIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "districtId query parametri kerak"})
		return
	}

	districtID, err := strconv.Atoi(districtIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Noto'g'ri districtId"})
		return
	}

	markets, err := h.uc.GetMarketsByDistrictID(districtID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	log.Printf("Geography: Fetched %d markets for districtId=%d", len(markets), districtID)
	c.JSON(http.StatusOK, markets)
}
