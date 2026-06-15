const bcrypt = require('bcryptjs');
const Usuario = require('../models/usuario');

const cadastrar = async ({ nome, email, senha, tipo, telefone, cnpj }) => {
  const emailExistente = await Usuario.findOne({ where: { email } });

  if (emailExistente) {
    const err = new Error('Email já cadastrado');
    err.code = 'EMAIL_EM_USO';
    throw err;
  }

  if (tipo === 'prestador' && !cnpj) {
    throw new Error('CNPJ é obrigatório para prestadores');
  }

  const senhaCriptografada = bcrypt.hashSync(senha, 10);
  const usuario = await Usuario.create({
    nome,
    email,
    senha: senhaCriptografada,
    tipo,
    telefone: telefone || null,
    cnpj: cnpj || null
  });

  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    tipo: usuario.tipo
  };
};

const entrar = async ({ email, senha }) => {
  const usuario = await Usuario.findOne({ where: { email } });
  if (!usuario) {
    const err = new Error('Email ou senha incorretos');
    err.code = 'CREDENCIAIS_INVALIDAS';
    throw err;
  }

  if (!bcrypt.compareSync(senha, usuario.senha)) {
    const err = new Error('Email ou senha incorretos');
    err.code = 'CREDENCIAIS_INVALIDAS';
    throw err;
  }

  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    tipo: usuario.tipo
  };
};

module.exports = {
  cadastrar,
  entrar
};
