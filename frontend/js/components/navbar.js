class NavbarComponent {
    constructor() {
        this.userMenu = document.getElementById('user-menu');
        this.userDropdown = document.getElementById('user-dropdown');
        this.logoutBtn = document.getElementById('logout-btn');
        this.themeToggle = document.getElementById('theme-toggle');
        this.sidebarToggle = document.getElementById('sidebar-toggle');
        this.globalSearch = document.getElementById('global-search');
        
        this.init();
    }

    init() {
        // User dropdown toggle
        this.userMenu.addEventListener('click', (e) => {
            e.stopPropagation();
            this.userDropdown.classList.toggle('show');
        });

        document.addEventListener('click', () => {
            this.userDropdown.classList.remove('show');
        });

        // Logout
        this.logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            auth.logout();
        });

        // Theme toggle
        this.themeToggle.addEventListener('click', toggleTheme);

        // Sidebar toggle (mobile)
        this.sidebarToggle.addEventListener('click', () => {
            const sidebar = document.getElementById('sidebar');
            const overlay = document.getElementById('sidebar-overlay');
            sidebar.classList.toggle('open');
            overlay.classList.toggle('show');
        });

        // Close sidebar on overlay click
        document.getElementById('sidebar-overlay').addEventListener('click', () => {
            document.getElementById('sidebar').classList.remove('open');
            document.getElementById('sidebar-overlay').classList.remove('show');
        });

        // Global search
        this.globalSearch.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const query = this.globalSearch.value.trim();
                if (query) {
                    window.location.href = `/?page=search&q=${encodeURIComponent(query)}`;
                }
            }
        });

        // Update user info
        this.updateUser();
    }

    updateUser() {
        const user = auth.getUser();
        if (user) {
            document.getElementById('username-display').textContent = user.username;
            document.getElementById('user-avatar').textContent = getInitials(user.username);
            
            // Show/hide admin menu
            const adminItem = document.getElementById('admin-menu-item');
            if (adminItem) {
                adminItem.style.display = user.role === 'admin' ? 'flex' : 'none';
            }
        }
    }
}

// Initialize when DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.navbar = new NavbarComponent();
});
