package middleware

import (
	"github.com/gin-gonic/gin"

	"savdosklad/pkg/i18n"
)

// Language middleware parses Accept-Language header and sets lang in context
func Language() gin.HandlerFunc {
	return func(c *gin.Context) {
		lang := i18n.ParseAcceptLanguage(c.GetHeader("Accept-Language"))
		c.Set("lang", lang)
		c.Next()
	}
}
