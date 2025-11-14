const express = require('express')
const businessController = require('../controllers/businessController')
const { authenticateToken, requireRole } = require('../middleware/auth')

const router = express.Router()

// Public routes
router.post('/register', businessController.registerBusiness)

// protected routes (super admin only)
router.get('/', authenticateToken, requireRole(['super_admin']), businessController.getAllBusinesses)
router.get('/:businessId', authenticateToken, businessController.getBusinessById)
router.put('/:businessId', authenticateToken, businessController.updateBusiness)

module.exports = router
