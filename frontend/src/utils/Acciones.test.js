import axios from 'axios';
import { login, tokenRole, tokenId, getAllUsers, insertUser } from './Acciones';

jest.mock('axios');

describe('Acciones util functions', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.resetAllMocks();
  });

  test('login stores token on success', async () => {
    axios.post.mockResolvedValue({ data: { Token: 'abc' } });
    const res = await login({ nombre: 'u', password: 'p' });
    expect(localStorage.getItem('token')).toBe('abc');
    // login returns token (Acciones returns Token or sets localStorage)
    expect(res).toBe('abc');
  });

  test('login throws on failure', async () => {
    axios.post.mockRejectedValue(new Error('fail'));
    await expect(login({})).rejects.toThrow('fail');
  });

  test('tokenRole calls backend and returns Adminu', async () => {
    localStorage.setItem('token', 't');
    axios.get.mockResolvedValue({ data: { Adminu: true } });
    const r = await tokenRole();
    expect(r).toBe(true);
    expect(axios.get).toHaveBeenCalled();
  });

  test('tokenId returns idU from backend', async () => {
    localStorage.setItem('token', 't2');
    axios.get.mockResolvedValue({ data: { idU: 5 } });
    const v = await tokenId();
    expect(v).toBe(5);
  });

  test('getAllUsers returns data', async () => {
    axios.get.mockResolvedValue({ data: [{ id: 1 }] });
    const out = await getAllUsers();
    expect(out).toEqual([{ id: 1 }]);
  });

  test('insertUser sends data with auth header', async () => {
    localStorage.setItem('token', 'mytoken');
    axios.post.mockResolvedValue({ data: { ok: true } });
    const payload = { nombre: 'n' };
    const out = await insertUser(payload);
    expect(axios.post).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ nombre: 'n' }), expect.objectContaining({ headers: expect.any(Object) }));
    expect(out).toEqual({ ok: true });
  });
});
