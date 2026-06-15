const Sequelize = require('sequelize');
const db = require('../bancoDados');

const ServicoDisponibilidades = db.define('servico_disponibilidades', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    servicoId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: 'servico_id'
    },
    diaDaSemana: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: 'dia_da_semana'
    },
    horaInicio: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'hora_inicio'
    },
    horaFim: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'hora_fim'
    }
});

module.exports = ServicoDisponibilidades;
