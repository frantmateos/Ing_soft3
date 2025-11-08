package clientUsers

import (
	"context"
	"testing"

	Model "Golang/model"

	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/sqlite"
	"github.com/stretchr/testify/assert"
)

func setupInMemoryDB(t *testing.T) *SQL {
    db, err := gorm.Open("sqlite3", ":memory:")
    if err != nil {
        t.Fatalf("failed to open sqlite in memory: %v", err)
    }
    db.LogMode(false)
    db.AutoMigrate(&Model.User{})
    return &SQL{db: db, Database: "mem"}
}

func TestInsertAndGetUserById(t *testing.T) {
    repo := setupInMemoryDB(t)

    u := Model.User{Nombre: "test", Password: "p"}
    created, err := repo.InsertUser(u)
    assert.NoError(t, err)
    // created.Id should be set by GORM
    assert.NotZero(t, created.Id)

    fetched, err2 := repo.GetUserById(created.Id)
    assert.NoError(t, err2)
    assert.Equal(t, "test", fetched.Nombre)
}

func TestUpdateUser(t *testing.T) {
    repo := setupInMemoryDB(t)
    u := Model.User{Nombre: "before", Password: "p"}
    created, _ := repo.InsertUser(u)

    created.Nombre = "after"
    updated, err := repo.UpdateUser(context.Background(), created)
    assert.NoError(t, err)
    assert.Equal(t, "after", updated.Nombre)
}

func TestGetUserByNameAndGetAll(t *testing.T) {
    repo := setupInMemoryDB(t)
    repo.InsertUser(Model.User{Nombre: "alpha", Password: "a"})
    repo.InsertUser(Model.User{Nombre: "beta", Password: "b"})

    u, err := repo.GetUserByName(Model.User{Nombre: "alpha"})
    assert.NoError(t, err)
    assert.Equal(t, "alpha", u.Nombre)

    all, err2 := repo.GetAllUsers()
    assert.NoError(t, err2)
    assert.GreaterOrEqual(t, len(all), 2)
}

func TestGetUserById_NotFound(t *testing.T) {
    repo := setupInMemoryDB(t)

    _, err := repo.GetUserById(9999)
    assert.Error(t, err)
}

func TestUpdateUser_NotFound(t *testing.T) {
    repo := setupInMemoryDB(t)

    // attempt to update non-existent user (id not present)
    u := Model.User{Id: 12345, Nombre: "nope"}
    _, err := repo.UpdateUser(context.Background(), u)
    assert.Error(t, err)
}
