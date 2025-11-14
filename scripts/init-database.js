const { Sequelize } = require('sequelize')
require('dotenv').config()

const initDatabase = async () => {
  try {
    // connect to postgresSQL without specifying database to create it
    const sequelize = new Sequelize(
      'postgres',
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'postgres',
        logging: console.log
      }
    )

    await sequelize.authenticate()
    console.log('Connection has been established successfully.')

    // Create the database if exists
    const [results] = await sequelize.query(`
        SELECT 1 FROM pg_database WHERE datname = '${process.env.DB_NAME}';
      `)

    if (results.length === 0) {
      // Database does not exist, create it
      await sequelize.query(`CREATE DATABASE "${process.env.DB_NAME}";`)
      console.log(`Database "${process.env.DB_NAME}" created successfully.`)
    } else {
      console.log(`Database "${process.env.DB_NAME}" already exists.`)
    }
    await sequelize.close()
    console.log('Connection closed.')
    process.exit(0)
  } catch (error) {
    console.error('Unable to initialize the database:', error)
    process.exit(1)
  }
}

initDatabase()
