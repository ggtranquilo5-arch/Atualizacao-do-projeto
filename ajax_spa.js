document.addEventListener('DOMContentLoaded', () => {
    // Interceptar formulários POST (Adicionar/Editar)
    document.addEventListener('submit', async (e) => {
        if (e.target.tagName === 'FORM' && e.target.method.toUpperCase() === 'POST') {
            // Ignorar forms que possuam atributo data-no-ajax ou que sejam de login
            if (e.target.hasAttribute('data-no-ajax') || window.location.href.includes('index.php') || window.location.href.includes('configuracoes.php')) {
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
                
                // Buscar a mesma página atualizada silenciosamente ignorando o cache
                const url = new URL(window.location.href);
                url.searchParams.set('_t', new Date().getTime());
                const updatedPageRes = await fetch(url.toString(), { cache: 'no-store' });
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
                if(document.querySelector('.form-container h2') && document.querySelector('input[name="acao"]')){
                    document.querySelector('.form-container h2').innerText = "Cadastrar Novo";
                    if(document.querySelector('.form-container button')) document.querySelector('.form-container button').innerText = "Adicionar";
                    document.querySelector('input[name="acao"]').value = 'adicionar';
                }

            } catch (error) {
                console.error(error);
                let toastContainer = document.querySelector('.toast-container');
                if(!toastContainer) {
                    toastContainer = document.createElement('div');
                    toastContainer.className = 'toast-container';
                    document.body.appendChild(toastContainer);
                }
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
        if (link && link.href && !link.href.includes('javascript:') && !link.href.includes('#')) {
            const isActionLink = link.href.includes('excluir=') || 
                                 link.href.includes('excluir_usuario=') || 
                                 link.href.includes('banir_usuario=') || 
                                 link.href.includes('redefinir_senha=');
            
            if (isActionLink) {
                if (e.defaultPrevented) return; // Confirmação foi cancelada pelo usuário (onclick inline confirm return false)
                
                e.preventDefault();
                const icon = link.querySelector('i') ? link.querySelector('i').className : '';
                link.innerHTML = '<i class="fa fa-spinner fa-spin"></i>';
                link.style.pointerEvents = 'none';

                try {
                    // Executar ação via GET
                    await fetch(link.href);
                    
                    // Buscar a página atualizada ignorando o cache
                    const url = new URL(window.location.href);
                    url.searchParams.set('_t', new Date().getTime());
                    const updatedPageRes = await fetch(url.toString(), { cache: 'no-store' });
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

    // ==========================================
    // SISTEMA DE SINCRONIZAÇÃO EM TEMPO REAL (LIVE SYNC)
    // Atualiza a tela de todos os dispositivos simultaneamente
    // ==========================================

    // Indicador visual de Live
    const topbar = document.querySelector('.topbar');
    if (topbar && !document.getElementById('live-indicator')) {
        const indicator = document.createElement('div');
        indicator.id = 'live-indicator';
        indicator.innerHTML = '<span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:#10b981; box-shadow: 0 0 8px #10b981; animation: pulse 2s infinite; margin-right:5px;"></span><span style="font-size:12px; color:#64748b; font-weight:bold;">Sincronização Ativa</span>';
        indicator.style.position = 'absolute';
        indicator.style.top = '10px';
        indicator.style.right = '15px';
        indicator.style.display = 'flex';
        indicator.style.alignItems = 'center';
        topbar.style.position = 'relative';
        topbar.appendChild(indicator);
        
        if (!document.getElementById('live-sync-style')) {
            const style = document.createElement('style');
            style.id = 'live-sync-style';
            style.innerHTML = '@keyframes pulse { 0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); } 70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); } 100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); } }';
            document.head.appendChild(style);
        }
    }

    setInterval(async () => {
        // Pausa a sincronização se a aba do navegador estiver oculta
        if (document.hidden) return;

        try {
            // Busca a versão mais recente do banco de dados ignorando o CACHE do navegador
            const url = new URL(window.location.href);
            url.searchParams.set('_t', new Date().getTime()); // Força requisição nova
            url.searchParams.set('live_sync', '1');

            const res = await fetch(url.toString(), { cache: 'no-store' });
            if (!res.ok) return; // Se o servidor bloquear, aborta silenciosamente
            
            const htmlText = await res.text();
            const parser = new DOMParser();
            const newDoc = parser.parseFromString(htmlText, 'text/html');

            let hasChanges = false;

            // Função para trocar o HTML apenas se houver diferença
            const syncElement = (selector) => {
                const oldEl = document.querySelector(selector);
                const newEl = newDoc.querySelector(selector);
                if (oldEl && newEl && oldEl.innerHTML.trim() !== newEl.innerHTML.trim()) {
                    oldEl.innerHTML = newEl.innerHTML;
                    hasChanges = true;
                }
            };

            // Sincronizar todos os elementos reativos do sistema
            syncElement('.table-container tbody'); // Atualiza linhas da tabela
            syncElement('.cards'); // Atualiza contadores numéricos
            syncElement('.activity'); // Atualiza apenas o histórico, preservando o gráfico
            syncElement('.chat-messages'); // Atualiza chat da IA

            if (hasChanges) {
                let toastContainer = document.querySelector('.toast-container');
                if (!toastContainer) {
                    toastContainer = document.createElement('div');
                    toastContainer.className = 'toast-container';
                    document.body.appendChild(toastContainer);
                }
                const toast = document.createElement('div');
                toast.className = 'toast sucesso';
                toast.innerHTML = '<i class="fa fa-sync fa-spin"></i> Atualização detectada!';
                toastContainer.appendChild(toast);
                setTimeout(() => toast.remove(), 4000);
            }

        } catch (e) {
            // Erros de rede são ignorados no modo silencioso
        }
    }, 5000); // Sincroniza a cada 5 segundos
});
