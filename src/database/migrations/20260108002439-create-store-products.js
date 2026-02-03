'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('store_products', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      store_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'stores',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },

      product_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },

      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },

      stock: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      min_stock: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      status: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal(
          'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
        ),
      },
    });

    // Evita duplicar el mismo producto en la misma tienda
    await queryInterface.addConstraint('store_products', {
      fields: ['store_id', 'product_id'],
      type: 'unique',
      name: 'unique_store_product',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('store_products');
  },
};
