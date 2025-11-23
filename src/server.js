require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const { authLimiter } = require('./middleware/rateLimiter');

const PORT = process.env.PORT || 4000;

const app = express();

// Connect DB
connectDB(process.env.MONGODB_URI).catch(err => {
  console.error('Failed to connect to database:', err.message);
  process.exit(1);
});

// Middlewares
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());
app.use(morgan('dev'));

// Rate limiter for auth endpoints
app.use('/api/auth', authLimiter);

// Routes
app.use('/api/auth', authRoutes);

// Health check
app.get('/health', (req, res) => res.send({ status: 'ok' }));

// Global error handler (simple)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Auth service listening on port ${PORT}`);
});
