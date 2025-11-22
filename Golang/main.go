package main

import (
	repo "Golang/clients"
	controller "Golang/controller"
	"Golang/middleware"
	service "Golang/service"
	"log"
	"net/http"
	os "os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

type Controller interface {
	GetUserByName(c *gin.Context)
	UsuarioInsert(c *gin.Context)
	UpdateUser(c *gin.Context)
	Extrac(c *gin.Context)
	GetUserById(c *gin.Context)
	Login(c *gin.Context)
}

func main() {

	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	sqlconfig := repo.MySQLConfig{
		Name: os.Getenv("DB_NAME"),
		User: os.Getenv("DB_USER"),
		Pass: os.Getenv("DB_PASS"),
		Host: os.Getenv("DB_HOST"),
	}

	mainRepo := repo.NewSql(sqlconfig)
	Service := service.NewService(mainRepo)
	Controller := controller.NewController(Service)
	router := gin.Default()

	router.Use(func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")

		allowedOrigins := []string{
			"https://localhost:3000",
			"http://localhost:3000",
			"http://127.0.0.1:3000",
			"https://webapp-qa-2025.azurewebsites.net",
			"https://webapp-produ-2025.azurewebsites.net",
			"http://frontend-instance-qa.brazilsouth.azurecontainer.io",
    		"http://frontend-instance-prod.brazilsouth.azurecontainer.io",
		}
		for _, o := range allowedOrigins {
			if strings.HasPrefix(origin, o) {
				c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
				c.Writer.Header().Set("Vary", "Origin")
				break
			}

		}
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE, UPDATE")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Origin, Authorization, Content-Type, X-Auth-Token")
		c.Writer.Header().Set("Access-Control-Expose-Headers", "Content-Length")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusOK)
			return
		}
		c.Next()
	})
	router.POST("/users", Controller.UsuarioInsert)
	router.POST("/users/login", Controller.Login)
	router.GET("/users/token", Controller.Extrac)

	router.GET("/users/all", middleware.AuthMiddleware(), Controller.GetAllUsers)
	router.GET("/users", middleware.AuthMiddleware(), Controller.GetUserByName)
	router.GET("/users/:id", middleware.AuthMiddleware(), Controller.GetUserById)
	router.PUT("/users", middleware.AuthMiddleware(), Controller.UpdateUser)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	router.Run(":" + port)

}
