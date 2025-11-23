const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const fetch = require('node-fetch');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const { sendEmail } = require('../utils/email'); // Stub - actual sending disabled for now
const {
  signupValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation
} = require('../validators/authValidators');

// Helper: create JWT
const signToken = (user) => {
  return jwt.sign(
    { sub: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// POST /api/auth/signup
router.post('/signup', signupValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const {
      businessName,
      firstName,
      lastName,
      email,
      phone,
      address,
      pincode,
      services,
      role,
      password
    } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const user = new User({
      businessName,
      firstName,
      lastName,
      email,
      phone,
      address,
      pincode,
      services,
      role,
      password
    });

    // create verification token
    const token = user.generateEmailVerificationToken(
      parseInt(process.env.EMAIL_VERIFY_TOKEN_EXPIRES?.replace('h','')) || 24
    );

    await user.save();

    const verifyUrl = `${process.env.BASE_URL}/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

    // TODO: Send verification email - to be implemented later
    // const html = `
    //   <p>Hello ${firstName || email},</p>
    //   <p>Welcome! Please verify your email by clicking the link below:</p>
    //   <p><a href="${verifyUrl}">Verify Email</a></p>
    //   <p>If you did not request this, ignore this email.</p>
    // `;
    //
    // await sendEmail({
    //   to: email,
    //   template: 'verification',
    //   templateVars: { name: firstName || email, verifyUrl },
    // });

    return res.status(201).json({
      message: 'User registered. Verification email sent.',
      userId: user._id
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/auth/verify-email?token=...&email=...
router.get('/verify-email', async (req, res) => {
  try {
    const { token, email } = req.query;
    if (!token || !email) return res.status(400).send('Invalid verify link');

    const user = await User.findOne({
      email,
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).send('Invalid or expired token');

    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    // Redirect to frontend login page with a success message
    return res.redirect(`${process.env.BASE_URL}/login?verified=1`);
  } catch (err) {
    console.error(err);
    return res.status(500).send('Server error');
  }
});

// POST /api/auth/login
router.post('/login', loginValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;

    // If recaptcha is enabled, verify
    // if (process.env.RECAPTCHA_SECRET) {
    //   if (!recaptchaToken) return res.status(400).json({ error: 'reCAPTCHA token required' });
    //   const recaptchaUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET}&response=${recaptchaToken}`;
    //   const r = await fetch(recaptchaUrl, { method: 'POST' });
    //   const recaptchaRes = await r.json();
    //   if (!recaptchaRes.success || recaptchaRes.score < 0.3) {
    //     return res.status(400).json({ error: 'Failed reCAPTCHA verification' });
    //   }
    // }

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    if (!user.isVerified) {
      return res.status(403).json({ error: 'Email not verified' });
    }

    const token = signToken(user);

    return res.json({
      token,
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', forgotPasswordValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      // Do not reveal whether email exists
      return res.json({ message: 'If that email exists, a reset link was sent.' });
    }

    const token = user.generateResetPasswordToken(parseInt(process.env.PASSWORD_RESET_EXPIRES_MIN) || 60);
    await user.save();

    const resetUrl = `${process.env.BASE_URL}/auth/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
    
    // TODO: Send reset password email - to be implemented later
    // const html = `
    //   <p>Hello ${user.firstName || email},</p>
    //   <p>Click to reset your password:</p>
    //   <p><a href="${resetUrl}">Reset Password</a></p>
    //   <p>This link expires in ${process.env.PASSWORD_RESET_EXPIRES_MIN || 60} minutes.</p>
    // `;
    //
    // await sendEmail({
    //   to: email,
    //   subject: 'Reset your password',
    //   text: `Reset: ${resetUrl}`,
    //   html
    // });

    return res.json({ message: 'If that email exists, a reset link was sent.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', resetPasswordValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { token, email, password } = req.body;
    const user = await User.findOne({
      email,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ error: 'Invalid or expired token' });

    user.password = password; // will be hashed in pre-save
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // TODO: Send password changed confirmation email - to be implemented later
    // await sendEmail({
    //   to: email,
    //   subject: 'Password changed',
    //   text: 'Your password has been changed successfully.',
    //   html: `<p>Your password has been changed successfully.</p>`
    // });

    // Return JWT directly so client can continue
    const jwtToken = signToken(user);
    return res.json({ message: 'Password reset successful', token: jwtToken });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;


// const auth = require('../middleware/auth');
// const { permit } = require('../middleware/roles');

// router.get('/admin-only', auth, permit('organization_admin', 'admin'), (req, res) => {
//   res.json({ secret: 'only admins and org admins see this' });
// });
