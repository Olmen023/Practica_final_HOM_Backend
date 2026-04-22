import PDFDocument from 'pdfkit';

/**
 * Genera un PDF para un albarán y devuelve un Buffer.
 * @param {object} note - Documento DeliveryNote con los campos populados
 *   (note.client, note.project, note.user)
 * @returns {Promise<Buffer>}
 */
export const generateDeliveryNotePdf = (note) => {
  return new Promise((resolve, reject) => {
    const doc     = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks  = [];

    doc.on('data',  (chunk) => chunks.push(chunk));
    doc.on('end',   () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // ── Cabecera ──────────────────────────────────────────────────────────────
    doc
      .fontSize(22)
      .font('Helvetica-Bold')
      .text('ALBARÁN DE TRABAJO', { align: 'center' })
      .moveDown(0.5);

    doc
      .fontSize(10)
      .font('Helvetica')
      .text(`Nº Albarán: ${note._id}`, { align: 'right' })
      .text(`Fecha: ${note.workDate ? new Date(note.workDate).toLocaleDateString('es-ES') : '—'}`, { align: 'right' })
      .moveDown(1);

    // ── Separador ─────────────────────────────────────────────────────────────
    doc
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .stroke()
      .moveDown(0.8);

    // ── Datos del cliente ─────────────────────────────────────────────────────
    const client = note.client ?? {};
    doc
      .font('Helvetica-Bold').fontSize(12).text('CLIENTE')
      .font('Helvetica').fontSize(10)
      .text(`Nombre: ${client.name ?? '—'}`)
      .text(`CIF:    ${client.cif  ?? '—'}`)
      .text(`Email:  ${client.email ?? '—'}`)
      .moveDown(0.8);

    // ── Datos del proyecto ────────────────────────────────────────────────────
    const project = note.project ?? {};
    doc
      .font('Helvetica-Bold').fontSize(12).text('PROYECTO')
      .font('Helvetica').fontSize(10)
      .text(`Nombre: ${project.name        ?? '—'}`)
      .text(`Código: ${project.projectCode ?? '—'}`)
      .moveDown(0.8);

    // ── Descripción del trabajo ───────────────────────────────────────────────
    doc
      .font('Helvetica-Bold').fontSize(12).text('DESCRIPCIÓN')
      .font('Helvetica').fontSize(10)
      .text(note.description ?? '—')
      .moveDown(0.8);

    // ── Detalle según formato ─────────────────────────────────────────────────
    if (note.format === 'hours') {
      const workers = note.workers ?? [];
      doc
        .font('Helvetica-Bold').fontSize(12).text('HORAS TRABAJADAS')
        .font('Helvetica').fontSize(10);

      if (workers.length === 0) {
        doc.text('Sin operarios registrados.');
      } else {
        workers.forEach((w) => {
          doc.text(`• ${w.name ?? '—'} — ${w.hours ?? 0} h`);
        });
      }
      doc.moveDown(0.8);
    } else {
      const materials = note.materials ?? [];
      doc
        .font('Helvetica-Bold').fontSize(12).text('MATERIALES')
        .font('Helvetica').fontSize(10);

      if (materials.length === 0) {
        doc.text('Sin materiales registrados.');
      } else {
        materials.forEach((m) => {
          doc.text(`• ${m.name ?? '—'} — ${m.quantity ?? 0} ${m.unit ?? 'ud'}`);
        });
      }
      doc.moveDown(0.8);
    }

    // ── Firma ─────────────────────────────────────────────────────────────────
    doc
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .stroke()
      .moveDown(0.8);

    if (note.signed && note.signatureUrl) {
      doc
        .font('Helvetica-Bold').fontSize(12).text('FIRMA DEL RECEPTOR')
        .moveDown(0.3)
        .font('Helvetica').fontSize(9)
        .text(`Firmado el: ${new Date(note.updatedAt).toLocaleDateString('es-ES')}`);
      // La imagen de firma se añadiría aquí si tuviéramos el buffer local
    } else {
      doc
        .font('Helvetica-Oblique').fontSize(10)
        .text('Pendiente de firma.', { align: 'center' });
    }

    // ── Pie de página ─────────────────────────────────────────────────────────
    doc
      .moveDown(2)
      .fontSize(8)
      .fillColor('grey')
      .text('Generado por BildyApp — Gestión de Obras', { align: 'center' });

    doc.end();
  });
};
