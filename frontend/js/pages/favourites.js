class FavoritesPage {
    constructor() {
        this.container = document.getElementById('page-content');
    }

    render() {
        this.container.innerHTML = `
            <div class="page-header">
                <h2><i class="fas fa-star"></i> Favorites</h2>
            </div>
            <div id="favorites-content"></div>
        `;

        this.loadFavorites();
    }

    loadFavorites() {
        const favs = storage.getFavorites();
        const content = document.getElementById('favorites-content');

        const allFavs = [...favs.files, ...favs.folders];

        if (allFavs.length === 0) {
            content.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-star"></i>
                    <h3>Belum ada favorit</h3>
                    <p>Tambahkan file atau folder ke favorit dengan klik bintang ⭐</p>
                </div>
            `;
            return;
        }

        let html = '<div class="recent-list">';
        allFavs.forEach(item => {
            const icon = item.path.includes('.') ? getFileIcon(item.name) : 'fa-folder';
            const type = item.path.includes('.') ? 'file' : 'folder';
            html += `
                <div class="recent-item">
                    <i class="fas ${icon}"></i>
                    <div class="info" onclick="window.navigateTo('files', { path: '${encodeURIComponent(item.path)}' })">
                        <div class="name">${escapeHtml(item.name)}</div>
                        <div class="path">${escapeHtml(item.path)}</div>
                    </div>
                    <button class="btn btn-sm btn-danger" onclick="window.removeFavorite('${item.path}','${type}')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        });
        html += '</div>';
        content.innerHTML = html;
    }
}

window.removeFavorite = function(path, type) {
    storage.toggleFavorite(type, path, getFileName(path));
    toast.success('Dihapus dari favorit');
    favoritesPage.loadFavorites();
};

window.favoritesPage = new FavoritesPage();
