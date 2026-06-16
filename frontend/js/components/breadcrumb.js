class BreadcrumbComponent {
    constructor(container) {
        this.container = container || document.getElementById('breadcrumb');
        this.path = '';
        this.onNavigate = null;
    }

    render(path, onNavigate) {
        this.path = path || '';
        this.onNavigate = onNavigate || this.onNavigate;
        
        if (!this.container) return;
        
        const parts = this.path.split('/').filter(p => p);
        let html = `<span class="breadcrumb-item" data-path="">Home</span>`;
        
        let currentPath = '';
        parts.forEach((part, index) => {
            currentPath += (index > 0 ? '/' : '') + part;
            const isLast = index === parts.length - 1;
            html += `<span class="breadcrumb-separator"><i class="fas fa-chevron-right"></i></span>`;
            html += `<span class="breadcrumb-item ${isLast ? 'active' : ''}" data-path="${currentPath}">${escapeHtml(part)}</span>`;
        });
        
        this.container.innerHTML = html;
        
        // Add click events
        this.container.querySelectorAll('.breadcrumb-item').forEach(item => {
            item.addEventListener('click', () => {
                const path = item.dataset.path;
                if (this.onNavigate) {
                    this.onNavigate(path);
                }
            });
        });
    }

    update(path) {
        this.render(path, this.onNavigate);
    }
}

window.BreadcrumbComponent = BreadcrumbComponent;
