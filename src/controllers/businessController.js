const models = require('../models')
const { successResponse, errorResponse, serverErrorResponse } = require('../utils/responseHandlers')
const { generateToken, hashPassword } = require('../utils/auth')

const businessController = {
  // Register a new business
  registerBusiness: async (req, res) => {
    try {
      const {
        business_name,
        business_type,
        contact_email,
        phone,
        address,
        city,
        admin_name,
        admin_email,
        admin_password
      } = req.body

      // Check if business with the same email already exists
      const existingBusiness = await models.Business.findOne({
        where: { contact_email }
      })
      if (existingBusiness) {
        return errorResponse(res, 'Business with this email already exists', 409)
      }

      // Create new business
      const business = await models.Business.create({
        business_name,
        business_type,
        contact_email,
        phone,
        address,
        city
      })

      // create default configuration for the business
      const defaultConfigs = [
        { config_key: 'theme', config_value: 'default' },
        { config_key: 'currency', config_value: 'INR' },
        { config_key: 'timezone', config_value: 'Asia/Kolkata' }
      ]

      for (const config of defaultConfigs) {
        await models.BusinessConfig.create({
          business_id: business.id,
          ...config
        })
      }

      // In a real scenario, Create admin user for the business
      // For now, you will return just business data

      return successResponse(
        res,
        'Business registered successfully',
        {
          business: {
            id: business.id,
            business_name: business.business_name,
            business_type: business.business_type,
            contact_email: business.contact_email,
            is_active: business.is_active
          }
        },
        201
      )
    } catch (error) {
      console.error('Error registering business:', error)
      return serverErrorResponse(res, 'Failed to register business')
    }
  },

  // Get all businesses (for super admin)
  getAllBusinesses: async (req, res) => {
    try {
      const businesses = await models.Business.findAll({
        attributes: { exclude: ['created_at', 'updated_at'] },
        include: [
          {
            model: models.BusinessConfig,
            as: 'configurations',
            attributes: ['config_key', 'config_value']
          }
        ]
      })
      return successResponse(res, 'Businesses retrieved successfully', { businesses })
    } catch (error) {
      console.error('Get fetching businesses:', error)
      return serverErrorResponse(res, 'Failed to fetch businesses')
    }
  },

  // Get business by ID
  getBusinessById: async (req, res) => {
    try {
      const { businessId } = req.params

      const business = await models.Business.findByPk(businessId, {
        attributes: { exclude: ['created_at', 'updated_at'] },
        include: [
          {
            model: models.BusinessConfig,
            as: 'configurations',
            attributes: ['config_key', 'config_value']
          }
        ]
      })

      if (!business) {
        return errorResponse(res, 'Business not found', 404)
      }

      return successResponse(res, 'Business retrieved successfully', { business })
    } catch (error) {
      console.error('Error fetching business by ID:', error)
      return serverErrorResponse(res, 'Failed to fetch business')
    }
  },

  // update business
  updateBusiness: async (req, res) => {
    try {
      const { businessId } = req.params
      const updateData = req.body

      const business = await models.Business.findByPk(businessId)

      if (!business) {
        return errorResponse(res, 'Business not found', 404)
      }

      await business.update(updateData)

      return successResponse(res, 'Business updated successfully', {
        business: {
          id: business.id,
          business_name: business.business_name,
          business_type: business.business_type,
          contact_email: business.contact_email,
          is_active: business.is_active
        }
      })
    } catch (error) {
      console.error('Error updating business:', error)
      return serverErrorResponse(res, 'Failed to update business')
    }
  }
}

module.exports = businessController
