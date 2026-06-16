class DashboardPage {
    constructor() {
        this.container = document.getElementById('page-content');
    }

    async render() {
        this.container.innerHTML = `
            <div class="page-header">
                <h2><i class="fas fa-chart-pie"></i> Dashboard</h2>
                <div class="page-actions">
                    <button class="btn btn-primary" onclick="window.navigateTo('files')">
                        <i class="fas fa-folder-open"></i> Buka File Manager
                    </button>
                </div>
            </div>
            <div id="dashboard-content">
                <div class="loading-container">
                    <div class="loading-spinner"></div>
                </div>
            </div>
        `;

        await this.loadData();
    }

    async loadData() {
        try {
            const stats = await api.getStorageStats();
            const files = await api.listFiles('');
            const recents = storage.getRecents();

            const totalFiles = files.files ? files.files.filter(f => !f.isDirectory).length : 0;
            const totalFolders = files.files ? files.files.filter(f => f.isDirectory).length : 0;
            
            const usedGB = (stats.used / (1024 * 1024 * 1024)).toFixed(2);
            const totalGB = 100; // Asumsi total storage 100GB

            const content = document.getElementById('dashboard-content');
            content.innerHTML = `
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="value">${totalFiles}</div>
                        <div class="label">Total File</div>
                    </div>
                    <div class="stat-card">
                        <div class="value">${totalFolders}</div>
                        <div class="label">Total Folder</div>
                    </div>
                    <div class="stat-card">
                        <div class="value">${usedGB} GB</div>
                        <div class="label">Storage Digunakan</div>
                    </div>
                    <div class="stat-card">
                        <div class="value">${(totalGB - parseFloat(usedGB)).toFixed(2)} GB</div>
                        <div class="label">Storage Tersisa</div>
                    </div>
                </div>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px;">
                    <div>
                        <h3 style="margin-bottom:12px;font-size:16px;">
                            <i class="fas fa-clock"></i> File Terbaru
                        </h3>
                        <div id="recent-files-list">
                            ${this.renderRecentItems(recents.slice(0, 5))}
                        </div>
                    </div>
                    <div>
                        <h3 style="margin-bottom:12px;font-size:16px;">
                            <i class="fas fa-star"></i> Favorit
                        </h3>
                        <div id="favorites-list">
                            ${this.renderFavorites()}
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            document.getElementById('dashboard-content').innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-circle"></i>
                    <h3>Gagal memuat dashboard</h3>
                    <p>${error.message}</p>
                </div>
            `;
        }
    }

    renderRecentItems(recents) {
        if (!recents || recents.length === 0) {
            return '<div class="empty-state" style="padding:20px;"><p style="font-size:13px;">Belum ada file yang dibuka</p></div>';
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
        return html;
    }

    renderFavorites() {
        const favs = storage.getFavorites();
        const allFavs = [...favs.files, ...favs.folders];
        
        if (allFavs.length === 0) {
            return '<div class="empty-state" style="padding:20px;"><p style="font-size:13px;">Belum ada favorit</p></div>';
        }

        let html = '<div class="recent-list">';
        allFavs.slice(0, 5).forEach(item => {
            const icon = item.path.includes('.') ? getFileIcon(item.name) : 'fa-folder';
            html += `
                <div class="recent-item" onclick="window.navigateTo('files', { path: '${encodeURIComponent(item.path)}' })">
                    <i class="fas ${icon}"></i>
                    <div class="info">
                        <div class="name">${escapeHtml(item.name)}</div>
                        <div class="path">${escapeHtml(item.path)}</div>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        return html;
    }
}

window.dashboardPage = new DashboardPage();
