package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"

	"savdosklad/pkg/auth"
	"savdosklad/pkg/i18n"
)

func CustomerAuth(jwtManager *auth.JWTManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": i18n.Tc(c, i18n.MsgAuthHeaderRequired)})
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": i18n.Tc(c, i18n.MsgInvalidAuthFormat)})
			return
		}

		claims, err := jwtManager.ValidateToken(parts[1])
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": i18n.Tc(c, i18n.MsgInvalidOrExpiredToken)})
			return
		}

		// Check that this is a customer token (role = -1)
		if claims.Role != -1 {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": i18n.Tc(c, i18n.MsgAccessDeniedCustomer)})
			return
		}

		c.Set("customerID", claims.UserID)
		c.Next()
	}
}
