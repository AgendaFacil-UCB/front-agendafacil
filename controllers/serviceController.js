const { validationResult } = require('express-validator');
const Service = require('../models/service');
const Category = require('../models/category');

const getList = async (req, res) => {
  try {
    const services = await Service.findAll({
      include: [
        { model: Category, as: 'category' },
        { model: require('../models/user'), as: 'prestador', attributes: ['id', 'name'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.render('services/list', {
      title: 'Serviços',
      services: services || []
    });
  } catch (err) {
    return res.status(500).send('Erro ao listar serviços');
  }
};

const getDetail = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id, {
      include: [
        { model: Category, as: 'category' },
        { model: require('../models/user'), as: 'prestador', attributes: ['id', 'name', 'phone'] }
      ]
    });

    if (!service) {
      return res.status(404).render('404');
    }

    res.render('services/detail', {
      title: service.name,
      service: service,
      canBook: req.session.user && req.session.user.type === 'cliente'
    });
  } catch (err) {
    return res.status(500).send('Erro ao buscar serviço');
  }
};

const getCreate = async (req, res) => {
  if (req.session.user.type !== 'prestador') {
    return res.status(403).send('Apenas prestadores podem criar serviços');
  }

  try {
    const categories = await Category.findAll({
      order: [['name', 'ASC']]
    });

    res.render('services/create', {
      title: 'Criar Serviço',
      categories: categories || []
    });
  } catch (err) {
    return res.status(500).send('Erro ao buscar categorias');
  }
};

const postCreate = async (req, res) => {
  if (req.session.user.type !== 'prestador') {
    return res.status(403).send('Apenas prestadores podem criar serviços');
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.status(400).json({ errors: errors.array() });
    }

    const categories = await Category.findAll();
    return res.status(400).render('services/create', {
      title: 'Criar Serviço',
      errors: errors.array(),
      categories
    });
  }

  try {
    const { name, category_id, description, duration, price } = req.body;

    await Service.create({
      prestadorId: req.session.user.id,
      categoryId: category_id,
      name,
      description,
      duration,
      price
    });

    res.redirect('/services');
  } catch (err) {
    return res.status(500).send('Erro ao criar serviço');
  }
};

module.exports = {
  getList,
  getDetail,
  getCreate,
  postCreate
};

