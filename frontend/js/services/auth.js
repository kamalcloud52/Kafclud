class AuthService {
    constructor() {
        this.currentUser = null;
        this.loadUser();
    }

    loadUser() {
        try {
            const saved = localStorage.getItem(APP.STORAGE_KEYS.USER);
            if (saved) {
                this.currentUser = JSON.parse(saved);
            }
        } catch (e) {
            this.currentUser = null;
        }
        return this.currentUser;
    }

    getUser() {
        return this.currentUser;
    }

    isAuthenticated() {
        return !!this.currentUser && !!api.getToken();
    }

    isAdmin() {
        return this.currentUser && this.currentUser.role === 'admin';
    }

    async login(username, password) {
        const data = await api.login(username, password);
        this.currentUser = data.user;
        return data;
    }

    async logout() {
        await api.logout();
        this.currentUser = null;
        localStorage.removeItem(APP.STORAGE_KEYS.USER);
        window.location.href = '/login';
    }

    async verify() {
        try {
            const data = await api.verifyToken();
            if (data.valid) {
                this.currentUser = data.user;
                localStorage.setItem(APP.STORAGE_KEYS.USER, JSON.stringify(data.user));
                return data.user;
            }
            return null;
        } catch (e) {
            return null;
        }
    }

    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = '/login';
            return false;
        }
        return true;
    }

    requireAdmin() {
        if (!this.isAuthenticated()) {
            window.location.href = '/login';
            return false;
        }
        if (!this.isAdmin()) {
            window.location.href = '/';
            return false;
        }
        return true;
    }
}

window.auth = new AuthService();
