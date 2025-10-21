package clientUsers

import (
	Model "Golang/model"
	"context"
	"fmt"

	_ "github.com/jinzhu/gorm/dialects/mysql"

	"github.com/jinzhu/gorm"
	log "github.com/sirupsen/logrus"
)

type MySQLConfig struct {
	Name string
	User string
	Pass string
	Host string
}

type SQL struct {
	db       *gorm.DB
	Database string
}

func NewSql(config MySQLConfig) SQL {
	// Azure exige TLS. Usamos skip-verify (más simple y suficiente para este TP)
	dsn := fmt.Sprintf("%s:%s@tcp(%s:3306)/%s?charset=utf8&parseTime=True&tls=skip-verify",
		config.User, config.Pass, config.Host, config.Name)

	db, err := gorm.Open("mysql", dsn)
	if err != nil {
		log.Println("❌ Connection Failed to Open")
		log.Fatal(err)
	} else {
		log.Println("✅ Connection Established (Azure MySQL, TLS enabled)")
	}

	db.AutoMigrate(&Model.User{})

	return SQL{
		db:       db,
		Database: config.Name,
	}
}


func (repository SQL) InsertUser(user Model.User) (Model.User, error) {

	result := repository.db.Create(&user)

	if result.Error != nil {
		log.Error("Error al crear el usuario")
		log.Error(result.Error)
		return user, fmt.Errorf("error creating user")
	}
	log.Debug("User Created: ", user.Id)
	return user, nil
}

func (repository SQL) GetUserById(Id int) (Model.User, error) {
	var userId Model.User

	result := repository.db.Where("id = ?", Id).First(&userId)
	log.Debug("id: ", userId)
	if result.Error != nil {
		log.Error("Error al buscar el usuario")
		log.Error(result.Error)
		return userId, fmt.Errorf("error creating user")
	}

	return userId, nil
}

func (repository SQL) UpdateUser(ctx context.Context, User Model.User) (Model.User, error) {
	var buscado Model.User
	fmt.Println("db busca: ", User)

	result := repository.db.Where("id = ?", User.Id).First(&buscado)

	if result.Error != nil {
		return Model.User{}, fmt.Errorf("error finding document: %v", result.Error)
	}

	if err := repository.db.Save(&User).Error; err != nil {
		return User, fmt.Errorf("error updating user: %w", err)
	}

	return User, nil
}

func (repository SQL) GetUserByName(Usuario Model.User) (Model.User, error) {
	var user Model.User
	fmt.Println("esto busca: ", Usuario.Nombre)
	result := repository.db.Where("nombre = ?", Usuario.Nombre).First(&user)
	if result.Error != nil {
		log.Error("Error al buscar el usuario")
		log.Error(result.Error)
		return user, fmt.Errorf("Error searching user by name.")
	}
	fmt.Println("esto encuenetra: ", user.Nombre)
	fmt.Println("esto encuenetra: ", user.Password)

	return user, nil
}

func (repository SQL) GetAllUsers() ([]Model.User, error) {
	var users []Model.User

	result := repository.db.Find(&users)
	if result.Error != nil {
		log.Error("Error al obtener los usuarios")
		log.Error(result.Error)
		return nil, fmt.Errorf("Error retrieving all users.")
	}

	return users, nil
}
