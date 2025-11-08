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
  // prevent real reloads
  delete window.location;
  window.location = { reload: jest.fn() };
});

// jsdom in this environment may lack MutationObserver used by some components — polyfill it.
/* eslint-disable no-unused-vars */
global.MutationObserver = global.MutationObserver || class {
  constructor(callback) { this.callback = callback; }
  disconnect() {}
  observe() {}
  takeRecords() { return []; }
};
/* eslint-enable no-unused-vars */

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

  userEvent.type(inputNombre, 'nuevo nombre');
  userEvent.type(inputGenero, 'M');
  userEvent.type(textarea, 'atrib');

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
  // click actualizar
  const updateBtn = await screen.findByRole('button', { name: /Actualizar/i });
  act(() => { userEvent.click(updateBtn); });

  const modal = document.querySelector('.modal-content');
  const inputNombre = within(modal).getByPlaceholderText(/Nombre del Usuario/i);
  const inputGenero = within(modal).getByPlaceholderText(/Género/i);
  const textarea = within(modal).getByPlaceholderText(/Atributos/i);
  const updateSubmit = within(modal).getByRole('button', { name: /Actualizar/i });

  // change values
  userEvent.clear(inputNombre);
  userEvent.type(inputNombre, 'u1-upd');
  userEvent.type(inputGenero, 'F');
  userEvent.type(textarea, 'attr');

  await act(async () => { userEvent.click(updateSubmit); });

  expect(updateUser).toHaveBeenCalled();
  expect(window.location.reload).toHaveBeenCalled();
});
