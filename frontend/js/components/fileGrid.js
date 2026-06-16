class FileGridComponent {
    constructor(container) {
        this.container = container;
        this.files = [];
        this.onClick = null;
        this.onContextMenu = null;
    }

    render(files, options = {}) {
        this.files = files || [];
        this.onClick = options.onClick || this.onClick;
        this.onContextMenu = options.onContextMenu || this.onContextMenu;

        if (!this.container) return;

        if (this.files.length === 0) {
            this.container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-images"></i>
                    <h3>Tidak ada gambar</h3>
                    <p>Folder ini tidak memiliki file gambar</p>
                </div>
            `;
            return;
        }

        let html = '<div class="gallery-grid">';
        
        this.files.forEach((file) => {
            const thumbnail = isImageFile(file.name) 
                ? api.getThumbnailUrl(file.path) 
                : '';
            
            html += `
                <div class="gallery-item" data-path="${file.path}">
                    ${thumbnail ? `<img src="${thumbnail}" alt="${escapeHtml(file.name)}" loading="lazy" />` : `
                        <div class="flex-center" style="height:100%;background:var(--bg-tertiary);">
                            <i class="fas ${getFileIcon(file.name)}" style="font-size:48px;color:var(--text-muted);"></i>
                        </div>
                    `}
                    <div class="overlay">
                        <div>${escapeHtml(file.name)}</div>
                    </div>
                </div>
            `;
        });

        html += '</div>';
        this.container.innerHTML = html;

        this.container.querySelectorAll('.gallery-item').forEach(item => {
            const path = item.dataset.path;
            
            item.addEventListener('click', () => {
                if (this.onClick) {
                    this.onClick(path);
                }
            });

            item.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                if (this.onContextMenu) {
                    this.onContextMenu(e, path);
                }
            });
        });
    }
}

window.FileGridComponent = FileGridComponent;
