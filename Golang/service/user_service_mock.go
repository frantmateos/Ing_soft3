package services

import (
	Model "Golang/model"
	"context"

	"github.com/stretchr/testify/mock"
)

// MockUserClients es nuestro mock para la interfaz userClients
type MockUserClients struct {
	mock.Mock
}

// Implementamos TODOS los métodos de la interfaz userClients

func (m *MockUserClients) GetUserById(Id int) (Model.User, error) {
	// Le decimos al mock que registre la llamada y devuelva lo que le configuremos
	args := m.Called(Id)
	return args.Get(0).(Model.User), args.Error(1)
}

func (m *MockUserClients) UpdateUser(ctx context.Context, User Model.User) (Model.User, error) {
	args := m.Called(User)
	return args.Get(0).(Model.User), args.Error(1)
}

func (m *MockUserClients) InsertUser(user Model.User) (Model.User, error) {
	args := m.Called(user)
	// args.Get(0) será el Model.User que devolvemos
	// args.Error(1) será el error que devolvemos
	return args.Get(0).(Model.User), args.Error(1)
}

func (m *MockUserClients) GetUserByName(Usuario Model.User) (Model.User, error) {
	args := m.Called(Usuario)
	return args.Get(0).(Model.User), args.Error(1)
}

func (m *MockUserClients) GetAllUsers() ([]Model.User, error) {
	args := m.Called()
	return args.Get(0).([]Model.User), args.Error(1)
}
