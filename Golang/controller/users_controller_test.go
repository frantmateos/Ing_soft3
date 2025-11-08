package usersController

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	Domain "Golang/domain"

	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// MockService para el controlador
type MockServiceController struct{
    mock.Mock
}

func (m *MockServiceController) InsertUsuario(usuarioDomain Domain.UserData) (Domain.UserData, error) {
    args := m.Called(usuarioDomain)
    return args.Get(0).(Domain.UserData), args.Error(1)
}
func (m *MockServiceController) GetUserByName(usuarioDomain Domain.UserData) (Domain.UserData, error) {
    args := m.Called(usuarioDomain)
    return args.Get(0).(Domain.UserData), args.Error(1)
}
func (m *MockServiceController) UpdateUser(usuarioDomain Domain.UserData) (Domain.UserData, error) {
    args := m.Called(usuarioDomain)
    return args.Get(0).(Domain.UserData), args.Error(1)
}
func (m *MockServiceController) Login(User Domain.UserData) (Domain.LoginData, error) {
    args := m.Called(User)
    return args.Get(0).(Domain.LoginData), args.Error(1)
}
func (m *MockServiceController) GetAllUsers() ([]Domain.UserData, error) {
    args := m.Called()
    return args.Get(0).([]Domain.UserData), args.Error(1)
}
func (m *MockServiceController) GetUserById(userId int) (Domain.UserData, error) {
    args := m.Called(userId)
    return args.Get(0).(Domain.UserData), args.Error(1)
}

func TestLogin_Controller_OK(t *testing.T) {
    gin.SetMode(gin.TestMode)
    mockSvc := new(MockServiceController)
    ctrl := NewController(mockSvc)

    loginResp := Domain.LoginData{Token: "tok", IdU: 1}
    mockSvc.On("Login", mock.Anything).Return(loginResp, nil)

    body, _ := json.Marshal(Domain.UserData{Nombre: "u", Password: "p"})
    req := httptest.NewRequest(http.MethodPost, "/users/login", bytes.NewReader(body))
    req.Header.Set("Content-Type", "application/json")
    w := httptest.NewRecorder()

    c, _ := gin.CreateTestContext(w)
    c.Request = req

    ctrl.Login(c)

    assert.Equal(t, http.StatusOK, w.Code)
    var got Domain.LoginData
    json.Unmarshal(w.Body.Bytes(), &got)
    assert.Equal(t, "tok", got.Token)
}

func TestGetUserById_Controller_BadID(t *testing.T) {
    gin.SetMode(gin.TestMode)
    mockSvc := new(MockServiceController)
    ctrl := NewController(mockSvc)

    req := httptest.NewRequest(http.MethodGet, "/users/abc", nil)
    w := httptest.NewRecorder()
    c, _ := gin.CreateTestContext(w)
    c.Params = gin.Params{{Key: "id", Value: "abc"}}
    c.Request = req

    ctrl.GetUserById(c)
    assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestUsuarioInsert_Controller_OK(t *testing.T) {
    gin.SetMode(gin.TestMode)
    mockSvc := new(MockServiceController)
    ctrl := NewController(mockSvc)

    input := Domain.UserData{Nombre: "nuevo"}
    mockSvc.On("InsertUsuario", mock.Anything).Return(input, nil)

    body, _ := json.Marshal(input)
    req := httptest.NewRequest(http.MethodPost, "/users", bytes.NewReader(body))
    req.Header.Set("Content-Type", "application/json")
    w := httptest.NewRecorder()
    c, _ := gin.CreateTestContext(w)
    c.Request = req

    ctrl.UsuarioInsert(c)
    assert.Equal(t, http.StatusCreated, w.Code)
}

func TestGetAllUsers_Controller_OK(t *testing.T) {
    gin.SetMode(gin.TestMode)
    mockSvc := new(MockServiceController)
    ctrl := NewController(mockSvc)

    users := []Domain.UserData{{Id: 1, Nombre: "a"}}
    mockSvc.On("GetAllUsers").Return(users, nil)

    req := httptest.NewRequest(http.MethodGet, "/users/all", nil)
    w := httptest.NewRecorder()
    c, _ := gin.CreateTestContext(w)
    c.Request = req

    ctrl.GetAllUsers(c)
    assert.Equal(t, http.StatusOK, w.Code)
}

func TestExtrac_Controller_OK(t *testing.T) {
    gin.SetMode(gin.TestMode)
    mockSvc := new(MockServiceController)
    ctrl := NewController(mockSvc)

    // build token (same secret used in middleware)
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{"some": "claim"})
    tok, _ := token.SignedString([]byte("bitsion"))

    req := httptest.NewRequest(http.MethodGet, "/users/token", nil)
    req.Header.Set("Authorization", tok)
    w := httptest.NewRecorder()
    c, _ := gin.CreateTestContext(w)
    c.Request = req

    ctrl.Extrac(c)
    assert.Equal(t, http.StatusOK, w.Code)
}

