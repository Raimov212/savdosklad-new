package middleware

import (
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"

	"savdosklad/internal/repository"
	"savdosklad/pkg/auth"
	"savdosklad/pkg/i18n"
)

func JWTAuth(jwtManager *auth.JWTManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		token := ""

		if authHeader != "" {
			parts := strings.SplitN(authHeader, " ", 2)
			if len(parts) == 2 && parts[0] == "Bearer" {
				token = parts[1]
			}
		}

		if token == "" {
			token = c.Query("token")
		}

		if token == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": i18n.Tc(c, i18n.MsgAuthHeaderRequired)})
			return
		}

		claims, err := jwtManager.ValidateToken(token)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": i18n.Tc(c, i18n.MsgInvalidOrExpiredToken)})
			return
		}

		c.Set("userID", claims.UserID)
		c.Set("username", claims.Username)
		c.Set("role", claims.Role)
		c.Next()
	}
}

func SubscriptionCheck(repo repository.UserRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		userIDValue, exists := c.Get("userID")
		if !exists {
			c.Next()
			return
		}

		userID := userIDValue.(int)
		user, err := repo.GetByID(userID)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": i18n.Tc(c, i18n.MsgUserNotFound)})
			return
		}

		// Check expiration date
		if !user.ExpirationDate.IsZero() && user.ExpirationDate.Before(time.Now()) {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
				"error":   i18n.Tc(c, i18n.MsgSubscriptionExpired),
				"expired": true,
			})
			return
		}

		c.Next()
	}
}
