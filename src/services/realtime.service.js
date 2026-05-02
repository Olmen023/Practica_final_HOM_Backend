import { getIO } from '../sockets/index.js';

const emitToCompany = (companyId, event, payload) => {
  const io = getIO();
  if (!io) return;
  io.to(`company:${companyId}`).emit(event, payload);
};

export const emitNewClient = (companyId, client) =>
  emitToCompany(companyId, 'client:new', { client });

export const emitNewProject = (companyId, project) =>
  emitToCompany(companyId, 'project:new', { project });

export const emitNewDeliveryNote = (companyId, deliveryNote) =>
  emitToCompany(companyId, 'deliverynote:new', { deliveryNote });

export const emitDeliveryNoteSigned = (companyId, deliveryNote) =>
  emitToCompany(companyId, 'deliverynote:signed', { deliveryNote });
