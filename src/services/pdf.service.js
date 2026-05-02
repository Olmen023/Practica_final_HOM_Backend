import { PassThrough } from 'stream';
import PDFDocument from 'pdfkit';

export const pipeDeliveryNotePdf = (note, dest, signatureBuffer = null) => {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  doc
    .fontSize(22).font('Helvetica-Bold')
    .text('ALBARÁN DE TRABAJO', { align: 'center' })
    .moveDown(0.5);

  doc
    .fontSize(10).font('Helvetica')
    .text(`Nº Albarán: ${note._id}`, { align: 'right' })
    .text(
      `Fecha: ${note.workDate
        ? new Date(note.workDate).toLocaleDateString('es-ES')
        : '—'}`,
      { align: 'right' }
    )
    .moveDown(1);

  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke().moveDown(0.8);

  const client = note.client ?? {};
  doc
    .font('Helvetica-Bold').fontSize(12).text('CLIENTE')
    .font('Helvetica').fontSize(10)
    .text(`Nombre: ${client.name  ?? '—'}`)
    .text(`CIF:    ${client.cif   ?? '—'}`)
    .text(`Email:  ${client.email ?? '—'}`)
    .moveDown(0.8);

  const project = note.project ?? {};
  doc
    .font('Helvetica-Bold').fontSize(12).text('PROYECTO')
    .font('Helvetica').fontSize(10)
    .text(`Nombre: ${project.name        ?? '—'}`)
    .text(`Código: ${project.projectCode ?? '—'}`)
    .moveDown(0.8);

  doc
    .font('Helvetica-Bold').fontSize(12).text('DESCRIPCIÓN')
    .font('Helvetica').fontSize(10)
    .text(note.description ?? '—')
    .moveDown(0.8);

  if (note.format === 'hours') {
    const workers = note.workers ?? [];
    doc.font('Helvetica-Bold').fontSize(12).text('HORAS TRABAJADAS')
       .font('Helvetica').fontSize(10);
    if (workers.length) {
      workers.forEach(w => doc.text(`• ${w.name ?? '—'} — ${w.hours ?? 0} h`));
    } else {
      doc.text('Sin operarios registrados.');
    }
  } else {
    doc
      .font('Helvetica-Bold').fontSize(12).text('MATERIALES')
      .font('Helvetica').fontSize(10)
      .text(`• ${note.material ?? '—'} — ${note.quantity ?? 0} ${note.unit ?? 'ud'}`);
  }
  doc.moveDown(0.8);

  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke().moveDown(0.8);

  if (signatureBuffer) {
    doc
      .font('Helvetica-Bold').fontSize(12).text('FIRMA DEL RECEPTOR')
      .moveDown(0.5);
    doc.image(signatureBuffer, { width: 150, align: 'center' });
    doc
      .moveDown(0.4)
      .font('Helvetica').fontSize(9)
      .text(`Firmado el: ${new Date().toLocaleDateString('es-ES')}`, { align: 'center' });
  } else if (note.signed) {
    doc
      .font('Helvetica-Bold').fontSize(12).text('FIRMA DEL RECEPTOR')
      .moveDown(0.3)
      .font('Helvetica').fontSize(9)
      .text(`Firmado el: ${new Date(note.updatedAt).toLocaleDateString('es-ES')}`);
  } else {
    doc
      .font('Helvetica-Oblique').fontSize(10)
      .text('Pendiente de firma.', { align: 'center' });
  }

  doc
    .moveDown(2).fontSize(8).fillColor('grey')
    .text('Generado por BildyApp — Gestión de Obras', { align: 'center' });

  doc.pipe(dest);
  doc.end();
};

export const generateDeliveryNotePdf = (note, signatureBuffer = null) =>
  new Promise((resolve, reject) => {
    const pass   = new PassThrough();
    const chunks = [];
    pass.on('data',  c => chunks.push(c));
    pass.on('end',   () => resolve(Buffer.concat(chunks)));
    pass.on('error', reject);
    pipeDeliveryNotePdf(note, pass, signatureBuffer);
  });
