import DeliveryNote from '../models/DeliveryNote.js';
import Project      from '../models/Project.js';
import Client       from '../models/Client.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadImage, uploadPdf } from '../services/storage.service.js';
import { generateDeliveryNotePdf } from '../services/pdf.service.js';
import {
  emitNewDeliveryNote,
  emitDeliveryNoteSigned,
} from '../services/realtime.service.js';

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

  emitNewDeliveryNote(req.user.companyId, note);
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

// PATCH /api/deliverynote/:id/sign
// Recibe la imagen de firma como multipart/form-data (campo: signature)
export const sign = asyncHandler(async (req, res) => {
  const note = await DeliveryNote.findOne({
    _id:     req.params.id,
    company: req.user.companyId,
  });

  if (!note) throw AppError.notFound('Albarán no encontrado');
  if (note.signed) throw AppError.conflict('El albarán ya está firmado');
  if (!req.file)   throw AppError.validation('Se requiere la imagen de firma');

  // 1. Subir firma a Cloudinary (con optimización Sharp en el servicio)
  const signatureUrl = await uploadImage(
    req.file.buffer,
    'signatures',
    `note_${note._id}`
  );

  // 2. Marcar como firmado y guardar URL
  note.signed       = true;
  note.signatureUrl = signatureUrl;
  await note.save();

  // 3. Generar PDF con los datos actualizados y subirlo
  const populatedNote = await DeliveryNote.findById(note._id)
    .populate('user',    'name lastName email')
    .populate('client',  'name cif email phone address')
    .populate('project', 'name projectCode address email');

  const pdfBuffer = await generateDeliveryNotePdf(populatedNote);
  const pdfUrl = await uploadPdf(pdfBuffer, 'deliverynotes', `note_${note._id}`);

  note.pdfUrl = pdfUrl;
  await note.save();

  emitDeliveryNoteSigned(req.user.companyId, note);
  res.json({ deliveryNote: note, signatureUrl, pdfUrl });
});

// GET /api/deliverynote/pdf/:id
// Redirige a la URL del PDF almacenado en Cloudinary, o lo regenera si no existe
export const downloadPdf = asyncHandler(async (req, res) => {
  const note = await DeliveryNote.findOne({
    _id:     req.params.id,
    company: req.user.companyId,
  })
    .populate('user',    'name lastName email')
    .populate('client',  'name cif email phone address')
    .populate('project', 'name projectCode address email');

  if (!note) throw AppError.notFound('Albarán no encontrado');

  // Si ya hay PDF guardado, redirigir
  if (note.pdfUrl) {
    return res.redirect(note.pdfUrl);
  }

  // Si no hay PDF (albarán sin firmar), generarlo al vuelo y enviarlo
  const pdfBuffer = await generateDeliveryNotePdf(note);

  res.set({
    'Content-Type':        'application/pdf',
    'Content-Disposition': `inline; filename="albaran-${note._id}.pdf"`,
    'Content-Length':      pdfBuffer.length,
  });
  res.send(pdfBuffer);
});
