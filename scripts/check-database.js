const { Client } = require('pg')
require('dotenv').config()

const checkDatabase = async () => {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'postgres' // Connect to default database first
  })

  try {
    await client.connect()
    console.log('✅ Connected to PostgreSQL server')

    // Check if our database exists
    const result = await client.query(`
      SELECT datname FROM pg_database 
      WHERE datname = '${process.env.DB_NAME}'
    `)

    if (result.rows.length > 0) {
      console.log(`✅ Database '${process.env.DB_NAME}' exists`)

      // Check tables in our database
      const client2 = new Client({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      })

      await client2.connect()
      const tables = await client2.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `)

      console.log(`📊 Tables in database: ${tables.rows.map(row => row.table_name).join(', ')}`)
      await client2.end()
    } else {
      console.log(`❌ Database '${process.env.DB_NAME}' does not exist`)
      console.log('💡 Run: npm run db:init')
    }
  } catch (error) {
    console.error('❌ Connection error:', error.message)
  } finally {
    await client.end()
  }
}

checkDatabase()
