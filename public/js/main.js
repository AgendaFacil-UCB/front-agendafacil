// Adicionar helper para comparação de igualdade no Mustache
Mustache.tags = ['{{', '}}'];

// Função auxiliar para Mustache (caso necessário)
window.ifEqual = function(a, b) {
  return a === b;
};

// Inicialização geral
document.addEventListener('DOMContentLoaded', function() {
  console.log('AgendaFácil carregado');

  // Validação de formulários
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    form.addEventListener('submit', function(e) {
      if (!form.checkValidity()) {
        e.preventDefault();
        e.stopPropagation();
      }
      form.classList.add('was-validated');
    });
  });
});

// Função para formatação de data/hora
function formatDateTime(dateTime) {
  const date = new Date(dateTime);
  return date.toLocaleString('pt-BR');
}

// Função para mostrar notificações
function showNotification(message, type = 'success') {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
  alertDiv.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;

  const mainContainer = document.querySelector('main');
  mainContainer.insertBefore(alertDiv, mainContainer.firstChild);

  // Auto-remover após 5 segundos
  setTimeout(() => {
    alertDiv.remove();
  }, 5000);
}

