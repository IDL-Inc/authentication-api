const models = require('../models')
const { successResponse, errorResponse, serverErrorResponse } = require('../utils/responseHandlers')
const { generateToken, hashPassword, comparePassword } = require('../utils/auth')

const authController = {
  // user Registration
  register: async (req, res) => {
    try {
      const {
        business_id,
        first_name,
        last_name,
        email,
        password,
        phone,
        role = 'customer'
      } = req.body

      // check if user already exists
      const existingUser = await models.User.findOne({
        where: { email }
      })
      if (existingUser) {
        return errorResponse(res, 'User with this email already exists', 409)
      }

      // check if the business exists
      if (business_id) {
        const business = await models.Business.findByPk(business_id)
        if (!business) {
          return errorResponse(res, 'Business not found', 404)
        }
      }

      // hash password
      const hashedPassword = await hashPassword(password)

      // create user
      const user = await models.User.create({
        business_id,
        first_name,
        last_name,
        email,
        password: hashedPassword,
        phone,
        role
      })

      // generate JWT token
      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        businessId: user.business_id
      })

      return successResponse(res, 'User registered successfully', {
        user: user.toJSON(),
        token
      }, 200)
    } catch (error) {
      console.error('User Registration Error:', error)
      return serverErrorResponse(res, 'Failed to register user')
    }
  },

  // user Login
  login: async (req, res) => {
    try {
      const { email, password } = req.body

      // find user by email
      const user = await models.User.findOne({
        where: { email },
        include: [
          {
            model: models.Business,
            as: 'business',
            attributes: ['id', 'business_name', 'business_type', 'is_active']
          }
        ]
      })

      if (!user) {
        return errorResponse(res, 'Invalid email or password', 401)
      }

      // check if user is active
      if (!user.is_active) {
        return errorResponse(res, 'User account is inactive. Please contact support.', 401)
      }

      // check password
      const isPasswordValid = await user.validatePassword(password)
      if (!isPasswordValid) {
        return errorResponse(res, 'Invalid email or password', 401)
      }

      // update last login
      await user.update({ last_login: new Date() })

      // generate JWT token
      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        businessId: user.business_id
      })

      return successResponse(res, 'Login successful', {
        user: user.toJSON(),
        token
      }, 200)
    } catch (error) {
      console.error('User Login Error:', error)
      return serverErrorResponse(res, 'Failed to login user')
    }
  },

  // get current user profile
  getProfile: async (req, res) => {
    try {
      const user = await models.User.findByPk(req.user.userId, {
        attributes: { exclude: ['password'] },
        include: [
          {
            model: models.Business,
            as: 'business',
            attributes: ['id', 'business_name', 'business_type']
          }
        ]
      })

      if (!user) {
        return errorResponse(res, 'User not found', 404)
      }

      return successResponse(res, 'User profile fetched successfully', { user }, 200)
    } catch (error) {
      console.error('Get Profile Error:', error)
      return serverErrorResponse(res, 'Failed to fetch user profile')
    }
  },

  // update user profile
  updateProfile: async (req, res) => {
    try {
      const { first_name, last_name, phone } = req.body
      const user = await models.User.findByPk(req.user.userId)

      if (!user) {
        return errorResponse(res, 'User not found', 404)
      }

      await user.update({
        first_name: first_name || user.first_name,
        last_name: last_name || user.last_name,
        phone: phone || user.phone
      })

      return successResponse(res, 'User profile updated successfully', { user: user.toJSON() }, 200)
    } catch (error) {
      console.error('Update Profile Error:', error)
      return serverErrorResponse(res, 'Failed to update user profile')
    }
  },

  // change password
  changePassword: async (req, res) => {
    try {
      const { current_password, new_password } = req.body
      const user = await models.User.findByPk(req.user.userId)

      if (!user) {
        return errorResponse(res, 'User not found', 404)
      }

      // verify current password
      const isCurrentPasswordValid = await user.validatePassword(current_password)

      if (!isCurrentPasswordValid) {
        return errorResponse(res, 'Current password is incorrect', 401)
      }

      // hash new password
      const hashedNewPassword = await hashPassword(new_password)

      // update password
      await user.update({ password: hashedNewPassword })

      return successResponse(res, 'Password changed successfully', null, 200)
    } catch (error) {
      console.error('Change Password Error:', error)
      return serverErrorResponse(res, 'Failed to change password')
    }
  }
}

module.exports = authController
