const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const generateToken = (payload, expiresIn = '7d') => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn })
}

const verifyToken = (token) => {
  try {
    return twt.verify(token, process.env.jwt_SECRET)
  } catch (error) {
    throw new Error('Invalid token')
  }
}

const hashPassword = async (password) => {
  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12
  return await bcrypt.hash(password, saltRounds)
}

const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword)
}

const extractTokenFromHeader = (authHeader) => {
  if (!authHeader) {
    return null
  }
  const parts = authHeader.split(' ')
  if (parts.length === 2 && parts[0] === 'Bearer') {
    return parts[1]
  }
  return null
}

// generate password reset token
const generatePasswordResetToken = (userId) => {
  return jwt.sign(
    { userId, type: 'password_reset' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  )
}

module.exports = {
  generateToken,
  verifyToken,
  hashPassword,
  comparePassword,
  extractTokenFromHeader,
  generatePasswordResetToken
}
