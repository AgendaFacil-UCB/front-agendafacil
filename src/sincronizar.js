const db = require('./bancoDados');
const Usuario = require('./models/usuario');
const Categoria = require('./models/categoria');
const Servico = require('./models/servico');
const Agendamento = require('./models/agendamento');

// Definir relacionamentos
Servico.belongsTo(Usuario, { foreignKey: 'prestadorId', as: 'prestador' });
Servico.belongsTo(Categoria, { foreignKey: 'categoriaId', as: 'categoria' });

Agendamento.belongsTo(Usuario, { foreignKey: 'clienteId', as: 'cliente' });
Agendamento.belongsTo(Usuario, { foreignKey: 'prestadorId', as: 'prestador' });
Agendamento.belongsTo(Servico, { foreignKey: 'servicoId', as: 'servico' });

Usuario.hasMany(Servico, { foreignKey: 'prestadorId', as: 'servicos' });
Usuario.hasMany(Agendamento, { foreignKey: 'clienteId', as: 'agendamentosComoCliente' });
Usuario.hasMany(Agendamento, { foreignKey: 'prestadorId', as: 'agendamentosComoPrestador' });

Categoria.hasMany(Servico, { foreignKey: 'categoriaId', as: 'servicos' });

// Sincronizar banco de dados
const sincronizarBancoDados = async () => {
  try {
    await db.sync();
    console.log('Banco de dados sincronizado com sucesso');

    // Inserir categorias padrão
    const categorias = [
      { nome: 'Barbearia', descricao: 'Serviços de barbearia' },
      { nome: 'Manicure', descricao: 'Serviços de unhas' },
      { nome: 'Beleza', descricao: 'Serviços gerais de beleza' },
      { nome: 'Saúde', descricao: 'Serviços de saúde' },
      { nome: 'Educação', descricao: 'Aulas e cursos' }
    ];

    for (const cat of categorias) {
      await Categoria.findOrCreate({
        where: { nome: cat.nome },
        defaults: cat
      });
    }
  } catch (err) {
    console.error('Erro ao sincronizar banco de dados:', err);
  }
};

module.exports = sincronizarBancoDados;
