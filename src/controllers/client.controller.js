import Client from '../models/Client.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// POST /api/client
export const create = asyncHandler(async (req, res) => {
  const { name, cif, email, phone, address } = req.body;

  const existing = await Client.findOne({ company: req.user.companyId, cif })
    .setOptions({ includeDeleted: true });
  if (existing) {
    throw AppError.conflict('Ya existe un cliente con ese CIF en tu compañía');
  }

  const client = await Client.create({
    user:    req.user.id,
    company: req.user.companyId,
    name,
    cif,
    email,
    phone,
    address,
  });

  res.status(201).json({ client });
});

// GET /api/client/:id
export const getById = asyncHandler(async (req, res) => {
  const client = await Client.findOne({
    _id:     req.params.id,
    company: req.user.companyId,
  });
  if (!client) throw AppError.notFound('Cliente no encontrado');
  res.json({ client });
});

// PUT /api/client/:id
export const update = asyncHandler(async (req, res) => {
  const client = await Client.findOneAndUpdate(
    { _id: req.params.id, company: req.user.companyId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!client) throw AppError.notFound('Cliente no encontrado');
  res.json({ client });
});

// DELETE /api/client/:id   (?soft=true → borrado lógico)
export const remove = asyncHandler(async (req, res) => {
  const soft = req.query.soft === 'true';

  if (soft) {
    const client = await Client.findOneAndUpdate(
      { _id: req.params.id, company: req.user.companyId },
      { deleted: true },
      { new: true }
    );
    if (!client) throw AppError.notFound('Cliente no encontrado');
    return res.json({ message: 'Cliente archivado correctamente' });
  }

  const client = await Client.findOneAndDelete({
    _id:     req.params.id,
    company: req.user.companyId,
  });
  if (!client) throw AppError.notFound('Cliente no encontrado');
  res.json({ message: 'Cliente eliminado correctamente' });
});
