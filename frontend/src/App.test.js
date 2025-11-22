import React from 'react';
import { act } from 'react'; 
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom'; 

import App from './App';
import LoginRegister from './components/LoginRegister/LoginRegister';
import MisUsuarios from './components/home/home';

import Swal from 'sweetalert2';
jest.mock('sweetalert2', () => ({
  fire: jest.fn(() => Promise.resolve({})),
}));

const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => {
    const originalModule = jest.requireActual('react-router-dom');
    return {
        ...originalModule,
        useNavigate: () => mockedNavigate,
        BrowserRouter: ({ children }) => <div>{children}</div>, 
    };
});

import { 
  login, 
  register, 
  getAllUsers, 
  tokenRole, 
  insertUser, 
  updateUser 
} from './utils/Acciones';

jest.mock('./utils/Acciones.js', () => ({
  login: jest.fn(),
  register: jest.fn(),
  getAllUsers: jest.fn(),
  tokenRole: jest.fn(),
  insertUser: jest.fn(),
  updateUser: jest.fn(),
}));

const mockedLogin = login;
const mockedRegister = register;
const mockedSwal = Swal.fire;
const mockedGetAllUsers = getAllUsers;
const mockedTokenRole = tokenRole;
const mockedInsertUser = insertUser;

beforeEach(() => {
  mockedLogin.mockClear();
  mockedRegister.mockClear();
  mockedSwal.mockClear();
  mockedNavigate.mockClear();
  mockedGetAllUsers.mockClear();
  mockedTokenRole.mockClear();
  mockedInsertUser.mockClear();
  localStorage.clear();
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  console.log.mockRestore();
  console.error.mockRestore();
});

const originalLocation = window.location;
beforeAll(() => {
  delete window.location;
  window.location = { href: 'http://localhost/' };
});
afterAll(() => {
  window.location = originalLocation;
});


describe('Tests de App.js (Routing)', () => {

  test('Renderizar login por defecto', () => {
    localStorage.clear();

    act(() => {
      render(
        <MemoryRouter initialEntries={['/']}> 
          <App />
        </MemoryRouter>
      );
    });

    expect(screen.getByRole('heading', { name: /Login Administradores/i })).toBeInTheDocument();
  });

  test('Renderizar home', async () => {
    localStorage.setItem('token', 'un-token-falso');
    mockedTokenRole.mockResolvedValue(true);
    mockedGetAllUsers.mockResolvedValue([]);

    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/home']}> 
          <App />
        </MemoryRouter>
      );
    });

    expect(screen.getByRole('heading', { name: /Usuarios/i })).toBeInTheDocument();
  });
});

