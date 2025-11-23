// Email utility - stub version
// TODO: Implement email sending when ready
// Supports: SendGrid, AWS SES, or Nodemailer

async function sendEmail(opts = {}) {
  const { to, subject, template, templateVars = {} } = opts;
  
  // For now, just log the email that would be sent
  console.log('[EMAIL STUB] Would send email:', {
    to,
    subject,
    template,
    templateVars
  });
  
  // Return success without actually sending
  return true;
}

module.exports = { sendEmail };
