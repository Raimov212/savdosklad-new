package handler

import (
	"crypto/rand"
	"encoding/hex"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"savdosklad/internal/entity"
	"savdosklad/internal/usecase"
	"savdosklad/pkg/cache"
	"savdosklad/pkg/i18n"
)

type UserHandler struct {
	uc *usecase.UserUseCase
}

func NewUserHandler(uc *usecase.UserUseCase) *UserHandler {
	return &UserHandler{uc: uc}
}

// Register godoc
// @Summary      Register a new user
// @Tags         Auth
// @Accept       json
// @Produce      json
// @Param        input body entity.RegisterRequest true "Register"
// @Success      201 {object} entity.User
// @Failure      400 {object} map[string]string
// @Router       /auth/register [post]
func (h *UserHandler) Register(c *gin.Context) {
	var req entity.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := h.uc.Register(req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": i18n.Tc(c, err.Error())})
		return
	}
	c.JSON(http.StatusCreated, user)
}

// Login godoc
// @Summary      Login
// @Tags         Auth
// @Accept       json
// @Produce      json
// @Param        input body entity.LoginRequest true "Login"
// @Success      200 {object} entity.LoginResponse
// @Failure      401 {object} map[string]string
// @Router       /auth/login [post]
func (h *UserHandler) Login(c *gin.Context) {
	var req entity.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	resp, err := h.uc.Login(req)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": i18n.Tc(c, err.Error())})
		return
	}
	c.JSON(http.StatusOK, resp)
}

// GetAll godoc
// @Summary      Get all users
// @Tags         Users
// @Security     BearerAuth
// @Produce      json
// @Success      200 {array} entity.User
// @Router       /users [get]
func (h *UserHandler) GetAll(c *gin.Context) {
	users, err := h.uc.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, users)
}

// GetByID godoc
// @Summary      Get user by ID
// @Tags         Users
// @Security     BearerAuth
// @Produce      json
// @Param        id path int true "User ID"
// @Success      200 {object} entity.User
// @Router       /users/{id} [get]
func (h *UserHandler) GetByID(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	user, err := h.uc.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": i18n.Tc(c, i18n.MsgUserNotFound)})
		return
	}
	c.JSON(http.StatusOK, user)
}

// Update godoc
// @Summary      Update user
// @Tags         Users
// @Security     BearerAuth
// @Accept       json
// @Param        id path int true "User ID"
// @Param        input body entity.UpdateUserRequest true "Update"
// @Success      200 {object} map[string]string
// @Router       /users/{id} [put]
func (h *UserHandler) Update(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var req entity.UpdateUserRequest
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

// Delete godoc
// @Summary      Delete user
// @Tags         Users
// @Security     BearerAuth
// @Param        id path int true "User ID"
// @Success      200 {object} map[string]string
// @Router       /users/{id} [delete]
func (h *UserHandler) Delete(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	if err := h.uc.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": i18n.Tc(c, i18n.MsgDeleted)})
}

// GetMyEmployees godoc
// @Summary      Get current user's employees
// @Tags         Users
// @Security     BearerAuth
// @Produce      json
// @Success      200 {array} entity.User
// @Router       /users/my-employees [get]
func (h *UserHandler) GetMyEmployees(c *gin.Context) {
	if c.GetInt("role") < 1 {
		c.JSON(http.StatusForbidden, gin.H{"error": "Forbidden"})
		return
	}
	adminID := c.GetInt("userID")
	employees, err := h.uc.GetEmployees(adminID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, employees)
}

// CreateEmployee godoc
// @Summary      Create employee
// @Tags         Users
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        input body entity.RegisterRequest true "Employee info"
// @Success      201 {object} entity.User
// @Router       /users/employees [post]
func (h *UserHandler) CreateEmployee(c *gin.Context) {
	if c.GetInt("role") < 1 {
		c.JSON(http.StatusForbidden, gin.H{"error": "Forbidden"})
		return
	}
	adminID := c.GetInt("userID")
	var req entity.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := h.uc.CreateEmployee(req, adminID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": i18n.Tc(c, err.Error())})
		return
	}
	c.JSON(http.StatusCreated, user)
}

// GenerateTelegramLink godoc
// @Summary      Generate Telegram Link Token
// @Tags         Users
// @Security     BearerAuth
// @Produce      json
// @Success      200 {object} map[string]string
// @Router       /users/telegram-link [post]
func (h *UserHandler) GenerateTelegramLink(c *gin.Context) {
	if c.GetInt("role") < 0 {
		c.JSON(http.StatusForbidden, gin.H{"error": "Forbidden"})
		return
	}
	userID := c.GetInt("userID")
	
	bytes := make([]byte, 16)
	if _, err := rand.Read(bytes); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}
	
	token := hex.EncodeToString(bytes)
	
	// Store in cache: token -> userID
	cache.TgAuthCache.Store(token, userID)
	
	// Also retrieve the bot username (stored when bot started)
	botUsername := "savdosklad_bot"
	if val, ok := cache.TgAuthCache.Load("__bot_username__"); ok {
		if name, ok := val.(string); ok && name != "" {
			botUsername = name
		}
	}
	
	c.JSON(http.StatusOK, gin.H{
		"link":        token,
		"botUsername": botUsername,
	})
}
