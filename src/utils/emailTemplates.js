const defaultLayout = ({ title, bodyHtml }) => `
  <!doctype html>
  <html>
    <head>
      <meta charset="utf-8"/>
      <meta name="viewport" content="width=device-width,initial-scale=1"/>
      <title>${escapeHtml(title)}</title>
      <style>
        body { font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; color: #333; line-height:1.4; }
        .container { max-width: 680px; margin: 24px auto; padding: 20px; border-radius: 8px; background: #fff; box-shadow: 0 1px 6px rgba(0,0,0,0.06);}
        .btn { display:inline-block; padding:10px 16px; border-radius:6px; text-decoration:none; font-weight:600; }
        .primary { background:#2563eb; color:#fff; }
      </style>
    </head>
    <body>
      <div class="container">
        ${bodyHtml}
        <hr/>
        <small>If you didn't request this, ignore this message.</small>
      </div>
    </body>
  </html>
`;

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Build verification & reset templates
const verificationTemplate = ({ name, verifyUrl }) => {
  const title = 'Verify your email';
  const bodyHtml = `
    <h2>${escapeHtml(`Hello ${name || 'there'}`)}</h2>
    <p>Welcome! Click the button below to verify your email and activate your account.</p>
    <p><a class="btn primary" href="${escapeHtml(verifyUrl)}">Verify email</a></p>
  `;
  return { title, html: defaultLayout({ title, bodyHtml }), text: `Verify your account: ${verifyUrl}` };
};

const resetPasswordTemplate = ({ name, resetUrl, expiresInMin }) => {
  const title = 'Reset your password';
  const bodyHtml = `
    <h2>${escapeHtml(`Hello ${name || 'there'}`)}</h2>
    <p>Click the link below to reset your password. The link expires in ${escapeHtml(String(expiresInMin))} minutes.</p>
    <p><a class="btn primary" href="${escapeHtml(resetUrl)}">Reset password</a></p>
  `;
  return { title, html: defaultLayout({ title, bodyHtml }), text: `Reset your password: ${resetUrl}` };
};

module.exports = { verificationTemplate, resetPasswordTemplate };
