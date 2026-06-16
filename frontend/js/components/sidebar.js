class SidebarComponent {
    constructor() {
        this.items = document.querySelectorAll('.sidebar-item');
        this.currentPage = 'dashboard';
        this.init();
    }

    init() {
        this.items.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                if (page) {
                    this.navigate(page);
                }
            });
        });

        // Highlight current page
        const params = new URLSearchParams(window.location.search);
        const page = params.get('page') || 'dashboard';
        this.setActive(page);
    }

    navigate(page) {
        window.location.href = `/?page=${page}`;
    }

    setActive(page) {
        this.items.forEach(item => {
            item.classList.toggle('active', item.dataset.page === page);
        });
        this.currentPage = page;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.sidebar = new SidebarComponent();
});
