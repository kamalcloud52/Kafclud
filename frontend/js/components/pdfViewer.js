class PDFViewerComponent {
    constructor() {
        this.viewer = document.getElementById('pdf-viewer');
        this.canvas = document.getElementById('pdf-canvas');
        this.title = document.getElementById('pdf-title');
        this.pageInfo = document.getElementById('pdf-page-info');
        this.zoomSlider = document.getElementById('pdf-zoom');
        this.zoomLabel = document.getElementById('pdf-zoom-label');
        this.searchInput = document.getElementById('pdf-search-input');
        this.searchCount = document.getElementById('pdf-search-count');
        
        this.pdf = null;
        this.currentPage = 1;
        this.totalPages = 0;
        this.scale = 1;
        this.fullscreen = false;
        this.searchResults = [];
        this.searchIndex = -1;

        this.init();
    }

    init() {
        // Close
        document.getElementById('pdf-close').addEventListener('click', () => this.close());

        // Navigation
        document.getElementById('pdf-prev').addEventListener('click', () => this.prevPage());
        document.getElementById('pdf-next').addEventListener('click', () => this.nextPage());

        // Zoom
        this.zoomSlider.addEventListener('input', () => {
            this.scale = this.zoomSlider.value / 100;
            this.zoomLabel.textContent = `${Math.round(this.scale * 100)}%`;
            this.renderPage();
        });

        // Fullscreen
        document.getElementById('pdf-fullscreen').addEventListener('click', () => {
            if (this.viewer.requestFullscreen) {
                this.viewer.requestFullscreen();
            }
        });

        // Search
        this.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.searchPDF();
            }
        });

        document.getElementById('pdf-search-prev').addEventListener('click', () => this.searchPrev());
        document.getElementById('pdf-search-next').addEventListener('click', () => this.searchNext());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (this.viewer.style.display !== 'flex') return;
            if (e.key === 'ArrowLeft') this.prevPage();
            if (e.key === 'ArrowRight') this.nextPage();
            if (e.key === 'Escape') this.close();
            if (e.key === 'f' || e.key === 'F') {
                if (this.viewer.requestFullscreen) {
                    this.viewer.requestFullscreen();
                }
            }
        });

        // Set PDF.js worker
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }

    async open(path, name) {
        this.title.textContent = name || getFileName(path);
        this.viewer.style.display = 'flex';
        this.currentPage = 1;
        this.searchResults = [];
        this.searchIndex = -1;

        try {
            // Download PDF
            const response = await api.downloadFile(path);
            const arrayBuffer = await response.arrayBuffer();
            
            this.pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            this.totalPages = this.pdf.numPages;
            this.renderPage();
            this.updatePageInfo();
        } catch (error) {
            toast.error('Gagal membuka PDF: ' + error.message);
            this.close();
        }
    }

    async renderPage() {
        if (!this.pdf) return;

        try {
            const page = await this.pdf.getPage(this.currentPage);
            const viewport = page.getViewport({ scale: this.scale });
            
            this.canvas.width = viewport.width;
            this.canvas.height = viewport.height;
            
            const context = this.canvas.getContext('2d');
            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;

            this.updatePageInfo();
        } catch (error) {
            console.error('PDF render error:', error);
        }
    }

    updatePageInfo() {
        this.pageInfo.textContent = `${this.currentPage} / ${this.totalPages}`;
    }

    prevPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.renderPage();
        }
    }

    nextPage() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.renderPage();
        }
    }

    async searchPDF() {
        const query = this.searchInput.value.trim();
        if (!query || !this.pdf) return;

        this.searchResults = [];
        this.searchIndex = -1;

        for (let i = 1; i <= this.totalPages; i++) {
            const page = await this.pdf.getPage(i);
            const textContent = await page.getTextContent();
            const text = textContent.items.map(item => item.str).join(' ');
            
            if (text.toLowerCase().includes(query.toLowerCase())) {
                this.searchResults.push(i);
            }
        }

        this.searchCount.textContent = this.searchResults.length > 0 
            ? `${this.searchResults.length} halaman ditemukan`
            : 'Tidak ditemukan';

        if (this.searchResults.length > 0) {
            this.searchIndex = 0;
            this.currentPage = this.searchResults[0];
            this.renderPage();
        }
    }

    searchPrev() {
        if (this.searchResults.length === 0) return;
        this.searchIndex = (this.searchIndex - 1 + this.searchResults.length) % this.searchResults.length;
        this.currentPage = this.searchResults[this.searchIndex];
        this.renderPage();
        this.searchCount.textContent = `Halaman ${this.searchIndex + 1} dari ${this.searchResults.length}`;
    }

    searchNext() {
        if (this.searchResults.length === 0) return;
        this.searchIndex = (this.searchIndex + 1) % this.searchResults.length;
        this.currentPage = this.searchResults[this.searchIndex];
        this.renderPage();
        this.searchCount.textContent = `Halaman ${this.searchIndex + 1} dari ${this.searchResults.length}`;
    }

    close() {
        this.pdf = null;
        this.viewer.style.display = 'none';
        this.canvas.width = 0;
        this.canvas.height = 0;
        this.searchInput.value = '';
        this.searchCount.textContent = '';
        this.searchResults = [];
    }
}

// Initialize when DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.pdfViewer = new PDFViewerComponent();
});
