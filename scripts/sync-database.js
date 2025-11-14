const { sequelize, testConnection } = require('../src/config/database')
const models = require('../src/models')

const syncDatabase = async () => {
  try {
    await testConnection()
    console.log('starting database synchronization...')

    // Synchronize all models
    await sequelize.sync({ force: false, alter: true })
    console.log('database synchronized successfully.')

    // create initial admin business for testing
    const initialBusiness = await models.Business.findOrCreate({
      where: { contact_email: 'info@agribiz.farm' },
      defaults: {
        business_name: 'AgriBiz Farm',
        business_type: 'agriculture',
        phone: '+1234567890',
        address: 'Begusarai, Bihar, India',
        city: 'Begusarai',
        state: 'Bihar'
      }
    })
    console.log('Initial business ensured:', initialBusiness[0].business_name)

    process.exit(0)
  } catch (error) {
    console.log('database synchronization failed:', error)
    process.exit(1)
  }
}

syncDatabase()
