const { sequelize, testConnection } = require('../src/config/database')
const models = require('../src/models')

const syncDatabase = async () => {
  try {
    console.log('🔄 Testing database connection...')
    await testConnection()

    console.log('🔄 Starting database synchronization...')

    // Sync all models
    await sequelize.sync({ force: false, alter: true })

    console.log('✅ Database synchronized successfully')

    // Create initial super admin user
    const { hashPassword } = require('../src/utils/auth')

    const superAdmin = await models.User.findOrCreate({
      where: { email: 'superadmin@platform.com' },
      defaults: {
        first_name: 'Super',
        last_name: 'Admin',
        email: 'superadmin@platform.com',
        password: await hashPassword('admin123'),
        phone: '+910000000000',
        role: 'super_admin',
        business_id: null // Super admin doesn't belong to a business
      }
    })

    console.log('✅ Super admin user created:', superAdmin[0].email)

    // Create a sample business for testing
    const sampleBusiness = await models.Business.findOrCreate({
      where: { contact_email: 'demo@agribiz.com' },
      defaults: {
        business_name: 'Demo Agriculture Business',
        business_type: 'agriculture',
        contact_email: 'demo@agribiz.com',
        phone: '+919876543210',
        address: '123 Farm Road, Agricultural Zone'
      }
    })

    console.log('✅ Sample business created:', sampleBusiness[0].business_name)

    // Create business admin user
    const businessAdmin = await models.User.findOrCreate({
      where: { email: 'admin@agribiz.com' },
      defaults: {
        business_id: sampleBusiness[0].id,
        first_name: 'Business 1',
        last_name: 'Admin',
        email: 'admin@agribiz.com',
        password: await hashPassword('admin123'),
        phone: '+919876543211',
        role: 'admin'
      }
    })

    console.log('✅ Business admin user created:', businessAdmin[0].email)

    console.log('\n🎉 Database setup completed successfully!')
    console.log('📋 Sample credentials:')
    console.log('   Super Admin: superadmin@platform.com / admin123')
    console.log('   Business Admin: admin@agribiz.com / admin123')

    process.exit(0)
  } catch (error) {
    console.error('❌ Database synchronization failed:', error)
    process.exit(1)
  }
}

syncDatabase()
