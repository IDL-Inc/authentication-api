module.exports = (sequelize, DataTypes) => {
  const BusinessConfig = sequelize.define(
    'BusinessConfig',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      business_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'businesses',
          key: 'id'
        }
      },
      config_key: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      config_value: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    },
    {
      tableName: 'business_configs',
      timestamps: true,
      underscored: true,
      indexes: [
        {
          fields: ['business_id']
        },
        {
          unique: true,
          fields: ['business_id', 'config_key']
        }
      ]
    }
  )
  BusinessConfig.associate = function (models) {
    BusinessConfig.belongsTo(models.Business, {
      foreignKey: 'business_id',
      as: 'business'
    })
  }
  return BusinessConfig
}
