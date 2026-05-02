import config from '../config/index.js';

export const notifySlack = async (err, req) => {
  const webhookUrl = config.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    console.error('[Slack logger desactivado] Error 5XX:', err.message);
    return;
  }

  const payload = {
    text: ':rotating_light: *Error 5XX en BildyApp*',
    attachments: [
      {
        color: 'danger',
        fields: [
          {
            title: 'Mensaje',
            value: err.message ?? 'Sin mensaje',
            short: false,
          },
          {
            title: 'Ruta',
            value: `${req?.method ?? '?'} ${req?.originalUrl ?? '?'}`,
            short: true,
          },
          {
            title: 'Entorno',
            value: config.NODE_ENV,
            short: true,
          },
          {
            title: 'Stack (primeras 3 líneas)',
            value: (err.stack ?? '').split('\n').slice(0, 3).join('\n'),
            short: false,
          },
        ],
        footer: 'BildyApp Logger',
        ts: Math.floor(Date.now() / 1000),
      },
    ],
  };

  try {
    const res = await fetch(webhookUrl, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error(`[Slack] Error al enviar webhook: ${res.status} ${res.statusText}`);
    }
  } catch (fetchErr) {
    console.error('[Slack] Excepción al enviar webhook:', fetchErr.message);
  }
};
