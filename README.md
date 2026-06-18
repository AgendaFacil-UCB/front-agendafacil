# 📅 AgendaFácil

Um sistema web moderno e intuitivo para gerenciamento de agendamentos entre clientes e prestadores de serviço.

---

## ✨ Últimas Mudanças (v1.1.0)

- ✅ **Refatoração de Templates**: Todos os templates agora usam extensão `.html` (consolidado)
- ✅ **Consolidação de Erros**: Arquivo `404.html` e `erro.html` agora são um só (`erro.html` dinâmico)
- ✅ **Renomeação de Entrada**: `indice.js` → `server.js` (convenção Express mais clara)
- ✅ **Server-Side Forms**: Removido lógica pesada de JavaScript das views (agendamento, confirmar/cancelar)
- ✅ **Estrutura Limpa**: Melhor separação de responsabilidades entre cliente e servidor

---

## 📋 Sobre o Projeto

**AgendaFácil** é uma plataforma que conecta clientes que precisam de serviços com prestadores de serviço. O sistema permite que:

- **Prestadores de Serviço**: Cadastrem seus serviços, definam disponibilidades e horários, e gerenciem agendamentos
- **Clientes**: Busquem serviços disponíveis, escolham horários e façam agendamentos

---

## ✨ Funcionalidades Principais

### Para Clientes
- ✅ Cadastro e autenticação segura
- ✅ Visualizar lista de serviços disponíveis
- ✅ Buscar horários disponíveis por serviço
- ✅ Agendar serviços em horários específicos
- ✅ Visualizar seus agendamentos
- ✅ Cancelar agendamentos

### Para Prestadores
- ✅ Cadastro e autenticação com validação de tipo de usuário
- ✅ Criar e gerenciar seus serviços
- ✅ Definir disponibilidades e horários
- ✅ Visualizar agendamentos recebidos
- ✅ Confirmar e cancelar agendamentos
- ✅ Painel administrativo com estatísticas

---

## 🛠️ Requisitos

Antes de começar, você precisa ter instalado:

- **Node.js** (versão 14 ou superior)
- **npm** (geralmente vem com o Node.js)

Verifique se estão instalados:
```bash
node --version
npm --version
```

---

## 🚀 Instalação

### 1. Clone ou baixe o projeto
```bash
cd agendafacil-pt2
```

### 2. Instale as dependências
```bash
npm install
```

Isso instalará automaticamente:
- **Express**: Framework web
- **Sequelize**: ORM para banco de dados
- **SQLite3**: Banco de dados local
- **Bcryptjs**: Criptografia de senhas
- **Express-validator**: Validação de formulários
- **Mustache**: Motor de templates
- **Express-session**: Gerenciamento de sessões

---

## ⚙️ Configuração

### 1. O banco de dados será criado automaticamente

Na primeira execução, o arquivo `banco.sqlite` será criado na pasta `src/` com todas as tabelas necessárias.

---

## ▶️ Como Executar

### Modo de Desenvolvimento (com auto-reload)
```bash
npm run dev
```

### Modo de Produção
```bash
npm start
```

O servidor iniciará em: **http://localhost:3000**

---

## 📁 Estrutura do Projeto

```
agendafacil-pt2/
├── src/
│   ├── app.js                          # Configuração principal do Express
│   ├── server.js                       # Ponto de entrada da aplicação (renomeado de indice.js)
│   ├── sincronizar.js                  # Sincronização do banco de dados e relações
│   ├── bancoDados.js                   # Configuração do Sequelize/SQLite
│   ├── banco.sqlite                    # Banco de dados (criado automaticamente)
│   │
│   ├── controllers/                    # Lógica das requisições
│   │   ├── controladorAutenticacao.js  # Login, cadastro, logout
│   │   ├── controladorAgendamentos.js  # CRUD de agendamentos
│   │   ├── controladorServicos.js      # CRUD de serviços e disponibilidades
│   │   └── controladorPainel.js        # Painel de controle (cliente/prestador)
│   │
│   ├── models/                         # Estrutura das tabelas do banco
│   │   ├── usuario.js                  # Tabela de usuários
│   │   ├── servico.js                  # Tabela de serviços
│   │   ├── agendamento.js              # Tabela de agendamentos
│   │   ├── categoria.js                # Tabela de categorias
│   │   └── servico_disponibilidades.js # Disponibilidades dos serviços (dias/horas)
│   │
│   ├── services/                       # Lógica de negócio reutilizável
│   │   ├── servicoAutenticacao.js      # Funções de autenticação
│   │   └── servicoAgendamentos.js      # Funções de agendamento (horários, validação)
│   │
│   ├── routers/                        # Definição das rotas
│   │   ├── rotasAutenticacao.js        # Rotas de login/cadastro/logout
│   │   ├── rotasServicos.js            # Rotas de serviços (CRUD)
│   │   ├── rotasAgendamentos.js        # Rotas de agendamentos
│   │   └── rotasPainel.js              # Rotas do painel
│   │
│   ├── middleware/                     # Validações e tratamento
│   │   ├── middlewareAutenticacao.js   # Verifica se usuário está logado e tipo
│   │   └── tratadorDeErros.js          # Centraliza tratamento de erros
│   │
│   └── views/                          # Templates HTML (Mustache)
│       ├── layout.html                 # Template base (wrapper)
│       ├── index.html                  # Página inicial
│       ├── erro.html                   # Página de erros (404, 500, etc)
│       ├── autenticacao/               # Páginas de autenticação
│       │   ├── cadastro.html           # Cadastro com seleção de tipo
│       │   └── entrar.html             # Login
│       ├── servicos/                   # Páginas de serviços
│       │   ├── lista.html              # Listagem de serviços
│       │   ├── detalhe.html            # Detalhes + agendamento
│       │   └── criar.html              # Criar novo serviço
│       ├── agendamentos/               # Páginas de agendamentos
│       │   ├── meus-agendamentos.html  # Agendamentos do cliente
│       │   └── agendamentos-prestador.html # Agendamentos recebidos
│       └── painel/                     # Páginas do painel
│           ├── cliente.html            # Dashboard do cliente
│           └── prestador.html          # Dashboard do prestador
│
├── public/                             # Arquivos estáticos
│   ├── css/
│   │   └── style.css                   # Estilos da aplicação
│   └── js/
│       └── main.js                     # JavaScript do cliente
│
├── .env.example                        # Exemplo de variáveis de ambiente
├── package.json                        # Dependências do projeto
├── LICENSE                             # Licença MIT
└── README.md                           # Este arquivo
```

