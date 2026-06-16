class RecentPage {
    constructor() {
        this.container = document.getElementById('page-content');
    }

    render() {
        this.container.innerHTML = `
            <div class="page-header">
                <h2><i class="fas fa-clock"></i> Recent Files</h2>
                <div class="page-actions">
                    <button class="btn btn-sm btn-danger" id="clear-recents">
                        <i class="fas fa-trash"></i> Bersihkan
                    </button>
                </div>
            </div>
            <div id="recent-content"></div>
        `;

        document.getElementById('clear-recents').addEventListener('click', async () => {
            const confirmed = await modal.confirm('Yakin ingin membersihkan semua riwayat?');
            if (confirmed) {
                storage.clearRecents();
                this.loadRecents();
                toast.success('Riwayat dibersihkan');
            }
        });

        this.loadRecents();
    }

    loadRecents() {
        const recents = storage.getRecents();
        const content = document.getElementById('recent-content');

        if (recents.length === 0) {
            content.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clock"></i>
                    <h3>Belum ada riwayat</h3>
                    <p>File yang Anda buka akan muncul di sini</p>
                </div>
            `;
            return;
        }

        let html = '<div class="recent-list">';
        recents.forEach(item => {
            const icon = item.type === 'folder' ? 'fa-folder' : getFileIcon(item.name);
            html += `
                <div class="recent-item" onclick="window.navigateTo('files', { path: '${encodeURIComponent(item.path)}' })">
                    <i class="fas ${icon}"></i>
                    <div class="info">
                        <div class="name">${escapeHtml(item.name)}</div>
                        <div class="path">${escapeHtml(item.path)}</div>
                    </div>
                    <div class="time">${formatDate(item.accessed)}</div>
                </div>
            `;
        });
        html += '</div>';
        content.innerHTML = html;
    }
}

window.recentPage = new RecentPage();
