const { validationResult } = require('express-validator');
const Servico = require('../models/servico');
const ServicoDisponibilidades = require('../models/servico_disponibilidades');
const ServicoAgendamentos = require('../services/servicoAgendamentos');
const Categoria = require('../models/categoria');
const Usuario = require('../models/usuario');

const getLista = async (req, res) => {
  try {
    const servicos = await Servico.findAll({
      include: [
        { model: Categoria, as: 'categoria' },
        { model: Usuario, as: 'prestador', attributes: ['id', 'nome'] }
      ],
      order: [['criadoEm', 'DESC']]
    });

    res.render('servicos/lista', {
      title: 'Serviços',
      servicos: servicos || []
    });
  } catch (err) {
    return res.status(500).send('Erro ao listar serviços');
  }
};

const getDetalhe = async (req, res) => {
  try {
    const servico = await Servico.findByPk(req.params.id, {
      include: [
        { model: Categoria, as: 'categoria' },
        { model: Usuario, as: 'prestador', attributes: ['id', 'nome', 'telefone'] }
      ]
    });

    if (!servico) {
      return res.status(404).render('404');
    }

    const disponibilidades = await ServicoDisponibilidades.findAll({
      where: { servicoId: servico.id },
      order: [['diaDaSemana', 'ASC']]
    });

    const nomesDias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

    const diasFuncionamento = disponibilidades.map(d => ({
      nome: nomesDias[d.diaDaSemana],
      horaInicio: d.horaInicio,
      horaFim: d.horaFim
    }));

    // Se houver ?data=YYYY-MM-DD, calcular horários disponíveis e repassar para a view
    const selectedData = req.query.data || '';
    let horarios = [];
    if (selectedData) {
      try {
        horarios = await ServicoAgendamentos.getHorariosDisponiveis(servico.id, selectedData);
      } catch (err) {
        // Em caso de erro ao buscar horários (data inválida, serviço não encontrado),
        // simplesmente não retornamos horários e deixamos a view exibir mensagem apropriada.
        horarios = [];
      }
    }

    // Data mínima para o input date (hoje)
    const hoje = new Date();
    const minDate = hoje.toISOString().slice(0, 10);

    res.render('servicos/detalhe', {
      title: servico.nome,
      servico: servico,
      diasFuncionamento,
      podeAgendar: req.session.usuario && req.session.usuario.tipo === 'cliente',
      horarios,
      selectedData,
      minDate
    });
  } catch (err) {
    return res.status(500).send('Erro ao buscar serviço');
  }
};

const getCriar = async (req, res) => {
  if (req.session.usuario.tipo !== 'prestador') {
    return res.status(403).send('Apenas prestadores podem criar serviços');
  }

  try {
    const categorias = await Categoria.findAll({
      order: [['nome', 'ASC']]
    });

    res.render('servicos/criar', {
      title: 'Criar Serviço',
      categorias: categorias || []
    });
  } catch (err) {
    return res.status(500).send('Erro ao buscar categorias');
  }
};

const postCriar = async (req, res) => {
  if (req.session.usuario.tipo !== 'prestador') {
    return res.status(403).send('Apenas prestadores podem criar serviços');
  }

  console.log(req.body);

  const erros = validationResult(req);
  if (!erros.isEmpty()) {
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.status(400).json({ errors: erros.array() });
    }

    const categorias = await Categoria.findAll();
    return res.status(400).render('servicos/criar', {
      title: 'Criar Serviço',
      errors: erros.array(),
      categorias
    });
  }

  try {
    const { nome, categoria_id, descricao, duracao, preco } = req.body;

    const servico = await Servico.create({
      prestadorId: req.session.usuario.id,
      categoriaId: categoria_id,
      nome,
      descricao,
      duracao,
      preco
    });

    const { dias, hora_inicio, hora_fim } = req.body;

    const arrayDias = Array.isArray(dias)
        ? dias
        : [dias];

    for (const dia of arrayDias) {
      await ServicoDisponibilidades.create({
        servicoId: servico.id,
        diaDaSemana: parseInt(dia),
        horaInicio: hora_inicio,
        horaFim: hora_fim
      });
    }

    res.redirect('/servicos');
  } catch (err) {
    console.log(err);
    return res.status(500).send('Erro ao criar serviço');
  }
};

module.exports = {
  getLista,
  getDetalhe,
  getCriar,
  postCriar
};
