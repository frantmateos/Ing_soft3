// --- CORRECCIÓN DE MOCK: Definimos un mock reutilizable ---
const mockAxios = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
};
// Le decimos a Jest que CADA VEZ que alguien pida 'axios', le entregue nuestro objeto mock
jest.mock('axios', () => mockAxios);

// Reimporta Acciones con env/tokens frescos.
async function loadAccionesWithEnv(url = 'https://api.example.com') {
  jest.resetModules(); // Esto ahora es seguro
  
  // Reseteamos los mocks de axios aquí DENTRO, después de resetear los módulos
  mockAxios.get.mockClear();
  mockAxios.post.mockClear();
  mockAxios.put.mockClear();
  
  process.env.REACT_APP_BACKEND_URL = url;
  return await import('./Acciones'); // <-- ruta correcta
}

describe('Acciones util functions', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('login stores token on success y devuelve el token', async () => {
    const { login } = await loadAccionesWithEnv('https://qa.backend');
    mockAxios.post.mockResolvedValue({ data: { Token: 'abc' } });

    const res = await login({ nombre: 'u', password: 'p' });

    expect(res).toBe('abc');
    expect(localStorage.getItem('token')).toBe('abc');
    expect(mockAxios.post).toHaveBeenCalledWith(
      '/users/login',
      expect.objectContaining({ nombre: 'u', password: 'p' }),
      expect.any(Object)
    );
  });

  test('login lanza error en fallo', async () => {
    const { login } = await loadAccionesWithEnv();
    mockAxios.post.mockRejectedValue(new Error('fail'));

    await expect(login({})).rejects.toThrow('fail');
  });

  test('register éxito devuelve data y pega a /users', async () => {
    const { register } = await loadAccionesWithEnv('https://prod.backend');
    mockAxios.post.mockResolvedValue({ data: { ok: true, id: 1 } });

    const out = await register({ nombre: 'n' });

    expect(out).toEqual({ ok: true, id: 1 });
    expect(mockAxios.post).toHaveBeenCalledWith(
      '/users',
      expect.objectContaining({ nombre: 'n' })
    );
  });

  test('register lanza error en fallo', async () => {
    const { register } = await loadAccionesWithEnv();
    mockAxios.post.mockRejectedValue(new Error('boom'));

    await expect(register({})).rejects.toThrow('boom');
  });

  test('getAllUsers éxito devuelve arreglo y usa Authorization', async () => {
    localStorage.setItem('token', 'tkn');
    const { getAllUsers } = await loadAccionesWithEnv('https://b');
    mockAxios.get.mockResolvedValue({ data: [{ id: 1 }] });

    const out = await getAllUsers();

    expect(out).toEqual([{ id: 1 }]);
    // (Esta aserción ya estaba corregida y pasaba)
    expect(mockAxios.get).toHaveBeenCalledWith(
      '/users/all',
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer tkn' }),
      })
    );
  });

  test('getAllUsers lanza error y propaga el throw', async () => {
    const { getAllUsers } = await loadAccionesWithEnv();
    const netError = { message: 'netfail' }; // no es instancia de Error
    mockAxios.get.mockRejectedValue(netError);

    await expect(getAllUsers()).rejects.toEqual(netError);
    // Alternativa: rejects.toMatchObject({ message: 'netfail' })
  });

  test('insertUser envía payload y header Bearer', async () => {
    localStorage.setItem('token', 'mytoken');
    const { insertUser } = await loadAccionesWithEnv('https://x');
    mockAxios.post.mockResolvedValue({ data: { ok: true } });

    const payload = { nombre: 'n', genero: 'm' };
    const out = await insertUser(payload);

    expect(out).toEqual({ ok: true });
    expect(mockAxios.post).toHaveBeenCalledWith(
      '/users',
      expect.objectContaining({ nombre: 'n', genero: 'm' }),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer mytoken' }),
      })
    );
  });

  test('insertUser propaga error', async () => {
    const { insertUser } = await loadAccionesWithEnv();
    mockAxios.post.mockRejectedValue(new Error('create-fail'));

    await expect(insertUser({})).rejects.toThrow('create-fail');
  });

  test('getUserById éxito usa header Authorization', async () => {
    localStorage.setItem('token', 'tok');
    const { getUserById } = await loadAccionesWithEnv('https://u');
    mockAxios.get.mockResolvedValue({ data: { id: 7 } });

    const data = await getUserById(7);

    expect(data).toEqual({ id: 7 });
    expect(mockAxios.get).toHaveBeenCalledWith(
      '/users/7',
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer tok' }),
      })
    );
  });

  test('getUserById lanza error con response', async () => {
    const { getUserById } = await loadAccionesWithEnv();
    const errorResponse = { response: { data: 'bad' } };
    mockAxios.get.mockRejectedValue(errorResponse);

    await expect(getUserById(1)).rejects.toEqual(errorResponse);
  });

  test('updateUser exito hace PUT /users con id y headers', async () => {
    localStorage.setItem('token', 'tok2');
    const { updateUser } = await loadAccionesWithEnv('https://upd');
    mockAxios.put.mockResolvedValue({ data: { ok: 1 } });

    const body = { nombre: 'n', genero: 'f', estado: true };
    const data = await updateUser(9, body);

    expect(data).toEqual({ ok: 1 });
    expect(mockAxios.put).toHaveBeenCalledWith(
      '/users',
      expect.objectContaining({ id: 9, nombre: 'n', genero: 'f', estado: true }),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer tok2' }),
      })
    );
  });

  test('updateUser propaga error', async () => {
    const { updateUser } = await loadAccionesWithEnv();
    mockAxios.put.mockRejectedValue(new Error('put-fail'));

    await expect(updateUser(1, {})).rejects.toThrow('put-fail');
  });

  test('tokenId lanza si no hay token en localStorage', async () => {
    const { tokenId } = await loadAccionesWithEnv('https://z');
    await expect(tokenId()).rejects.toThrow('No token found');
  });

  test('tokenId devuelve idU cuando hay token y backend responde', async () => {
    localStorage.setItem('token', 'T');
    const { tokenId } = await loadAccionesWithEnv('https://z');
    mockAxios.get.mockResolvedValue({ data: { idU: 42 } });

    const id = await tokenId();

    expect(id).toBe(42);
    expect(mockAxios.get).toHaveBeenCalledWith(
      '/users/token',
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer T' }),
      })
    );
  });

  test('tokenRole devuelve Adminu y usa Authorization sin Bearer', async () => {
    localStorage.setItem('token', 'ZZ');
    const { tokenRole } = await loadAccionesWithEnv('https://z');
    mockAxios.get.mockResolvedValue({ data: { Adminu: false } });

    const r = await tokenRole();

    expect(r).toBe(false);
    expect(mockAxios.get).toHaveBeenCalledWith(
      '/users/token',
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'ZZ' }),
      })
    );
  });
});