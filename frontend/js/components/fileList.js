class FileListComponent {
    constructor(container) {
        this.container = container;
        this.files = [];
        this.selected = [];
        this.onSelect = null;
        this.onDoubleClick = null;
        this.onContextMenu = null;
    }

    render(files, options = {}) {
        this.files = files || [];
        this.selected = options.selected || [];
        this.onSelect = options.onSelect || this.onSelect;
        this.onDoubleClick = options.onDoubleClick || this.onDoubleClick;
        this.onContextMenu = options.onContextMenu || this.onContextMenu;

        if (!this.container) return;

        if (this.files.length === 0) {
            this.container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-folder-open"></i>
                    <h3>Folder kosong</h3>
                    <p>Tidak ada file atau folder di sini</p>
                </div>
            `;
            return;
        }

        let html = `
            <div class="file-list">
                <div class="file-list-header">
                    <div><input type="checkbox" id="select-all" /></div>
                    <div>Nama</div>
                    <div>Ukuran</div>
                    <div>Diubah</div>
                    <div></div>
                </div>
        `;

        this.files.forEach((file, index) => {
            const isSelected = this.selected.includes(file.path);
            const icon = file.isDirectory ? 'fa-folder' : getFileIcon(file.name);
            const iconClass = file.isDirectory ? 'folder' : '';
            
            html += `
                <div class="file-list-item ${isSelected ? 'selected' : ''}" data-index="${index}" data-path="${file.path}">
                    <div><input type="checkbox" class="file-select" ${isSelected ? 'checked' : ''} /></div>
                    <div class="name">
                        <i class="fas ${icon} ${iconClass}"></i>
                        <span>${escapeHtml(file.name)}</span>
                    </div>
                    <div>${file.isDirectory ? '-' : formatFileSize(file.size)}</div>
                    <div>${formatDate(file.modifiedAt)}</div>
                    <div>
                        <button class="btn btn-sm btn-outline favorite-btn" data-path="${file.path}" data-type="${file.isDirectory ? 'folder' : 'file'}">
                            <i class="fas ${storage.isFavorite(file.isDirectory ? 'folder' : 'file', file.path) ? 'fa-star' : 'fa-star-o'}"></i>
                        </button>
                    </div>
                </div>
            `;
        });

        html += '</div>';
        this.container.innerHTML = html;

        // Event listeners
        this.container.querySelectorAll('.file-list-item').forEach(item => {
            const path = item.dataset.path;
            
            item.addEventListener('click', (e) => {
                if (e.target.type === 'checkbox') return;
                this.toggleSelect(path);
            });

            item.addEventListener('dblclick', () => {
                if (this.onDoubleClick) {
                    this.onDoubleClick(path);
                }
            });

            item.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                if (this.onContextMenu) {
                    this.onContextMenu(e, path);
                }
            });
        });

        // Select all
        const selectAll = this.container.querySelector('#select-all');
        if (selectAll) {
            selectAll.addEventListener('change', () => {
                const checked = selectAll.checked;
                this.files.forEach(f => {
                    if (checked) {
                        if (!this.selected.includes(f.path)) {
                            this.selected.push(f.path);
                        }
                    } else {
                        this.selected = this.selected.filter(p => p !== f.path);
                    }
                });
                this.render(this.files, { selected: this.selected });
                if (this.onSelect) this.onSelect(this.selected);
            });
        }

        // Favorite buttons
        this.container.querySelectorAll('.favorite-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const path = btn.dataset.path;
                const type = btn.dataset.type;
                storage.toggleFavorite(type, path, getFileName(path));
                this.render(this.files, { selected: this.selected });
            });
        });
    }

    toggleSelect(path) {
        const index = this.selected.indexOf(path);
        if (index > -1) {
            this.selected.splice(index, 1);
        } else {
            this.selected.push(path);
        }
        this.render(this.files, { selected: this.selected });
        if (this.onSelect) this.onSelect(this.selected);
    }

    getSelected() {
        return this.selected;
    }

    clearSelection() {
        this.selected = [];
        this.render(this.files, { selected: [] });
    }
}

window.FileListComponent = FileListComponent;
