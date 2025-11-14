const express = require('express')
const authController = require('../controllers/authController')
const { authenticateToken } = require('../middleware/auth')

const router = express.Router()

// public routes
router.post('/register', authController.register)
router.post('/login', authController.login)

// protected routes
router.get('/profile', authenticateToken, authController.getProfile)
router.put('/profile', authenticateToken, authController.updateProfile)
router.put('/change-password', authenticateToken, authController.changePassword)

module.exports = router
