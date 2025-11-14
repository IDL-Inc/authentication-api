module.exports = (sequelize, DataTypes) => {
  const Business = sequelize.define('Business', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    business_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    business_type: {
      type: DataTypes.ENUM('agriculture', 'garments', 'electronics', 'general_store', 'services', 'other'),
      allowNull: false
    },
    contact_email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'businesses',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['contact_email']
      },
      {
        fields: ['business_type']
      },
      {
        fields: ['is_active']
      }
    ]
  })

  Business.associate = function (models) {
    // associations can be defined here
    Business.hasMany(models.BusinessConfig, {
      foreignKey: 'business_id',
      as: 'configurations'
    })

    // Add user association
    Business.hasMany(models.User, {
      foreignKey: 'business_id',
      as: 'users'
    })
  }
  return Business
}
