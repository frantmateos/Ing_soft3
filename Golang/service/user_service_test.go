package services

import (
	Domain "Golang/domain"
	Model "Golang/model"
	"fmt"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestGetUserById_UsuarioExiste(t *testing.T) {
	mockClients := new(MockUserClients)

	usuarioMock := Model.User{
		Id:     1,
		Nombre: "Usuario de Prueba",
		Admin:  false,
		Estado: true,
	}

	mockClients.On("GetUserById", 1).
		Return(usuarioMock, nil)

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

	mockClients.On("GetUserById", 99).
		Return(Model.User{}, fmt.Errorf("usuario no encontrado"))

	service := NewService(mockClients)

	usuarioDomain, err := service.GetUserById(99)

	assert.NotNil(t, err)

	assert.Equal(t, "Error al obtener el usuario: usuario no encontrado", err.Error()) //

	assert.Equal(t, 0, usuarioDomain.Id)

	mockClients.AssertExpectations(t)
}

func TestInsertUsuario_Exitoso(t *testing.T) {
	mockClients := new(MockUserClients)

	usuarioInput := Domain.UserData{
		Nombre:   "Nuevo Usuario",
		Password: "Password123",
		Admin:    false,
	}

	usuarioMockDevuelto := Model.User{
		Id:       5,
		Nombre:   "Nuevo Usuario",
		Password: "42f749ade7f9e195bf475f37a44cafcb",
		Admin:    false,
		Estado:   true,
	}

	usuarioEsperadoEnMock := Model.User{
		Nombre:   "Nuevo Usuario",
		Password: "42f749ade7f9e195bf475f37a44cafcb",
		Admin:    false,
		Estado:   true,
	}

	mockClients.On("InsertUser", usuarioEsperadoEnMock).
		Return(usuarioMockDevuelto, nil)

	service := NewService(mockClients)

	usuarioDomainDevuelto, err := service.InsertUsuario(usuarioInput)

	assert.Nil(t, err)
	assert.Equal(t, 5, usuarioDomainDevuelto.Id)
	assert.Equal(t, "Nuevo Usuario", usuarioDomainDevuelto.Nombre)

	assert.Equal(t, "42f749ade7f9e195bf475f37a44cafcb", usuarioDomainDevuelto.Password)

	mockClients.AssertExpectations(t)
}

func TestLogin_UsuarioNoExiste_DebeRetornarError(t *testing.T) {
	mockClients := new(MockUserClients)

	loginInput := Domain.UserData{
		Nombre:   "usuario.inexistente",
		Password: "123",
	}

	usuarioBusqueda := Model.User{
		Nombre: "usuario.inexistente",
		Admin:  false,
	}

	mockClients.On("GetUserByName", usuarioBusqueda).
		Return(Model.User{}, fmt.Errorf("usuario no encontrado"))

	service := NewService(mockClients)

	loginData, err := service.Login(loginInput) //

	assert.NotNil(t, err)

	assert.Equal(t, "error", err.Error()) //

	assert.Empty(t, loginData.Token)

	mockClients.AssertExpectations(t)
}
