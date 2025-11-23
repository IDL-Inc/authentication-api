const { body } = require('express-validator');

const signupValidation = [
  body('firstName').isLength({ min: 2 }).withMessage('First name required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be 8+ chars'),
  body('role').optional().isIn(['orgadmin','admin','user'])
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').exists().withMessage('Password required'),
  body('recaptchaToken').optional().isString()
];

const forgotPasswordValidation = [
  body('email').isEmail().withMessage('Valid email required')
];

const resetPasswordValidation = [
  body('email').isEmail().withMessage('Valid email required'),
  body('token').exists().withMessage('Token required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be 8+ chars')
];

module.exports = {
  signupValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation
};