func TestGetUserByName_Controller_OK(t *testing.T) {
    gin.SetMode(gin.TestMode)
    mockSvc := new(MockServiceController)
    ctrl := NewController(mockSvc)

    in := Domain.UserData{Nombre: "pepe"}
    mockSvc.On("GetUserByName", mock.Anything).Return(in, nil)

    body, _ := json.Marshal(in)
    req := httptest.NewRequest(http.MethodGet, "/users", bytes.NewReader(body))
    req.Header.Set("Content-Type", "application/json")
    w := httptest.NewRecorder()
    c, _ := gin.CreateTestContext(w)
    c.Request = req

    ctrl.GetUserByName(c)
    assert.Equal(t, http.StatusOK, w.Code)
}

func TestUpdateUser_Controller_OK(t *testing.T) {
    gin.SetMode(gin.TestMode)
    mockSvc := new(MockServiceController)
    ctrl := NewController(mockSvc)

    in := Domain.UserData{Id: 3, Nombre: "upd"}
    mockSvc.On("UpdateUser", mock.Anything).Return(in, nil)

    body, _ := json.Marshal(in)
    req := httptest.NewRequest(http.MethodPut, "/users", bytes.NewReader(body))
    req.Header.Set("Content-Type", "application/json")
    w := httptest.NewRecorder()
    c, _ := gin.CreateTestContext(w)
    c.Request = req

    ctrl.UpdateUser(c)
    assert.Equal(t, http.StatusCreated, w.Code)
}

func TestUpdateUser_Controller_BadJSON(t *testing.T) {
    gin.SetMode(gin.TestMode)
    mockSvc := new(MockServiceController)
    ctrl := NewController(mockSvc)

    req := httptest.NewRequest(http.MethodPut, "/users", bytes.NewReader([]byte("bad-json")))
    req.Header.Set("Content-Type", "application/json")
    w := httptest.NewRecorder()
    c, _ := gin.CreateTestContext(w)
    c.Request = req

    ctrl.UpdateUser(c)
    assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestGetUserById_Controller_OK(t *testing.T) {
    gin.SetMode(gin.TestMode)
    mockSvc := new(MockServiceController)
    ctrl := NewController(mockSvc)

    user := Domain.UserData{Id: 9, Nombre: "ok"}
    mockSvc.On("GetUserById", 9).Return(user, nil)

    req := httptest.NewRequest(http.MethodGet, "/users/9", nil)
    w := httptest.NewRecorder()
    c, _ := gin.CreateTestContext(w)
    c.Params = gin.Params{{Key: "id", Value: "9"}}
    c.Request = req

    ctrl.GetUserById(c)
    assert.Equal(t, http.StatusOK, w.Code)
}

func TestUsuarioInsert_Controller_BadJSON(t *testing.T) {
    gin.SetMode(gin.TestMode)
    mockSvc := new(MockServiceController)
    ctrl := NewController(mockSvc)

    req := httptest.NewRequest(http.MethodPost, "/users", bytes.NewReader([]byte("not-json")))
    req.Header.Set("Content-Type", "application/json")
    w := httptest.NewRecorder()
    c, _ := gin.CreateTestContext(w)
    c.Request = req

    ctrl.UsuarioInsert(c)
    assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestLogin_Controller_ErrorFromService(t *testing.T) {
    gin.SetMode(gin.TestMode)
    mockSvc := new(MockServiceController)
    ctrl := NewController(mockSvc)

    mockSvc.On("Login", mock.Anything).Return(Domain.LoginData{}, assert.AnError)

    body, _ := json.Marshal(Domain.UserData{Nombre: "u", Password: "p"})
    req := httptest.NewRequest(http.MethodPost, "/users/login", bytes.NewReader(body))
    req.Header.Set("Content-Type", "application/json")
    w := httptest.NewRecorder()
    c, _ := gin.CreateTestContext(w)
    c.Request = req

    ctrl.Login(c)
    assert.Equal(t, http.StatusBadRequest, w.Code)
}
