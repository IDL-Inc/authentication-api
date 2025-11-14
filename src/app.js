const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
require('dotenv').config()

// import routes
const businessRoutes = require('./routes/businessRoutes')
const authRoutes = require('./routes/authRoutes')

const app = express()

// Middleware
app.use(helmet())
app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api/businesses', businessRoutes)
app.use('/api/auth', authRoutes)

// Basic health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'business API is running',
    timestamp: new Date().toISOString()
  })
})

// Database health checkup
app.get('/health/db', async (req, res) => {
  try {
    const { testConnection } = require('./config/database')
    await testConnection()
    res.status(200).json({
      status: 'success',
      message: 'Database connection is healthy',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Databse connnection failed',
      error: error.message
    })
  }
})

// Root route
app.get('/', (req, res) => {
  res.send('api is running...')
})

// 404 handler - should be after all other routes
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  })
})

// Error handling Middleware
app.use((error, req, res, next) => {
  console.log('error:', error)
  res.status(500).json({
    status: 'error',
    message: 'Internal Server Error'
  })
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV}`)
  console.log(`Database: ${process.env.DB_NAME} @ ${process.env.DB_HOST}:${process.env.DB_PORT}`)
})

module.exports = app
