const { verifyToken, extractTokenFromHeader } = require('../utils/auth')

const authenticateToken = async (req, res, next) => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization)
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Access Token is required'
      })
    }
    const decoded = verifyToken(token)

    // verify token still exists and is active
    const user = await models.User.findByPk(decoded.userId, {
      attributes: ['id', 'email', 'role', 'business_id', 'is_active']
    })

    if (!user || !user.is_active) {
      return res.status(401).json({
        status: 'error',
        message: 'User not found or inactive'
      })
    }

    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
      businessId: user.business_id
    }

    next()
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid or expired token'
    })
  }
}

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized'
      })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'Insufficient permissions. Required roles: ' + roles.join(', ')
      })
    }
    next()
  }
}

// middleware to rquire business context
const requireBusinessAccess = (req, res, next) => {
  if (!req.user.businessId) {
    return res.status(403).json({
      status: 'error',
      message: 'Business access required'
    })
  }
  next()
}

module.exports = {
  authenticateToken,
  requireRole,
  requireBusinessAccess
}
