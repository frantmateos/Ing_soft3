import React from 'react';
import { render, screen, within, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MisUsuarios from './home';
import { MemoryRouter } from 'react-router-dom';
import { getAllUsers, tokenRole, insertUser, updateUser } from '../../utils/Acciones';

jest.mock('../../utils/Acciones');

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  delete window.location;
  window.location = { reload: jest.fn() };
});

global.MutationObserver = global.MutationObserver || class {
  constructor(callback) { this.callback = callback; }
  disconnect() {}
  observe() {}
  takeRecords() { return []; }
};

test('open and close add dialog resets body overflow', async () => {
  tokenRole.mockResolvedValue(true);
  getAllUsers.mockResolvedValue([]);

  await act(async () => {
    render(<MemoryRouter><MisUsuarios /></MemoryRouter>);
  });

  const addBtn = screen.getByRole('button', { name: /Agregar Usuario/i });
  act(() => { userEvent.click(addBtn); });
  expect(document.querySelector('.modal')).toBeInTheDocument();
  expect(document.body.style.overflow).toBe('hidden');

  const cancel = within(document.querySelector('.modal-content')).getByRole('button', { name: /Cancelar/i });
  act(() => { userEvent.click(cancel); });
  expect(document.querySelector('.modal')).not.toBeInTheDocument();
  expect(document.body.style.overflow).toBe('auto');
});

test('insert user success calls insertUser and reload', async () => {
  tokenRole.mockResolvedValue(true);
  getAllUsers.mockResolvedValue([]);
  insertUser.mockResolvedValue({ id: 10, nombre: 'nuevo', atributos: 'x' });

  await act(async () => { render(<MemoryRouter><MisUsuarios /></MemoryRouter>); });
  act(() => { userEvent.click(screen.getByRole('button', { name: /Agregar Usuario/i })); });

  const modal = document.querySelector('.modal-content');
  const inputNombre = within(modal).getByPlaceholderText(/Nombre del Usuario/i);
  const inputGenero = within(modal).getByPlaceholderText(/Género/i);
  const textarea = within(modal).getByPlaceholderText(/Atributos/i);
  const addBtn = within(modal).getByRole('button', { name: /Agregar/i });

  act(() => { userEvent.type(inputNombre, 'nuevo nombre'); });
  act(() => { userEvent.type(inputGenero, 'M'); });
  act(() => { userEvent.type(textarea, 'atrib'); });

  await act(async () => { userEvent.click(addBtn); });

  expect(insertUser).toHaveBeenCalled();
  expect(window.location.reload).toHaveBeenCalled();
});

test('edit user updates and reloads', async () => {
  tokenRole.mockResolvedValue(true);
  const users = [{ id: 1, nombre: 'u1', atributos: 'a', estado: true, admin: false }];
  getAllUsers.mockResolvedValue(users);
  updateUser.mockResolvedValue({ id: 1, nombre: 'u1-upd', atributos: 'a' });

  await act(async () => { render(<MemoryRouter><MisUsuarios /></MemoryRouter>); });

  await screen.findByText('u1');

  const updateBtn = screen.getByRole('button', { name: /Actualizar/i });
  act(() => { userEvent.click(updateBtn); });

  const modal = document.querySelector('.modal-content');
  const inputNombre = within(modal).getByPlaceholderText(/Nombre del Usuario/i);
  const inputGenero = within(modal).getByPlaceholderText(/Género/i);
  const textarea = within(modal).getByPlaceholderText(/Atributos/i);
  const updateSubmit = within(modal).getByRole('button', { name: /Actualizar/i });

  act(() => { userEvent.clear(inputNombre); });
  act(() => { userEvent.type(inputNombre, 'u1-upd'); });
  act(() => { userEvent.type(inputGenero, 'F'); });
  act(() => { userEvent.type(textarea, 'attr'); });

  await act(async () => { userEvent.click(updateSubmit); });

  expect(updateUser).toHaveBeenCalled();
  expect(window.location.reload).toHaveBeenCalled();
});