describe('Tests de Login Register', () => {
  test('Cambio de UI al registrarse', () => {
    act(() => { render(<LoginRegister />); });

    const registerLink = screen.getByRole('link', { name: 'Regístrate' });

    act(() => { userEvent.click(registerLink); });

    const registerTitle = screen.getByRole('heading', { name: /Regístrate/i });

    expect(registerTitle).toBeInTheDocument();
  });

  test('logn', async () => {
    mockedLogin.mockResolvedValue({ token: 'fake_token_123' });
    act(() => { render(<LoginRegister />); });

    const loginForm = screen.getByRole('heading', { name: /Login Administradores/i }).closest('form');
    const inputUsuario = within(loginForm).getByPlaceholderText(/Usuario/i);
    const inputPassword = within(loginForm).getByPlaceholderText(/Contraseña/i);
    const loginButton = within(loginForm).getByRole('button', { name: /Login/i });

    userEvent.type(inputUsuario, 'usuario.valido');
    userEvent.type(inputPassword, 'clave.valida');

    await act(async () => { userEvent.click(loginButton); });

    expect(mockedLogin).toHaveBeenCalledWith(expect.objectContaining({ nombre: 'usuario.valido' }));
    expect(mockedSwal).toHaveBeenCalledWith(expect.objectContaining({ title: 'Login exitoso' }));
    expect(mockedNavigate).toHaveBeenCalledWith('/home');
  });

  test('login error', async () => {
    mockedLogin.mockRejectedValue(new Error('Credenciales invalidas'));
    act(() => { render(<LoginRegister />); });

    const loginForm = screen.getByRole('heading', { name: /Login Administradores/i }).closest('form');
    const inputUsuario = within(loginForm).getByPlaceholderText(/Usuario/i);
    const inputPassword = within(loginForm).getByPlaceholderText(/Contraseña/i);
    const loginButton = within(loginForm).getByRole('button', { name: /Login/i })
    ;
    userEvent.type(inputUsuario, 'usuario.valido');
    userEvent.type(inputPassword, 'clave.incorrecta');

    await act(async () => { userEvent.click(loginButton); });

    expect(mockedSwal).toHaveBeenCalledWith(expect.objectContaining({ title: 'Error en el Login' }));
    expect(mockedNavigate).not.toHaveBeenCalled();
  });

  test('Registro éxito: muestra Swal y redirige a "/"', async () => {
  mockedRegister.mockResolvedValue({ ok: true });

  act(() => { render(<LoginRegister />); });

  userEvent.click(screen.getByRole('link', { name: 'Regístrate' }));

  const form = screen.getByRole('heading', { name: /Regístrate/i }).closest('form');
  const inputUsuario = within(form).getByPlaceholderText(/Usuario/i);
  const inputPassword = within(form).getByPlaceholderText(/Contraseña/i);
  const btnRegistrar  = within(form).getByRole('button', { name: /Registrarse/i });

  userEvent.type(inputUsuario, 'nuevo.user');
  userEvent.type(inputPassword, 'clave.segura');

  await act(async () => { userEvent.click(btnRegistrar); });

  expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({
    icon: 'success',
    title: 'Registro exitoso',
  }));

  await act(async () => { await Promise.resolve(); });
  expect(window.location.href).toBe('/');
});

test('Registro error: muestra Swal de error y NO redirige', async () => {
  mockedRegister.mockRejectedValue(new Error('boom'));

  act(() => { render(<LoginRegister />); });

  userEvent.click(screen.getByRole('link', { name: 'Regístrate' }));

  const form = screen.getByRole('heading', { name: /Regístrate/i }).closest('form');
  const inputUsuario = within(form).getByPlaceholderText(/Usuario/i);
  const inputPassword = within(form).getByPlaceholderText(/Contraseña/i);
  const btnRegistrar  = within(form).getByRole('button', { name: /Registrarse/i });

  window.location.href = 'http://localhost/inicio';

  userEvent.type(inputUsuario, 'alguien');
  userEvent.type(inputPassword, 'badpass');

  await act(async () => { userEvent.click(btnRegistrar); });

  expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({
    icon: 'error',
    title: 'Error en el Registro',
  }));

  await act(async () => { await Promise.resolve(); });
  expect(window.location.href).toBe('http://localhost/inicio');
});

test('useEffect limpia token al montar el componente', () => {
  localStorage.setItem('token', 'TOKEN_VIEJO');

  act(() => { render(<LoginRegister />); });

  expect(localStorage.getItem('token')).toBeNull();
});

test('Volver a Login desde pantalla de registro', () => {
  act(() => { render(<LoginRegister />); });

  userEvent.click(screen.getByRole('link', { name: 'Regístrate' }));
  userEvent.click(screen.getByRole('link', { name: 'Login' }));

  expect(screen.getByRole('heading', { name: /Login Administradores/i })).toBeInTheDocument();
});

});


describe('Tests de home', () => {
  test('mostrar usuarios', async () => {
    const usuariosFalsos = [{ id: 1, nombre: 'Usuario Uno', estado: false, admin: false }];
    mockedGetAllUsers.mockResolvedValue(usuariosFalsos);
    mockedTokenRole.mockResolvedValue(true);
    await act(async () => { render(<MisUsuarios />); });
    expect(mockedGetAllUsers).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Usuario Uno')).toBeInTheDocument();
  });

  test('boton agregar para admin', async () => {
    mockedGetAllUsers.mockResolvedValue([]);
    mockedTokenRole.mockResolvedValue(false); 
    await act(async () => { render(<MisUsuarios />); });
    expect(screen.queryByRole('button', { name: /Agregar Usuario/i })).not.toBeInTheDocument();
  });

  test('errores relacionados a agregar', async () => {
    mockedGetAllUsers.mockResolvedValue([]);
    mockedTokenRole.mockResolvedValue(true);
    await act(async () => { render(<MisUsuarios />); });
    const botonAgregarUsuario = screen.getByRole('button', { name: /Agregar Usuario/i });
    act(() => { userEvent.click(botonAgregarUsuario); });
    const modalTitle = screen.getByRole('heading', { name: /Agregar Nuevo Cliente/i });
    const modal = modalTitle.closest('.modal-content');
    const botonSubmitAgregar = within(modal).getByRole('button', { name: /Agregar/i });
    act(() => { userEvent.click(botonSubmitAgregar); });
    expect(mockedInsertUser).not.toHaveBeenCalled();
    expect(within(modal).getByText('El nombre debe tener al menos 5 caracteres.')).toBeInTheDocument();
  });
});