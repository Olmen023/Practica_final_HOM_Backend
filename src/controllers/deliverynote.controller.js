import DeliveryNote from '../models/DeliveryNote.js';
import Project      from '../models/Project.js';
import Client       from '../models/Client.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// POST /api/deliverynote
export const create = asyncHandler(async (req, res) => {
  const { project, client, format, description, workDate, ...rest } = req.body;

  // Verificar que el proyecto y el cliente pertenecen a la compañía del usuario
  const [projectDoc, clientDoc] = await Promise.all([
    Project.findOne({ _id: project, company: req.user.companyId }),
    Client.findOne({ _id: client,  company: req.user.companyId }),
  ]);

  if (!projectDoc) throw AppError.notFound('Proyecto no encontrado en tu compañía');
  if (!clientDoc)  throw AppError.notFound('Cliente no encontrado en tu compañía');

  const note = await DeliveryNote.create({
    user:    req.user.id,
    company: req.user.companyId,
    project,
    client,
    format,
    description,
    workDate,
    ...rest,
  });

  res.status(201).json({ deliveryNote: note });
});

// GET /api/deliverynote   — lista paginada con filtros
export const list = asyncHandler(async (req, res) => {
  const {
    page   = 1,
    limit  = 10,
    sort   = '-workDate',
    project,
    client,
    format,
    signed,
    from,
    to,
  } = req.query;

  const filter = { company: req.user.companyId };
  if (project) filter.project = project;
  if (client)  filter.client  = client;
  if (format)  filter.format  = format;
  if (signed !== undefined) filter.signed = signed === 'true';
  if (from || to) {
    filter.workDate = {};
    if (from) filter.workDate.$gte = new Date(from);
    if (to)   filter.workDate.$lte = new Date(to);
  }

  const skip = page * limit; // 🐛 BUG 3 heredado — se corrige en commit 25

  const [notes, totalItems] = await Promise.all([
    DeliveryNote.find(filter)
      .populate('client',  'name cif')
      .populate('project', 'name projectCode')
      .sort(sort)
      .skip(Number(skip))
      .limit(Number(limit)),
    DeliveryNote.countDocuments(filter),
  ]);

  res.json({
    data: notes,
    pagination: {
      totalItems,
      totalPages:  Math.ceil(totalItems / Number(limit)),
      currentPage: Number(page),
      limit:       Number(limit),
    },
  });
});

// GET /api/deliverynote/:id
export const getById = asyncHandler(async (req, res) => {
  const note = await DeliveryNote.findOne({
    _id:     req.params.id,
    company: req.user.companyId,
  })
    .populate('user',    'name lastName email')
    .populate('client',  'name cif email phone address')
    .populate('project', 'name projectCode address email');

  if (!note) throw AppError.notFound('Albarán no encontrado');
  res.json({ deliveryNote: note });
});

// DELETE /api/deliverynote/:id
// Un albarán firmado no se puede borrar
export const remove = asyncHandler(async (req, res) => {
  const note = await DeliveryNote.findOne({
    _id:     req.params.id,
    company: req.user.companyId,
  });

  if (!note) throw AppError.notFound('Albarán no encontrado');
  if (note.signed) {
    throw AppError.conflict('No se puede eliminar un albarán firmado');
  }

  await note.deleteOne();
  res.json({ message: 'Albarán eliminado correctamente' });
});
