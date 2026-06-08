# 📅 AgendaFácil - Sistema de Agendamento

Um sistema completo de agendamento de serviços desenvolvido com **Node.js**, **Express** e **Mustache Templates**.

## ✨ Características

- ✅ Dois tipos de usuários: **Clientes** e **Prestadores de Serviço**
- ✅ Sistema de autenticação com criptografia de senha
- ✅ Gerenciamento de serviços (Barbearia, Manicure, Educação, etc.)
- ✅ Agendamentos com horários disponíveis
- ✅ Templates renderizados com Mustache
- ✅ Dashboard personalizado por tipo de usuário
- ✅ Banco de dados SQLite integrado
- ✅ Interface moderna com Bootstrap 5

## 🛠️ Tecnologias Utilizadas

- **Backend**: Node.js + Express.js
- **Template Engine**: Mustache.js
- **Banco de Dados**: SQLite3
- **Autenticação**: bcryptjs + express-session
- **Validação**: express-validator
- **Frontend UI**: Bootstrap 5
- **CSS**: Custom CSS + Bootstrap

## 📦 Instalação

### Pré-requisitos
- Node.js v14+ 
- npm ou yarn

### Passos

1. **Clone o repositório**
```bash
git clone <seu-repositorio>
cd front-agendafacil
```

2. **Instale as dependências**
```bash
npm install
```

3. **Inicie o servidor**
```bash
npm start
```

4. **Acesse a aplicação**
Abra seu navegador e vá para: `http://localhost:3000`

### Desenvolvimento (com auto-reload)
```bash
npm run dev
```

## 📁 Estrutura do Projeto

```
front-agendafacil/
├── src/
│   ├── server.js              # Configuração principal do Express
│   ├── database.js            # Configuração do SQLite
│   └── routes/
│       ├── auth.js            # Rotas de autenticação
│       ├── services.js        # Rotas de serviços
│       ├── appointments.js    # Rotas de agendamentos
│       └── dashboard.js       # Rotas de dashboard
├── views/
│   ├── layout.mustache        # Template layout principal
│   ├── index.mustache         # Página inicial
│   ├── 404.mustache           # Página de erro
│   ├── auth/
│   │   ├── login.mustache
│   │   └── register.mustache
│   ├── services/
│   │   ├── list.mustache
│   │   ├── detail.mustache
│   │   └── create.mustache
│   ├── appointments/
│   │   ├── new.mustache
│   │   ├── my-appointments.mustache
│   │   └── prestador-appointments.mustache
│   └── dashboard/
│       ├── cliente.mustache
│       └── prestador.mustache
├── public/
│   ├── css/
│   │   └── style.css          # Estilos customizados
│   └── js/
│       └── main.js            # Scripts do frontend
├── package.json
└── README.md
```

## 🔐 Autenticação

### Como Funciona
- Senhas são criptografadas com **bcryptjs**
- Sessões gerenciadas com **express-session**
- Cookies seguros com opção httpOnly

### Tipos de Usuário

#### 👤 Cliente
- Busca e agenda serviços
- Visualiza seus agendamentos
- Pode cancelar agendamentos
- Dashboard personalizado

#### 💼 Prestador
- Cria e gerencia seus serviços
- Visualiza agendamentos de clientes
- Confirma/cancela agendamentos
- Dashboard com estatísticas

## 📊 Banco de Dados

### Tabelas Principais

**users**
```sql
- id: Integer (PK)
- name: String
- email: String (unique)
- password: String (criptografado)
- type: String (prestador | cliente)
- phone: String (opcional)
- created_at: DateTime
```

**services**
```sql
- id: Integer (PK)
- prestador_id: Integer (FK)
- category_id: Integer (FK)
- name: String
- description: Text
- duration: Integer (minutos)
- price: Float
- created_at: DateTime
```

**appointments**
```sql
- id: Integer (PK)
- cliente_id: Integer (FK)
- service_id: Integer (FK)
- prestador_id: Integer (FK)
- appointment_date: DateTime
- status: String (pendente | confirmado | cancelado | concluído)
- created_at: DateTime
```

**categories**
```sql
- id: Integer (PK)
- name: String
- description: Text
```

## 🚀 Funcionalidades Principais

### 1. Autenticação
- Registro de novo usuário
- Login com validação
- Logout seguro
- Sessão persistente

### 2. Serviços
- Listar todos os serviços
- Ver detalhes de um serviço
- Criar novo serviço (prestador)
- Filtrar por categoria

### 3. Agendamentos
- Agendar um serviço (cliente)
- Ver histórico de agendamentos
- Cancelar agendamento
- Confirmar agendamento (prestador)

### 4. Dashboard
- Dashboard para cliente com próximos agendamentos
- Dashboard para prestador com estatísticas
- Ações rápidas

## 🎯 Fluxo de Uso

### Para Cliente
1. Cadastrar como cliente
2. Fazer login
3. Explorar serviços disponíveis
4. Agendar um serviço
5. Visualizar agendamentos no dashboard

### Para Prestador
1. Cadastrar como prestador
2. Fazer login
3. Criar serviços
4. Gerenciar agendamentos
5. Visualizar estatísticas no dashboard

## 🔧 Configurações

### Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto:
```env
PORT=3000
NODE_ENV=development
SESSION_SECRET=sua-chave-secreta-aqui
```

## 📝 Endpoints da API

### Autenticação
- `GET /auth/register` - Página de registro
- `POST /auth/register` - Registrar novo usuário
- `GET /auth/login` - Página de login
- `POST /auth/login` - Fazer login
- `GET /auth/logout` - Fazer logout

### Serviços
- `GET /services` - Listar serviços
- `GET /services/:id` - Detalhes do serviço
- `GET /services/create` - Página de criar serviço
- `POST /services` - Criar novo serviço

### Agendamentos
- `GET /appointments/new/:serviceId` - Página de agendamento
- `POST /appointments` - Criar agendamento
- `GET /appointments/my-appointments` - Meus agendamentos (cliente)
- `GET /appointments/prestador-appointments` - Agendamentos (prestador)
- `POST /appointments/:id/cancel` - Cancelar agendamento

### Dashboard
- `GET /dashboard/cliente` - Dashboard do cliente
- `GET /dashboard/prestador` - Dashboard do prestador

## 🎨 Customização

### Adicionar Nova Categoria
Edit `src/database.js` na função `initializeDatabase()`:
```javascript
db.run(`
  INSERT OR IGNORE INTO categories (name, description) VALUES
  ('Nova Categoria', 'Descrição da categoria')
`);
```

### Mudar Cores
Edit `public/css/style.css` para alterar variáveis CSS:
```css
:root {
    --primary-color: #0d6efd;
    --success-color: #198754;
}
```

## 🚨 Tratamento de Erros

A aplicação usa validação em dois níveis:
1. **Client-side**: Validação HTML5
2. **Server-side**: express-validator com mensagens personalizadas

## 📱 Responsividade

- Layout responsivo com Bootstrap 5
- Mobile-friendly
- Testes em diferentes tamanhos de tela

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT - veja o arquivo LICENSE para detalhes.

## 👤 Autor

Desenvolvido como um sistema de agendamento educacional.

## 🔮 Próximas Melhorias

- [ ] Notificações por email
- [ ] Sistema de avaliação de serviços
- [ ] Relatórios e analytics
- [ ] Integração com pagamento
- [ ] App mobile
- [ ] Busca avançada de serviços
- [ ] Múltiplos schedules por prestador
- [ ] Cancelamento automático por inatividade

## 📞 Suporte

Para dúvidas ou problemas, abra uma issue no repositório.
