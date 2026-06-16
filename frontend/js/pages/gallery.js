class GalleryPage {
    constructor() {
        this.container = document.getElementById('page-content');
        this.currentPath = '';
        this.images = [];
        this.currentIndex = 0;
    }

    async render(params = {}) {
        this.currentPath = params.path || '';
        const imagePath = params.image || '';

        this.container.innerHTML = `
            <div class="page-header">
                <h2><i class="fas fa-images"></i> Gallery</h2>
                <div class="page-actions">
                    <button class="btn btn-sm btn-outline" id="gallery-back">
                        <i class="fas fa-arrow-left"></i> Kembali
                    </button>
                </div>
            </div>
            <div id="gallery-content">
                <div class="loading-container">
                    <div class="loading-spinner"></div>
                </div>
            </div>
            <div id="gallery-viewer" style="display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.9);z-index:400;display:none;align-items:center;justify-content:center;">
                <button id="gallery-close" style="position:absolute;top:20px;right:20px;color:white;font-size:30px;background:none;border:none;z-index:401;">
                    <i class="fas fa-times"></i>
                </button>
                <button id="gallery-prev" style="position:absolute;left:20px;color:white;font-size:40px;background:none;border:none;z-index:401;">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <button id="gallery-next" style="position:absolute;right:20px;color:white;font-size:40px;background:none;border:none;z-index:401;">
                    <i class="fas fa-chevron-right"></i>
                </button>
                <img id="gallery-viewer-img" style="max-width:90%;max-height:90%;object-fit:contain;cursor:zoom-in;" />
                <div style="position:absolute;bottom:20px;left:50%;transform:translateX(-50%);color:white;font-size:14px;background:rgba(0,0,0,0.5);padding:8px 16px;border-radius:8px;" id="gallery-counter"></div>
            </div>
        `;

        // Back button
        document.getElementById('gallery-back').addEventListener('click', () => {
            window.history.back();
        });

        await this.loadImages(imagePath);
        this.bindViewerEvents();
    }

    async loadImages(highlightPath) {
        try {
            const result = await api.listFiles(this.currentPath);
            this.images = (result.files || []).filter(f => isImageFile(f.name));
            
            const content = document.getElementById('gallery-content');
            
            if (this.images.length === 0) {
                content.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-images"></i>
                        <h3>Tidak ada gambar</h3>
                        <p>Folder ini tidak memiliki file gambar</p>
                    </div>
                `;
                return;
            }

            // Render grid
            let html = '<div class="gallery-grid">';
            this.images.forEach((img, index) => {
                html += `
                    <div class="gallery-item" data-index="${index}">
                        <img src="${api.getThumbnailUrl(img.path)}" alt="${escapeHtml(img.name)}" loading="lazy" />
                        <div class="overlay">${escapeHtml(img.name)}</div>
                    </div>
                `;
            });
            html += '</div>';
            content.innerHTML = html;

            // Click to open viewer
            content.querySelectorAll('.gallery-item').forEach(item => {
                item.addEventListener('click', () => {
                    const index = parseInt(item.dataset.index);
                    this.openViewer(index);
                });
            });

            // Highlight specific image
            if (highlightPath) {
                const index = this.images.findIndex(f => f.path === highlightPath);
                if (index > -1) {
                    this.openViewer(index);
                }
            }

        } catch (error) {
            document.getElementById('gallery-content').innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-circle"></i>
                    <h3>Gagal memuat gambar</h3>
                    <p>${error.message}</p>
                </div>
            `;
        }
    }

    bindViewerEvents() {
        const viewer = document.getElementById('gallery-viewer');
        const img = document.getElementById('gallery-viewer-img');
        const close = document.getElementById('gallery-close');
        const prev = document.getElementById('gallery-prev');
        const next = document.getElementById('gallery-next');
        const counter = document.getElementById('gallery-counter');
        let isZoomed = false;

        const updateViewer = (index) => {
            this.currentIndex = index;
            const image = this.images[index];
            img.src = api.getThumbnailUrl(image.path);
            counter.textContent = `${index + 1} / ${this.images.length}`;
        };

        close.addEventListener('click', () => {
            viewer.style.display = 'none';
        });

        prev.addEventListener('click', () => {
            const index = (this.currentIndex - 1 + this.images.length) % this.images.length;
            updateViewer(index);
        });

        next.addEventListener('click', () => {
            const index = (this.currentIndex + 1) % this.images.length;
            updateViewer(index);
        });

        img.addEventListener('click', () => {
            isZoomed = !isZoomed;
            img.style.transform = isZoomed ? 'scale(1.5)' : 'scale(1)';
            img.style.cursor = isZoomed ? 'zoom-out' : 'zoom-in';
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (viewer.style.display === 'flex') {
                if (e.key === 'ArrowLeft') prev.click();
                if (e.key === 'ArrowRight') next.click();
                if (e.key === 'Escape') close.click();
            }
        });

        // Store for later use
        this._updateViewer = updateViewer;
        this._viewer = viewer;
    }

    openViewer(index) {
        this._viewer.style.display = 'flex';
        this._updateViewer(index);
    }
}

window.galleryPage = new GalleryPage();
