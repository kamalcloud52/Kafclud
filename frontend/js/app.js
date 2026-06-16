class App {
    constructor() {
        this.currentPage = null;
        this.params = {};
        this.init();
    }

    init() {
        // Load theme
        loadTheme();

        // Check authentication
        const isLoginPage = window.location.pathname.includes('login');
        const isAuthenticated = auth.isAuthenticated();

        if (!isAuthenticated && !isLoginPage) {
            window.location.href = '/login';
            return;
        }

        if (isAuthenticated && isLoginPage) {
            window.location.href = '/';
            return;
        }

        // Parse URL params
        const params = new URLSearchParams(window.location.search);
        const page = params.get('page') || 'dashboard';
        const path = params.get('path') || '';
        const q = params.get('q') || '';
        const image = params.get('image') || '';

        this.params = { path, q, image };

        // Render page
        this.renderPage(page);

        // Handle back/forward
        window.addEventListener('popstate', () => {
            const newParams = new URLSearchParams(window.location.search);
            const newPage = newParams.get('page') || 'dashboard';
            this.renderPage(newPage);
        });

        // Global navigation
        window.navigateTo = (page, params = {}) => {
            const urlParams = new URLSearchParams();
            urlParams.set('page', page);
            if (params.path) urlParams.set('path', params.path);
            if (params.q) urlParams.set('q', params.q);
            if (params.image) urlParams.set('image', params.image);
            window.history.pushState({}, '', '?' + urlParams.toString());
            this.renderPage(page);
        };
    }

    renderPage(page) {
        // Update sidebar
        document.querySelectorAll('.sidebar-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === page);
        });

        // Admin check
        if (page === 'admin' && !auth.isAdmin()) {
            toast.error('Anda tidak memiliki akses admin');
            this.renderPage('dashboard');
            return;
        }

        // Render page
        switch (page) {
            case 'dashboard':
                dashboardPage.render();
                break;
            case 'files':
                filesPage.render(this.params);
                break;
            case 'gallery':
                galleryPage.render(this.params);
                break;
            case 'video':
                videoPage.render(this.params);
                break;
            case 'music':
                musicPage.render(this.params);
                break;
            case 'favorites':
                favoritesPage.render();
                break;
            case 'recent':
                recentPage.render();
                break;
            case 'search':
                searchPage.render(this.params);
                break;
            case 'admin':
                adminPage.render();
                break;
            case 'settings':
                settingsPage.render();
                break;
            default:
                dashboardPage.render();
        }
    }
}

// Initialize app when DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});

// Global page references
window.dashboardPage = new DashboardPage();
window.filesPage = new FilesPage();
window.galleryPage = new GalleryPage();
window.videoPage = new VideoPage();
window.musicPage = new MusicPage();
window.favoritesPage = new FavoritesPage();
window.recentPage = new RecentPage();
window.searchPage = new SearchPage();
window.adminPage = new AdminPage();
window.settingsPage = new SettingsPage();
