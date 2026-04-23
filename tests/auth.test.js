import request from 'supertest';
import { dbConnect, dbClear, dbClose } from './setup.js';
import { createUserWithCompany, RAW_PASSWORD } from './helpers/factories.js';
import { authHeader } from './helpers/auth.js';
import app from '../src/app.js';

beforeAll(dbConnect);
afterEach(dbClear);
afterAll(dbClose);

// ── POST /api/user/register ───────────────────────────────────────────────────
describe('POST /api/user/register', () => {
  it('registra un usuario nuevo y devuelve accessToken + refreshToken', async () => {
    const res = await request(app)
      .post('/api/user/register')
      .send({ email: 'nuevo@test.com', password: 'Segura123!' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
    expect(res.body.user.email).toBe('nuevo@test.com');
    expect(res.body.user.status).toBe('pending');
  });

  it('rechaza email inválido (400)', async () => {
    const res = await request(app)
      .post('/api/user/register')
      .send({ email: 'no-es-email', password: 'Segura123!' });

    expect(res.status).toBe(400);
  });

  it('rechaza si el usuario ya existe con email verificado (409)', async () => {
    const { user } = await createUserWithCompany({ email: 'dup@test.com', status: 'verified' });

    const res = await request(app)
      .post('/api/user/register')
      .send({ email: user.email, password: 'Segura123!' });

    expect(res.status).toBe(409);
  });
});

// ── POST /api/user/login ──────────────────────────────────────────────────────
describe('POST /api/user/login', () => {
  it('devuelve tokens con credenciales correctas', async () => {
    const { user } = await createUserWithCompany({ email: 'login@test.com' });

    const res = await request(app)
      .post('/api/user/login')
      .send({ email: user.email, password: RAW_PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
  });

  it('rechaza contraseña incorrecta (401)', async () => {
    const { user } = await createUserWithCompany({ email: 'login2@test.com' });

    const res = await request(app)
      .post('/api/user/login')
      .send({ email: user.email, password: 'Incorrecta123!' });

    expect(res.status).toBe(401);
  });

  it('rechaza email inexistente (401)', async () => {
    const res = await request(app)
      .post('/api/user/login')
      .send({ email: 'noexiste@test.com', password: 'Segura123!' });

    expect(res.status).toBe(401);
  });
});

// ── GET /api/user ─────────────────────────────────────────────────────────────
describe('GET /api/user', () => {
  it('devuelve el perfil del usuario autenticado', async () => {
    const { user } = await createUserWithCompany();

    const res = await request(app)
      .get('/api/user')
      .set('Authorization', authHeader(user._id));

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(user.email);
  });

  it('rechaza petición sin token (401)', async () => {
    const res = await request(app).get('/api/user');
    expect(res.status).toBe(401);
  });

  it('rechaza token inválido (401)', async () => {
    const res = await request(app)
      .get('/api/user')
      .set('Authorization', 'Bearer token.invalido.aqui');
    expect(res.status).toBe(401);
  });
});

// ── PUT /api/user/validation ──────────────────────────────────────────────────
describe('PUT /api/user/validation', () => {
  it('verifica el email con el código correcto', async () => {
    const regRes = await request(app)
      .post('/api/user/register')
      .send({ email: 'verify@test.com', password: 'Segura123!' });

    const { accessToken } = regRes.body;

    // Recuperar el código directamente de la BD en-memoria
    const User = (await import('../src/models/User.js')).default;
    const userDoc = await User.findOne({ email: 'verify@test.com' })
      .select('+verificationCode');
    const { verificationCode: code } = userDoc;

    const res = await request(app)
      .put('/api/user/validation')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ code });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/verificado/i);
  });

  it('rechaza código incorrecto (400)', async () => {
    const { user } = await createUserWithCompany({ status: 'pending' });

    const res = await request(app)
      .put('/api/user/validation')
      .set('Authorization', authHeader(user._id))
      .send({ code: '000000' });

    expect(res.status).toBe(400);
  });
});

// ── DELETE /api/user ──────────────────────────────────────────────────────────
describe('DELETE /api/user', () => {
  it('elimina la cuenta del usuario autenticado', async () => {
    const { user } = await createUserWithCompany();

    const res = await request(app)
      .delete('/api/user')
      .set('Authorization', authHeader(user._id));

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/eliminada/i);
  });
});
