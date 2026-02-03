'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('roles', [
      {
        id: 1,
        name: 'Administrador',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 2,
        name: 'Cajero',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('roles', {
      id: [1, 2],
    });
  },
};