---

## 🔐 Segurança

### Autenticação
- Senhas são criptografadas com **bcryptjs**
- Sessões são gerenciadas de forma segura com **express-session**
- Middleware verifica se usuário está autenticado em rotas protegidas

### Validação
- Dados de entrada são validados com **express-validator**
- Verifica tipo de usuário (cliente/prestador) antes de ações

---

## 💻 Fluxo de Uso

### 1️⃣ Cadastro e Autenticação
```
Usuário acessa / → Clica em "Cadastrar ou Entrar"
→ Preenche formulário (tipo: cliente ou prestador)
→ É redirecionado para o painel correspondente
```

### 2️⃣ Cliente Agendando Serviço
```
Cliente → Vai em "/servicos"
→ Visualiza lista de serviços
→ Clica em um serviço → Vê detalhes
→ Clica em "Agendar" → Seleciona data e hora
→ Confirma agendamento
→ Vê confirmação em "Meus Agendamentos"
```

### 3️⃣ Prestador Gerenciando
```
Prestador → Vai para "/painel"
→ Cria novo serviço com categorias
→ Define horários de funcionamento
→ Recebe agendamentos em "Agendamentos Recebidos"
→ Confirma ou cancela agendamentos
```

---

## 🔧 Tecnologias Utilizadas

| Tecnologia | Versão | Uso |
|-----------|--------|-----|
| **Node.js** | 14+ | Runtime JavaScript |
| **Express** | 4.18.2 | Framework web |
| **Sequelize** | 6.37.8 | ORM do banco de dados |
| **SQLite3** | 5.1.6 | Banco de dados |
| **Bcryptjs** | 2.4.3 | Criptografia de senhas |
| **Express-session** | 1.17.3 | Gerenciamento de sessões |
| **Express-validator** | 7.0.0 | Validação de dados |
| **Mustache** | 4.2.0 | Templates HTML |
| **Dotenv** | 16.3.1 | Variáveis de ambiente |

---

## 📚 Endpoints Principais

### Autenticação
- `GET /autenticacao/cadastro` - Página de cadastro
- `POST /autenticacao/cadastro` - Criar novo usuário
- `GET /autenticacao/entrar` - Página de login
- `POST /autenticacao/entrar` - Fazer login
- `GET /autenticacao/sair` - Logout

### Serviços
- `GET /servicos` - Listar todos os serviços
- `GET /servicos/:id` - Detalhes de um serviço
- `POST /servicos` - Criar novo serviço (prestador)

### Agendamentos
- `GET /agendamentos/horarios/:servicoId` - Horários disponíveis
- `POST /agendamentos` - Criar agendamento
- `GET /agendamentos/meus-agendamentos` - Agendamentos do cliente
- `GET /agendamentos/agendamentos-prestador` - Agendamentos recebidos
- `POST /agendamentos/:id/confirmar` - Confirmar agendamento
- `POST /agendamentos/:id/cancelar` - Cancelar agendamento

### Painel
- `GET /painel` - Painel principal

---

## 🐛 Solução de Problemas


### Erro: "Port 3000 is already in use"
**Solução**: Altere a porta no `.env`:
```bash
PORT=3001
```

### Banco de dados vazio
**Solução**: Verifique se o arquivo `banco.sqlite` foi criado em `src/`. Se não, execute:
```bash
npm run dev
```

---

## 📖 Como Usar (Guia Rápido)

1. **Instale tudo**:
   ```bash
   npm install
   ```

2. **Crie o arquivo `.env`** com suas configurações

3. **Inicie o servidor**:
   ```bash
   npm run dev
   ```

4. **Acesse** http://localhost:3000

5. **Cadastre-se** como cliente ou prestador

6. **Explore** e teste as funcionalidades!

---

## 📝 Notas Importantes

- O banco de dados é local (SQLite), ideal para desenvolvimento
- As sessões expirarem após 24 horas de inatividade
- Para produção, altere `SESSION_SECRET` no `.env`
- Para usar HTTPS, configure a variável `NODE_ENV=production`

---

## 📄 Licença

Este projeto está licensiado sob a **MIT License** - veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 🤝 Contribuições

Sinta-se livre para fazer um fork, criar branches e enviar pull requests com melhorias!

---

## ❓ Suporte

Se encontrar problemas ou tiver dúvidas:
1. Verifique a seção "Solução de Problemas" acima
2. Revise os logs do servidor (console)
3. Certifique-se de que o Node.js está corretamente instalado

---

**Desenvolvido com ❤️ para facilitar agendamentos**
