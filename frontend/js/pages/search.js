class SearchPage {
    constructor() {
        this.container = document.getElementById('page-content');
        this.query = '';
        this.results = [];
    }

    async render(params = {}) {
        this.query = params.q || '';

        this.container.innerHTML = `
            <div class="page-header">
                <h2><i class="fas fa-search"></i> Hasil Pencarian</h2>
                <div class="page-actions">
                    <div class="search-bar">
                        <input type="text" id="search-input" placeholder="Cari file atau folder..." value="${escapeHtml(this.query)}" />
                        <button class="btn btn-primary" id="search-btn"><i class="fas fa-search"></i> Cari</button>
                    </div>
                </div>
            </div>
            <div id="search-results">
                <div class="loading-container">
                    <div class="loading-spinner"></div>
                </div>
            </div>
        `;

        document.getElementById('search-btn').addEventListener('click', () => {
            const query = document.getElementById('search-input').value.trim();
            if (query) {
                window.location.href = `/?page=search&q=${encodeURIComponent(query)}`;
            }
        });

        document.getElementById('search-input').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('search-btn').click();
            }
        });

        if (this.query) {
            await this.search();
        } else {
            document.getElementById('search-results').innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>Masukkan kata kunci</h3>
                    <p>Cari file dan folder dengan cepat</p>
                </div>
            `;
        }
    }

    async search() {
        try {
            // Search by listing all files recursively (simple implementation)
            const results = await this.searchRecursive('');
            this.results = results.filter(item => 
                item.name.toLowerCase().includes(this.query.toLowerCase())
            );

            const container = document.getElementById('search-results');

            if (this.results.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-search"></i>
                        <h3>Tidak ditemukan</h3>
                        <p>Tidak ada hasil untuk "${escapeHtml(this.query)}"</p>
                    </div>
                `;
                return;
            }

            let html = `
                <p style="color:var(--text-secondary);margin-bottom:12px;">
                    Menemukan ${this.results.length} hasil untuk "${escapeHtml(this.query)}"
                </p>
                <div class="recent-list">
            `;

            this.results.forEach(item => {
                const icon = item.isDirectory ? 'fa-folder' : getFileIcon(item.name);
                html += `
                    <div class="recent-item" onclick="window.navigateTo('files', { path: '${encodeURIComponent(item.path)}' })">
                        <i class="fas ${icon}"></i>
                        <div class="info">
                            <div class="name">${escapeHtml(item.name)}</div>
                            <div class="path">${escapeHtml(item.path)}</div>
                        </div>
                        <div style="font-size:12px;color:var(--text-muted);">
                            ${item.isDirectory ? 'Folder' : formatFileSize(item.size)}
                        </div>
                    </div>
                `;
            });

            html += '</div>';
            container.innerHTML = html;

        } catch (error) {
            document.getElementById('search-results').innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-circle"></i>
                    <h3>Gagal mencari</h3>
                    <p>${error.message}</p>
                </div>
            `;
        }
    }

    async searchRecursive(path) {
        try {
            const result = await api.listFiles(path);
            let items = result.files || [];
            let allItems = [];

            for (const item of items) {
                allItems.push({ ...item, path: item.path || path });
                if (item.isDirectory) {
                    const subItems = await this.searchRecursive(item.path);
                    allItems = allItems.concat(subItems);
                }
            }

            return allItems;
        } catch {
            return [];
        }
    }
}

window.searchPage = new SearchPage();
