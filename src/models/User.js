module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    business_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'businesses',
        key: 'id'
      }
    },
    first_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    last_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: [8, 100]
      }
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    role: {
      type: DataTypes.ENUM('super_admin', 'business_admin', 'warehouse_manager', 'delivery_person', 'admin', 'manager', 'customer_support', 'customer', 'user'),
      allowNull: false,
      defaultValue: 'user'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true
    },
    email_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    tableName: 'users',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['email']
      },
      {
        fields: ['business_id']
      },
      {
        fields: ['role']
      },
      {
        fields: ['is_active']
      }
    ]
  }
  )

  User.associate = function (models) {
    User.belongsTo(models.Business, {
      foreignKey: 'business_id',
      as: 'business'
    })
  }

  // Instance method to check password (will be used in authentication)
  User.prototype.validatePassword = async function (password) {
    const bcrypt = require('bcryptjs')
    return await bcrypt.compare(password, this.password)
  }

  // instane method to get user info without password
  User.prototype.toJSON = function () {
    const values = { ...this.get() }
    delete values.password
    return values
  }
  return User
}
