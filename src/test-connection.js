// test-connection.js
const { Client } = require('pg')
require('dotenv').config()

async function testConnection () {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || null,
    database: process.env.DB_NAME
  })

  try {
    await client.connect()
    console.log('✅ Successfully connected to PostgreSQL database!')

    // Test query
    const result = await client.query('SELECT current_database(), current_user, version();')
    console.log('📊 Connection Details:')
    console.log('   Database:', result.rows[0].current_database)
    console.log('   User:', result.rows[0].current_user)
    console.log('   Version:', result.rows[0].version.split(',')[0])

    await client.end()
    return true
  } catch (error) {
    console.error('❌ Connection failed:', error.message)
    return false
  }
}

testConnection()
