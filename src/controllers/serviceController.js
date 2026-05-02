const { validationResult } = require('express-validator');
const Service = require('../models/Service');
const Category = require('../models/Category');

class ServiceController {
  static getList(req, res) {
    Service.findAll((err, services) => {
      if (err) {
        return res.status(500).send('Erro ao listar serviços');
      }

      res.render('services/list', {
        title: 'Serviços',
        services: services || []
      });
    });
  }

  static getDetail(req, res) {
    Service.findById(req.params.id, (err, service) => {
      if (err) {
        return res.status(500).send('Erro ao buscar serviço');
      }

      if (!service) {
        return res.status(404).render('404');
      }

      res.render('services/detail', {
        title: service.name,
        service: service,
        canBook: req.session.user && req.session.user.type === 'cliente'
      });
    });
  }

  static getCreate(req, res) {
    if (req.session.user.type !== 'prestador') {
      return res.status(403).send('Apenas prestadores podem criar serviços');
    }

    Category.findAll((err, categories) => {
      if (err) {
        return res.status(500).send('Erro ao buscar categorias');
      }

      res.render('services/create', {
        title: 'Criar Serviço',
        categories: categories || []
      });
    });
  }

  static postCreate(req, res) {
    if (req.session.user.type !== 'prestador') {
      return res.status(403).send('Apenas prestadores podem criar serviços');
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (req.headers.accept && req.headers.accept.includes('application/json')) {
        return res.status(400).json({ errors: errors.array() });
      }

      return res.status(400).render('services/create', {
        title: 'Criar Serviço',
        errors: errors.array()
      });
    }

    const { name, category_id, description, duration, price } = req.body;

    Service.create(
      req.session.user.id,
      category_id,
      name,
      description,
      duration,
      price,
      (err) => {
        if (err) {
          return res.status(500).send('Erro ao criar serviço');
        }

        res.redirect('/services');
      }
    );
  }
}

module.exports = ServiceController;

