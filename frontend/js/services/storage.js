class StorageService {
    constructor() {
        this.prefix = 'kafa_';
    }

    getKey(key) {
        return `${this.prefix}${key}`;
    }

    get(key, defaultValue = null) {
        try {
            const value = localStorage.getItem(this.getKey(key));
            return value ? JSON.parse(value) : defaultValue;
        } catch {
            return defaultValue;
        }
    }

    set(key, value) {
        try {
            localStorage.setItem(this.getKey(key), JSON.stringify(value));
        } catch (e) {
            console.warn('Failed to save to localStorage:', e);
        }
    }

    remove(key) {
        localStorage.removeItem(this.getKey(key));
    }

    // Favorites
    getFavorites() {
        return this.get('favorites', { files: [], folders: [] });
    }

    toggleFavorite(type, path, name) {
        const favs = this.getFavorites();
        const list = type === 'file' ? favs.files : favs.folders;
        const index = list.findIndex(f => f.path === path);
        
        if (index > -1) {
            list.splice(index, 1);
        } else {
            list.push({ path, name, added: new Date().toISOString() });
        }
        
        this.set('favorites', favs);
        return favs;
    }

    isFavorite(type, path) {
        const favs = this.getFavorites();
        const list = type === 'file' ? favs.files : favs.folders;
        return list.some(f => f.path === path);
    }

    // Recent files
    addRecent(path, name, type) {
        let recents = this.get('recents', []);
        recents = recents.filter(r => r.path !== path);
        recents.unshift({ path, name, type, accessed: new Date().toISOString() });
        if (recents.length > 50) {
            recents = recents.slice(0, 50);
        }
        this.set('recents', recents);
        return recents;
    }

    getRecents() {
        return this.get('recents', []);
    }

    clearRecents() {
        this.remove('recents');
    }
}

window.storage = new StorageService();
