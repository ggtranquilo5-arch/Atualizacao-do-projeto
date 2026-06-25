document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('submit', async (e) => {
        if (e.target.tagName === 'FORM' && e.target.method.toUpperCase() === 'POST') {
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
                const response = await fetch(e.target.action || window.location.href, {
                    method: 'POST',
                    body: formData
                });

                const htmlText = await response.text();
                const parser = new DOMParser();
                const newDoc = parser.parseFromString(htmlText, 'text/html');

                const newTable = newDoc.querySelector('.table-container');
                const oldTable = document.querySelector('.table-container');
                if (newTable && oldTable) {
                    oldTable.innerHTML = newTable.innerHTML;
                }

                const newCards = newDoc.querySelector('.cards');
                const oldCards = document.querySelector('.cards');
                if (newCards && oldCards) {
                    oldCards.innerHTML = newCards.innerHTML;
                }

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

                const acaoInput = e.target.querySelector('input[name="acao"]');
                if (acaoInput && acaoInput.value !== 'editar') {
                    e.target.reset();
                }

                document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));

                if (document.querySelector('.form-container h2') && document.querySelector('input[name="acao"]')) {
                    document.querySelector('.form-container h2').innerText = "Cadastrar Novo";
                    if (document.querySelector('.form-container button')) document.querySelector('.form-container button').innerText = "Adicionar";
                    document.querySelector('input[name="acao"]').value = 'adicionar';
                }

            } catch (error) {
                console.error(error);
                let toastContainer = document.querySelector('.toast-container');
                if (!toastContainer) {
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

    document.addEventListener('click', async (e) => {
        const link = e.target.closest('a');
        if (link && link.href && !link.href.includes('javascript:') && !link.href.includes('#')) {
            const isActionLink = link.href.includes('excluir=') ||
                link.href.includes('excluir_usuario=') ||
                link.href.includes('banir_usuario=') ||
                link.href.includes('redefinir_senha=');

            if (isActionLink) {
                if (e.defaultPrevented) return;

                e.preventDefault();
                const icon = link.querySelector('i') ? link.querySelector('i').className : '';
                link.innerHTML = '<i class="fa fa-spinner fa-spin"></i>';
                link.style.pointerEvents = 'none';

                try {
                    await fetch(link.href);

                    const url = new URL(window.location.href);
                    url.searchParams.set('_t', new Date().getTime());
                    const updatedPageRes = await fetch(url.toString(), { cache: 'no-store' });
                    const htmlText = await updatedPageRes.text();
                    const parser = new DOMParser();
                    const newDoc = parser.parseFromString(htmlText, 'text/html');

                    const newTable = newDoc.querySelector('.table-container');
                    const oldTable = document.querySelector('.table-container');
                    if (newTable && oldTable) oldTable.innerHTML = newTable.innerHTML;

                    const newCards = newDoc.querySelector('.cards');
                    const oldCards = document.querySelector('.cards');
                    if (newCards && oldCards) oldCards.innerHTML = newCards.innerHTML;

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

    const topbar = document.querySelector('.topbar');
    const titleH1 = topbar ? topbar.querySelector('h1') : null;
    if (titleH1 && !document.getElementById('live-indicator')) {
        const indicator = document.createElement('span');
        indicator.id = 'live-indicator';
        indicator.innerHTML = '<span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#10b981; box-shadow: 0 0 8px #10b981; animation: pulse 2s infinite; margin-right:5px;"></span><span style="font-size:11px; color:#10b981; font-weight:bold; letter-spacing: 0.5px;">AO VIVO</span>';
        indicator.style.display = 'inline-flex';
        indicator.style.alignItems = 'center';
        indicator.style.marginLeft = '15px';
        indicator.style.verticalAlign = 'middle';
        indicator.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
        indicator.style.padding = '4px 10px';
        indicator.style.borderRadius = '12px';
        indicator.style.border = '1px solid rgba(16, 185, 129, 0.2)';
        indicator.style.textTransform = 'uppercase';
        titleH1.appendChild(indicator);

        if (!document.getElementById('live-sync-style')) {
            const style = document.createElement('style');
            style.id = 'live-sync-style';
            style.innerHTML = '@keyframes pulse { 0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); } 70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); } 100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); } }';
            document.head.appendChild(style);
        }
    }

    setInterval(async () => {
        if (document.hidden) return;

        try {
            const url = new URL(window.location.href);
            url.searchParams.set('_t', new Date().getTime()); 
            url.searchParams.set('live_sync', '1');

            const res = await fetch(url.toString(), { cache: 'no-store' });
            if (!res.ok) return; 

            const htmlText = await res.text();
            const parser = new DOMParser();
            const newDoc = parser.parseFromString(htmlText, 'text/html');

            let hasChanges = false;

            const syncElement = (selector) => {
                const oldEl = document.querySelector(selector);
                const newEl = newDoc.querySelector(selector);
                if (oldEl && newEl && oldEl.innerHTML.trim() !== newEl.innerHTML.trim()) {
                    oldEl.innerHTML = newEl.innerHTML;
                    hasChanges = true;
                }
            };

            syncElement('.table-container tbody'); 
            syncElement('.cards'); 
            syncElement('.activity'); 
            syncElement('.sidebar .menu'); 
            syncElement('.topbar'); 

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
        }
    }, 5000); 
});
