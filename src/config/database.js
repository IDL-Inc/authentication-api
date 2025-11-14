const { Sequelize } = require('sequelize')
require('dotenv').config()

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    port: process.env.DB_PORT || 5432,
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 60000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true
    },
    dialectOptions: {
      ssl: process.env.DB_SSL === 'true'
        ? {
            require: true,
            rejectUnauthorized: false
          }
        : false
    }
  }
)

// Test Database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate()
    console.log('database connection established successfully.')

    // check database version
    const [result] = await sequelize.query('SELECT version();')
    console.log('database version:', result[0].version.split(' ')[1])
  } catch (error) {
    console.error('unable to connect to the database:', error)
    process.exit(1)
  }
}

module.exports = { sequelize, testConnection }
