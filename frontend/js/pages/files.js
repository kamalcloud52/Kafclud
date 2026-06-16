class FilesPage {
    constructor() {
        this.container = document.getElementById('page-content');
        this.currentPath = '';
        this.files = [];
        this.selected = [];
        this.viewMode = localStorage.getItem('kafa_view_mode') || 'list';
        this.sortBy = 'name';
        this.sortOrder = 'asc';
    }

    async render(params = {}) {
        this.currentPath = params.path || '';
        
        this.container.innerHTML = `
            <div class="page-header">
                <div>
                    <h2><i class="fas fa-folder"></i> File Manager</h2>
                    <div id="breadcrumb" class="breadcrumb"></div>
                </div>
                <div class="page-actions">
                    <button class="btn btn-sm btn-outline" id="view-toggle" title="Ganti tampilan">
                        <i class="fas ${this.viewMode === 'grid' ? 'fa-list' : 'fa-th'}"></i>
                    </button>
                    <button class="btn btn-sm btn-outline" id="upload-btn">
                        <i class="fas fa-upload"></i> Upload
                    </button>
                    <button class="btn btn-sm btn-outline" id="new-folder-btn">
                        <i class="fas fa-folder-plus"></i> Folder
                    </button>
                    ${this.selected.length > 0 ? `
                        <button class="btn btn-sm btn-danger" id="delete-selected">
                            <i class="fas fa-trash"></i> Hapus (${this.selected.length})
                        </button>
                    ` : ''}
                </div>
            </div>
            <div id="upload-container"></div>
            <div id="file-container">
                <div class="loading-container">
                    <div class="loading-spinner"></div>
                </div>
            </div>
        `;

        // Initialize components
        this.breadcrumb = new BreadcrumbComponent(document.getElementById('breadcrumb'));
        this.upload = new UploadComponent(document.getElementById('upload-container'));
        this.fileList = new FileListComponent(document.getElementById('file-container'));
        this.fileGrid = new FileGridComponent(document.getElementById('file-container'));

        this.bindEvents();
        await this.loadFiles();
    }

    bindEvents() {
        // View toggle
        document.getElementById('view-toggle').addEventListener('click', () => {
            this.viewMode = this.viewMode === 'list' ? 'grid' : 'list';
            localStorage.setItem('kafa_view_mode', this.viewMode);
            this.renderFiles();
        });

        // Upload
        document.getElementById('upload-btn').addEventListener('click', () => {
            document.querySelector('#upload-container .upload-zone')?.click();
        });

        // New folder
        document.getElementById('new-folder-btn').addEventListener('click', async () => {
            const name = await modal.prompt('Masukkan nama folder:');
            if (name) {
                try {
                    const path = this.currentPath ? `${this.currentPath}/${name}` : name;
                    await api.createFolder(path);
                    toast.success(`Folder "${name}" berhasil dibuat`);
                    await this.loadFiles();
                } catch (error) {
                    toast.error('Gagal membuat folder: ' + error.message);
                }
            }
        });

        // Delete selected
        document.getElementById('delete-selected')?.addEventListener('click', async () => {
            if (this.selected.length === 0) return;
            const confirmed = await modal.confirm(
                `Yakin ingin menghapus ${this.selected.length} item?`
            );
            if (confirmed) {
                try {
                    for (const path of this.selected) {
                        await api.deleteItem(path);
                    }
                    toast.success(`${this.selected.length} item berhasil dihapus`);
                    this.selected = [];
                    await this.loadFiles();
                } catch (error) {
                    toast.error('Gagal menghapus: ' + error.message);
                }
            }
        });

        // Upload callback
        this.upload.onUpload = () => {
            this.loadFiles();
        };
    }

    async loadFiles() {
        try {
            const result = await api.listFiles(this.currentPath);
            this.files = result.files || [];
            this.renderFiles();
            this.updateBreadcrumb();
        } catch (error) {
            document.getElementById('file-container').innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-circle"></i>
                    <h3>Gagal memuat file</h3>
                    <p>${error.message}</p>
                </div>
            `;
        }
    }

    renderFiles() {
        const container = document.getElementById('file-container');
        
        // Sort files
        const sorted = sortFiles(this.files, this.sortBy, this.sortOrder);
        
        // Render upload zone
        this.upload.setPath(this.currentPath);
        this.upload.render(this.currentPath);

        // Render files
        if (this.viewMode === 'grid') {
            this.fileGrid.render(sorted.filter(f => isImageFile(f.name) || f.isDirectory), {
                onClick: (path) => this.handleFileClick(path),
                onContextMenu: (e, path) => this.showContextMenu(e, path)
            });
        } else {
            this.fileList.render(sorted, {
                selected: this.selected,
                onSelect: (selected) => { this.selected = selected; this.updateActions(); },
                onDoubleClick: (path) => this.handleFileClick(path),
                onContextMenu: (e, path) => this.showContextMenu(e, path)
            });
        }

        // Update upload container position
        const uploadContainer = document.getElementById('upload-container');
        const fileContainer = document.getElementById('file-container');
        if (this.files.length === 0) {
            uploadContainer.style.display = 'block';
        } else {
            uploadContainer.style.display = 'block';
        }
    }

    updateBreadcrumb() {
        this.breadcrumb.render(this.currentPath, (path) => {
            this.currentPath = path;
            this.selected = [];
            this.loadFiles();
            // Update URL
            const params = new URLSearchParams(window.location.search);
            params.set('path', path);
            window.history.pushState({}, '', '?' + params.toString());
        });
    }

    updateActions() {
        const actions = document.querySelector('.page-actions');
        const existing = actions.querySelector('#delete-selected');
        if (existing) existing.remove();
        
        if (this.selected.length > 0) {
            const btn = document.createElement('button');
            btn.className = 'btn btn-sm btn-danger';
            btn.id = 'delete-selected';
            btn.innerHTML = `<i class="fas fa-trash"></i> Hapus (${this.selected.length})`;
            btn.addEventListener('click', async () => {
                const confirmed = await modal.confirm(
                    `Yakin ingin menghapus ${this.selected.length} item?`
                );
                if (confirmed) {
                    try {
                        for (const path of this.selected) {
                            await api.deleteItem(path);
                        }
                        toast.success(`${this.selected.length} item berhasil dihapus`);
                        this.selected = [];
                        await this.loadFiles();
                    } catch (error) {
                        toast.error('Gagal menghapus: ' + error.message);
                    }
                }
            });
            actions.appendChild(btn);
        }
    }

    async handleFileClick(path) {
        const file = this.files.find(f => f.path === path);
        if (!file) return;

        // Add to recent
        storage.addRecent(path, file.name, file.isDirectory ? 'folder' : 'file');

        if (file.isDirectory) {
            this.currentPath = path;
            this.selected = [];
            await this.loadFiles();
            // Update URL
            const params = new URLSearchParams(window.location.search);
            params.set('path', path);
            window.history.pushState({}, '', '?' + params.toString());
        } else if (isVideoFile(file.name)) {
            player.playVideo(path, file.name);
        } else if (isAudioFile(file.name)) {
            player.playMusic(path, file.name);
        } else if (isPDFFile(file.name)) {
            pdfViewer.open(path, file.name);
        } else if (isImageFile(file.name)) {
            // Open in gallery
            const images = this.files.filter(f => isImageFile(f.name));
            const index = images.findIndex(f => f.path === path);
            if (index > -1) {
                // Navigate to gallery page
                const params = new URLSearchParams();
                params.set('page', 'gallery');
                params.set('path', this.currentPath);
                params.set('image', path);
                window.location.href = '?' + params.toString();
            }
        } else {
            // Download file
            try {
                const response = await api.downloadFile(path);
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = file.name;
                a.click();
                URL.revokeObjectURL(url);
                toast.success(`Download ${file.name} berhasil`);
            } catch (error) {
                toast.error('Gagal download: ' + error.message);
            }
        }
    }

    showContextMenu(e, path) {
        const file = this.files.find(f => f.path === path);
        if (!file) return;

        const items = [
            {
                label: 'Buka',
                icon: 'fa-eye',
                action: () => this.handleFileClick(path)
            },
            {
                label: 'Download',
                icon: 'fa-download',
                action: async () => {
                    try {
                        const response = await api.downloadFile(path);
                        const blob = await response.blob();
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = file.name;
                        a.click();
                        URL.revokeObjectURL(url);
                        toast.success('Download berhasil');
                    } catch (error) {
                        toast.error('Gagal download: ' + error.message);
                    }
                }
            },
            'separator',
            {
                label: 'Rename',
                icon: 'fa-edit',
                action: async () => {
                    const newName = await modal.prompt('Nama baru:', file.name);
                    if (newName && newName !== file.name) {
                        try {
                            await api.renameItem(path, newName);
                            toast.success('Berhasil direname');
                            await this.loadFiles();
                        } catch (error) {
                            toast.error('Gagal rename: ' + error.message);
                        }
                    }
                }
            },
            {
                label: 'Move',
                icon: 'fa-arrow-right',
                action: async () => {
                    const target = await modal.prompt('Folder tujuan:');
                    if (target !== null) {
                        try {
                            const dest = target ? `${target}/${file.name}` : file.name;
                            await api.moveItem(path, dest);
                            toast.success('Berhasil dipindahkan');
                            await this.loadFiles();
                        } catch (error) {
                            toast.error('Gagal move: ' + error.message);
                        }
                    }
                }
            },
            {
                label: 'Copy',
                icon: 'fa-copy',
                action: async () => {
                    const target = await modal.prompt('Folder tujuan:');
                    if (target !== null) {
                        try {
                            const dest = target ? `${target}/${file.name}` : file.name;
                            await api.copyItem(path, dest);
                            toast.success('Berhasil dicopy');
                            await this.loadFiles();
                        } catch (error) {
                            toast.error('Gagal copy: ' + error.message);
                        }
                    }
                }
            },
            'separator',
            {
                label: 'Favorite',
                icon: storage.isFavorite(file.isDirectory ? 'folder' : 'file', path) ? 'fa-star' : 'fa-star-o',
                action: () => {
                    storage.toggleFavorite(file.isDirectory ? 'folder' : 'file', path, file.name);
                    toast.success(storage.isFavorite(file.isDirectory ? 'folder' : 'file', path) ? 'Ditambahkan ke favorit' : 'Dihapus dari favorit');
                    this.loadFiles();
                }
            },
            'separator',
            {
                label: 'Hapus',
                icon: 'fa-trash',
                danger: true,
                action: async () => {
                    const confirmed = await modal.confirm(`Yakin ingin menghapus "${file.name}"?`);
                    if (confirmed) {
                        try {
                            await api.deleteItem(path);
                            toast.success('Berhasil dihapus');
                            await this.loadFiles();
                        } catch (error) {
                            toast.error('Gagal hapus: ' + error.message);
                        }
                    }
                }
            }
        ];

        contextMenu.show(e.clientX, e.clientY, items);
    }
}

window.filesPage = new FilesPage();
