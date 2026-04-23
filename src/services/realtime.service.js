import { getIO } from '../sockets/index.js';

/**
 * Emite un evento a la room de una compañía específica.
 *
 * 🐛 BUG 5: se usa io.emit() (broadcast global a todos los clientes conectados)
 * en lugar de io.to(`company:${companyId}`).emit() (solo la room de la compañía).
 * Esto hace que todos los usuarios de cualquier empresa reciban los eventos
 * de todas las demás empresas, lo que supone una fuga de información.
 * Se corrige en el commit de fix correspondiente.
 *
 * @param {string} companyId  - ID de la compañía destinataria
 * @param {string} event      - Nombre del evento Socket.IO
 * @param {object} payload    - Datos a emitir
 */
const emitToCompany = (companyId, event, payload) => {
  const io = getIO();
  if (!io) return; // Socket.IO no inicializado (entorno de tests) — noop
  io.to(`company:${companyId}`).emit(event, payload);
};

// ── Helpers semánticos ────────────────────────────────────────────────────────

export const emitNewClient = (companyId, client) =>
  emitToCompany(companyId, 'client:new', { client });

export const emitNewProject = (companyId, project) =>
  emitToCompany(companyId, 'project:new', { project });

export const emitNewDeliveryNote = (companyId, deliveryNote) =>
  emitToCompany(companyId, 'deliverynote:new', { deliveryNote });

export const emitDeliveryNoteSigned = (companyId, deliveryNote) =>
  emitToCompany(companyId, 'deliverynote:signed', { deliveryNote });
