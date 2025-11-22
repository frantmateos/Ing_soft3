package middleware

import (
	"net/http/httptest"
	"testing"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func TestExtractClaims_ValidToken(t *testing.T) {
    // build token signed with same secret "bitsion"
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
        "user_id": 1,
        "admin":   false,
        "exp":     time.Now().Add(time.Hour).Unix(),
    })
    tok, _ := token.SignedString([]byte("bitsion"))

    claims, err := ExtractClaims(tok)
    assert.NoError(t, err)
    assert.Equal(t, float64(1), claims["user_id"])
}

func TestExtractClaims_InvalidToken(t *testing.T) {
    _, err := ExtractClaims("not-a-token")
    assert.Error(t, err)
}

func TestAuthMiddleware_NoHeader(t *testing.T) {
    gin.SetMode(gin.TestMode)
    w := httptest.NewRecorder()
    c, _ := gin.CreateTestContext(w)
    c.Request = httptest.NewRequest("GET", "/", nil)

    mw := AuthMiddleware()
    mw(c)

    assert.Equal(t, 401, w.Code)
}

func TestAuthMiddleware_ValidToken(t *testing.T) {
    gin.SetMode(gin.TestMode)
    w := httptest.NewRecorder()
    c, _ := gin.CreateTestContext(w)
    // create valid token with expected claims user_id and admin
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{"user_id": 12, "admin": true, "exp": time.Now().Add(time.Hour).Unix()})
    tok, _ := token.SignedString([]byte("bitsion"))

    req := httptest.NewRequest("GET", "/", nil)
    req.Header.Set("Authorization", "Bearer "+tok)
    c.Request = req

    mw := AuthMiddleware()
    mw(c)

    // not aborted
    assert.False(t, c.IsAborted())
    v, ok := c.Get("userID")
    assert.True(t, ok)
    assert.Equal(t, float64(12), v)
}
