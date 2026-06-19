document.addEventListener('DOMContentLoaded', () => {
    // Interceptar formulários POST (Adicionar/Editar)
    document.addEventListener('submit', async (e) => {
        if (e.target.tagName === 'FORM' && e.target.method.toUpperCase() === 'POST') {
            // Ignorar forms que possuam atributo data-no-ajax ou que sejam de login
            if (e.target.hasAttribute('data-no-ajax') || window.location.href.includes('index.php')) {
                return;
            }

            e.preventDefault();
            const formData = new FormData(e.target);
            const submitBtn = e.target.querySelector('button[type="submit"]');
            const originalText = submitBtn ? submitBtn.innerHTML : '';

            if (submitBtn) {
                submitBtn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Processando...';
                submitBtn.disabled = true;
            }

            try {
                // Enviar os dados POST
                await fetch(e.target.action || window.location.href, {
                    method: 'POST',
                    body: formData
                });

                // Buscar a mesma página atualizada silenciosamente
                const updatedPageRes = await fetch(window.location.href);
                const htmlText = await updatedPageRes.text();
                const parser = new DOMParser();
                const newDoc = parser.parseFromString(htmlText, 'text/html');

                // Substituir a tabela
                const newTable = newDoc.querySelector('.table-container');
                const oldTable = document.querySelector('.table-container');
                if (newTable && oldTable) {
                    oldTable.innerHTML = newTable.innerHTML;
                }

                // Substituir cards (se houver atualização de números)
                const newCards = newDoc.querySelector('.cards');
                const oldCards = document.querySelector('.cards');
                if (newCards && oldCards) {
                    oldCards.innerHTML = newCards.innerHTML;
                }

                // Substituir modais se existirem (para fechar ou atualizar)
                const newModals = newDoc.querySelectorAll('.modal-overlay');
                const oldModals = document.querySelectorAll('.modal-overlay');
                if (newModals.length > 0 && newModals.length === oldModals.length) {
                    oldModals.forEach((mod, index) => {
                        mod.innerHTML = newModals[index].innerHTML;
                    });
                }

                // Exibir Toast animado de Sucesso
                const newToast = newDoc.querySelector('.toast');
                let toastContainer = document.querySelector('.toast-container');
                if (!toastContainer) {
                    toastContainer = document.createElement('div');
                    toastContainer.className = 'toast-container';
                    document.body.appendChild(toastContainer);
                }
                if (newToast) {
                    toastContainer.innerHTML = newToast.outerHTML;
                } else {
                    toastContainer.innerHTML = '<div class="toast sucesso"><i class="fa fa-check-circle"></i> Ação concluída com sucesso!</div>';
                }

                // Limpar formulário se for "adicionar"
                const acaoInput = e.target.querySelector('input[name="acao"]');
                if (acaoInput && acaoInput.value !== 'editar') {
                    e.target.reset();
                }

                // Fechar modais ativos
                document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));

                // Voltar topo form
                if (document.querySelector('.form-container h2') && document.querySelector('input[name="acao"]')) {
                    document.querySelector('.form-container h2').innerText = "Cadastrar Novo";
                    if (document.querySelector('.form-container button')) document.querySelector('.form-container button').innerText = "Adicionar";
                    document.querySelector('input[name="acao"]').value = 'adicionar';
                }

            } catch (error) {
                console.error(error);
                let toastContainer = document.querySelector('.toast-container');
                toastContainer.innerHTML = '<div class="toast erro"><i class="fa fa-exclamation-circle"></i> Erro de conexão!</div>';
            } finally {
                if (submitBtn) {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }
            }
        }
    });

    // Interceptar links de exclusão/banir/ações diretas
    document.addEventListener('click', async (e) => {
        const link = e.target.closest('a');
        if (link && link.href) {
            const isActionLink = link.href.includes('excluir=') ||
                link.href.includes('excluir_usuario=') ||
                link.href.includes('banir_usuario=') ||
                link.href.includes('redefinir_senha=');

            if (isActionLink) {
                if (e.defaultPrevented) return; // Confirmação foi cancelada pelo usuário

                e.preventDefault();
                const icon = link.querySelector('i') ? link.querySelector('i').className : '';
                link.innerHTML = '<i class="fa fa-spinner fa-spin"></i>';
                link.style.pointerEvents = 'none';

                try {
                    // Executar ação via GET
                    await fetch(link.href);

                    // Buscar a página atualizada
                    const updatedPageRes = await fetch(window.location.href);
                    const htmlText = await updatedPageRes.text();
                    const parser = new DOMParser();
                    const newDoc = parser.parseFromString(htmlText, 'text/html');

                    // Atualizar tabela e cards
                    const newTable = newDoc.querySelector('.table-container');
                    const oldTable = document.querySelector('.table-container');
                    if (newTable && oldTable) oldTable.innerHTML = newTable.innerHTML;

                    const newCards = newDoc.querySelector('.cards');
                    const oldCards = document.querySelector('.cards');
                    if (newCards && oldCards) oldCards.innerHTML = newCards.innerHTML;

                    // Mostrar notificação
                    const newToast = newDoc.querySelector('.toast');
                    let toastContainer = document.querySelector('.toast-container');
                    if (!toastContainer) {
                        toastContainer = document.createElement('div');
                        toastContainer.className = 'toast-container';
                        document.body.appendChild(toastContainer);
                    }
                    if (newToast) {
                        toastContainer.innerHTML = newToast.outerHTML;
                    } else {
                        toastContainer.innerHTML = '<div class="toast sucesso"><i class="fa fa-check-circle"></i> Ação concluída com sucesso!</div>';
                    }

                } catch (error) {
                    console.error(error);
                    alert("Erro ao executar ação.");
                }
            }
        }
    });
});
