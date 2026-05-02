import jwt from 'jsonwebtoken';
import config from '../../src/config/index.js';

export const getToken = (userId) =>
  jwt.sign({ id: String(userId) }, config.JWT_SECRET, { expiresIn: '15m' });

export const authHeader = (userId) => `Bearer ${getToken(userId)}`;
