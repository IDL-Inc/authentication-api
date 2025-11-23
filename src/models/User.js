const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const ROLE_ENUM = ['orgadmin', 'admin', 'user'];

const userSchema = new mongoose.Schema({
  businessName: { type: String },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  phone: { type: String },
  address: { type: String },
  pincode: { type: String },
  services: [{ type: String }], // e.g., ['same-day','cod','fragile']
  role: { type: String, enum: ROLE_ENUM, default: 'user' },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String },
  emailVerificationExpires: { type: Date },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

// Hash password before save
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function(candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Token helpers
userSchema.methods.generateEmailVerificationToken = function(ttlHours = 24) {
  const token = crypto.randomBytes(32).toString('hex');
  this.emailVerificationToken = token;
  this.emailVerificationExpires = Date.now() + ttlHours * 60 * 60 * 1000;
  return token;
};

userSchema.methods.generateResetPasswordToken = function(expMinutes = 60) {
  const token = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = token;
  this.resetPasswordExpires = Date.now() + expMinutes * 60 * 1000;
  return token;
};

module.exports = mongoose.model('User', userSchema);
