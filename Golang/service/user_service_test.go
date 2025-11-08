package services

import (
	"crypto/md5"
	"encoding/hex"
	"fmt"
	"testing"

	Domain "Golang/domain"
	Model "Golang/model"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func TestInsertUsuario_Success(t *testing.T) {
	mockClient := new(MockUserClients)
	svc := NewService(mockClient)

	in := Domain.UserData{
		Nombre:   "pepito",
		Password: "secret",
	}

	mockClient.On("InsertUser", mock.Anything).Return(Model.User{Id: 42}, nil)

	out, err := svc.InsertUsuario(in)
	assert.NoError(t, err)
	assert.Equal(t, 42, out.Id)
	mockClient.AssertExpectations(t)
}

func TestGetUserByName_Success(t *testing.T) {
	mockClient := new(MockUserClients)
	svc := NewService(mockClient)

	in := Domain.UserData{Nombre: "ana"}
	returned := Model.User{Id: 5, Nombre: "ana", Genero: "F"}

	mockClient.On("GetUserByName", mock.Anything).Return(returned, nil)

	out, err := svc.GetUserByName(in)
	assert.NoError(t, err)
	assert.Equal(t, 5, out.Id)
	assert.Equal(t, "ana", out.Nombre)
	mockClient.AssertExpectations(t)
}

func TestGetUserById_UsuarioExiste(t *testing.T) {
	mockClients := new(MockUserClients)

	usuarioMock := Model.User{
		Id:     1,
		Nombre: "Usuario de Prueba",
		Admin:  false,
		Estado: true,
	}

	mockClients.On("GetUserById", 1).Return(usuarioMock, nil)

	service := NewService(mockClients)
	usuarioDomain, err := service.GetUserById(1)

	assert.Nil(t, err)
	assert.Equal(t, 1, usuarioDomain.Id)
	assert.Equal(t, "Usuario de Prueba", usuarioDomain.Nombre)
	assert.Equal(t, false, usuarioDomain.Admin)
	assert.Equal(t, true, usuarioDomain.Estado)

	mockClients.AssertExpectations(t)
}

func TestGetUserById_UsuarioNoExiste(t *testing.T) {
	mockClients := new(MockUserClients)

	mockClients.On("GetUserById", 99).Return(Model.User{}, fmt.Errorf("usuario no encontrado"))

	service := NewService(mockClients)

	usuarioDomain, err := service.GetUserById(99)

	assert.NotNil(t, err)
	assert.Equal(t, "Error al obtener el usuario: usuario no encontrado", err.Error())
	assert.Equal(t, 0, usuarioDomain.Id)

	mockClients.AssertExpectations(t)
}

func TestUpdateUser_Success(t *testing.T) {
	mockClient := new(MockUserClients)
	svc := NewService(mockClient)

	in := Domain.UserData{Id: 7, Nombre: "update"}
	returned := Model.User{Id: 7, Nombre: "update"}

	mockClient.On("UpdateUser", mock.Anything).Return(returned, nil)

	out, err := svc.UpdateUser(in)
	assert.NoError(t, err)
	assert.Equal(t, 7, out.Id)
	mockClient.AssertExpectations(t)
}

func TestLogin_SuccessAndFail(t *testing.T) {
	mockClient := new(MockUserClients)
	svc := NewService(mockClient)

	sum := md5.Sum([]byte("pwd"))
	md5pwd := hex.EncodeToString(sum[:])

	returned := Model.User{Id: 2, Nombre: "usr", Password: md5pwd, Admin: false}
	mockClient.On("GetUserByName", mock.Anything).Return(returned, nil)

	in := Domain.UserData{Nombre: "usr", Password: "pwd"}
	token, err := svc.Login(in)
	assert.NoError(t, err)
	assert.Equal(t, 2, token.IdU)

	bad := Domain.UserData{Nombre: "usr", Password: "wrong"}
	_, err2 := svc.Login(bad)
	assert.Error(t, err2)

	mockClient.AssertExpectations(t)
}

func TestGetAllUsers_Success(t *testing.T) {
	mockClient := new(MockUserClients)
	svc := NewService(mockClient)

	users := []Model.User{{Id: 1, Nombre: "a"}, {Id: 2, Nombre: "b"}}
	mockClient.On("GetAllUsers").Return(users, nil)

	out, err := svc.GetAllUsers()
	assert.NoError(t, err)
	assert.Len(t, out, 2)

	mockClient.AssertExpectations(t)
}

func TestInsertUsuario_Exitoso(t *testing.T) {
	mockClients := new(MockUserClients)

	usuarioInput := Domain.UserData{
		Nombre:   "Nuevo Usuario",
		Password: "Password123",
		Admin:    false,
	}

	sum := md5.Sum([]byte("Password123"))
	md5pwd := hex.EncodeToString(sum[:])

	usuarioMockDevuelto := Model.User{
		Id:       5,
		Nombre:   "Nuevo Usuario",
		Password: md5pwd,
		Admin:    false,
		Estado:   true,
	}

	mockClients.On("InsertUser", mock.Anything).Return(usuarioMockDevuelto, nil)

	service := NewService(mockClients)

	usuarioDomainDevuelto, err := service.InsertUsuario(usuarioInput)

	assert.Nil(t, err)
	assert.Equal(t, 5, usuarioDomainDevuelto.Id)
	assert.Equal(t, "Nuevo Usuario", usuarioDomainDevuelto.Nombre)
	assert.Equal(t, md5pwd, usuarioDomainDevuelto.Password)

	mockClients.AssertExpectations(t)
}

func TestLogin_UsuarioNoExiste_DebeRetornarError(t *testing.T) {
	mockClients := new(MockUserClients)

	loginInput := Domain.UserData{
		Nombre:   "usuario.inexistente",
		Password: "123",
	}

	mockClients.On("GetUserByName", mock.Anything).Return(Model.User{}, fmt.Errorf("usuario no encontrado"))

	service := NewService(mockClients)

	loginData, err := service.Login(loginInput)

	assert.NotNil(t, err)
	assert.Equal(t, "error", err.Error())
	assert.Empty(t, loginData.Token)

	mockClients.AssertExpectations(t)
}
