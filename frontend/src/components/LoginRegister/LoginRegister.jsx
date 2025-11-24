import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import './LoginRegister.css';
import { FaUserAlt, FaLock } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { login, register } from '../../utils/Acciones.js';

const LoginRegister = () => {
  const [nombre, setNombre] = useState('');
  const [password, setPassword] = useState('');
  const [admin,setAdmin] = useState(true)
  const navigate = useNavigate();
  const [action, setAction] = useState();

  const registerLink = () => {
    setAction('active');
  };
  
  const loginLink = () => {
    setAction('');
  };

  useEffect(() => {
    const clearToken = () => {
      const token = localStorage.getItem('token');
      if (token) {
        localStorage.removeItem('token');
        console.log('token eliminado');
      }
    };
    clearToken();
  }, []);

  const handleSubmitLogin = (e) => {
    
    e.preventDefault();
    const userData = { nombre, password, admin };

    login(userData)
      .then(token => {
        Swal.fire({
          icon: 'success',
          title: 'Login exitoso',
          text: `Bienvenido, ${nombre}!`,
        });
        localStorage.setItem('nombre', nombre);
        navigate('/home');
      })
      .catch(err => {
        Swal.fire({
          icon: 'error',
          title: 'Error en el Login',
          text: 'Usuario o contraseña inválidos',
        });
        console.log(err);
      });
  };
  
  const handleSubmitRegister = (e) => {
    e.preventDefault();
    const userData = { nombre, password, admin };

    register(userData)
      .then(res => {
        Swal.fire({
          icon: 'success',
          title: 'Registro exitoso',
          text: 'Usuario registrado exitosamente',
        }).then(() => {
          window.location.href = "/";
        });
      })
      .catch(err => {
        Swal.fire({
          icon: 'error',
          title: 'Error en el Registro',
          text: 'Usuario o contraseña inválidos',
        });
        console.log(err);
      });
  };

  return (
    <div className={`wrapper ${action}`}>
      <div className="from-box login">
        <form onSubmit={handleSubmitLogin}>
          <h1>Login Administradores PRO</h1>
          <div className="input-box">
            <input 
              type="text" 
              placeholder="Usuario" 
              required 
              value={nombre} 
              onChange={(e) => setNombre(e.target.value)} 
            />
            <FaUserAlt className="icon" />
          </div>
          <div className="input-box">
            <input 
              type="password" 
              placeholder="Contraseña" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
            <FaLock className="icon" />
          </div>
          <button type="submit">Login</button>
          <div className="register">
            <p>No tienes una cuenta? <a href="#" onClick={registerLink}>Regístrate</a></p>
          </div>
        </form>
      </div>

      <div className="from-box register">
        <form onSubmit={handleSubmitRegister}>
          <h1>Regístrate</h1>
          <div className="input-box">
            <input 
              type="text" 
              placeholder="Usuario" 
              required 
              value={nombre} 
              onChange={(e) => setNombre(e.target.value)} 
            />
            <FaUserAlt className="icon" />
          </div>
          <div className="input-box">
            <input 
              type="password" 
              placeholder="Contraseña" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
            <FaLock className="icon" />
          </div>
          <button type="submit">Registrarse</button>
          <div className="register-link">
            <p>¿Ya tienes una cuenta? <a href="#" onClick={loginLink}>Login</a></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginRegister;
