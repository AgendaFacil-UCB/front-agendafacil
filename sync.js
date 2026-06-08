const db = require('./db');
const User = require('./models/user');
const Category = require('./models/category');
const Service = require('./models/service');
const Appointment = require('./models/appointment');

// Definir relacionamentos
Service.belongsTo(User, { foreignKey: 'prestadorId', as: 'prestador' });
Service.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

Appointment.belongsTo(User, { foreignKey: 'clienteId', as: 'cliente' });
Appointment.belongsTo(User, { foreignKey: 'prestadorId', as: 'prestador' });
Appointment.belongsTo(Service, { foreignKey: 'serviceId', as: 'service' });

User.hasMany(Service, { foreignKey: 'prestadorId', as: 'services' });
User.hasMany(Appointment, { foreignKey: 'clienteId', as: 'appointmentsAsClient' });
User.hasMany(Appointment, { foreignKey: 'prestadorId', as: 'appointmentsAsPrestador' });

Category.hasMany(Service, { foreignKey: 'categoryId', as: 'services' });

// Sincronizar banco de dados
const syncDatabase = async () => {
  try {
    await db.sync();
    console.log('Banco de dados sincronizado com sucesso');

    // Inserir categorias padrão
    const categories = [
      { name: 'Barbearia', description: 'Serviços de barbearia' },
      { name: 'Manicure', description: 'Serviços de unhas' },
      { name: 'Beleza', description: 'Serviços gerais de beleza' },
      { name: 'Saúde', description: 'Serviços de saúde' },
      { name: 'Educação', description: 'Aulas e cursos' }
    ];

    for (const cat of categories) {
      await Category.findOrCreate({
        where: { name: cat.name },
        defaults: cat
      });
    }
  } catch (err) {
    console.error('Erro ao sincronizar banco de dados:', err);
  }
};

module.exports = syncDatabase;

