import Project from '../models/Project.js';
import Client  from '../models/Client.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { emitNewProject } from '../services/realtime.service.js';

// POST /api/project
export const create = asyncHandler(async (req, res) => {
  const { client, name, projectCode, address, email, notes, active } = req.body;

  // Verificar que el cliente pertenece a la misma compañía
  const clientDoc = await Client.findOne({ _id: client, company: req.user.companyId });
  if (!clientDoc) throw AppError.notFound('Cliente no encontrado en tu compañía');

  // Código de proyecto único por compañía
  const existing = await Project.findOne({ company: req.user.companyId, projectCode })
    .setOptions({ includeDeleted: true });
  if (existing) throw AppError.conflict('Ya existe un proyecto con ese código en tu compañía');

  const project = await Project.create({
    user:    req.user.id,
    company: req.user.companyId,
    client,
    name,
    projectCode,
    address,
    email,
    notes,
    active,
  });

  emitNewProject(req.user.companyId, project);
  res.status(201).json({ project });
});

// GET /api/project   — lista paginada con filtros
export const list = asyncHandler(async (req, res) => {
  const {
    page   = 1,
    limit  = 10,
    sort   = '-createdAt',
    client,
    name,
    active,
  } = req.query;

  const filter = { company: req.user.companyId };
  if (client) filter.client = client;
  if (name)   filter.name   = { $regex: name, $options: 'i' };
  if (active !== undefined) filter.active = active === 'true';

  // 🐛 BUG 3 (mismo patrón copiado de client): skip = page * limit
  // Se corrige en el mismo fix del commit 25 junto con client.controller.js
  const skip = page * limit;

  const [projects, totalItems] = await Promise.all([
    Project.find(filter)
      .populate('client', 'name cif')
      .sort(sort)
      .skip(Number(skip))
      .limit(Number(limit)),
    Project.countDocuments(filter),
  ]);

  res.json({
    data: projects,
    pagination: {
      totalItems,
      totalPages:  Math.ceil(totalItems / Number(limit)),
      currentPage: Number(page),
      limit:       Number(limit),
    },
  });
});

// GET /api/project/:id
export const getById = asyncHandler(async (req, res) => {
  const project = await Project.findOne({
    _id:     req.params.id,
    company: req.user.companyId,
  }).populate('client', 'name cif email');

  if (!project) throw AppError.notFound('Proyecto no encontrado');
  res.json({ project });
});

// PUT /api/project/:id
export const update = asyncHandler(async (req, res) => {
  const project = await Project.findOneAndUpdate(
    { _id: req.params.id, company: req.user.companyId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!project) throw AppError.notFound('Proyecto no encontrado');
  res.json({ project });
});

// GET /api/project/archived
export const listArchived = asyncHandler(async (req, res) => {
  const projects = await Project.find({ company: req.user.companyId, deleted: true })
    .setOptions({ includeDeleted: true })
    .populate('client', 'name cif')
    .sort('-updatedAt');

  res.json({ data: projects, total: projects.length });
});

// PATCH /api/project/:id/restore
export const restore = asyncHandler(async (req, res) => {
  const project = await Project.findOneAndUpdate(
    { _id: req.params.id, company: req.user.companyId, deleted: true },
    { deleted: false },
    { new: true }
  ).setOptions({ includeDeleted: true });

  if (!project) throw AppError.notFound('Proyecto archivado no encontrado');
  res.json({ project });
});

// DELETE /api/project/:id   (?soft=true → borrado lógico)
export const remove = asyncHandler(async (req, res) => {
  const soft = req.query.soft === 'true';

  if (soft) {
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, company: req.user.companyId },
      { deleted: true },
      { new: true }
    );
    if (!project) throw AppError.notFound('Proyecto no encontrado');
    return res.json({ message: 'Proyecto archivado correctamente' });
  }

  const project = await Project.findOneAndDelete({
    _id:     req.params.id,
    company: req.user.companyId,
  });
  if (!project) throw AppError.notFound('Proyecto no encontrado');
  res.json({ message: 'Proyecto eliminado correctamente' });
});
